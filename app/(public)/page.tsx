import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MindloomLogo } from '@/components/ui/mindloom-logo';
import HeroInteractive from '@/components/landing/hero-interactive';

export const metadata: Metadata = {
  title: 'Mindloom — Personal AI Companion. Dual-Engine Intelligence.',
  description:
    'A self-hosted, two-layer personal AI companion that learns from your documents, notes, and daily logs. Blazing local ML for instant recall, Cortex Ultra for deep cognitive reasoning.',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/25 selection:text-cyan-200 overflow-hidden font-sans">
      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO SECTION — Bespoke Spatial Dual-Engine Experience
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="overview" className="relative pt-10 pb-20 md:pt-16 md:pb-28 px-6 max-w-7xl mx-auto">
        {/* Ambient Iridescent Spotlights */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[700px] md:w-[1050px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[380px] h-[380px] bg-fuchsia-500/10 rounded-full blur-[130px] pointer-events-none" />

        <HeroInteractive />
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. HARDWARE & SOFTWARE SHOWCASE — Apple Pro Device Bezel
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-24 bg-gradient-to-b from-black via-zinc-950/60 to-black border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <p className="text-xs font-semibold font-mono uppercase tracking-[0.14em] text-cyan-400">
              The Interface
            </p>
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
              Engineered with titanium precision.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              A bespoke dashboard built to monitor knowledge ingestion, document chunking, and dual-layer query execution in real time.
            </p>
          </div>

          {/* Apple Pro Display Mockup with 3D Depth */}
          <div className="relative rounded-3xl p-3 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.85)] transform-gpu hover:scale-[1.008] transition-transform duration-500">
            <div className="rounded-2xl bg-zinc-950 border border-white/[0.08] overflow-hidden">
              {/* Window Header */}
              <div className="h-10 px-4 bg-zinc-900/60 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                  <span className="text-zinc-600">mindloom.internal</span>
                  <span>/</span>
                  <span className="text-zinc-200">dashboard</span>
                </div>
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Dual-Engine Connected
                </div>
              </div>

              {/* Simulation Content Body */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-black/40">
                {/* Left Telemetry Column */}
                <div className="md:col-span-4 space-y-4">
                  <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Knowledge Storage</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">1 Document</div>
                    <div className="text-xs text-cyan-400 font-mono mt-0.5">3 Chunks Ingested • Indexed</div>
                  </div>

                  <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Query Router Split</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">100% Local</div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">0 Tokens billed to Cortex Ultra</div>
                  </div>

                  <div className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-xs font-mono text-zinc-500 uppercase">Vector Search Latency</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">38 ms</div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">Sliding window retrieval</div>
                  </div>
                </div>

                {/* Right Interactive Chat Simulation */}
                <div className="md:col-span-8 rounded-xl p-6 bg-zinc-950/80 border border-white/[0.08] flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* User Prompt */}
                    <div className="flex items-start gap-3 justify-end">
                      <div className="p-3.5 rounded-2xl rounded-tr-none bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-100 max-w-md leading-relaxed">
                        What are the primary technical accomplishments mentioned in my uploaded resume?
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500 text-black font-bold flex items-center justify-center text-xs shrink-0">
                        M
                      </div>
                    </div>

                    {/* Mindloom Response */}
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        <MindloomLogo size={28} />
                      </div>
                      <div className="p-4 rounded-2xl rounded-tl-none bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 max-w-lg space-y-2 leading-relaxed">
                        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.05]">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Answered Locally via Chunk #2
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">38ms • Zero API Cost</span>
                        </div>
                        <p>
                          Based on your uploaded resume document, your highlighted architectural work includes architecting a dual-layer RAG pipeline, optimizing sub-50ms local vector lookups, and orchestrating full-stack Next.js 16 applications with strict session isolation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Input Bar */}
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between text-xs text-zinc-500">
                    <span className="pl-2">Ask your personal AI anything about your knowledge...</span>
                    <div className="px-2.5 py-1 rounded-lg bg-white text-black font-semibold text-[10px]">
                      Send ↵
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. DUAL-ENGINE ARCHITECTURE — Apple Chip-Style Breakdown
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="dual-engine" className="py-28 px-6 max-w-7xl mx-auto scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold font-mono uppercase tracking-[0.14em] text-indigo-400">
            System Architecture
          </p>
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
            Two engines. One mind.
          </h2>
          <p className="text-zinc-400 text-base">
            Every other AI sends your private life to third-party data centers. Mindloom delegates work between an edge local ML layer and Cortex Ultra.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Engine 1: Local ML Microservice */}
          <div className="group rounded-3xl p-8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden transform-gpu hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Layer 1: Deterministic Engine
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Local ML Microservice
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Runs completely on your hardware or isolated backend container. Employs sentence-transformers (`all-MiniLM-L6-v2`) and spaCy Named Entity Recognition for semantic parsing without internet access.
              </p>
            </div>

            <ul className="mt-8 space-y-3 pt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Sub-50ms vector chunk retrieval</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Zero token cost & zero rate limits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Direct structured aggregation from MongoDB</span>
              </li>
            </ul>
          </div>

          {/* Engine 2: Cortex Ultra Deep Cognitive Synthesizer */}
          <div className="group rounded-3xl p-8 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-indigo-500/40 transition-all duration-500 shadow-2xl relative overflow-hidden transform-gpu hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M12 2v20M2 12h20M4.929 4.929l14.142 14.142M4.929 19.071L19.071 4.929" />
              </svg>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Layer 2: Synaptic Intelligence
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Cortex Ultra Synthesizer
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                When open-ended synthesis or multi-hop logic is demanded, Mindloom compresses your top-k retrieved chunks into structured JSON context and invokes Cortex Ultra with automated rate-limit backoff.
              </p>
            </div>

            <ul className="mt-8 space-y-3 pt-6 border-t border-white/[0.06] text-xs font-mono text-zinc-300">
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Deep multi-document cognitive reasoning</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Context compression (up to 70% token savings)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <span>Graceful degradation if cloud network is offline</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. FEATURE SHOWCASE (Apple Bento Grid) — All Platform Capabilities
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-28 px-6 bg-zinc-950 border-t border-white/[0.06] scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold font-mono uppercase tracking-[0.14em] text-cyan-400">
              Capabilities
            </p>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
              Every feature, tuned to perfection.
            </h2>
            <p className="text-zinc-400 text-base">
              Built systematically according to our 30-day implementation plan.
            </p>
          </div>

          {/* Bento Grid with 3D Hover Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Intelligent Ingestion (Wide) */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/[0.2] transition-all duration-500 transform-gpu hover:-translate-y-1.5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  Precision Ingestion & Sliding-Window Chunker
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                  Upload PDFs, text, and markdown files. Mindloom automatically extracts raw text streams via pure Node.js parsers and slices documents into overlapping 250-word chunks stored in MongoDB Atlas, ready for vector indexing.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">PDF / TXT / MD</span>
                <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">50-Word Overlap</span>
                <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">Week 1 Complete</span>
              </div>
            </div>

            {/* Bento Card 2: Spaced Repetition (Tall) */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/[0.2] transition-all duration-500 transform-gpu hover:-translate-y-1.5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  SM-2 Spaced Repetition
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Scientifically calculated memory retention curves. Identifies topics you haven’t reviewed recently and generates mock interview sessions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-amber-400/90">
                SuperMemo-2 Forgetting Curve
              </div>
            </div>

            {/* Bento Card 3: Continuous Journaling */}
            <div className="rounded-3xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/[0.2] transition-all duration-500 transform-gpu hover:-translate-y-1.5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  Cognitive Journal & Logging
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Input free-form reflections each day. Mindloom extracts topics, skills, and time allocation automatically, generating live productivity charts.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] text-xs font-mono text-emerald-400/90">
                Automated Time & Topic Clustering
              </div>
            </div>

            {/* Bento Card 4: Absolute Security & Sovereignty (Wide) */}
            <div className="md:col-span-2 rounded-3xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/[0.2] transition-all duration-500 transform-gpu hover:-translate-y-1.5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  Zero Data Leakage & Perimeter Defense
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                  Encrypted at rest and isolated by per-user tenant keys in MongoDB. Your private documents are never retained by model training pipelines or external surveillance systems.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">HTTP-Only JWTs</span>
                <span className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">Compound Indexing</span>
                <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Client-Side Isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. TECHNICAL SPECIFICATIONS — Apple Comparison Table
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="specs" className="py-28 px-6 max-w-5xl mx-auto scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-semibold font-mono uppercase tracking-[0.14em] text-cyan-400">
            Specifications
          </p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            Comparing the Execution Layers.
          </h2>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/70 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-3 p-4 sm:p-6 bg-white/[0.02] border-b border-white/[0.06] text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            <div>Parameter</div>
            <div className="text-cyan-400">Layer 1 (Local ML)</div>
            <div className="text-indigo-400">Layer 2 (Cortex Ultra)</div>
          </div>

          <div className="divide-y divide-white/[0.04] text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <div className="text-zinc-400 font-medium">Query Latency</div>
              <div className="text-white font-mono font-semibold">Sub-45ms</div>
              <div className="text-zinc-300 font-mono">600ms – 1.8s</div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <div className="text-zinc-400 font-medium">Per-Query Cost</div>
              <div className="text-emerald-400 font-mono font-semibold">$0.00 (Free forever)</div>
              <div className="text-zinc-300 font-mono">Sub-cent (Compressed)</div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <div className="text-zinc-400 font-medium">Data Destination</div>
              <div className="text-emerald-400 font-mono">Local Memory / Sandbox</div>
              <div className="text-zinc-300 font-mono">SSL Encrypted Pipeline</div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <div className="text-zinc-400 font-medium">Offline Resilience</div>
              <div className="text-white font-mono">100% Functional</div>
              <div className="text-zinc-400 font-mono">Graceful Fallback</div>
            </div>

            <div className="grid grid-cols-3 p-4 sm:p-6 items-center">
              <div className="text-zinc-400 font-medium">Ideal Workload</div>
              <div className="text-zinc-300">Semantic Search, Time Logs, Exact Recall</div>
              <div className="text-zinc-300">Synthesis, Complex Reasoning, Mock Interviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. FINAL CTA — Apple Minimalist Finish
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 border-t border-white/[0.08] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-white/[0.04] border border-white/[0.1] shadow-2xl">
            <MindloomLogo size={36} />
          </div>

          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white leading-tight">
            Deploy your mind today.
          </h2>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-light">
            Upload your first document. Watch your personal AI extract and chunk it into permanent vector memory in seconds.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-9 py-4 rounded-full text-sm font-semibold text-black bg-white hover:bg-zinc-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.45)] active:scale-95"
            >
              Get Started with Mindloom
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-sm font-medium text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all hover:text-white"
            >
              Sign In to Dashboard
            </Link>
          </div>

          <p className="text-xs text-zinc-500 pt-2 font-mono">
            Free forever for personal use • No credit card required
          </p>
        </div>
      </section>
    </div>
  );
}
