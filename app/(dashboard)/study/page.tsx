import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import StudyDashboard from './study-dashboard';
import { getDueStudyItems } from '@/app/actions/study';

export const metadata = {
  title: 'Study & Memory — Mindloom',
};

export default async function StudyPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const { items = [] } = await getDueStudyItems();

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Study & Memory 
        </h1>
        <p className="text-sm text-zinc-400">
          Spaced repetition and AI mock interviews based on your knowledge graph.
        </p>
      </div>

      <StudyDashboard initialItems={items} />
    </div>
  );
}

