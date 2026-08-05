import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface Props {
  data: ChartDataPoint[];
}

export default function SatisfactionDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + (d.value as number), 0);

  return (
    <div className="glass-card p-5 animate-fade-in animate-delay-6">
      <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-400 pulse-dot" />
        Customer Satisfaction Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={3}
            strokeWidth={0}
            animationBegin={200}
            animationDuration={1000}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill as string} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              const pct = ((d.value / total) * 100).toFixed(1);
              return (
                <div className="glass-card p-3 text-sm border border-orange-500/20">
                  <div className="font-semibold" style={{ color: d.fill }}>{d.name}</div>
                  <div className="text-gray-400">{Number(d.value).toLocaleString()} ({pct}%)</div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={10}
            formatter={(value: string) => (
              <span style={{ color: '#8888aa', fontSize: 12 }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-28px' }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{total.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>
    </div>
  );
}
