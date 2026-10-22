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
 * Save an uploaded file to disk under public/uploads/<userId>/ if writable.
 * On serverless platforms (e.g. Vercel) where the filesystem is read-only (EROFS),
 * this handles write failures gracefully so document extraction and storage in DB succeed.
 */
export async function saveFile(
  userId: string,
  file: File,
  buffer?: Buffer
): Promise<{ fileUrl: string; savedName: string }> {
  const savedName = uniqueFilename(file.name);
  const fileUrl = `/uploads/${userId}/${savedName}`;

  try {
    const userDir = path.join(UPLOAD_DIR, userId);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }
    const filePath = path.join(userDir, savedName);
    const fileBuffer = buffer || Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);
  } catch (err: any) {
    // Expected on Vercel / serverless environments with read-only root filesystems
    console.warn(`[Storage] Skipping local disk persistence (${err.code || err.message}). Operating in serverless mode.`);
  }

  return { fileUrl, savedName };
}

/**
 * Delete a file from disk given its public URL path.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  const sanitizedRelPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  const filePath = path.resolve(process.cwd(), 'public', sanitizedRelPath);
  const safeBase = path.resolve(UPLOAD_DIR);

  if (!filePath.startsWith(safeBase)) {
    console.error(`[Storage] Path traversal attempt blocked: ${fileUrl}`);
    return;
  }

  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (err) {
    console.warn('Failed to delete file from disk:', err);
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
