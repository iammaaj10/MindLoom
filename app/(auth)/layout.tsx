import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* ─── Minimal Auth Top Bar (no marketing navbar) ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <ThemeToggle />
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 pt-14">{children}</main>
    </div>
  );
}
