'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import StudyItem from '@/lib/db/models/study-plan';
import Log from '@/lib/db/models/log';
import { calculateSM2, SM2State } from '@/lib/study/sm2';
import { revalidatePath } from 'next/cache';

export async function syncTopicsToStudyPlan() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    
    // Find all unique topics the user has logged
    const logs = await Log.find({ userId: session.userId }).select('extractedTopics').lean();
    const uniqueTopics = new Set<string>();
    
    logs.forEach(log => {
      if (log.extractedTopics) {
        log.extractedTopics.forEach(t => uniqueTopics.add(t));
      }
    });

    // Add any missing topics to the StudyPlan
    let added = 0;
    for (const topic of Array.from(uniqueTopics)) {
      const existing = await StudyItem.findOne({ userId: session.userId, topic });
      if (!existing) {
        await StudyItem.create({
          userId: session.userId,
          topic,
          nextReview: new Date(), // Due immediately
        });
        added++;
      }
    }

    return { success: true, added };
  } catch (error) {
    console.error('Failed to sync study plan:', error);
    return { error: 'Failed to sync study plan' };
  }
}

export async function getDueStudyItems() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    
    // Auto-sync before fetching
    await syncTopicsToStudyPlan();

    const now = new Date();
    const dueItems = await StudyItem.find({
      userId: session.userId,
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 }).limit(10).lean();

    return { success: true, items: JSON.parse(JSON.stringify(dueItems)) };
  } catch (error) {
    console.error('Failed to fetch due items:', error);
    return { error: 'Failed to fetch due items' };
  }
}

export async function submitReview(itemId: string, quality: number) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    
    const item = await StudyItem.findOne({ _id: itemId, userId: session.userId });
    if (!item) return { error: 'Item not found' };

    const currentState: SM2State = {
      repetitions: item.repetitions,
      easeFactor: item.easeFactor,
      interval: item.interval,
    };

    const newState = calculateSM2(quality, currentState);

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newState.interval);

    item.repetitions = newState.repetitions;
    item.easeFactor = newState.easeFactor;
    item.interval = newState.interval;
    item.lastReviewed = new Date();
    item.nextReview = nextReview;

    await item.save();
    revalidatePath('/study');

    return { success: true, item: JSON.parse(JSON.stringify(item)) };
  } catch (error) {
    console.error('Failed to submit review:', error);
    return { error: 'Failed to submit review' };
  }
}

// B4: Auto-generate flashcards from document chunks using Gemini
export async function generateFlashcardsFromDocs() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const { generateWithGemini } = await import('@/lib/ai/gemini');
    const Chunk = (await import('@/lib/db/models/chunk')).default;

    // Get latest chunks that haven't been turned into flashcards yet
    const existingTopics = await StudyItem.find({ userId: session.userId }).select('topic').lean();
    const existingSet = new Set(existingTopics.map((t: any) => t.topic.toLowerCase()));

    const chunks = await Chunk.find({ userId: session.userId })
      .select('content metadata')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (chunks.length === 0) {
      return { error: 'No documents found. Upload some first!' };
    }

    // Combine chunk content for Gemini
    const combinedContent = chunks
      .map((c: any) => c.content)
      .join('\n---\n')
      .slice(0, 8000); // Stay within token limits

    const prompt = `Based on the following content from the user's documents, generate a list of study topics/concepts that would be useful flashcards for spaced repetition review.

Rules:
- Extract 5-15 key concepts, terms, or facts.
- Each topic should be a short phrase (2-6 words), like a flashcard front.
- Focus on technical terms, important concepts, names, and key facts.
- Return ONLY a JSON array of strings. No explanation.
- Example output: ["React Server Components", "JWT Token Structure", "MongoDB Aggregation Pipeline"]

Content:
${combinedContent}`;

    const result = await generateWithGemini(
      'You are a study flashcard generator. Return only valid JSON arrays.',
      prompt,
      session.userId
    );

    // Parse the response
    let topics: string[] = [];
    try {
      // Extract JSON array from the response (handle markdown code blocks)
      const jsonMatch = result.text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error('Failed to parse Gemini flashcard response:', result.text);
      return { error: 'AI returned invalid format. Try again.' };
    }

    // Filter out topics that already exist
    const newTopics = topics.filter(t => !existingSet.has(t.toLowerCase()));

    if (newTopics.length === 0) {
      return { success: true, added: 0, message: 'All generated topics already exist in your study plan!' };
    }

    // Create study items
    const items = newTopics.map(topic => ({
      userId: session.userId,
      topic,
      nextReview: new Date(),
    }));

    await StudyItem.insertMany(items);
    revalidatePath('/study');

    return { success: true, added: newTopics.length, topics: newTopics };
  } catch (error) {
    console.error('Flashcard generation failed:', error);
    return { error: 'Failed to generate flashcards. Make sure your Gemini API key is configured.' };
  }
}
