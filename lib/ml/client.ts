const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  try {
    const res = await fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts }),
    });

    if (!res.ok) {
      console.error(`ML Service Error: ${res.status} ${res.statusText}`);
      // Fallback: return empty arrays if the service fails
      return texts.map(() => []);
    }

    const data = await res.json();
    return data.embeddings;
  } catch (error) {
    console.error('Failed to connect to ML Service:', error);
    // Fallback gracefully so ingestion doesn't crash completely
    // We can implement a retry or background embedding worker later
    return texts.map(() => []);
  }
}
