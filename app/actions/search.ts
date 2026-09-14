'use server';

import { getSession } from '@/lib/auth/session';
import { searchChunks, SearchResult } from '@/lib/ml/retrieval';
import { buildContext, contextToPromptBlock, CompressedContext } from '@/lib/ml/context';

// ─── Types ────────────────────────────────────────────

export interface SearchResponse {
  results: SearchResult[];
  context: CompressedContext;
  promptBlock: string;
  error?: string;
}

// ─── Search Action ────────────────────────────────────

export async function semanticSearch(
  query: string,
  limit: number = 5
): Promise<SearchResponse> {
  const session = await getSession();
  if (!session) {
    return {
      results: [],
      context: { query, timestamp: '', chunks: [], entities: [], summary: '' },
      promptBlock: '',
      error: 'You must be logged in.',
    };
  }

  if (!query.trim()) {
    return {
      results: [],
      context: { query, timestamp: '', chunks: [], entities: [], summary: '' },
      promptBlock: '',
      error: 'Please enter a search query.',
    };
  }

  try {
    // 1. Retrieve relevant chunks via vector search
    const results = await searchChunks(session.userId, query, limit);

    // 2. Compress into structured context
    const context = buildContext(query, results);

    // 3. Generate the prompt block (preview for Week 3 Gemini integration)
    const promptBlock = contextToPromptBlock(context);

    return { results, context, promptBlock };
  } catch (error) {
    console.error('Semantic search failed:', error);
    return {
      results: [],
      context: { query, timestamp: '', chunks: [], entities: [], summary: '' },
      promptBlock: '',
      error: 'Search failed. Please try again.',
    };
  }
}
