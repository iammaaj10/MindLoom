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
import { encryptValue } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import { rm } from 'fs/promises';
import path from 'path';

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

  // Input validation
  if (displayName && displayName.length > 100) {
    return { error: 'Display name is too long (max 100 characters)' };
  }
  if (apiKey && (apiKey.length < 10 || apiKey.length > 200)) {
    return { error: 'API key looks invalid' };
  }

  try {
    await dbConnect();
    const updates: Record<string, unknown> = {};

    if (displayName !== undefined) {
      updates.displayName = displayName.trim().slice(0, 100);
    }

    // Fix #1: Encrypt the API key before storing
    if (apiKey) {
      const { encrypted, iv } = encryptValue(apiKey);
      updates.geminiApiKey = encrypted;
      updates.geminiApiKeyIv = iv;
    }

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

    // Fix #7: Delete uploaded files from disk
    try {
      const userUploadDir = path.join(process.cwd(), 'public', 'uploads', session.userId);
      await rm(userUploadDir, { recursive: true, force: true });
    } catch (fileErr) {
      // Directory may not exist — that's OK
      console.warn('Upload directory cleanup:', fileErr);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to wipe data:', error);
    return { error: 'Failed to wipe data' };
  }
}
