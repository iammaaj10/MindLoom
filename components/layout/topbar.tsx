'use client';

import { logout } from '@/app/actions/auth';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-provider';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/chat': 'Chat',
  '/journal': 'Journal',
  '/documents': 'Documents',
  '/study': 'Study',
  '/analytics': 'Analytics',
  '/privacy': 'Privacy',
};

export default function Topbar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-8 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.08]"
      style={{
        left: '16rem', /* matches sidebar w-64 */
      }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Mindloom</span>
        <span className="text-zinc-600 text-xs">/</span>
        <span className="text-sm font-semibold tracking-tight text-white">
          {pageTitle}
        </span>
      </div>

      {/* Right: Controls & User */}
      <div className="flex items-center gap-4">
        {/* Architecture Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Local Engine + Cortex Ultra Hybrid</span>
        </div>

        {/* B2: Theme Toggle */}
        <ThemeToggle />

        <div className="w-px h-4 bg-white/[0.08]" />

        {/* User Card */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-white bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-zinc-300">
            {userName}
          </span>
        </div>

        {/* Logout */}
        <form action={logout}>
          <button
            type="submit"
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
