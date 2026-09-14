import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Study & Memory — Mindloom',
};

export default async function StudyPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5 flex items-center gap-3">
          Study & Memory 
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
            Coming Soon — Week 4
          </span>
        </h1>
        <p className="text-sm text-zinc-400">
          Spaced repetition and AI mock interviews based on your knowledge graph.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] opacity-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">Spaced Repetition Flashcards</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            MindLoom will automatically generate flashcards from your uploaded documents and journal logs, using an SM-2 algorithm to surface topics just before you forget them.
          </p>
          <button className="btn-primary opacity-50 cursor-not-allowed text-sm h-10 px-6">Module Locked</button>
        </div>

        <div className="rounded-2xl p-8 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] opacity-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">Adaptive Mock Interviews</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Gemini will conduct interactive mock interviews scoped strictly to your actual logged skills and ingested knowledge, avoiding generic questions.
          </p>
          <button className="btn-primary opacity-50 cursor-not-allowed text-sm h-10 px-6">Module Locked</button>
        </div>
      </div>
    </div>
  );
}
