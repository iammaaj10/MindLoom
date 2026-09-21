'use server';

import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import { GraphNode } from '@/lib/db/models/graph';
import { getSession } from '@/lib/auth/session';
import { getGenAI } from '@/lib/ai/gemini';

export async function getKnowledgeGaps() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await dbConnect();

  try {
    // 1. Fetch user's knowledge footprint
    const docs = await DocumentModel.find({ userId: session.userId })
      .select('title category chunkCount')
      .lean();

    const nodes = await GraphNode.find({ userId: session.userId })
      .select('name type')
      .limit(100) // limit to avoid massive prompts
      .lean();

    if (docs.length === 0 && nodes.length === 0) {
      return { 
        success: true, 
        gaps: [{
          title: 'Start Your Journey',
          description: 'You haven\'t uploaded any documents yet. Start by uploading foundational material in a subject you want to learn.',
          relevance: 'High'
        }] 
      };
    }

    // 2. Prepare context for Gemini
    const docSummary = docs.map((d: any) => `- ${d.title} (${d.category})`).join('\n');
    const nodeSummary = nodes.map((n: any) => `${n.name} (${n.type})`).join(', ');

    const prompt = `
You are an expert curriculum designer and knowledge analyst.
The user has been learning and uploading documents. Based on their current knowledge footprint, identify 3 "Knowledge Gaps" — logical next steps, missing foundational concepts, or advanced topics they should explore next to complete their understanding.

User's Uploaded Documents:
${docSummary}

Key Concepts they know (from Knowledge Graph):
${nodeSummary}

Respond EXACTLY in this JSON format (no markdown blocks, just raw JSON array):
[
  {
    "title": "Short title of the topic",
    "description": "Why they should learn this based on what they already know",
    "relevance": "High/Medium"
  }
]
`;

    // 3. Call Gemini
    const genAI = await getGenAI(session.userId);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    
    // Clean JSON if it's wrapped in markdown
    if (text.startsWith('```json')) text = text.replace(/```json/g, '');
    if (text.startsWith('```')) text = text.replace(/```/g, '');
    text = text.trim();

    const gaps = JSON.parse(text);

    return { success: true, gaps };

  } catch (error: any) {
    console.error('Failed to generate knowledge gaps:', error);
    return { error: 'Failed to analyze knowledge gaps' };
  }
}
