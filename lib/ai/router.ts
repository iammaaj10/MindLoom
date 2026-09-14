import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import Chunk from '@/lib/db/models/chunk';
import ChatMessage from '@/lib/db/models/chat-history';
import Log from '@/lib/db/models/log';
import mongoose from 'mongoose';

// ─── Types ────────────────────────────────────────────

export type QueryIntent = 'local_stats' | 'local_lookup' | 'gemini_rag';

export interface RouterDecision {
  intent: QueryIntent;
  source: 'local' | 'gemini';
  localAnswer?: string;
  confidence: number;
}

// ─── Pattern Matchers ─────────────────────────────────

const STATS_PATTERNS: { pattern: RegExp; handler: string }[] = [
  { pattern: /how many (documents?|files?|pdfs?)/i, handler: 'doc_count' },
  { pattern: /how many chunks?/i, handler: 'chunk_count' },
  { pattern: /how many (quer|chat|message|conversation)/i, handler: 'query_count' },
  { pattern: /how many (journal|log|entr)/i, handler: 'log_count' },
  { pattern: /total (documents?|files?|chunks?)/i, handler: 'doc_count' },
  { pattern: /list.*(documents?|files?)/i, handler: 'list_docs' },
  { pattern: /what.*(documents?|files?).*have/i, handler: 'list_docs' },
  { pattern: /show.*my.*(documents?|files?)/i, handler: 'list_docs' },
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening))[\s!.?]*$/i,
];

// ─── Intent Classifier ───────────────────────────────

export async function classifyIntent(
  query: string,
  userId: string
): Promise<RouterDecision> {
  const trimmed = query.trim();

  // 1. Check if it's just a greeting
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        intent: 'local_stats',
        source: 'local',
        localAnswer: `Hey there! 👋 I'm your MindLoom companion. I can help you search through your documents, answer questions about your knowledge base, or track your daily activities. What would you like to do?`,
        confidence: 1.0,
      };
    }
  }

  // 2. Check for stats/aggregation queries (answerable locally)
  for (const { pattern, handler } of STATS_PATTERNS) {
    if (pattern.test(trimmed)) {
      const answer = await handleStatsQuery(handler, userId);
      return {
        intent: 'local_stats',
        source: 'local',
        localAnswer: answer,
        confidence: 0.95,
      };
    }
  }

  // 3. Everything else goes to Gemini RAG
  return {
    intent: 'gemini_rag',
    source: 'gemini',
    confidence: 0.8,
  };
}

// ─── Local Stats Handlers ─────────────────────────────

async function handleStatsQuery(
  handler: string,
  userId: string
): Promise<string> {
  await dbConnect();
  const uid = new mongoose.Types.ObjectId(userId);

  switch (handler) {
    case 'doc_count': {
      const count = await DocumentModel.countDocuments({ userId: uid });
      return `You have **${count}** document${count !== 1 ? 's' : ''} uploaded in your knowledge base.`;
    }
    case 'chunk_count': {
      const count = await Chunk.countDocuments({ userId: uid });
      return `Your documents have been split into **${count}** searchable chunk${count !== 1 ? 's' : ''}.`;
    }
    case 'query_count': {
      const count = await ChatMessage.countDocuments({
        userId: uid,
        role: 'user',
      });
      return `You've made **${count}** query${count !== 1 ? 'ies' : 'y'} so far.`;
    }
    case 'log_count': {
      const count = await Log.countDocuments({ userId: uid });
      return `You have **${count}** journal entr${count !== 1 ? 'ies' : 'y'} logged.`;
    }
    case 'list_docs': {
      const docs = await DocumentModel.find({ userId: uid })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title category chunkCount createdAt')
        .lean();

      if (docs.length === 0) {
        return `You haven't uploaded any documents yet. Head to the **Documents** page to get started!`;
      }

      const list = docs
        .map(
          (d: any, i: number) =>
            `${i + 1}. **${d.title}** — _${d.category}_ (${d.chunkCount} chunks)`
        )
        .join('\n');

      return `Here are your recent documents:\n\n${list}`;
    }
    default:
      return 'I couldn\'t process that request locally.';
  }
}
