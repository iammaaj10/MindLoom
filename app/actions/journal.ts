'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import Log from '@/lib/db/models/log';
import { extractEntities } from '@/lib/ml/client';
import { revalidatePath } from 'next/cache';

export async function createJournalEntry(content: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!content?.trim()) {
    return { error: 'Content is required' };
  }

  try {
    await dbConnect();

    // Send the journal content to our local ML service to extract entities/topics
    // We use the same extractEntities endpoint that we use for documents!
    const entitiesList = await extractEntities([content]);
    const extractedEntities = entitiesList[0] || [];

    // Filter out only topics (TECH) and organizations/people (ENTITY) from the extracted data
    const topics = extractedEntities
      .filter(e => e.startsWith('TECH:') || e.startsWith('ENTITY:'))
      .map(e => e.split(':')[1]);

    const newLog = await Log.create({
      userId: session.userId,
      content,
      tags: [],
      extractedTopics: topics,
      extractedTimeSpent: [], // Could be expanded later with regex parsing for time
      date: new Date(),
    });

    revalidatePath('/journal');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');

    return { success: true, log: JSON.parse(JSON.stringify(newLog)) };
  } catch (error: any) {
    console.error('Failed to create journal entry:', error);
    return { error: 'Failed to create journal entry' };
  }
}

export async function deleteJournalLog(id: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    await Log.deleteOne({ _id: id, userId: session.userId });
    revalidatePath('/journal');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete log:', error);
    return { error: 'Failed to delete log' };
  }
}

export async function updateJournalLog(id: string, content: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };
  if (!content.trim()) return { error: 'Content cannot be empty' };

  try {
    await dbConnect();
    
    // Re-extract entities from ML Service
    const extractedTopics = await extractEntities([content]);

    await Log.updateOne(
      { _id: id, userId: session.userId },
      { 
        $set: { 
          content,
          extractedTopics: extractedTopics[0] || [],
          updatedAt: new Date()
        } 
      }
    );

    revalidatePath('/journal');
    return { success: true };
  } catch (error) {
    console.error('Failed to update log:', error);
    return { error: 'Failed to update log' };
  }
}
