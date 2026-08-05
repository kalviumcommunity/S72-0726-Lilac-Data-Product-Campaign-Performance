import { CampaignRow, KPI, ChartDataPoint } from '../types';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const median = (arr: number[]): number => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const fmt = (n: number, dec = 1): string =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(dec) + 'M'
  : n >= 1_000 ? (n / 1_000).toFixed(dec) + 'K'
  : n.toFixed(dec);

/* ─── KPIs ────────────────────────────────────────────────────────── */
export function computeKPIs(data: CampaignRow[]): KPI[] {
  const totalRevenue = data.reduce((s, r) => s + r.Revenue_Generated, 0);
  const totalBudget  = data.reduce((s, r) => s + r.Budget, 0);
  const avgROI       = data.reduce((s, r) => s + r.ROI, 0) / data.length;
  const totalConv    = data.reduce((s, r) => s + r.Conversions, 0);
  const avgSat       = data.reduce((s, r) => s + r.Customer_Satisfaction_Post_Refund, 0) / data.length;

  return [
    { label: 'Total Revenue',     value: '$' + fmt(totalRevenue),      icon: 'revenue', glow: 'stat-glow-purple', color: '#7c4dff' },
    { label: 'Total Budget',      value: '$' + fmt(totalBudget),       icon: 'budget',  glow: 'stat-glow-cyan',   color: '#00e5ff' },
    { label: 'Average ROI',       value: avgROI.toFixed(2) + 'x',      icon: 'roi',     glow: 'stat-glow-green',  color: '#76ff03' },
    { label: 'Total Conversions', value: fmt(totalConv, 0),            icon: 'conversions', glow: 'stat-glow-pink',   color: '#ff4081' },
    { label: 'Avg Satisfaction',  value: avgSat.toFixed(2) + ' / 5',   icon: 'satisfaction', glow: 'stat-glow-orange', color: '#ffab40' },
  ];
}

/* ─── ROI Histogram ───────────────────────────────────────────────── */
export function roiHistogram(data: CampaignRow[], bins = 30): { data: ChartDataPoint[]; median: number } {
  const rois = data.map(r => r.ROI).filter(v => !isNaN(v));
  const min = Math.min(...rois);
  const max = Math.max(...rois);
  const step = (max - min) / bins;

  const counts: ChartDataPoint[] = Array.from({ length: bins }, (_, i) => ({
    bin: +(min + step * i + step / 2).toFixed(2),
    label: `${(min + step * i).toFixed(1)} – ${(min + step * (i + 1)).toFixed(1)}`,
    count: 0,
  }));

  rois.forEach(r => {
    const idx = Math.min(Math.floor((r - min) / step), bins - 1);
    (counts[idx].count as number)++;
  });

  return { data: counts, median: median(rois) };
}

/* ─── Budget vs Revenue (sampled scatter) ─────────────────────────── */
export function budgetVsRevenue(data: CampaignRow[], n = 1500): ChartDataPoint[] {
  const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, n);
  return shuffled.map(r => ({
    budget: +r.Budget.toFixed(0),
    revenue: +r.Revenue_Generated.toFixed(0),
    roi: +r.ROI.toFixed(2),
    tier: r.Subscription_Tier,
  }));
}

/* ─── Conversions by Tier ─────────────────────────────────────────── */
export function conversionsByTier(data: CampaignRow[]): ChartDataPoint[] {
  const groups: Record<string, number[]> = {};
  data.forEach(r => {
    if (!groups[r.Subscription_Tier]) groups[r.Subscription_Tier] = [];
    groups[r.Subscription_Tier].push(r.Conversions);
  });

  return Object.entries(groups).map(([tier, vals]) => {
    const sorted = [...vals].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const med = median(vals);
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    return { tier, q1, median: med, q3, min: sorted[0], max: sorted[sorted.length - 1], avg: +avg.toFixed(0), count: vals.length };
  }).sort((a, b) => (a.tier as string).localeCompare(b.tier as string));
}

/* ─── Top Keywords ────────────────────────────────────────────────── */
export function topKeywords(data: CampaignRow[], top = 10): ChartDataPoint[] {
  const counts: Record<string, number> = {};
  data.forEach(r => { counts[r.Common_Keywords] = (counts[r.Common_Keywords] || 0) + 1; });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([keyword, count]) => ({ keyword, count }));
}

/* ─── Avg Units Sold by Discount Range ────────────────────────────── */
export function discountVsUnits(data: CampaignRow[]): ChartDataPoint[] {
  const bins = [
    { label: '1-10%',  min: 1,  max: 10 },
    { label: '11-20%', min: 11, max: 20 },
    { label: '21-30%', min: 21, max: 30 },
    { label: '31-40%', min: 31, max: 40 },
    { label: '41-50%', min: 41, max: 50 },
  ];

  return bins.map(({ label, min, max }) => {
    const subset = data.filter(r => r.Discount_Level >= min && r.Discount_Level <= max);
    const avg = subset.length ? subset.reduce((s, r) => s + r.Units_Sold, 0) / subset.length : 0;
    const std = subset.length
      ? Math.sqrt(subset.reduce((s, r) => s + (r.Units_Sold - avg) ** 2, 0) / subset.length)
      : 0;
    return { range: label, avg: +avg.toFixed(0), std: +std.toFixed(0), count: subset.length };
  });
}

/* ─── Customer Satisfaction Distribution ──────────────────────────── */
export function satisfactionDistribution(data: CampaignRow[]): ChartDataPoint[] {
  const counts: Record<number, number> = {};
  data.forEach(r => {
    counts[r.Customer_Satisfaction_Post_Refund] = (counts[r.Customer_Satisfaction_Post_Refund] || 0) + 1;
  });

  const colors = ['#7c4dff', '#00e5ff', '#76ff03', '#ff4081', '#ffab40'];
  return Object.entries(counts)
    .sort((a, b) => +a[0] - +b[0])
    .map(([score, count], i) => ({
      name: `Score ${score}`,
      value: count,
      fill: colors[i % colors.length],
    }));
}
