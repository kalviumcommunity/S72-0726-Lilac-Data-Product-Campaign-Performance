import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
}

const COLORS = ['#7c4dff', '#00e5ff', '#ff4081', '#76ff03', '#ffab40', '#40c4ff', '#e040fb', '#ff6e40', '#69f0ae', '#ffd740'];

export default function TopKeywords({ data }: Props) {
  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-4">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot" />
        Top Campaign Keywords
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" strokeOpacity={0.5} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#8888aa', fontSize: 11 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            label={{ value: 'Count', position: 'insideBottom', offset: -2, fill: '#8888aa', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="keyword"
            tick={{ fill: '#e0e0f0', fontSize: 12 }}
            axisLine={{ stroke: '#2a2a4a' }}
            tickLine={false}
            width={90}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,229,255,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="glass-card p-3 text-sm border border-cyan-500/20">
                  <div className="font-semibold text-cyan-400">{d.keyword}</div>
                  <div className="text-gray-400">{Number(d.count).toLocaleString()} campaigns</div>
                </div>
              );
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
            ))}
            <LabelList dataKey="count" position="right" fill="#e0e0f0" fontSize={11} formatter={(v: number) => v.toLocaleString()} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
