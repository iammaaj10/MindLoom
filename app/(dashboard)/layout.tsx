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
    <div className="min-h-screen flex bg-black text-white selection:bg-cyan-500/20 selection:text-cyan-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: '16rem' }}>
        <Topbar userName={session.name} />
        <main className="flex-1 p-8 pt-22 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
