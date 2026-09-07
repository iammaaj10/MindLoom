import Link from 'next/link';
import type { Metadata } from 'next';
import AiOrb from '@/components/ui/ai-orb';
import { MindloomLogo } from '@/components/ui/mindloom-logo';

export const metadata: Metadata = {
  title: 'Mindloom — Your Personal AI Companion',
  description:
    'A self-hosted, two-layer personal AI that learns from your data. Local ML for speed, Gemini for deep reasoning.',
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white glow-bg">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative pt-10 pb-16 px-6 sm:pt-16 sm:pb-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between min-h-[90vh]">
        
        {/* Ambient background glows for premium feel */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Left Content */}
        <div className="w-full lg:w-[50%] text-left z-10 relative">
          <h1 className="animate-fade-up delay-100 text-5xl sm:text-6xl md:text-[5rem] font-bold tracking-tight mb-8 leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
            Intelligence <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              built on your data.
            </span>
          </h1>

          <p className="animate-fade-up delay-200 text-lg sm:text-xl text-zinc-400 max-w-lg mb-10 leading-relaxed font-light">
            Mindloom learns from your notes, PDFs, and daily logs. 
            Local ML handles the patterns instantly, while Gemini steps in for deep reasoning.
          </p>

          <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full text-sm font-semibold transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
              Start building <span>&rarr;</span>
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white/5 border border-white/10 backdrop-blur-md text-white hover:bg-white/10 px-8 py-4 rounded-full text-sm font-semibold transition-all text-center">
              Explore features
            </Link>
          </div>
        </div>

        {/* Right 3D Orb */}
        <div className="w-full lg:w-[45%] h-[350px] lg:h-[500px] animate-fade-up delay-300 mt-12 lg:mt-0 relative z-0">
          <AiOrb />
        </div>

      </section>

      {/* ═══ PRODUCT PREVIEW ═══ */}
      <section className="relative px-6 pb-32">
        <div className="max-w-5xl mx-auto animate-fade-up delay-300">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
            <div className="rounded-lg border border-zinc-900 bg-black overflow-hidden flex flex-col h-[400px]">
              
              <div className="border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                  <div className="w-3 h-3 rounded-full bg-zinc-800" />
                </div>
                <div className="text-xs text-zinc-500 font-mono">mindloom / chat</div>
              </div>

              <div className="flex-1 p-6 space-y-6 overflow-hidden">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-zinc-400">U</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-zinc-300">Summarize my notes on the React component lifecycle.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <MindloomLogo size={32} />
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Local ML</span>
                      <span className="text-[10px] text-zinc-500 font-mono">42ms</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      Based on your notes from yesterday, the React component lifecycle consists of three main phases: Mounting, Updating, and Unmounting. You highlighted `useEffect` as the primary hook for handling these side effects in functional components.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="border-t border-zinc-900 bg-zinc-950 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
              Two layers. One cohesive mind.
            </h2>
            <p className="text-zinc-400 max-w-xl text-lg">
              Mindloom routes your queries intelligently, giving you the best of both worlds: local privacy and cloud reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-xl border border-zinc-900 bg-black hover:border-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-lg border border-zinc-800 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Absolute Privacy</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your raw data never leaves your device. Mindloom uses local embeddings and sends only compressed context to Gemini when absolutely necessary.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-zinc-900 bg-black hover:border-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-lg border border-zinc-800 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Instant Recall</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Routine queries and direct retrievals are handled by the local ML layer in milliseconds, completely bypassing API rate limits.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-zinc-900 bg-black hover:border-zinc-800 transition-colors">
              <div className="w-10 h-10 rounded-lg border border-zinc-800 flex items-center justify-center mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Spaced Repetition</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Built-in SM-2 algorithm tracks your learning patterns and surfaces information exactly when you are about to forget it.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 px-6 border-t border-zinc-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
            Ready to deploy your Mindloom?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Upload your data. Watch it learn. Ask it anything.
          </p>
          <Link href="/signup" className="bg-white text-black hover:bg-zinc-200 px-8 py-3.5 rounded-md text-sm font-medium transition-colors">
            Get started for free
          </Link>
        </div>
      </section>
    </div>
  );
}
