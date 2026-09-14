import dbConnect from '@/lib/db/connection';
import Chunk, { IChunk } from '@/lib/db/models/chunk';
import { embedQuery } from '@/lib/ml/client';
import mongoose from 'mongoose';

// ─── Types ────────────────────────────────────────────

export interface SearchResult {
  _id: string;
  content: string;
  score: number;
  documentId: string;
  metadata: {
    topic: string;
    entities: string[];
    chunkIndex: number;
  };
}

// ─── Vector Search (Atlas) ────────────────────────────

/**
 * Perform semantic vector search using MongoDB Atlas Vector Search.
 *
 * Requires a vector search index named "chunk_vector_index" on the
 * `chunks` collection with the field path "embedding" and 384 dimensions.
 *
 * Falls back to in-memory cosine similarity if Atlas Vector Search
 * is not configured (e.g. on free-tier clusters without vector search).
 */
export async function searchChunks(
  userId: string,
  queryText: string,
  limit: number = 5
): Promise<SearchResult[]> {
  await dbConnect();

  // 1. Embed the query text
  const queryEmbedding = await embedQuery(queryText);

  if (queryEmbedding.length === 0) {
    console.warn('Query embedding is empty — ML service may be down');
    return [];
  }

  // 2. Try Atlas Vector Search first, fall back to in-memory if unavailable or if it returns 0 results (e.g. index syncing)
  try {
    let results = await atlasVectorSearch(userId, queryEmbedding, limit);
    
    if (results.length > 0) {
      console.log(`[Search] Atlas returned ${results.length} results`);
      return results;
    }
    
    console.log(`[Search] Atlas returned 0 results, falling back to in-memory...`);
    results = await inMemorySearch(userId, queryEmbedding, limit);
    console.log(`[Search] In-memory returned ${results.length} results`);
    return results;
  } catch (error) {
    console.warn('[Search] Atlas Vector Search unavailable or errored, falling back to in-memory:', (error as Error).message);
    const results = await inMemorySearch(userId, queryEmbedding, limit);
    console.log(`[Search] In-memory returned ${results.length} results`);
    return results;
  }
}

// ─── Atlas $vectorSearch Pipeline ─────────────────────

async function atlasVectorSearch(
  userId: string,
  queryEmbedding: number[],
  limit: number
): Promise<SearchResult[]> {
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'chunk_vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: limit * 10,
        limit: limit,
        filter: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
    },
    {
      $project: {
        content: 1,
        documentId: 1,
        metadata: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return results.map((r: any) => ({
    _id: r._id.toString(),
    content: r.content,
    score: r.score,
    documentId: r.documentId.toString(),
    metadata: r.metadata,
  }));
}

// ─── Fallback: In-Memory Cosine Similarity ────────────

async function inMemorySearch(
  userId: string,
  queryEmbedding: number[],
  limit: number
): Promise<SearchResult[]> {
  // Fetch all chunks for this user that have non-empty embeddings
  const chunks = await Chunk.find({
    userId: new mongoose.Types.ObjectId(userId),
    embedding: { $ne: [] },
  })
    .select('content embedding documentId metadata')
    .lean();

  console.log(`[Search] In-memory: found ${chunks.length} chunks with embeddings for user ${userId}`);
  if (chunks.length === 0) return [];

  // Compute cosine similarity in JS
  const scored = chunks.map((chunk: any) => {
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    return {
      _id: chunk._id.toString(),
      content: chunk.content,
      score,
      documentId: chunk.documentId.toString(),
      metadata: chunk.metadata,
    };
  });

  // Sort by score descending and take top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

// ─── Math Utilities ───────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
