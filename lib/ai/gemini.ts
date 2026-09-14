import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Singleton Client ─────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('[Gemini] GEMINI_API_KEY is not set — Gemini calls will fail');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const MODEL = 'gemini-1.5-flash';

// ─── Types ────────────────────────────────────────────

export interface GeminiResponse {
  text: string;
  tokensUsed: number;
  latencyMs: number;
}

// ─── Non-Streaming Generation ─────────────────────────

export async function generateWithGemini(
  systemPrompt: string,
  userMessage: string,
  maxRetries: number = 3
): Promise<GeminiResponse> {
  const start = Date.now();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const response = await result.response;
      const text = response.text() || '';
      const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

      return {
        text,
        tokensUsed,
        latencyMs: Date.now() - start,
      };
    } catch (error: any) {
      const status = error?.status || error?.httpStatusCode;

      // Rate limited — exponential backoff
      if (status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`[Gemini] Rate limited. Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Non-retryable error
      console.error('[Gemini] API error:', error?.message || error);
      throw error;
    }
  }

  throw new Error('Gemini API: max retries exceeded');
}

// ─── Streaming Generation ─────────────────────────────

export async function* streamWithGemini(
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error('[Gemini] Stream error:', error?.message || error);
    yield '\n\n⚠️ An error occurred while generating. Please try again.';
  }
}

// ─── System Prompt Builder ────────────────────────────

export function buildSystemPrompt(contextBlock: string): string {
  return `You are MindLoom, a personal AI companion that helps users understand, organize, and recall their own documents and knowledge.

IMPORTANT RULES:
- You answer ONLY based on the user's own documents provided in <context> below.
- If the context doesn't contain enough information, say so honestly — do NOT hallucinate.
- Be concise, clear, and helpful.
- When referencing specific information, mention which document/topic it came from.
- Use markdown formatting for readability (bold, lists, code blocks when appropriate).

${contextBlock}`;
}
