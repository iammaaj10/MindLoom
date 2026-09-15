import dbConnect from '@/lib/db/connection';
import Chunk, { IChunk } from '@/lib/db/models/chunk';
import { embedQuery, calculateSimilarity } from '@/lib/ml/client';
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
  // Fetch recent chunks for this user that have non-empty embeddings
  // Fix #11: Limit to recent 500 chunks to prevent memory explosion
  const chunks = await Chunk.find({
    userId: new mongoose.Types.ObjectId(userId),
    embedding: { $ne: [] },
  })
    .select('content embedding documentId metadata')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  console.log(`[Search] In-memory: found ${chunks.length} chunks with embeddings for user ${userId}`);
  if (chunks.length === 0) return [];

  // Fix A5: Offload cosine similarity math to the Python ML service
  const candidateEmbeddings = chunks.map(c => c.embedding);
  
  const { scores, rankedIndices } = await calculateSimilarity(
    queryEmbedding,
    candidateEmbeddings,
    limit
  );

  return rankedIndices.map((index, i) => {
    const chunk = chunks[index];
    return {
      _id: chunk._id.toString(),
      content: chunk.content,
      score: scores[index],
      documentId: chunk.documentId.toString(),
      metadata: chunk.metadata,
    };
  });
}

// ─── Math Utilities ───────────────────────────────────

// Replaced by Python ML Service (Task A5)
