import dbConnect from '@/lib/db/connection';
import Chunk, { IChunk } from '@/lib/db/models/chunk';
import { embedQuery, calculateSimilarity, extractEntities } from '@/lib/ml/client';
import mongoose from 'mongoose';
import { GraphNode, GraphEdge } from '@/lib/db/models/graph';

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

// ─── Vector & Hybrid Search ───────────────────────────

/**
 * Perform semantic vector search using MongoDB Atlas Vector Search
 * with automatic fallback to in-memory cosine similarity and keyword search.
 */
export async function searchChunks(
  userId: string,
  queryText: string,
  limit: number = 5
): Promise<SearchResult[]> {
  await dbConnect();

  // 1. Try to embed the query text
  const queryEmbedding = await embedQuery(queryText);

  // If embedding service is down or cold, immediately fall back to keyword search
  if (queryEmbedding.length === 0) {
    console.warn('[Search] Query embedding is empty or ML service offline. Falling back to keyword search.');
    return await keywordSearch(userId, queryText, limit);
  }

  // 2. Try Atlas Vector Search first (if configured on cluster)
  try {
    const results = await atlasVectorSearch(userId, queryEmbedding, limit);
    if (results.length > 0) {
      console.log(`[Search] Atlas Vector Search returned ${results.length} results`);
      return results;
    }
  } catch (error: any) {
    console.warn('[Search] Atlas Vector Search unavailable, falling back to in-memory:', error?.message);
  }

  // 3. Fall back to in-memory cosine similarity
  try {
    const inMemoryResults = await inMemorySearch(userId, queryEmbedding, limit);
    if (inMemoryResults.length > 0) {
      console.log(`[Search] In-memory search returned ${inMemoryResults.length} results`);
      return inMemoryResults;
    }
  } catch (inMemError: any) {
    console.warn('[Search] In-memory similarity error:', inMemError?.message);
  }

  // 4. If no results found via vectors (e.g. chunks uploaded without embeddings),
  // fall back to lexical keyword search so the user always gets relevant data
  console.log('[Search] Vector search returned 0 results. Falling back to keyword search...');
  return await keywordSearch(userId, queryText, limit);
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

// ─── In-Memory Cosine Similarity ─────────────────────

async function inMemorySearch(
  userId: string,
  queryEmbedding: number[],
  limit: number
): Promise<SearchResult[]> {
  const chunks = await Chunk.find({
    userId: new mongoose.Types.ObjectId(userId),
    embedding: { $ne: [] },
  })
    .select('content embedding documentId metadata')
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  if (chunks.length === 0) return [];

  const candidateEmbeddings = chunks.map((c) => c.embedding);

  const { scores, rankedIndices } = await calculateSimilarity(
    queryEmbedding,
    candidateEmbeddings,
    limit
  );

  return rankedIndices
    .filter((index) => scores[index] > 0.1) // Filter out zero/negligible similarity
    .map((index) => {
      const chunk = chunks[index];
      return {
        _id: chunk._id.toString(),
        content: chunk.content,
        score: parseFloat(scores[index].toFixed(4)),
        documentId: chunk.documentId.toString(),
        metadata: chunk.metadata,
      };
    });
}

// ─── Lexical / Keyword Search Fallback ────────────────

async function keywordSearch(
  userId: string,
  queryText: string,
  limit: number
): Promise<SearchResult[]> {
  const terms = queryText
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-zA-Z0-9]/g, ''))
    .filter((t) => t.length > 2);

  if (terms.length === 0) {
    // If query only has short words, use the trimmed query text directly
    terms.push(queryText.trim().toLowerCase());
  }

  const regexPatterns = terms.map((t) => new RegExp(t, 'i'));

  const chunks = await Chunk.find({
    userId: new mongoose.Types.ObjectId(userId),
    content: { $in: regexPatterns },
  })
    .sort({ createdAt: -1 })
    .limit(limit * 3)
    .lean();

  if (chunks.length === 0) return [];

  // Score chunks by term frequency
  const scored = chunks.map((chunk) => {
    const textLower = chunk.content.toLowerCase();
    let hits = 0;
    terms.forEach((term) => {
      if (textLower.includes(term)) hits++;
    });
    const score = Math.min(0.95, 0.4 + (hits / terms.length) * 0.5);
    return {
      _id: chunk._id.toString(),
      content: chunk.content,
      score: parseFloat(score.toFixed(3)),
      documentId: chunk.documentId.toString(),
      metadata: chunk.metadata,
      hits,
    };
  });

  return scored
    .sort((a, b) => b.hits - a.hits || b.score - a.score)
    .slice(0, limit)
    .map(({ hits, ...rest }) => rest);
}

// ─── Graph RAG ────────────────────────────────────────

export async function searchGraph(
  userId: string,
  queryText: string
): Promise<{ contextString: string; edges: any[] }> {
  await dbConnect();

  try {
    // 1. Extract entities from the user's query
    const extractedArrays = await extractEntities([queryText]);
    const extracted = extractedArrays[0] || [];

    // Clean up entity prefixes like "ENTITY:", "TECH:" from ML service
    const rawEntities = extracted.map((e) => (e.includes(':') ? e.split(':')[1] : e));

    if (rawEntities.length === 0) return { contextString: '', edges: [] };

    // 2. Find matching nodes in the database (case-insensitive regex)
    const regexes = rawEntities.map((e) => new RegExp(e, 'i'));
    const nodes = await GraphNode.find({
      userId: new mongoose.Types.ObjectId(userId),
      name: { $in: regexes },
    }).lean();

    if (nodes.length === 0) return { contextString: '', edges: [] };

    const nodeIds = nodes.map((n) => n._id);

    // 3. Find 1-hop edges connected to these nodes
    const edges = await GraphEdge.find({
      userId: new mongoose.Types.ObjectId(userId),
      $or: [{ sourceId: { $in: nodeIds } }, { targetId: { $in: nodeIds } }],
    })
      .populate('sourceId', 'name')
      .populate('targetId', 'name')
      .sort({ weight: -1 })
      .limit(20)
      .lean();

    if (edges.length === 0) return { contextString: '', edges: [] };

    // 4. Construct the Graph Context string
    let graphContext = '### Knowledge Graph Relationships:\n';
    edges.forEach((edge: any) => {
      const sourceName = edge.sourceId?.name || 'Unknown';
      const targetName = edge.targetId?.name || 'Unknown';
      graphContext += `- ${sourceName} ${edge.relationship} ${targetName} (Confidence: ${edge.weight})\n`;
    });

    return { contextString: graphContext, edges };
  } catch (err) {
    console.error('[GraphRAG] Search failed:', err);
    return { contextString: '', edges: [] };
  }
}
