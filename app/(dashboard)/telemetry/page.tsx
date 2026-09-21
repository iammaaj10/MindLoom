import type { Metadata } from 'next';
import dbConnect from '@/lib/db/connection';
import AuditLog from '@/lib/db/models/audit-log';
import { getSession } from '@/lib/auth/session';
import TelemetryCharts from './charts';

export const metadata: Metadata = {
  title: 'Telemetry Dashboard',
};

export default async function TelemetryPage() {
  const session = await getSession();
  if (!session) return null;

  await dbConnect();
  
  const logs = await AuditLog.find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const totalQueries = logs.filter(l => l.eventType === 'query').length;
  const localQueries = logs.filter(l => l.eventType === 'query' && l.source === 'local').length;
  const cloudQueries = logs.filter(l => l.eventType === 'query' && l.source === 'gemini').length;
  const ingestionCount = logs.filter(l => l.eventType === 'ingestion').length;
  
  const totalTokens = logs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);
  
  const queryLogs = logs.filter(l => l.eventType === 'query');
  const avgLatency = queryLogs.length > 0 
    ? queryLogs.reduce((sum, log) => sum + log.latencyMs, 0) / queryLogs.length 
    : 0;

  // Build chart data (last 20 queries, chronologically)
  const latencyChartData = queryLogs
    .slice(0, 20)
    .reverse()
    .map((log: any, i: number) => ({
      name: `Q${i + 1}`,
      latency: log.latencyMs,
      source: log.source,
    }));

  const routingPieData = [
    { name: 'Local Engine', value: localQueries, fill: '#22d3ee' },
    { name: 'Gemini Cloud', value: cloudQueries, fill: '#a78bfa' },
  ];

  const serializedLogs = logs.map((log: any) => ({
    _id: log._id.toString(),
    eventType: log.eventType,
    source: log.source,
    latencyMs: log.latencyMs,
    tokensUsed: log.tokensUsed,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Telemetry & Observability
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Live</span>
          </h1>
          <p className="text-sm text-zinc-400">System performance, token usage, and routing metrics.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono text-zinc-500 mb-1 uppercase">Total Tokens</div>
          <div className="text-2xl font-black text-white">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono text-zinc-500 mb-1 uppercase">Avg Latency</div>
          <div className="text-2xl font-black text-white">{Math.round(avgLatency)}<span className="text-xs text-zinc-500 font-normal">ms</span></div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono text-cyan-500 mb-1 uppercase">Local Hits</div>
          <div className="text-2xl font-black text-cyan-400">{localQueries}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono text-purple-500 mb-1 uppercase">Cloud Hits</div>
          <div className="text-2xl font-black text-purple-400">{cloudQueries}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono text-emerald-500 mb-1 uppercase">Ingestions</div>
          <div className="text-2xl font-black text-emerald-400">{ingestionCount}</div>
        </div>
      </div>

      {/* Charts */}
      <TelemetryCharts latencyData={latencyChartData} routingData={routingPieData} />

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/[0.01]">
          <h2 className="text-sm font-semibold text-white">Recent Audit Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs font-mono uppercase bg-white/[0.02] text-zinc-500">
              <tr>
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Latency</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {serializedLogs.map((log: any) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-mono text-[11px] whitespace-nowrap text-zinc-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white/5 border border-white/10">
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      log.source === 'local' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 
                      log.source === 'gemini' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                      'bg-white/5 text-zinc-400 border-white/10'
                    }`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-white text-xs">{log.latencyMs}<span className="text-zinc-500">ms</span></td>
                  <td className="px-5 py-3 font-mono text-emerald-400 text-xs">{log.tokensUsed > 0 ? `+${log.tokensUsed}` : '-'}</td>
                </tr>
              ))}
              {serializedLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500 text-xs">No telemetry data yet. Start chatting to generate metrics.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
