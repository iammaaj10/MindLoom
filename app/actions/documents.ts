'use server';

import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import Chunk from '@/lib/db/models/chunk';
import { getSession } from '@/lib/auth/session';
import { saveFile, deleteFile, getFileType } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────

export type DocumentResult = {
  _id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'text';
  fileUrl: string;
  category: string;
  status: 'uploading' | 'processing' | 'embedded' | 'failed';
  chunkCount: number;
  createdAt: string;
};

type UploadState = {
  error?: string;
  success?: boolean;
};

// ─── Upload ───────────────────────────────────────────

export async function uploadDocument(
  _prevState: UploadState | undefined,
  formData: FormData
): Promise<UploadState> {
  const session = await getSession();
  if (!session) {
    return { error: 'You must be logged in.' };
  }

  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string)?.trim();
  const category = (formData.get('category') as string)?.trim() || 'general';

  if (!file || file.size === 0) {
    return { error: 'Please select a file to upload.' };
  }

  // Validate file size (max 10MB)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { error: 'File size must be under 10MB.' };
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
  ];
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
    return { error: 'Unsupported file type. Use PDF, TXT, MD, PNG, JPG, or WebP.' };
  }

  try {
    // 1. Save to disk
    const { fileUrl } = await saveFile(session.userId, file);

    // 2. Create MongoDB record
    await dbConnect();
    await DocumentModel.create({
      userId: session.userId,
      title: title || file.name.replace(/\.[^/.]+$/, ''),
      fileType: getFileType(file.name),
      fileUrl,
      rawText: '',
      category,
      status: 'processing', // will become 'embedded' after Day 6-7 extraction
      chunkCount: 0,
    });

    revalidatePath('/documents');
    return { success: true };
  } catch (err) {
    console.error('Upload failed:', err);
    return { error: 'Upload failed. Please try again.' };
  }
}

// ─── Fetch ────────────────────────────────────────────

export async function getDocuments(): Promise<DocumentResult[]> {
  const session = await getSession();
  if (!session) return [];

  await dbConnect();
  const docs = await DocumentModel.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    title: doc.title,
    fileType: doc.fileType,
    fileUrl: doc.fileUrl,
    category: doc.category,
    status: doc.status,
    chunkCount: doc.chunkCount,
    createdAt: doc.createdAt.toISOString(),
  }));
}

// ─── Delete ───────────────────────────────────────────

export async function deleteDocument(documentId: string): Promise<{ error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: 'You must be logged in.' };
  }

  try {
    await dbConnect();

    // Find the document (ensure it belongs to this user)
    const doc = await DocumentModel.findOne({
      _id: documentId,
      userId: session.userId,
    });

    if (!doc) {
      return { error: 'Document not found.' };
    }

    // Delete file from disk
    await deleteFile(doc.fileUrl);

    // Delete related chunks
    await Chunk.deleteMany({ documentId: doc._id });

    // Delete the document record
    await DocumentModel.deleteOne({ _id: doc._id });

    revalidatePath('/documents');
    return {};
  } catch (err) {
    console.error('Delete failed:', err);
    return { error: 'Failed to delete document.' };
  }
}
