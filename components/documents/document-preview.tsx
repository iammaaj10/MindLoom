'use client';

import { useState, useEffect } from 'react';
import { getDocumentPreview } from '@/app/actions/documents';

interface DocumentPreviewProps {
  docId: string;
  docTitle: string;
  onClose: () => void;
}

export default function DocumentPreview({ docId, docTitle, onClose }: DocumentPreviewProps) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [chunkCount, setChunkCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const res = await getDocumentPreview(docId);
      if (res.success && res.document) {
        setContent(res.document.content);
        setChunkCount(res.document.chunkCount);
      } else if (res.error) {
        setError(res.error);
      }
      setIsLoading(false);
    }
    load();
  }, [docId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-zinc-950 border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{docTitle}</h3>
              <p className="text-[11px] text-zinc-500 font-mono">{chunkCount} chunks extracted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-xs text-zinc-500 font-mono">Loading document content...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-sans bg-transparent p-0 m-0 border-0">
                {content || 'No content extracted from this document.'}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500 font-mono">Press Esc to close</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/[0.06] text-zinc-300 text-xs font-medium hover:bg-white/[0.1] transition-all border border-white/[0.08]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
