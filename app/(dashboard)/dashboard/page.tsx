import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import dbConnect from '@/lib/db/connection';
import DocumentModel from '@/lib/db/models/document';
import Chunk from '@/lib/db/models/chunk';
import ChatMessage from '@/lib/db/models/chat-history';
import Log from '@/lib/db/models/log';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard — Mindloom Overview',
};

export default async function DashboardPage() {
  const session = await getSession();

  let documentCount = 0;
  let chunkCount = 0;
  let totalQueries = 0;
  let localQueries = 0;
  let logCount = 0;
  let recentDocs: any[] = [];

  if (session?.userId) {
    try {
      await dbConnect();
      const [docsNum, chunksNum, queriesNum, localQueriesNum, logsNum, latestDocs] =
        await Promise.all([
          DocumentModel.countDocuments({ userId: session.userId }),
          Chunk.countDocuments({ userId: session.userId }),
          ChatMessage.countDocuments({ userId: session.userId, role: 'user' }),
          ChatMessage.countDocuments({
            userId: session.userId,
            source: 'local',
            role: 'user',
          }),
          Log.countDocuments({ userId: session.userId }),
          DocumentModel.find({ userId: session.userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),
        ]);

      documentCount = docsNum;
      chunkCount = chunksNum;
      totalQueries = queriesNum;
      localQueries = localQueriesNum;
      logCount = logsNum;
      recentDocs = latestDocs;
    } catch (e) {
      console.error('Failed to load dashboard metrics from DB:', e);
    }
  }

  const localRatio =
    totalQueries > 0
      ? `${Math.round((localQueries / totalQueries) * 100)}%`
      : '100%';

  return (
    <div className="space-y-12 animate-fade-up relative">
      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 pt-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back,{' '}
              <span>
                {session?.name?.split(' ')[0] || 'User'}
              </span>
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] font-mono font-medium text-emerald-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Your hybrid intelligence engine is synced and ready. Here is a real-time overview of your second brain.
          </p>
        </div>

        <Link
          href="/documents"
          className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] shrink-0"
        >
          <span>Ingest Source</span>
          <svg className="group-hover:translate-x-0.5 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* ─── Live Telemetry Grid (Bento) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Documents & Chunks */}
        <div className="group rounded-3xl p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {chunkCount} chunks
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white mb-1">
              {documentCount}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Ingested Documents
            </div>
          </div>
        </div>

        {/* Metric 2: Total Queries */}
        <div className="group rounded-3xl p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white mb-1">
              {totalQueries}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Total AI Queries
            </div>
          </div>
        </div>

        {/* Metric 3: Answered Locally */}
        <div className="group rounded-3xl p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Privacy First
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white mb-1">
              {localRatio}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Locally Answered
            </div>
          </div>
        </div>

        {/* Metric 4: Daily Journal */}
        <div className="group rounded-3xl p-6 bg-white/[0.02] backdrop-blur-xl border border-white/[0.04] hover:bg-white/[0.04] hover:border-amber-500/30 transition-all duration-500 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform duration-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Active Streak
            </span>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white mb-1">
              {logCount}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Journal Entries
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Knowledge Documents Quick Strip ─── */}
      {recentDocs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-zinc-300 tracking-tight">
              Recently Indexed Knowledge
            </h2>
            <Link
              href="/documents"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDocs.map((doc) => (
              <div
                key={doc._id.toString()}
                className="group rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] text-zinc-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 flex items-center justify-center shrink-0 border border-white/[0.05] group-hover:border-cyan-500/20 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="truncate">
                    <p className="text-[13px] font-medium text-zinc-200 group-hover:text-white transition-colors truncate">{doc.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">{doc.category}</p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-300 transition-colors">
                  {doc.chunkCount} chunks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-300 tracking-tight">
          System Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/documents"
            className="group rounded-3xl p-6 bg-white/[0.015] border border-white/[0.04] hover:border-cyan-500/30 hover:bg-white/[0.03] transition-all duration-300 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-cyan-400 transition-all duration-300">→</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Upload Documents
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Feed your AI with new knowledge.
              </p>
            </div>
          </Link>

          <Link
            href="/chat"
            className="group rounded-3xl p-6 bg-white/[0.015] border border-white/[0.04] hover:border-indigo-500/30 hover:bg-white/[0.03] transition-all duration-300 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-indigo-400 transition-all duration-300">→</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Chat Companion
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Query your personalized AI engine.
              </p>
            </div>
          </Link>

          <Link
            href="/journal"
            className="group rounded-3xl p-6 bg-white/[0.015] border border-white/[0.04] hover:border-emerald-500/30 hover:bg-white/[0.03] transition-all duration-300 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-emerald-400 transition-all duration-300">→</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Daily Reflection
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Log activities and build your graph.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
