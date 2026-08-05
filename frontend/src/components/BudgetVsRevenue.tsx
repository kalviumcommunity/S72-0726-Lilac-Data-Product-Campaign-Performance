import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
}

const TIER_COLORS: Record<string, string> = {
  Basic: '#7c4dff',
  Premium: '#00e5ff',
  Standard: '#76ff03',
};

export default function BudgetVsRevenue({ data }: Props) {
  const tiers = [...new Set(data.map(d => d.tier as string))].sort();

  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-2">
      <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
        Budget vs Revenue Generated
      </h3>
      <div className="flex gap-3 mb-3">
        {tiers.map(t => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[t] || '#fff' }} />
            {t}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.5} />
          <XAxis
            dataKey="budget"
            type="number"
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            label={{ value: 'Budget ($)', position: 'insideBottom', offset: -2, fill: '#8888aa', fontSize: 12 }}
          />
          <YAxis
            dataKey="revenue"
            type="number"
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#8888aa', fontSize: 12 }}
          />
          <ZAxis dataKey="roi" range={[20, 80]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3', stroke: '#8888aa' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-card p-3 text-sm border border-cyan-500/20">
                  <div className="text-gray-400 text-xs mb-1">{d.tier} Tier</div>
                  <div>Budget: <span className="text-cyan-400 font-medium">${Number(d.budget).toLocaleString()}</span></div>
                  <div>Revenue: <span className="text-green-400 font-medium">${Number(d.revenue).toLocaleString()}</span></div>
                  <div>ROI: <span className="text-pink-400 font-medium">{d.roi}x</span></div>
                </div>
              );
            }}
          />
          {tiers.map(tier => (
            <Scatter
              key={tier}
              data={data.filter(d => d.tier === tier)}
              fill={TIER_COLORS[tier] || '#fff'}
              fillOpacity={0.6}
              name={tier}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
