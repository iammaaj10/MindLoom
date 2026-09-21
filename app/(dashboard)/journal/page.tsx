import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db/connection';
import Log from '@/lib/db/models/log';
import JournalForm from './journal-form';
import JournalItem from './journal-item';

export const metadata = {
  title: 'Daily Journal — Mindloom',
};

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await dbConnect();
  
  // Fetch recent logs
  const logsRaw = await Log.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const logs = JSON.parse(JSON.stringify(logsRaw));

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ─── Header ─── */}
      <div className="pb-6 border-b border-white/[0.07]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
          Daily Journal
        </h1>
        <p className="text-sm text-zinc-400">
          Log your learnings, thoughts, and activities. The local AI engine will automatically extract topics and update your knowledge graph.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── Entry Form (Left) ─── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <h2 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              New Entry
            </h2>
            <JournalForm />
          </div>
          
          {/* Info Card */}
          <div className="rounded-xl p-5 bg-black/40 border border-white/[0.06]">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">How it works</h3>
            <p className="text-[13px] leading-relaxed text-zinc-500">
              When you write a log, our local ML service instantly scans it to extract named entities and technical concepts. These are tagged to your entry automatically, building a graph of your daily learning over time.
            </p>
          </div>
        </div>

        {/* ─── Timeline (Right) ─── */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Recent Logs</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.1] rounded-2xl">
              <p className="text-zinc-500 text-sm">No journal entries yet. Start writing your first log!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any) => (
                <JournalItem key={log._id.toString()} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
