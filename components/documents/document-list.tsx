'use client';

import { useState, useTransition } from 'react';
import { deleteDocument, type DocumentResult } from '@/app/actions/documents';

function FileTypeIcon({ type }: { type: 'pdf' | 'image' | 'text' }) {
  if (type === 'pdf') {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.15)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
    );
  }
  if (type === 'image') {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; border: string; color: string; label: string; pulse?: boolean }> = {
    uploading: {
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
      color: 'text-indigo-400',
      label: 'Uploading',
      pulse: true,
    },
    processing: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      color: 'text-amber-400',
      label: 'Extracting',
      pulse: true,
    },
    embedded: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      color: 'text-emerald-400',
      label: 'Chunked & Ready',
    },
    failed: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      color: 'text-rose-400',
      label: 'Failed',
    },
  };

  const c = config[status] || config.processing;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${c.bg} ${c.border} ${c.color}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${c.pulse ? 'animate-ping' : ''} ${
          status === 'embedded' ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-current'
        }`}
      />
      <span>{c.label}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DocumentList({ documents }: { documents: DocumentResult[] }) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (docId: string) => {
    startTransition(async () => {
      await deleteDocument(docId);
      setConfirmId(null);
    });
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/[0.1] p-12 text-center bg-zinc-950/40">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] text-zinc-500 shadow-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">
          No knowledge documents yet
        </h3>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Upload your notes, PDFs, or resume above to populate your vector database chunks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc, i) => (
        <div
          key={doc._id}
          className="group relative rounded-2xl p-5 bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {/* Top row: Icon + Title + Action */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <FileTypeIcon type={doc.fileType} />

              <div className="relative shrink-0">
                {confirmId === doc._id ? (
                  <div className="flex items-center gap-1.5 animate-fade-up">
                    <button
                      onClick={() => handleDelete(doc._id)}
                      disabled={isPending}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors cursor-pointer"
                    >
                      {isPending ? '...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="text-[11px] font-medium px-2 py-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(doc._id)}
                    title="Delete document"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Document Title */}
            <h3
              className="text-sm font-semibold text-zinc-100 mb-2 truncate tracking-tight"
              title={doc.title}
            >
              {doc.title}
            </h3>

            {/* Category and Status */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 border border-white/[0.06] uppercase tracking-wider">
                {doc.category}
              </span>
              <StatusBadge status={doc.status} />
            </div>
          </div>

          {/* Bottom row: Chunks + Date */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
            <span className="text-zinc-500 text-[11px] font-mono">
              {formatDate(doc.createdAt)}
            </span>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px] font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{doc.chunkCount} {doc.chunkCount === 1 ? 'chunk' : 'chunks'}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
