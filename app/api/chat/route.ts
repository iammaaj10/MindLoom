import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { classifyIntent } from '@/lib/ai/router';
import { streamWithGemini, buildSystemPrompt } from '@/lib/ai/gemini';
import { searchChunks, searchGraph } from '@/lib/ml/retrieval';
import { buildContext, contextToPromptBlock } from '@/lib/ml/context';
import dbConnect from '@/lib/db/connection';
import ChatMessage from '@/lib/db/models/chat-history';
import ChatSession from '@/lib/db/models/chat-session';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fix #3: Validate all incoming payloads
const ChatInputSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
  sessionId: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate input
  let body: z.infer<typeof ChatInputSchema>;
  try {
    const raw = await request.json();
    const parsed = ChatInputSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    body = parsed.data;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const { message, sessionId } = body;

  const startTime = Date.now();
  await dbConnect();

  let activeSessionId = sessionId;
  
  // If no sessionId is provided or it's 'default', create a new session
  if (!activeSessionId || activeSessionId === 'default') {
    const newSession = await ChatSession.create({
      userId: session.userId,
      title: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
    });
    activeSessionId = newSession._id.toString();
  }

  // 1. Save user message to DB
  await ChatMessage.create({
    userId: session.userId,
    sessionId: activeSessionId,
    role: 'user',
    content: message,
    source: 'local',
    tokensUsed: 0,
    latencyMs: 0,
  });

  // 2. Run the intent classifier / router
  const decision = await classifyIntent(message, session.userId);

  // 3a. If answered locally, return immediately (no streaming needed)
  if (decision.source === 'local' && decision.localAnswer) {
    const latencyMs = Date.now() - startTime;

    // Save assistant response
    await ChatMessage.create({
      userId: session.userId,
      sessionId: activeSessionId,
      role: 'assistant',
      content: decision.localAnswer,
      source: 'local',
      tokensUsed: 0,
      latencyMs,
    });

    // Return as a simple JSON response with source metadata
    return new Response(
      JSON.stringify({
        text: decision.localAnswer,
        source: 'local',
        latencyMs,
        tokensUsed: 0,
        sessionId: activeSessionId,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 3b. Gemini RAG path — stream the response
  try {
    // Retrieve context
    const [searchResults, graphContextString] = await Promise.all([
      searchChunks(session.userId, message, 5),
      searchGraph(session.userId, message)
    ]);
    
    const context = buildContext(message, searchResults);
    let promptBlock = contextToPromptBlock(context);
    
    // Inject Graph Context
    if (graphContextString) {
      promptBlock = `${graphContextString}\n\n${promptBlock}`;
    }

    const systemPrompt = buildSystemPrompt(promptBlock);

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send source metadata first, including activeSessionId
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'meta', source: 'gemini', chunksUsed: searchResults.length, sessionId: activeSessionId })}\n\n`
            )
          );

          // Stream Gemini response
          for await (const chunk of streamWithGemini(systemPrompt, message, session.userId)) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`
              )
            );
          }

          const latencyMs = Date.now() - startTime;

          // Send done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'done', latencyMs })}\n\n`
            )
          );

          // Save the full response to DB (fire-and-forget)
          ChatMessage.create({
            userId: session.userId,
            sessionId: activeSessionId,
            role: 'assistant',
            content: fullText,
            source: 'gemini',
            tokensUsed: 0,
            latencyMs,
          }).catch((err) => console.error('[Chat] Failed to save response:', err));

          controller.close();
        } catch (err) {
          console.error('[Chat] Stream error:', err);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Chat] Gemini route failed:', error);

    // Graceful degradation — if Gemini fails, try to give a local-only answer
    const searchResults = await searchChunks(session.userId, message, 3);

    if (searchResults.length > 0) {
      const fallbackAnswer = `⚠️ I couldn't reach the AI service right now, but here's what I found in your documents:\n\n${searchResults
        .map(
          (r, i) =>
            `**${i + 1}.** *(${r.metadata.topic}, score: ${(r.score * 100).toFixed(0)}%)*\n${r.content.substring(0, 300)}${r.content.length > 300 ? '…' : ''}`
        )
        .join('\n\n')}`;

      await ChatMessage.create({
        userId: session.userId,
        sessionId: activeSessionId,
        role: 'assistant',
        content: fallbackAnswer,
        source: 'local',
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({
          text: fallbackAnswer,
          source: 'local',
          latencyMs: Date.now() - startTime,
          tokensUsed: 0,
          fallback: true,
          sessionId: activeSessionId,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
