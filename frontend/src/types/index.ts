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
