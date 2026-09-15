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

      <footer className="bg-zinc-950/80 border-t border-white/[0.08] pt-12 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-zinc-500 text-xs">
            <MindloomLogo size={20} />
            <span>&copy; {new Date().getFullYear()} Mindloom Technologies. All rights reserved.</span>
          </div>

          <nav className="flex items-center gap-6 text-xs text-zinc-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-zinc-700">|</span>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
