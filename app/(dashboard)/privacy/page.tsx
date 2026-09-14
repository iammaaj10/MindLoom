import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Privacy & Data — Mindloom',
};

export default async function PrivacyPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="space-y-8 animate-fade-up max-w-4xl">
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Privacy & Data Controls
        </h1>
        <p className="text-sm text-zinc-400">
          Transparency into how your local AI engine processes and stores your knowledge.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Local Processing */}
        <div className="rounded-2xl p-6 bg-emerald-500/5 border border-emerald-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-emerald-300 mb-1">Local Processing First</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your documents, journal entries, and local queries are processed by the <span className="font-mono text-zinc-300">all-MiniLM-L6-v2</span> embedding model running completely locally on your hardware. Entity extraction (NER) and statistical analytics never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* Cloud LLM Routing */}
        <div className="rounded-2xl p-6 bg-indigo-500/5 border border-indigo-500/20 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-indigo-300 mb-1">Strict Cloud Gateway</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                MindLoom only communicates with the Google Gemini API for complex reasoning tasks via our Dual-Layer RAG router.
              </p>
              <ul className="space-y-2 text-xs text-zinc-500 list-disc list-inside">
                <li>Only the top-5 most relevant chunks are sent in the prompt payload.</li>
                <li>Your entire database is never exposed to the LLM.</li>
                <li>We do not opt-in to user data retention for model training by default.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Ownership */}
        <div className="rounded-2xl p-6 bg-white/[0.03] border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center shrink-0 border border-white/[0.1] text-zinc-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-200 mb-1">Your Data Ownership</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                All raw data and vector embeddings are stored securely in your MongoDB Atlas cluster. You retain full control to export or permanently delete your knowledge graph at any time.
              </p>
              <button className="btn-primary bg-rose-500 hover:bg-rose-600 text-white border-none shadow-[0_0_15px_rgba(244,63,94,0.3)] h-9 px-4 text-xs">
                Request Data Deletion
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
