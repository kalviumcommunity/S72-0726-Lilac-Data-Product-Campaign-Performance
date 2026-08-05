import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
  median: number;
}

export default function ROIHistogram({ data, median }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-1">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 pulse-dot" />
        ROI Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.5} />
          <XAxis
            dataKey="bin"
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'ROI', position: 'insideBottom', offset: -2, fill: '#8888aa', fontSize: 12 }}
          />
          <YAxis
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'Frequency', angle: -90, position: 'insideLeft', fill: '#8888aa', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(124,77,255,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-card p-3 text-sm border border-purple-500/20">
                  <div className="text-gray-400 mb-1">{d.label}</div>
                  <div className="font-semibold text-purple-400">{d.count} campaigns</div>
                </div>
              );
            }}
          />
          <ReferenceLine
            x={+median.toFixed(2)}
            stroke="#ff4081"
            strokeDasharray="6 4"
            strokeWidth={2}
            label={{ value: `Median: ${median.toFixed(2)}`, fill: '#ff4081', fontSize: 11, position: 'top' }}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill="#7c4dff" fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
