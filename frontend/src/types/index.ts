// ─── EDA Types ─────────────────────────────────────────────────────────────

export interface EdaSummary {
  total_rows: number
  total_campaigns: number
  total_revenue: number
  avg_roi: number
  avg_conversion_rate: number
  avg_activation_score: number
  vanity_traffic_count: number
  vanity_traffic_pct: number
  high_activation_count: number
  numeric_describe: Record<string, Record<string, number>>
}

export interface CorrelationData {
  columns: string[]
  matrix: number[][]
}

export interface DistributionMetric {
  counts: number[]
  bin_edges: number[]
  mean: number
  median: number
  std: number
}

export type DistributionsData = Record<string, DistributionMetric>

export interface ScatterPoint {
  Campaign_ID: string
  Clicks: number
  conversion_rate: number
  activation_score: number
  activation_label: 'High' | 'Medium' | 'Low'
  vanity_traffic_flag: 0 | 1
  ROI: number
}

export interface VanityBreakdownRow {
  vanity_traffic_flag: 0 | 1
  count: number
  avg_roi: number
  avg_conversions: number
  avg_revenue: number
}

export interface VanityVsActivationData {
  scatter_points: ScatterPoint[]
  activation_label_counts: Record<string, number>
  vanity_breakdown: VanityBreakdownRow[]
}

export interface KeywordPerformanceRow {
  Common_Keywords: string
  campaign_count: number
  avg_conversion_rate: number
  avg_roi: number
  avg_revenue: number
  avg_activation_score: number
  total_revenue: number
}

export interface TierBreakdownRow {
  Subscription_Tier: string
  count: number
  avg_conversion_rate: number
  avg_roi: number
  avg_revenue: number
  avg_activation_score: number
  avg_satisfaction: number
  avg_subscription_length: number
}

// ─── Shared UI ──────────────────────────────────────────────────────────────

export type ActivationLabel = 'High' | 'Medium' | 'Low'
