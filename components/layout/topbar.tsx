'use client';

import { logout } from '@/app/actions/auth';
import { usePathname } from 'next/navigation';

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
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-6 z-30"
      style={{
        left: '14rem', /* matches sidebar w-56 */
        background: 'rgba(5, 5, 8, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {pageTitle}
        </span>
      </div>

      {/* Right: User */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--cyan))' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {userName}
          </span>
        </div>

        <div className="w-px h-5" style={{ background: 'var(--border)' }} />

        <form action={logout}>
          <button type="submit" className="btn-ghost text-xs">
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
