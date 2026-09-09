/**
 * Advanced text chunking utility using sliding window.
 * Splits text into chunks by word boundaries to preserve context.
 */

export interface ChunkResult {
  text: string;
  index: number;
}

export interface ChunkingOptions {
  maxWords?: number;
  overlapWords?: number;
}

export function chunkText(
  text: string,
  options: ChunkingOptions = {}
): ChunkResult[] {
  const { maxWords = 250, overlapWords = 50 } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text into words (handling punctuation gracefully)
  // This is a naive word splitter, but effective enough for Day 7.
  const words = text.split(/\s+/);
  
  if (words.length <= maxWords) {
    return [{ text: text.trim(), index: 0 }];
  }

  const chunks: ChunkResult[] = [];
  let currentIndex = 0;
  let chunkIndex = 0;

  while (currentIndex < words.length) {
    const chunkWords = words.slice(currentIndex, currentIndex + maxWords);
    const chunkText = chunkWords.join(' ').trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
      });
      chunkIndex++;
    }

    // Move index forward by maxWords minus overlap
    // Ensure we always move forward at least 1 word to prevent infinite loops
    const advance = Math.max(1, maxWords - overlapWords);
    currentIndex += advance;
  }

  return chunks;
}
