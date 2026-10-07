'use client';

import React, { useState } from 'react';

export default function DocumentsClientWrapper({ 
  children, 
  documentsLength, 
  totalChunks 
}: { 
  children: React.ReactNode, 
  documentsLength: number, 
  totalChunks: number 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={isFullscreen 
      ? "fixed inset-0 z-[100] bg-[#030303] p-8 md:p-12 flex flex-col overflow-hidden animate-in fade-in duration-300"
      : "relative flex flex-col overflow-hidden bg-[#030303] h-[calc(100vh-5rem)] rounded-[2rem] border border-white/[0.04] p-6 md:p-10 transition-all"
    }>
      
      {/* Premium Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
        {/* ─── Page Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-6 border-b border-white/[0.04] shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                Knowledge Ingestion
              </h1>
              <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                PIPELINE ACTIVE
              </span>
            </div>
            <p className="text-[14px] text-zinc-400 max-w-xl leading-relaxed">
              Upload files to extract, tokenize, and map knowledge into the local semantic vector space.
            </p>
          </div>

          {/* Aggregate Stats & Fullscreen */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-2 shadow-inner">
                <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-widest">Docs:</span>
                <span className="text-[13px] font-bold font-mono text-white">{documentsLength}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/10 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                <span className="text-[11px] text-cyan-400/80 font-medium uppercase tracking-widest">Chunks:</span>
                <span className="text-[13px] font-bold font-mono text-cyan-300">{totalChunks}</span>
              </div>
            </div>
            
            <div className="w-px h-8 bg-white/10 hidden sm:block"></div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Maximize Screen"}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95 border border-white/5"
            >
              {isFullscreen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-8 pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
