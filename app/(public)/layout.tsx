import Link from 'next/link';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-root)' }}>
      {/* ─── Navbar ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 glass-strong"
      >
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-semibold text-xs text-white"
                style={{ background: 'var(--accent)' }}
              >
                S
              </div>
              <div
                className="absolute -inset-0.5 rounded-md opacity-50"
                style={{ background: 'var(--accent)', filter: 'blur(8px)', zIndex: -1 }}
              />
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Mindloom
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Log in
            </Link>
            <Link href="/signup" className="btn-primary px-4 py-1.5 text-xs">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Content ─── */}
      <main className="flex-1 pt-14">{children}</main>

      {/* ─── Footer ─── */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center font-semibold text-[10px] text-white"
              style={{ background: 'var(--accent)' }}
            >
              S
            </div>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Mindloom — Your data, your intelligence.
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
