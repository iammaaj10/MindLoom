import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
const QUERY_COLORS = ['#10b981', '#6366f1']; // Emerald for Local, Indigo for Gemini

interface Props {
  topicData: { name: string; value: number }[];
  categoryData: { name: string; value: number }[];
  activityData: { date: string; count: number }[];
  queryData: { name: string; value: number }[];
}

export default function AnalyticsCharts({ topicData, categoryData, activityData, queryData }: Props) {
  // Calculate tokens saved (rough estimate: local queries * 500 avg tokens)
  const localQueryCount = queryData.find(q => q.name === 'Local AI (Free)')?.value || 0;
  const tokensSaved = localQueryCount * 500;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ─── Top Extracted Topics ─── */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] h-96 flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            Top Extracted Knowledge Topics
          </h2>
          <div className="flex-1 w-full min-h-0">
            {topicData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">No topic data available yet.</div>
            )}
          </div>
        </div>

        {/* ─── Document Categories ─── */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] h-96 flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            Document Categories
          </h2>
          <div className="flex-1 w-full min-h-0">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">No documents ingested yet.</div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name} ({entry.value})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Activity Timeline ─── */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] h-80 flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Journal Activity Timeline
          </h2>
          <div className="flex-1 w-full min-h-0">
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-sm">No activity recorded yet.</div>
            )}
          </div>
        </div>

        {/* ─── API Cost Savings (Local Router) ─── */}
        <div className="lg:col-span-1 rounded-2xl p-6 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.4)] h-80 flex flex-col">
          <h2 className="text-sm font-semibold text-zinc-200 mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            Query Source Distribution
          </h2>
          
          <div className="flex-1 w-full min-h-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={queryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {queryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={QUERY_COLORS[index % QUERY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-emerald-400">~{tokensSaved.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Tokens Saved</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Local AI (Free)</span>
              <span className="font-mono text-white">{queryData.find(q => q.name === 'Local AI (Free)')?.value || 0}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-zinc-400"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Gemini (Cloud)</span>
              <span className="font-mono text-white">{queryData.find(q => q.name === 'Gemini (Cloud)')?.value || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
