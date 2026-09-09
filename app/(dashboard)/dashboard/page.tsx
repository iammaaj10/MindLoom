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
    <div className="space-y-8 animate-fade-up">
      {/* ─── Welcome Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-white via-zinc-200 to-cyan-400 bg-clip-text text-transparent">
                {session?.name || 'User'}
              </span>
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Online
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Real-time telemetry and state of your personal hybrid intelligence engine.
          </p>
        </div>

        <Link
          href="/documents"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span>Ingest Source</span>
        </Link>
      </div>

      {/* ─── Live Telemetry Grid (Bento) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Documents & Chunks */}
        <div className="rounded-2xl p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] hover:border-cyan-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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
            <div className="text-3xl font-bold font-mono tracking-tight text-white mb-1">
              {documentCount}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Ingested Documents
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
              {chunkCount > 0 ? `${chunkCount} chunks in MongoDB` : 'Awaiting document upload'}
            </div>
          </div>
        </div>

        {/* Metric 2: Total Queries */}
        <div className="rounded-2xl p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] hover:border-indigo-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white mb-1">
              {totalQueries}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Total Queries
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
              RAG & Reasoning sessions
            </div>
          </div>
        </div>

        {/* Metric 3: Answered Locally */}
        <div className="rounded-2xl p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Local First
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-emerald-300 mb-1">
              {localRatio}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Answered Locally
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
              Zero Gemini API cost ratio
            </div>
          </div>
        </div>

        {/* Metric 4: Daily Journal & Growth */}
        <div className="rounded-2xl p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] hover:border-amber-500/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Streak Active
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white mb-1">
              {logCount}
            </div>
            <div className="text-xs font-medium text-zinc-400">
              Journal Entries
            </div>
            <div className="text-[11px] text-zinc-500 mt-1 font-mono">
              Continuous learning logs
            </div>
          </div>
        </div>
      </div>

      {/* ─── Recent Knowledge Documents Quick Strip ─── */}
      {recentDocs.length > 0 && (
        <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                Live Indexed Knowledge ({recentDocs.length})
              </h2>
            </div>
            <Link
              href="/documents"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage all documents</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentDocs.map((doc) => (
              <div
                key={doc._id.toString()}
                className="rounded-xl p-3.5 bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{doc.title}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{doc.category}</p>
                  </div>
                </div>

                <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
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
            className="group rounded-2xl p-5 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-cyan-500/40 hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-cyan-300 transition-colors flex items-center justify-between">
              <span>Upload Documents</span>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Feed your AI with PDFs, research papers, and notes.
            </p>
          </Link>

          <Link
            href="/chat"
            className="group rounded-2xl p-5 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors flex items-center justify-between">
              <span>Ask Your Companion</span>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Query your indexed chunks with local search & Gemini reasoning.
            </p>
          </Link>

          <Link
            href="/journal"
            className="group rounded-2xl p-5 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              <span>Daily Reflection</span>
              <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Log daily activities, time breakdowns, and learnings.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
