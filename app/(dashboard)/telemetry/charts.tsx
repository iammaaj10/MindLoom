'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';

interface TelemetryChartsProps {
  latencyData: { name: string; latency: number; source: string }[];
  routingData: { name: string; value: number; fill: string }[];
}

export default function TelemetryCharts({ latencyData, routingData }: TelemetryChartsProps) {
  const hasLatencyData = latencyData.length > 0;
  const hasRoutingData = routingData.some(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Latency Bar Chart */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4">Query Latency (Last 20)</h3>
        {hasLatencyData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={latencyData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={{ stroke: '#27272a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
                formatter={(value: any) => [`${value}ms`, 'Latency']}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="latency" radius={[4, 4, 0, 0]} maxBarSize={24}>
                {latencyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.source === 'local' ? '#22d3ee' : '#a78bfa'}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-xs text-zinc-600">
            No query data yet
          </div>
        )}
      </div>

      {/* Routing Pie Chart */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-xs font-mono text-zinc-500 uppercase mb-4">Routing Distribution</h3>
        {hasRoutingData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={routingData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {routingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-xs text-zinc-600">
            No routing data yet
          </div>
        )}
      </div>
    </div>
  );
}
