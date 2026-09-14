'use server';

import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import User from '@/lib/db/models/user';
import DocumentModel from '@/lib/db/models/document';
import Chunk from '@/lib/db/models/chunk';
import Log from '@/lib/db/models/log';
import ChatMessage from '@/lib/db/models/chat-history';
import ChatSession from '@/lib/db/models/chat-session';
import StudyItem from '@/lib/db/models/study-plan';
import { revalidatePath } from 'next/cache';

export async function getUserSettings() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const user = await User.findById(session.userId).select('displayName email geminiApiKey').lean();
    if (!user) return { error: 'User not found' };

    return { 
      success: true, 
      user: {
        email: user.email,
        displayName: user.displayName || '',
        hasCustomKey: !!user.geminiApiKey,
      } 
    };
  } catch (error) {
    console.error('Failed to get settings:', error);
    return { error: 'Failed to fetch settings' };
  }
}

export async function updateProfile(displayName: string, apiKey: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    const updates: any = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (apiKey !== undefined) updates.geminiApiKey = apiKey;

    await User.updateOne({ _id: session.userId }, { $set: updates });
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function wipeUserData() {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    await dbConnect();
    
    // Wipe all user data across all collections
    await Promise.all([
      DocumentModel.deleteMany({ userId: session.userId }),
      Chunk.deleteMany({ userId: session.userId }),
      Log.deleteMany({ userId: session.userId }),
      ChatMessage.deleteMany({ userId: session.userId }),
      ChatSession.deleteMany({ userId: session.userId }),
      StudyItem.deleteMany({ userId: session.userId }),
    ]);

    // Note: In a real app we should also delete files from S3/GridFS here.
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to wipe data:', error);
    return { error: 'Failed to wipe data' };
  }
}
