'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDocument, type DocumentResult } from '@/app/actions/documents';
import DocumentPreview from './document-preview';

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
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Poll for updates if any document is in a processing state
  useEffect(() => {
    const isProcessing = documents.some(
      (doc) => doc.status === 'processing' || doc.status === 'uploading'
    );
    
    if (isProcessing) {
      const interval = setInterval(() => {
        router.refresh();
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [documents, router]);

  const handleDelete = (docId: string) => {
    startTransition(async () => {
      await deleteDocument(docId);
      setConfirmId(null);
    });
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-3xl border border-white/[0.05] p-12 text-center bg-white/[0.01] backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-white/[0.02] border border-white/10 shadow-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-white mb-2 tracking-tight">
          No knowledge documents yet
        </h3>
        <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
          Upload your notes, PDFs, or research above to populate your vector database.
        </p>
      </div>
    );
  }

  const grid = (
    <div className="flex flex-col gap-3">
      {documents.map((doc, i) => (
        <div
          key={doc._id}
          className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06] transition-all duration-300"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <div className="flex items-center gap-4">
            <FileTypeIcon type={doc.fileType} />
            <div>
              <h3
                className="text-[15px] font-medium text-white mb-1 truncate max-w-[200px] sm:max-w-[300px] tracking-tight"
                title={doc.title}
              >
                {doc.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {doc.category} • {formatDate(doc.createdAt)}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">
                  {doc.chunkCount} Chunks
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <StatusBadge status={doc.status} />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewId(doc._id)}
                className="p-2 rounded-xl text-zinc-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                title="Preview document"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>

              {confirmId === doc._id ? (
                <div className="flex items-center gap-2 animate-fade-up">
                  <button
                    onClick={() => handleDelete(doc._id)}
                    disabled={isPending}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
                  >
                    {isPending ? '...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-[11px] font-medium px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(doc._id)}
                  title="Delete document"
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {grid}

      {/* B3: Document Preview Modal */}
      {previewId && (
        <DocumentPreview
          docId={previewId}
          docTitle={documents.find(d => d._id === previewId)?.title || 'Document'}
          onClose={() => setPreviewId(null)}
        />
      )}
    </>
  );
}
