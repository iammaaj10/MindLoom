import 'server-only';

import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Sanitize a filename — strip unsafe characters and limit length.
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
}

/**
 * Generate a unique filename by prepending a timestamp.
 */
function uniqueFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);
  const timestamp = Date.now();
  return sanitizeFilename(`${timestamp}_${base}${ext}`);
}

/**
 * Save an uploaded file to disk under public/uploads/<userId>/.
 * Returns the public URL path (e.g. /uploads/<userId>/filename.pdf).
 */
export async function saveFile(
  userId: string,
  file: File
): Promise<{ fileUrl: string; savedName: string }> {
  const userDir = path.join(UPLOAD_DIR, userId);

  // Ensure directory exists
  if (!existsSync(userDir)) {
    await mkdir(userDir, { recursive: true });
  }

  const savedName = uniqueFilename(file.name);
  const filePath = path.join(userDir, savedName);

  // Convert File to Buffer and write
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  const fileUrl = `/uploads/${userId}/${savedName}`;
  return { fileUrl, savedName };
}

/**
 * Delete a file from disk given its public URL path.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  const filePath = path.join(process.cwd(), 'public', fileUrl);
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (err) {
    console.error('Failed to delete file:', err);
  }
}

/**
 * Determine file type from extension.
 */
export function getFileType(filename: string): 'pdf' | 'image' | 'text' {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return 'image';
  return 'text';
}
