'use client';

import { useState, useTransition } from 'react';
import { semanticSearch, SearchResponse } from '@/app/actions/search';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPromptBlock, setShowPromptBlock] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(async () => {
      const res = await semanticSearch(query, 5);
      setResponse(res);
    });
  }

  return (
    <div className="space-y-8">
      {/* ─── Header ─── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Semantic Search</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Ask a question — we&apos;ll find the most relevant chunks from your documents using AI vector search.
        </p>
      </div>

      {/* ─── Search Bar ─── */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. What is machine learning?"
            className="input-field pl-11 h-12 text-base"
            disabled={isPending}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="btn-primary h-12 px-6 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              Searching…
            </span>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* ─── Error ─── */}
      {response?.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {response.error}
        </div>
      )}

      {/* ─── Results ─── */}
      {response && !response.error && (
        <div className="space-y-6">
          {/* Summary Bar */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3">
            <div className="text-sm text-zinc-300">
              <span className="font-semibold text-white">{response.results.length}</span>{' '}
              chunk{response.results.length !== 1 ? 's' : ''} found
              {response.context.entities.length > 0 && (
                <span className="text-zinc-500">
                  {' '}· {response.context.entities.length} entities detected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowPromptBlock(!showPromptBlock)}
              className="btn-ghost text-xs font-mono"
            >
              {showPromptBlock ? 'Hide' : 'Show'} Prompt Block
            </button>
          </div>

          {/* Prompt Block Preview */}
          {showPromptBlock && (
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-indigo-500/10 flex items-center gap-2">
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  WEEK 3 PREVIEW
                </span>
                <span className="text-xs text-zinc-400">This is the exact context block that will be sent to Gemini</span>
              </div>
              <pre className="p-4 text-xs font-mono text-indigo-300/80 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {response.promptBlock}
              </pre>
            </div>
          )}

          {/* Chunk Cards */}
          <div className="space-y-3">
            {response.results.map((result, idx) => (
              <div
                key={result._id}
                className="card p-5 space-y-3 transition-all duration-200 hover:border-white/[0.15]"
              >
                {/* Chunk Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
                      #{idx + 1}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      chunk:{result.metadata.chunkIndex}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {result.metadata.topic}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono">score</span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        result.score >= 0.7
                          ? 'text-emerald-400'
                          : result.score >= 0.4
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {result.content.length > 500
                    ? result.content.slice(0, 500) + '…'
                    : result.content}
                </p>

                {/* Entity Tags */}
                {result.metadata.entities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {result.metadata.entities.slice(0, 10).map((entity, i) => {
                      const [type, ...rest] = entity.split(':');
                      const label = rest.join(':');
                      const colorMap: Record<string, string> = {
                        DATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                        ENTITY: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                        ACRONYM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                        TECH: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                        EMAIL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                        URL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                        MEASURE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                      };
                      const color = colorMap[type] || 'bg-white/[0.06] text-zinc-400 border-white/[0.08]';
                      return (
                        <span
                          key={i}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${color}`}
                        >
                          <span className="opacity-60">{type}:</span>{label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {response.results.length === 0 && (
            <div className="text-center py-16">
              <div className="text-zinc-600 text-5xl mb-4">∅</div>
              <p className="text-zinc-400 text-sm">No matching chunks found.</p>
              <p className="text-zinc-500 text-xs mt-1">
                Upload documents first, then try a different query.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Initial State ─── */}
      {!response && !isPending && (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] flex items-center justify-center">
            <svg className="w-7 h-7 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">Type a question to search across all your documents.</p>
          <p className="text-zinc-600 text-xs mt-1.5">
            Results are ranked by semantic similarity, not keyword matching.
          </p>
        </div>
      )}
    </div>
  );
}
