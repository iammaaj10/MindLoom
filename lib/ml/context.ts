import { SearchResult } from '@/lib/ml/retrieval';

// ─── Types ────────────────────────────────────────────

export interface CompressedContext {
  query: string;
  timestamp: string;
  chunks: CompressedChunk[];
  entities: string[];
  summary: string;
}

interface CompressedChunk {
  content: string;
  score: number;
  topic: string;
  chunkIndex: number;
  documentId: string;
  chunkId: string;
}

// ─── Context Builder ─────────────────────────────────

/**
 * Takes raw retrieved chunks and compresses them into a structured
 * JSON context block ready to be injected into an LLM prompt.
 *
 * This is the "bridge" between local ML retrieval and Gemini generation.
 * Instead of dumping raw text, we send a compact, structured payload
 * that saves tokens and gives the LLM better signal.
 */
export function buildContext(
  query: string,
  retrievedChunks: SearchResult[]
): CompressedContext {
  // Deduplicate entities across all chunks
  const allEntities = new Set<string>();
  for (const chunk of retrievedChunks) {
    if (chunk.metadata?.entities) {
      for (const entity of chunk.metadata.entities) {
        allEntities.add(entity);
      }
    }
  }

  // Build compressed chunk representations
  const compressedChunks: CompressedChunk[] = retrievedChunks.map((chunk) => ({
    content: chunk.content.trim(),
    score: Math.round(chunk.score * 1000) / 1000, // 3 decimal places
    topic: chunk.metadata?.topic || 'general',
    chunkIndex: chunk.metadata?.chunkIndex ?? -1,
    documentId: chunk.documentId,
    chunkId: chunk._id,
  }));

  // Build a one-line summary of what we found
  const topicSet = new Set(compressedChunks.map((c) => c.topic));
  const topics = Array.from(topicSet).join(', ');
  const summary = `Found ${compressedChunks.length} relevant chunk(s) across topic(s): ${topics}. Top score: ${compressedChunks[0]?.score ?? 0}.`;

  return {
    query,
    timestamp: new Date().toISOString(),
    chunks: compressedChunks,
    entities: Array.from(allEntities).sort(),
    summary,
  };
}

/**
 * Serialize the compressed context into a prompt-friendly string
 * suitable for injection into an LLM system/user message.
 */
export function contextToPromptBlock(ctx: CompressedContext): string {
  const lines: string[] = [
    `<context query="${ctx.query}" retrieved_at="${ctx.timestamp}">`,
    `<summary>${ctx.summary}</summary>`,
  ];

  if (ctx.entities.length > 0) {
    lines.push(`<entities>${ctx.entities.join(', ')}</entities>`);
  }

  for (const chunk of ctx.chunks) {
    lines.push(`<chunk chunk_id="${chunk.chunkId}" score="${chunk.score}" topic="${chunk.topic}" index="${chunk.chunkIndex}">`);
    lines.push(chunk.content);
    lines.push('</chunk>');
  }

  lines.push('</context>');
  return lines.join('\n');
}
