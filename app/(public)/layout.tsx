import Link from 'next/link';
import { MindloomLogo } from '@/components/ui/mindloom-logo';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* ─── Apple-Style Frosted Translucent Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.08] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand Mark */}
          <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
            <MindloomLogo size={26} showWordmark showBadge />
          </Link>

          {/* Apple-style Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <Link href="#overview" className="hover:text-white transition-colors">
              Overview
            </Link>
            <Link href="#dual-engine" className="hover:text-white transition-colors">
              Dual-Engine
            </Link>
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </Link>
            <Link href="#specs" className="hover:text-white transition-colors">
              Specs
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.05] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.35)] active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 pt-14">{children}</main>

      {/* ─── Apple-Style Cinematic Footer ─── */}
      <footer className="bg-zinc-950/80 border-t border-white/[0.08] pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Footnote Disclaimers (Apple style) */}
          <div className="text-[11px] leading-relaxed text-zinc-500 border-b border-white/[0.06] pb-8 space-y-2">
            <p>
              1. Local ML layer runs locally or on isolated microservices using all-MiniLM-L6-v2 embeddings and spaCy NER. Retrieval latencies benchmarked under 50ms for local vectorized chunks.
            </p>
            <p>
              2. Cortex Ultra cognitive synthesis is invoked exclusively when the query router determines that generative synthesis or cross-document reasoning is required. All context is compressed to minimize latency and token footprint.
            </p>
          </div>

          {/* Directory Columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">
                Product
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard Telemetry</Link></li>
                <li><Link href="/documents" className="hover:text-white transition-colors">Knowledge Ingestion</Link></li>
                <li><Link href="/chat" className="hover:text-white transition-colors">Hybrid Chat</Link></li>
                <li><Link href="/journal" className="hover:text-white transition-colors">Daily Journal</Link></li>
                <li><Link href="/study" className="hover:text-white transition-colors">Spaced Repetition</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">
                Intelligence
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li><span className="text-zinc-500">Local Vector Search</span></li>
                <li><span className="text-zinc-500">Sliding-Window Chunker</span></li>
                <li><span className="text-zinc-500">Cortex Ultra Synthesis</span></li>
                <li><span className="text-zinc-500">SM-2 Forgetting Curve</span></li>
                <li><span className="text-zinc-500">Query Router v1</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">
                Security & Privacy
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Data Sovereignty</Link></li>
                <li><span className="text-zinc-500">Zero Cloud Leakage</span></li>
                <li><span className="text-zinc-500">JWT HTTP-Only Sessions</span></li>
                <li><span className="text-zinc-500">MongoDB Multi-Tenant DB</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px]">
                Mindloom
              </h4>
              <ul className="space-y-2 text-zinc-400">
                <li><span className="text-zinc-500">30-Day Engineering Plan</span></li>
                <li><span className="text-zinc-500">Next.js 16 App Router</span></li>
                <li><span className="text-zinc-500">FastAPI ML Microservice</span></li>
                <li><span className="text-zinc-500">Open Source Protocol</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06] text-xs text-zinc-500">
            <div className="flex items-center gap-3">
              <MindloomLogo size={20} />
              <span>Mindloom Platform &copy; {new Date().getFullYear()} Mindloom Technologies. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <span className="text-zinc-700">|</span>
              <span className="font-mono text-[11px] text-zinc-400">Version 1.0.0 (Week 1 Complete)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
