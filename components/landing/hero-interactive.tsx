'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AiOrb from '@/components/ui/ai-orb';

interface InteractivePrompt {
  label: string;
  query: string;
  route: 'local' | 'cortex' | 'hybrid';
  latency: string;
  cost: string;
  sourceChunk: string;
  response: string;
}

const interactivePrompts: InteractivePrompt[] = [
  {
    label: '⚡ Resume Analysis',
    query: 'What are my top system architecture skills in my uploaded resume?',
    route: 'local',
    latency: '34ms',
    cost: '$0.00',
    sourceChunk: 'Chunk #2 • Local Vector Index',
    response:
      'Extracted from Maaj_Resume (Chunk #2): Distributed RAG pipeline design, sub-50ms vector chunk retrieval with all-MiniLM-L6-v2, and Next.js full-stack isolation.',
  },
  {
    label: '🧠 Mock Interview',
    query: 'Generate a senior-level technical interview question on my RAG chunking logic.',
    route: 'cortex',
    latency: '820ms',
    cost: '<$0.001',
    sourceChunk: 'Cortex Ultra • Context Compressed',
    response:
      '“In your sliding-window chunker with 250-word bounds and 50-word overlap, how do you prevent semantic fragmentation across code blocks versus natural prose?”',
  },
  {
    label: '📊 Study Telemetry',
    query: 'How much study time have I logged on distributed systems this week?',
    route: 'local',
    latency: '18ms',
    cost: '$0.00',
    sourceChunk: 'MongoDB Aggregation • Local ML',
    response:
      'Aggregated from your continuous journal: 6.5 hours logged across 4 sessions, with primary focus on vector indexing and token compression.',
  },
];

export default function HeroInteractive() {
  const [activeEngine, setActiveEngine] = useState<'hybrid' | 'local' | 'cortex'>('hybrid');
  const [selectedPrompt, setSelectedPrompt] = useState<InteractivePrompt>(interactivePrompts[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelectPrompt = (prompt: InteractivePrompt) => {
    setIsSimulating(true);
    setSelectedPrompt(prompt);
    setTimeout(() => {
      setIsSimulating(false);
    }, 280);
  };

  return (
    <div className="w-full relative z-10">
      {/* ─── 1. Architectural Blueprint Rail (Human-Engineered System Header) ─── */}
      <div className="border-b border-white/[0.08] pb-5 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Engineering System Breadcrumb */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-xs font-mono uppercase tracking-[0.24em] text-zinc-300 font-semibold">
              Architecture Spec
            </span>
            <span className="text-zinc-700 font-mono text-xs">/</span>
            <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
              Hybrid Edge-to-Cloud Cognitive Interconnect
            </span>
          </div>

          {/* Right: Machined Silicon Interconnect Console */}
          <div className="inline-flex items-center self-start md:self-auto rounded-xl bg-zinc-950/90 border border-white/[0.12] p-1 shadow-[0_4px_24px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]">
            {/* Module 1: Local ML */}
            <button
              type="button"
              onClick={() => {
                setActiveEngine('local');
                handleSelectPrompt(interactivePrompts[0]);
              }}
              className={`group relative px-3 py-1.5 rounded-lg text-left transition-all duration-300 cursor-pointer flex items-center gap-2.5 ${
                activeEngine === 'local'
                  ? 'bg-cyan-500/15 text-white border border-cyan-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-sm transition-colors ${
                  activeEngine === 'local' ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-zinc-600'
                }`}
              />
              <div className="leading-tight">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Core 01</div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>Local ML</span>
                  <span className="text-[10px] font-mono text-cyan-400 font-normal">34ms</span>
                </div>
              </div>
            </button>

            <span className="text-zinc-700 px-1 font-mono text-xs select-none">⇄</span>

            {/* Module 2: Autonomous Arbiter */}
            <button
              type="button"
              onClick={() => {
                setActiveEngine('hybrid');
                handleSelectPrompt(interactivePrompts[2]);
              }}
              className={`group relative px-3 py-1.5 rounded-lg text-left transition-all duration-300 cursor-pointer flex items-center gap-2.5 ${
                activeEngine === 'hybrid'
                  ? 'bg-white/[0.1] text-white border border-white/[0.22] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-sm transition-colors ${
                  activeEngine === 'hybrid' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-zinc-600'
                }`}
              />
              <div className="leading-tight">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Arbiter</div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>Auto-Route</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-normal">Dual</span>
                </div>
              </div>
            </button>

            <span className="text-zinc-700 px-1 font-mono text-xs select-none">⇄</span>

            {/* Module 3: Cortex Ultra */}
            <button
              type="button"
              onClick={() => {
                setActiveEngine('cortex');
                handleSelectPrompt(interactivePrompts[1]);
              }}
              className={`group relative px-3 py-1.5 rounded-lg text-left transition-all duration-300 cursor-pointer flex items-center gap-2.5 ${
                activeEngine === 'cortex'
                  ? 'bg-indigo-500/15 text-white border border-indigo-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-white/[0.04]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-sm transition-colors ${
                  activeEngine === 'cortex' ? 'bg-indigo-400 shadow-[0_0_8px_#818cf8]' : 'bg-zinc-600'
                }`}
              />
              <div className="leading-tight">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Core 02</div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>Cortex Ultra</span>
                  <span className="text-[10px] font-mono text-indigo-400 font-normal">Synthesis</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Hero Headline & Spatial Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Spatial Typography & Live Prompt Sandbox */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-semibold tracking-[-0.04em] text-white leading-[1.03] text-balance">
              Your mind.{' '}
              <span className="bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                Digitized & sovereign.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 font-normal max-w-xl leading-relaxed">
              Upload your documents, notes, and study streams. Mindloom routes deterministic recall to an edge local ML layer in 34ms, engaging Cortex Ultra only when cross-document cognitive synthesis is demanded.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-all shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>Deploy Personal AI Free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/login"
              className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] backdrop-blur-xl transition-all hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <span>Access Dashboard</span>
              <span className="text-zinc-500">→</span>
            </Link>
          </div>

          {/* ─── 3. Live Interactive Engine Routing Sandbox (Unique Feature) ─── */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Live Query Router Simulation
              </span>
              <span>Click prompt to trigger router ↵</span>
            </div>

            {/* Prompt Selector Chips */}
            <div className="flex flex-wrap gap-2">
              {interactivePrompts.map((prompt) => {
                const isSelected = selectedPrompt.label === prompt.label;
                return (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/35 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    {prompt.label}
                  </button>
                );
              })}
            </div>

            {/* Simulated Live Router Terminal Output */}
            <div className="rounded-2xl p-4 bg-zinc-950/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      selectedPrompt.route === 'local'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}
                  >
                    {selectedPrompt.route === 'local' ? '● Routed to Local ML' : '● Routed to Cortex Ultra'}
                  </span>
                  <span className="text-zinc-500">{selectedPrompt.latency}</span>
                </div>
                <span className="text-zinc-400">{selectedPrompt.cost} token fee</span>
              </div>

              <div className="text-xs text-zinc-300 leading-relaxed font-sans min-h-[48px] flex items-center">
                {isSimulating ? (
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>Analyzing semantic tokens & vector distance...</span>
                  </div>
                ) : (
                  <p>{selectedPrompt.response}</p>
                )}
              </div>

              <div className="text-[10px] font-mono text-zinc-500 flex items-center justify-between pt-1 border-t border-white/[0.04]">
                <span>Source: {selectedPrompt.sourceChunk}</span>
                <span className="text-emerald-400">100% Privacy Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Spatial Neural Core with Precision Circular Frame */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4 lg:py-0">
          {/* Spatial Circular Lens Frame */}
          <div className="relative w-full max-w-[380px] sm:max-w-[430px] lg:max-w-[470px] aspect-square flex items-center justify-center">
            {/* Outer Apple Spatial Ring & Ambient Halo */}
            <div className="absolute inset-0 rounded-full border border-white/[0.08] bg-gradient-to-b from-white/[0.04] via-zinc-950/40 to-black/60 backdrop-blur-2xl shadow-[0_0_80px_rgba(99,102,241,0.18),inset_0_1px_1px_rgba(255,255,255,0.15)]" />

            {/* Inner Precision Titanium Radial Guides */}
            <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/[0.05] pointer-events-none" />
            <div className="absolute inset-7 sm:inset-9 rounded-full border border-dashed border-white/[0.06] pointer-events-none" />

            {/* Perfectly Rounded 3D Canvas Viewport */}
            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <AiOrb activeEngine={activeEngine} />
            </div>

            {/* Floating Hardware Specs Tag integrated into the bottom rim */}
            <div className="absolute -bottom-4 px-4 py-2 rounded-2xl bg-zinc-950/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl flex items-center gap-4 text-xs font-mono text-zinc-300 z-20">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>all-MiniLM-L6-v2</span>
              </div>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                <span>Cortex Ultra RAG</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
