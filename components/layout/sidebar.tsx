'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MindloomLogo } from '@/components/ui/mindloom-logo';

interface NavItem {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        label: 'Analytics',
        href: '/analytics',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Your AI Engine',
    items: [
      {
        label: 'Chat',
        href: '/chat',
        badge: 'v2',
        badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: 'Documents',
        href: '/documents',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        ),
      },
      {
        label: 'Knowledge Graph',
        href: '/graph',
        badge: '3D',
        badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        ),
      },
      {
        label: 'Search',
        href: '/search',
        badge: 'new',
        badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Continuous Growth',
    items: [
      {
        label: 'Daily Journal',
        href: '/journal',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        ),
      },
      {
        label: 'Study & Memory',
        href: '/study',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        label: 'Privacy & Data',
        href: '/privacy',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        label: 'Settings',
        href: '/settings',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
      {
        label: 'Telemetry',
        href: '/telemetry',
        badge: 'new',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        icon: (active) => (
          <svg
            className={`w-4 h-4 transition-colors ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-64 flex flex-col z-40 bg-zinc-950/95 backdrop-blur-2xl border-r border-white/[0.08] select-none"
    >
      {/* ─── Top Brand Header ─── */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08] bg-white/[0.015]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-90"
        >
          <MindloomLogo size={26} showWordmark showBadge />
        </Link>
      </div>

      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase px-3 mb-2 text-zinc-500/90">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-white/[0.08] border border-white/[0.1] shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <span className="absolute -left-1 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        {item.icon(isActive)}
                      </div>
                      <span className="tracking-tight">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md border ${
                          item.badgeColor || 'bg-white/[0.06] text-zinc-400 border-white/[0.08]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Bottom System Card ─── */}
      <div className="p-3 border-t border-white/[0.08] bg-black/40">
        <div className="rounded-xl p-3 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </span>
              <span className="text-xs font-semibold text-zinc-200">Local Ingestion</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/[0.05]">
            <span className="font-mono text-[10px]">Architecture</span>
            <span className="text-zinc-300 font-mono text-[10px]">Dual-Layer RAG</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
