import fs from 'fs';
import path from 'path';
import { extractText as extractPdfText } from 'unpdf';

/**
 * Extracts raw text from a given file buffer or path.
 */
export async function extractText(
  filePath: string,
  fileType: 'pdf' | 'image' | 'text'
): Promise<string> {
  const absolutePath = path.join(process.cwd(), 'public', filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const fileBuffer = fs.readFileSync(absolutePath);

  switch (fileType) {
    case 'pdf':
      return await extractFromPDF(fileBuffer);
    case 'text':
      return extractFromText(fileBuffer);
    case 'image':
      // Placeholder for Day 6 stretch goal: OCR
      return '[OCR Extraction Pending] Image text extraction will be implemented with Tesseract.';
    default:
      throw new Error(`Unsupported file type for extraction: ${fileType}`);
  }
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const { text } = await extractPdfText(uint8Array, { mergePages: true });
    // Sanitize and normalize text: remove excessive whitespace
    return (text || '').replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim();
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to parse PDF document.');
  }
}

function extractFromText(buffer: Buffer): Promise<string> {
  const text = buffer.toString('utf-8');
  // Normalize line endings and whitespace
  return Promise.resolve(text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n').trim());
}
