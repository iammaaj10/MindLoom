const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
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
    });

    if (!res.ok) {
      console.error(`ML Service Error: ${res.status} ${res.statusText}`);
      return texts.map(() => []);
    }

    const data = await res.json();
    return data.embeddings;
  } catch (error) {
    console.error('Failed to connect to ML Service:', error);
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
    });

    if (!res.ok) {
      console.error(`Entity Extraction Error: ${res.status} ${res.statusText}`);
      return texts.map(() => []);
    }

    const data = await res.json();
    return data.entities;
  } catch (error) {
    console.error('Failed to extract entities:', error);
    return texts.map(() => []);
  }
}

// ─── Embed a Single Query ─────────────────────────────

export async function embedQuery(text: string): Promise<number[]> {
  const results = await generateEmbeddings([text]);
  return results[0] || [];
}
