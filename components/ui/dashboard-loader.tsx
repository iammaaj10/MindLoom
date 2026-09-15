import React from 'react';

export function DashboardLoader({ title }: { title?: string }) {
  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col gap-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-48 bg-white/10 rounded-md"></div>
        <div className="h-4 w-96 bg-white/5 rounded-md"></div>
      </div>
      
      {/* Content Area Skeleton */}
      <div className="flex-1 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] overflow-hidden">
        <div className="p-6 h-full flex flex-col gap-6">
          <div className="h-12 w-full bg-white/[0.04] rounded-xl"></div>
          <div className="h-full w-full bg-white/[0.02] rounded-xl flex items-center justify-center">
            {title ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                <span className="text-xs text-zinc-500 font-mono tracking-widest uppercase">{title}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
