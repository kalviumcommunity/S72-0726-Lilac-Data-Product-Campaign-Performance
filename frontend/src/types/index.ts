export interface CampaignRow {
  Campaign_ID: string;
  Product_ID: string;
  Budget: number;
  Clicks: number;
  Conversions: number;
  Revenue_Generated: number;
  ROI: number;
  Customer_ID: string;
  Subscription_Tier: string;
  Subscription_Length: number;
  Flash_Sale_ID: string;
  Discount_Level: number;
  Units_Sold: number;
  Bundle_ID: string;
  Bundle_Price: number;
  Customer_Satisfaction_Post_Refund: number;
  Common_Keywords: string;
}

export interface KPI {
  label: string;
  value: string;
  delta?: string;
  icon: string;
  glow: string;
  color: string;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface CampaignPredictRequest {
  Budget: number;
  Clicks: number;
  ROI: number;
  Discount_Level: number;
  Units_Sold: number;
  Bundle_Price: number;
  Subscription_Length: number;
  Customer_Satisfaction_Post_Refund: number;
  subscription_value_score: number;
  discount_tier: "Low" | "Medium" | "High";
  revenue_per_click: number;
  cost_per_conversion: number;
  Conversions: number;
  activation_score: number;
}

export interface CampaignPredictResponse {
  predicted_conversion_rate: number;
  activation_probability: number;
  predicted_revenue: number;
}

export interface ModelMetrics {
  RMSE?: number;
  MAE?: number;
  R2?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  roc_auc?: number;
}

export interface ClusterProfile {
  cluster_id: number;
  label: string;
  size: number;
  means: Record<string, number>;
}
