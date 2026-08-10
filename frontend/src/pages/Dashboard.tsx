import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Key, Lightbulb, Star } from 'lucide-react';
import { CampaignRow, KPI, ChartDataPoint } from '../types';
import { loadData } from '../services/dataLoader';
import {
  computeKPIs, roiHistogram, budgetVsRevenue,
  conversionsByTier, topKeywords, discountVsUnits,
  satisfactionDistribution,
} from '../services/dataProcessor';

import KPICards from '../components/KPICards';
import ROIHistogram from '../components/ROIHistogram';
import BudgetVsRevenue from '../components/BudgetVsRevenue';
import ConversionsByTier from '../components/ConversionsByTier';
import TopKeywords from '../components/TopKeywords';
import DiscountVsUnits from '../components/DiscountVsUnits';
import SatisfactionDonut from '../components/SatisfactionDonut';

export default function Dashboard() {
  const [data, setData] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState<string>('All');

  useEffect(() => {
    loadData().then((rows) => {
      setData(rows);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (tierFilter === 'All') return data;
    return data.filter(r => r.Subscription_Tier === tierFilter);
  }, [data, tierFilter]);

  const tiers = useMemo(() => {
    const set = new Set(data.map(r => r.Subscription_Tier));
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  // Compute chart data
  const kpis: KPI[] = useMemo(() => computeKPIs(filtered), [filtered]);
  const roi = useMemo(() => roiHistogram(filtered), [filtered]);
  const scatter = useMemo(() => budgetVsRevenue(filtered), [filtered]);
  const tierConv: ChartDataPoint[] = useMemo(() => conversionsByTier(filtered), [filtered]);
  const keywords: ChartDataPoint[] = useMemo(() => topKeywords(filtered), [filtered]);
  const discount: ChartDataPoint[] = useMemo(() => discountVsUnits(filtered), [filtered]);
  const satisfaction: ChartDataPoint[] = useMemo(() => satisfactionDistribution(filtered), [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-lg">Loading campaign data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text tracking-tight">
              Campaign Performance Dashboard
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              {data.length.toLocaleString()} campaigns · Interactive analytics powered by Recharts
            </p>
          </div>

          {/* Tier filter */}
          <div className="flex flex-wrap gap-2">
            {tiers.map(t => (
              <button
                key={t}
                className={`filter-pill ${tierFilter === t ? 'active' : ''}`}
                onClick={() => setTierFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="mb-8">
        <KPICards kpis={kpis} />
      </section>

      {/* Charts grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ROIHistogram data={roi.data} median={roi.median} />
        <BudgetVsRevenue data={scatter} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <ConversionsByTier data={tierConv} />
        <TopKeywords data={keywords} />
        <div className="relative">
          <SatisfactionDonut data={satisfaction} />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DiscountVsUnits data={discount} />

        {/* Summary insights card */}
        <div className="glass-card p-6 animate-fade-in animate-delay-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 pulse-dot" />
            Key Insights
          </h3>
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group cursor-default">
              <div className="mt-0.5 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="text-purple-400" size={22} />
              </div>
              <div>
                <p className="font-medium text-white mb-1">ROI Performance</p>
                <p>Median ROI sits at <span className="text-purple-400 font-semibold">{roi.median.toFixed(2)}x</span> across {tierFilter === 'All' ? 'all tiers' : tierFilter + ' tier'}. Distribution shows a roughly uniform spread indicating varied campaign effectiveness.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group cursor-default">
              <div className="mt-0.5 group-hover:scale-110 transition-transform duration-300">
                <Key className="text-cyan-400" size={22} />
              </div>
              <div>
                <p className="font-medium text-white mb-1">Keyword Strategy</p>
                <p>"<span className="text-cyan-400 font-semibold">{keywords[0]?.keyword}</span>" leads with {Number(keywords[0]?.count).toLocaleString()} campaigns, closely followed by other terms — suggesting a balanced keyword portfolio.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group cursor-default">
              <div className="mt-0.5 group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="text-green-400" size={22} />
              </div>
              <div>
                <p className="font-medium text-white mb-1">Discount Impact</p>
                <p>Average units sold remains consistent (~100) across all discount ranges, suggesting discount level has minimal impact on volume.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group cursor-default">
              <div className="mt-0.5 group-hover:scale-110 transition-transform duration-300">
                <Star className="text-orange-400" size={22} />
              </div>
              <div>
                <p className="font-medium text-white mb-1">Customer Satisfaction</p>
                <p>Satisfaction scores are uniformly distributed (~25% each), indicating no strong systemic satisfaction issues or biases.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-800/50">
        Campaign Performance & Activation Intelligence · Built with React + Recharts + Tailwind
      </footer>
    </div>
  );
}
