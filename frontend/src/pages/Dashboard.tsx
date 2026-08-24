import { useState, useEffect } from 'react';
import { BarChart3, Key, Lightbulb, Star } from 'lucide-react';
import { KPI, ChartDataPoint } from '../types';
import { api } from '../services/api';

import KPICards from '../components/KPICards';
import ROIHistogram from '../components/ROIHistogram';
import BudgetVsRevenue from '../components/BudgetVsRevenue';
import ConversionsByTier from '../components/ConversionsByTier';
import TopKeywords from '../components/TopKeywords';
import DiscountVsUnits from '../components/DiscountVsUnits';
import SatisfactionDonut from '../components/SatisfactionDonut';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [roi, setRoi] = useState<{ data: ChartDataPoint[]; median: number }>({ data: [], median: 0 });
  const [scatter, setScatter] = useState<ChartDataPoint[]>([]);
  const [tierConv, setTierConv] = useState<ChartDataPoint[]>([]);
  const [keywords, setKeywords] = useState<ChartDataPoint[]>([]);
  const [discount, setDiscount] = useState<ChartDataPoint[]>([]);
  const [satisfaction, setSatisfaction] = useState<ChartDataPoint[]>([]);

  const fmt = (n: number, dec = 1): string =>
    n >= 1_000_000 ? (n / 1_000_000).toFixed(dec) + 'M'
    : n >= 1_000 ? (n / 1_000).toFixed(dec) + 'K'
    : n.toFixed(dec);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [
          summary,
          distributions,
          keywordData,
          tierData,
          scatterData,
          discountData,
          satisfactionData
        ] = await Promise.all([
          api.getEdaSummary(),
          api.getEdaDistributions(),
          api.getEdaKeywordPerformance(),
          api.getEdaTierBreakdown(),
          api.getEdaBudgetScatter(),
          api.getEdaDiscountVsUnits(),
          api.getEdaSatisfactionDistribution()
        ]);

        // Map KPIs
        setKpis([
          { label: 'Total Revenue',     value: '$' + fmt(summary.total_revenue),      icon: 'revenue', glow: 'stat-glow-purple', color: '#7c4dff' },
          { label: 'Total Budget',      value: '$' + fmt(summary.total_budget),       icon: 'budget',  glow: 'stat-glow-cyan',   color: '#00e5ff' },
          { label: 'Average ROI',       value: summary.avg_roi.toFixed(2) + 'x',      icon: 'roi',     glow: 'stat-glow-green',  color: '#76ff03' },
          { label: 'Total Conversions', value: fmt(summary.total_conversions, 0),     icon: 'conversions', glow: 'stat-glow-pink',   color: '#ff4081' },
          { label: 'Avg Satisfaction',  value: summary.avg_satisfaction.toFixed(2) + ' / 5',   icon: 'satisfaction', glow: 'stat-glow-orange', color: '#ffab40' },
        ]);

        // Map ROI Histogram
        const roiDist = distributions.ROI;
        const roiHistogramData = roiDist.counts.map((count: number, i: number) => ({
          bin: +((roiDist.bin_edges[i] + roiDist.bin_edges[i+1]) / 2).toFixed(2),
          label: `${roiDist.bin_edges[i].toFixed(1)} – ${roiDist.bin_edges[i+1].toFixed(1)}`,
          count,
        }));
        setRoi({ data: roiHistogramData, median: roiDist.median });

        // Map Budget Scatter
        setScatter(scatterData.map((d: any) => ({
          budget: +d.budget.toFixed(0),
          revenue: +d.revenue.toFixed(0),
          roi: +d.roi.toFixed(2),
          tier: d.tier
        })));

        // Map Conversions by Tier
        setTierConv(tierData.map((d: any) => ({
          tier: d.Subscription_Tier,
          avg: +(d.avg_conversion_rate * d.count).toFixed(0), // approx total conversions / count = avg conversions
          count: d.count
        })).sort((a: any, b: any) => a.tier.localeCompare(b.tier)));

        // Map Top Keywords
        setKeywords(keywordData.slice(0, 10).map((d: any) => ({
          keyword: d.Common_Keywords,
          count: d.campaign_count
        })));

        // Map Discount vs Units
        setDiscount(discountData);

        // Map Satisfaction Donut
        const colors = ['#7c4dff', '#00e5ff', '#76ff03', '#ff4081', '#ffab40'];
        setSatisfaction(satisfactionData.map((d: any, i: number) => ({
          name: `Score ${d.score}`,
          value: d.count,
          fill: colors[i % colors.length],
        })));

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

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

  if (error) {
    return <div className="p-6 text-red-400">Error: {error}</div>;
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
              10,000 campaigns · Full-Stack Data Pipeline
            </p>
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
                <p>Median ROI sits at <span className="text-purple-400 font-semibold">{roi.median.toFixed(2)}x</span> across all tiers. Distribution shows a roughly uniform spread indicating varied campaign effectiveness.</p>
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