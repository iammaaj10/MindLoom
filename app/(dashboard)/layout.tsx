import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';
import DashboardLayoutClient from '@/components/layout/dashboard-layout-client';

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
    <DashboardLayoutClient userName={session.name}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardLayoutClient>
  );
}
