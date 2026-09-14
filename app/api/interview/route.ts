import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { streamWithGemini, buildSystemPrompt } from '@/lib/ai/gemini';
import { searchChunks } from '@/lib/ml/retrieval';
import { buildContext, contextToPromptBlock } from '@/lib/ml/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { message, topic, history } = await request.json();

  if (!topic) {
    return new Response(JSON.stringify({ error: 'Topic is required' }), { status: 400 });
  }

  // 1. Gather context about this specific topic from the user's local documents
  const searchResults = await searchChunks(session.userId, topic, 5);
  const context = buildContext(topic, searchResults);
  const promptBlock = contextToPromptBlock(context);

  // 2. Build the Interviewer Persona
  let interviewerPrompt = `You are a technical interviewer conducting a mock interview with the user.
The topic for this interview is: ${topic}.

CRITICAL RULES:
1. ONLY ask questions related to this topic, and specifically based on the context provided below. 
2. Ask ONE question at a time.
3. Wait for the user's answer before proceeding to the next question.
4. Evaluate the user's previous answer briefly before asking the next question.
5. If the user doesn't know, provide a short, supportive explanation based on the context, then move on.
6. Keep the tone professional but encouraging.

USER'S LOCAL KNOWLEDGE CONTEXT:
${promptBlock}`;

  // If there is chat history, append it to the system prompt to maintain state
  // (Since streamWithGemini only takes systemPrompt and userMessage currently)
  if (history && history.length > 0) {
    interviewerPrompt += `\n\nPREVIOUS CHAT HISTORY:\n${history.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
  }

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream Gemini response
          for await (const chunk of streamWithGemini(interviewerPrompt, message, session.userId)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', text: chunk })}\n\n`)
            );
          }
          
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          );
          controller.close();
        } catch (err) {
          console.error('[Interview] Stream error:', err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`)
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
  } catch (error) {
    console.error('[Interview] Route failed:', error);
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable.' }),
      { status: 503 }
    );
  }
}
