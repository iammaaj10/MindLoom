import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ─── Welcome ─── */}
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Welcome back, <span className="gradient-text">{session?.name}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Here&apos;s your personal AI overview
        </p>
      </div>

      {/* ─── Stats — Bento Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up delay-75">
        {[
          {
            label: 'Documents',
            value: '0',
            sub: 'uploaded',
            accent: 'var(--accent)',
            bg: 'var(--accent-subtle)',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
          },
          {
            label: 'Total Queries',
            value: '0',
            sub: 'asked',
            accent: 'var(--cyan)',
            bg: 'var(--cyan-subtle)',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
          },
          {
            label: 'Answered Locally',
            value: '—',
            sub: 'of queries',
            accent: 'var(--success)',
            bg: 'rgba(0, 204, 136, 0.08)',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
          },
          {
            label: 'Study Streak',
            value: '0',
            sub: 'days',
            accent: 'var(--warning)',
            bg: 'rgba(255, 178, 36, 0.08)',
            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card p-5 flex flex-col justify-between min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg, color: stat.accent }}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="animate-fade-up delay-150">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Quick actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Upload documents',
              description: 'Feed your AI with PDFs, notes, and images',
              href: '/documents',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
              accent: 'var(--accent)',
            },
            {
              label: 'Ask your AI',
              description: 'Chat with your personal AI companion',
              href: '/chat',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              accent: 'var(--cyan)',
            },
            {
              label: 'Daily journal',
              description: 'Log what you did today',
              href: '/journal',
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
              accent: 'var(--success)',
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="card group p-5 block"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(255,255,255,0.04)', color: action.accent }}>
                {action.icon}
              </div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {action.label}
                <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" style={{ color: action.accent }}>→</span>
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Insights (placeholder charts) ─── */}
      <div className="animate-fade-up delay-200">
        <h2 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Chart placeholder 1 */}
          <div className="card p-6 min-h-[260px] flex flex-col">
            <div className="flex items-center justify-between mb-auto">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Time Distribution</span>
              <span className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid rgba(109,92,255,0.15)', fontSize: '10px' }}>
                Coming soon
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Start logging to see your time breakdown
                </p>
              </div>
            </div>
          </div>

          {/* Chart placeholder 2 */}
          <div className="card p-6 min-h-[260px] flex flex-col">
            <div className="flex items-center justify-between mb-auto">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Query Routing</span>
              <span className="badge" style={{ background: 'var(--cyan-subtle)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.15)', fontSize: '10px' }}>
                Coming soon
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Local</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Gemini</span>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Ask questions to see the routing breakdown
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
