import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex noise" style={{ background: 'var(--bg-root)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col main-with-sidebar" style={{ marginLeft: '14rem' }}>
        <Topbar userName={session.name} />
        <main className="flex-1 p-6 pt-20">{children}</main>
      </div>
    </div>
  );
}
