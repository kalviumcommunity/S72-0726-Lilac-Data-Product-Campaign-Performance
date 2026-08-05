import { CampaignRow } from '../types';

const NUMERIC_FIELDS = new Set([
  'Budget', 'Clicks', 'Conversions', 'Revenue_Generated', 'ROI',
  'Subscription_Length', 'Discount_Level', 'Units_Sold',
  'Bundle_Price', 'Customer_Satisfaction_Post_Refund',
]);

export function parseCSV(text: string): CampaignRow[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].replace(/\r$/, '').split(',');

  return lines.slice(1).map((line) => {
    const values = line.replace(/\r$/, '').split(',');
    const row: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      const val = values[i] ?? '';
      row[h] = NUMERIC_FIELDS.has(h) ? parseFloat(val) || 0 : val;
    });
    return row as unknown as CampaignRow;
  });
}

export async function loadData(): Promise<CampaignRow[]> {
  const resp = await fetch('/marketing_and_product_performance.csv');
  const text = await resp.text();
  return parseCSV(text);
}
