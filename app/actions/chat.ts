'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import ChatSession from '@/lib/db/models/chat-session';
import ChatMessage from '@/lib/db/models/chat-history';
import Chunk from '@/lib/db/models/chunk';
import Document from '@/lib/db/models/document';
import { revalidatePath } from 'next/cache';

export async function getChatSessions() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const sessions = await ChatSession.find({ userId: session.userId })
      .sort({ updatedAt: -1 })
      .limit(50) // Fix #10: Prevent unbounded queries
      .lean();

    return { success: true, sessions: JSON.parse(JSON.stringify(sessions)) };
  } catch (error) {
    console.error('Failed to get chat sessions:', error);
    return { error: 'Failed to fetch sessions' };
  }
}

export async function getChatMessages(sessionId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const messages = await ChatMessage.find({ 
      userId: session.userId,
      sessionId
    })
      .sort({ createdAt: 1 })
      .limit(200) // Fix #10: Cap messages per session
      .lean();

    return { success: true, messages: JSON.parse(JSON.stringify(messages)) };
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    return { error: 'Failed to fetch messages' };
  }
}

export async function deleteChatSession(sessionId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    
    // Delete session and all related messages
    await ChatSession.deleteOne({ _id: sessionId, userId: session.userId });
    await ChatMessage.deleteMany({ sessionId, userId: session.userId });

    revalidatePath('/chat');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete chat session:', error);
    return { error: 'Failed to delete session' };
  }
}

export async function getChunkContent(chunkId: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const chunk = await Chunk.findOne({ 
      _id: chunkId,
      userId: session.userId 
    }).populate('documentId', 'title').select('content metadata documentId').lean();

    if (!chunk) return { error: 'Chunk not found' };

    const responseData = {
      content: chunk.content,
      documentId: (chunk.documentId as any)?._id || chunk.documentId,
      documentTitle: (chunk.documentId as any)?.title || 'Unknown Document',
    };

    return { success: true, chunk: JSON.parse(JSON.stringify(responseData)) };
  } catch (error) {
    console.error('Failed to get chunk content:', error);
    return { error: 'Failed to fetch citation' };
  }
}
