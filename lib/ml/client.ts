const RAW_ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const ML_SERVICE_URL = RAW_ML_URL.replace(/\/+$/, '');
const ML_API_KEY = process.env.ML_SERVICE_API_KEY || 'mindloom-dev-secret';

// Common headers for all ML service requests
const ML_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'x-api-key': ML_API_KEY,
};

// ─── Embeddings ───────────────────────────────────────

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  try {
    const res = await fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: ML_HEADERS,
      body: JSON.stringify({ texts }),
      // Render free-tier instances sleep when inactive and may need up to 40s to wake up
      signal: AbortSignal.timeout(40000),
    });

    if (!res.ok) {
      const errDetail = await res.text().catch(() => '');
      console.error(`ML Service Error [POST ${ML_SERVICE_URL}/embed]: ${res.status} ${res.statusText} - ${errDetail}`);
      return texts.map(() => []);
    }

    const data = await res.json();
    return data.embeddings;
  } catch (error: any) {
    console.error(`Failed to connect to ML Service at ${ML_SERVICE_URL}:`, error?.message || error);
    return texts.map(() => []);
  }
}

// ─── Entity Extraction ───────────────────────────────

export async function extractEntities(texts: string[]): Promise<string[][]> {
  if (texts.length === 0) return [];

  try {
    const res = await fetch(`${ML_SERVICE_URL}/extract_entities`, {
      method: 'POST',
      headers: ML_HEADERS,
      body: JSON.stringify({ texts }),
      signal: AbortSignal.timeout(40000),
    });

    if (!res.ok) {
      console.error(`Entity Extraction Error [POST ${ML_SERVICE_URL}/extract_entities]: ${res.status} ${res.statusText}`);
      return texts.map(() => []);
    }

    const data = await res.json();
    return data.entities;
  } catch (error) {
    console.error(`Failed to extract entities at ${ML_SERVICE_URL}:`, error);
    return texts.map(() => []);
  }
}

// ─── Embed a Single Query ─────────────────────────────

export async function embedQuery(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0] || [];
}

// ─── Vector Cosine Similarity ─────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export async function calculateSimilarity(
  queryEmbedding: number[],
  candidateEmbeddings: number[][],
  topK: number = 5
): Promise<{ scores: number[]; rankedIndices: number[] }> {
  if (candidateEmbeddings.length === 0 || queryEmbedding.length === 0) {
    return { scores: [], rankedIndices: [] };
  }

  // Fast, instant in-memory calculation (0.1ms vs 2000ms network round-trip)
  const scores = candidateEmbeddings.map((candidate) => cosineSimilarity(queryEmbedding, candidate));
  const rankedIndices = Array.from({ length: scores.length }, (_, i) => i)
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, topK);

  return { scores, rankedIndices };
}
