'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import ChatSession from '@/lib/db/models/chat-session';
import ChatMessage from '@/lib/db/models/chat-history';
import { revalidatePath } from 'next/cache';

export async function getChatSessions() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const sessions = await ChatSession.find({ userId: session.userId })
      .sort({ updatedAt: -1 })
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
