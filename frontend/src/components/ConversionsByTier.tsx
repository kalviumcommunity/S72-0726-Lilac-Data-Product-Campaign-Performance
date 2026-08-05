import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ErrorBar,
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

export default function ConversionsByTier({ data }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-3">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-pink-500 pulse-dot" />
        Conversions by Subscription Tier
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.5} />
          <XAxis
            dataKey="tier"
            tick={{ fill: '#8888aa', fontSize: 12 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'Conversions', angle: -90, position: 'insideLeft', fill: '#8888aa', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(124,77,255,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-card p-3 text-sm border border-pink-500/20">
                  <div className="font-semibold mb-1" style={{ color: TIER_COLORS[d.tier] }}>{d.tier}</div>
                  <div className="text-gray-400">Median: <span className="text-white">{d.median}</span></div>
                  <div className="text-gray-400">Q1: {d.q1} · Q3: {d.q3}</div>
                  <div className="text-gray-400">Range: {d.min} – {d.max}</div>
                  <div className="text-gray-400">Count: {d.count} campaigns</div>
                </div>
              );
            }}
          />
          <Bar dataKey="median" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((d) => {
              const tier = d.tier as string;
              return (
                <rect key={tier} fill={TIER_COLORS[tier] || '#7c4dff'} fillOpacity={0.8} />
              );
            })}
            <ErrorBar dataKey="q3" width={4} strokeWidth={1.5} stroke="#e0e0f0" direction="y" />
          </Bar>
          {/* Overlay bar for Q1–Q3 range visualization */}
          <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={60} fillOpacity={0}>
            {data.map((d) => {
              const tier = d.tier as string;
              return (
                <rect key={tier} fill="transparent" stroke={TIER_COLORS[tier] || '#7c4dff'} strokeWidth={1.5} strokeDasharray="4 3" />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        {data.map(d => (
          <span key={d.tier as string} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[d.tier as string] }} />
            {d.tier as string}: median {d.median as number}
          </span>
        ))}
      </div>
    </div>
  );
}
