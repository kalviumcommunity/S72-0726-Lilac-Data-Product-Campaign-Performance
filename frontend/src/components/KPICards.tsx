import { KPI } from '../types';
import { DollarSign, Wallet, TrendingUp, Target, Star } from 'lucide-react';

interface Props {
  kpis: KPI[];
}

const getIcon = (id: string, color: string) => {
  const props = { size: 22, color, strokeWidth: 2.5 };
  switch (id) {
    case 'revenue': return <DollarSign {...props} />;
    case 'budget': return <Wallet {...props} />;
    case 'roi': return <TrendingUp {...props} />;
    case 'conversions': return <Target {...props} />;
    case 'satisfaction': return <Star {...props} />;
    default: return <div />;
  }
};

export default function KPICards({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className={`glass-card p-6 flex flex-col justify-between animate-fade-in animate-delay-${i + 1} ${kpi.glow}`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              {getIcon(kpi.icon, kpi.color)}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
              {kpi.label}
            </span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight" style={{ color: kpi.color }}>
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}
