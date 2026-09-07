'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MindloomLogo } from '@/components/ui/mindloom-logo';

const navSections = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
      },
      {
        label: 'Analytics',
        href: '/analytics',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      },
    ],
  },
  {
    title: 'Your AI',
    items: [
      {
        label: 'Chat',
        href: '/chat',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      },
      {
        label: 'Documents',
        href: '/documents',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
      },
    ],
  },
  {
    title: 'Growth',
    items: [
      {
        label: 'Journal',
        href: '/journal',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      },
      {
        label: 'Study',
        href: '/study',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Privacy',
        href: '/privacy',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar-desktop fixed top-0 left-0 h-screen w-56 flex flex-col z-40"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ─── Logo ─── */}
      <div className="h-14 flex items-center px-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <MindloomLogo size={24} showWordmark showBadge />
        </Link>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-medium tracking-[0.12em] uppercase px-3 mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  >
                    <span style={{ color: isActive ? 'var(--accent)' : undefined }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ─── Status ─── */}
      <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--success)', animation: 'pulse-ring 2s cubic-bezier(0,0,0.2,1) infinite' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: 'var(--success)' }} />
          </span>
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Local ML active
          </span>
        </div>
      </div>
    </aside>
  );
}
