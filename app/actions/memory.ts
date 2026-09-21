'use server';

import dbConnect from '@/lib/db/connection';
import Memory from '@/lib/db/models/memory';
import { getSession } from '@/lib/auth/session';
import { z } from 'zod';

const MemorySchema = z.object({
  category: z.enum(['Preference', 'Goal', 'Fact']),
  content: z.string().min(1, 'Content is required').max(500, 'Content too long'),
});

export async function getMemories() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await dbConnect();
  const memories = await Memory.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    success: true,
    memories: memories.map((m: any) => ({
      _id: m._id.toString(),
      category: m.category,
      content: m.content,
      source: m.source,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}

export async function addMemory(category: string, content: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const parsed = MemorySchema.safeParse({ category, content });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await dbConnect();
  await Memory.create({
    userId: session.userId,
    category: parsed.data.category,
    content: parsed.data.content,
    source: 'User',
  });

  return { success: true };
}

export async function deleteMemory(memoryId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  if (!memoryId || memoryId.length > 100) return { error: 'Invalid ID' };

  await dbConnect();
  await Memory.deleteOne({ _id: memoryId, userId: session.userId });

  return { success: true };
}
