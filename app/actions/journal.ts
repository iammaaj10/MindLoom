'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import Log from '@/lib/db/models/log';
import { extractEntities } from '@/lib/ml/client';
import { extractGraphEntities } from '@/lib/ai/gemini';
import { GraphNode, GraphEdge } from '@/lib/db/models/graph';
import { revalidatePath } from 'next/cache';

// Fix #8: Strip control characters and enforce length limits
function sanitizeContent(input: string, maxLength = 5000): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // strip control chars except \n, \r, \t
}

export async function createJournalEntry(content: string) {
  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!content?.trim()) {
    return { error: 'Content is required' };
  }

  const sanitized = sanitizeContent(content);
  if (!sanitized) {
    return { error: 'Content is required' };
  }

  try {
    await dbConnect();

    // Send the journal content to our local ML service to extract entities/topics
    // We use the same extractEntities endpoint that we use for documents!
    const entitiesList = await extractEntities([sanitized]);
    const extractedEntities = entitiesList[0] || [];

    // Filter out only topics (TECH) and organizations/people (ENTITY) from the extracted data
    const topics = extractedEntities
      .filter(e => e.startsWith('TECH:') || e.startsWith('ENTITY:'))
      .map(e => e.split(':')[1]);

    const newLog = await Log.create({
      userId: session.userId,
      content: sanitized,
      tags: [],
      extractedTopics: topics,
      extractedTimeSpent: [], // Could be expanded later with regex parsing for time
      date: new Date(),
    });

    // Also extract rich graph relationships using Gemini and save them to the graph DB
    try {
      const graphData = await extractGraphEntities(sanitized, session.userId);
      if (graphData && graphData.nodes && graphData.nodes.length > 0) {
        const nodeMap = new Map();
        for (const node of graphData.nodes) {
          const created = await GraphNode.findOneAndUpdate(
            { userId: session.userId, name: node.name },
            { $setOnInsert: { type: node.type, description: node.description } },
            { upsert: true, new: true }
          );
          nodeMap.set(node.name, created._id);
        }

        if (graphData.edges && graphData.edges.length > 0) {
          for (const edge of graphData.edges) {
            const sourceId = nodeMap.get(edge.source);
            const targetId = nodeMap.get(edge.target);
            if (sourceId && targetId) {
              await GraphEdge.create({
                userId: session.userId,
                sourceId,
                targetId,
                relationship: edge.relationship,
                weight: 1.0,
                chunkIds: [],
              });
            }
          }
        }
      }
    } catch (graphErr) {
      console.error('[Journal] Failed to extract graph entities:', graphErr);
    }

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
  const sanitized = sanitizeContent(content);

  try {
    await dbConnect();
    
    // Re-extract entities from ML Service
    const extractedTopics = await extractEntities([sanitized]);

    await Log.updateOne(
      { _id: id, userId: session.userId },
      { 
        $set: { 
          content: sanitized,
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
