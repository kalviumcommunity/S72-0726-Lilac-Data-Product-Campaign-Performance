import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ErrorBar, LabelList,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
}

const COLORS = ['#7c4dff', '#00e5ff', '#76ff03', '#ffab40', '#40c4ff'];

export default function DiscountVsUnits({ data }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-5">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 pulse-dot" />
        Avg Units Sold by Discount Range
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 25, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.5} />
          <XAxis
            dataKey="range"
            tick={{ fill: '#8888aa', fontSize: 12 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'Discount Range', position: 'insideBottom', offset: -2, fill: '#8888aa', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'Avg Units Sold', angle: -90, position: 'insideLeft', fill: '#8888aa', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(118,255,3,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-card p-3 text-sm border border-green-500/20">
                  <div className="font-semibold text-green-400">{d.range}</div>
                  <div className="text-gray-400">Avg: <span className="text-white">{d.avg}</span> units</div>
                  <div className="text-gray-400">Std Dev: ±{d.std}</div>
                  <div className="text-gray-400">Campaigns: {Number(d.count).toLocaleString()}</div>
                </div>
              );
            }}
          />
          <Bar dataKey="avg" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
            ))}
            <ErrorBar dataKey="std" width={6} strokeWidth={1.5} stroke="#e0e0f0" direction="y" />
            <LabelList dataKey="avg" position="top" fill="#e0e0f0" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
