'use client';

import { useState, useTransition } from 'react';
import { deleteDocument, type DocumentResult } from '@/app/actions/documents';

function FileTypeIcon({ type }: { type: 'pdf' | 'image' | 'text' }) {
  if (type === 'pdf') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (type === 'image') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string; pulse?: boolean }> = {
    uploading: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', label: 'Uploading', pulse: true },
    processing: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Processing', pulse: true },
    embedded: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', label: 'Ready' },
    failed: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Failed' },
  };

  const c = config[status] || config.processing;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ background: c.color }}
      />
      {c.label}
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
      <div className="card p-12 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
        <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          No documents yet
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          Upload your first document to start training your AI
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {documents.map((doc, i) => (
        <div
          key={doc._id}
          className="card group p-4 transition-all duration-200 hover:border-zinc-700 animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <FileTypeIcon type={doc.fileType} />
            </div>

            {/* Delete button */}
            <div className="relative">
              {confirmId === doc._id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(doc._id)}
                    disabled={isPending}
                    className="text-[10px] font-medium px-2 py-1 rounded transition-colors"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                  >
                    {isPending ? '...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-[10px] font-medium px-2 py-1 rounded transition-colors hover:bg-zinc-800"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(doc._id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-800"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            className="text-sm font-medium mb-1 truncate"
            style={{ color: 'var(--text-primary)' }}
            title={doc.title}
          >
            {doc.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text-tertiary)',
                  border: '1px solid var(--border)',
                }}
              >
                {doc.category}
              </span>
              <StatusBadge status={doc.status} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
              {formatDate(doc.createdAt)}
            </span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {doc.chunkCount} chunks
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
