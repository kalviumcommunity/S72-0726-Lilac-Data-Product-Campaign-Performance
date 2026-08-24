import { CampaignPredictRequest, CampaignPredictResponse, ModelMetrics, ClusterProfile } from '../types';

const API_BASE = '/api';

export const api = {
  async predict(payload: CampaignPredictRequest): Promise<CampaignPredictResponse> {
    const res = await fetch(`${API_BASE}/ml/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Prediction failed');
    return res.json();
  },

  async getConversionMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/ml/conversion/metrics`);
    if (!res.ok) throw new Error('Failed to fetch conversion metrics');
    return res.json();
  },

  async getConversionImportance(): Promise<Record<string, number>> {
    const res = await fetch(`${API_BASE}/ml/conversion/importance`);
    if (!res.ok) throw new Error('Failed to fetch conversion importance');
    return res.json();
  },

  async getActivationMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/ml/activation/metrics`);
    if (!res.ok) throw new Error('Failed to fetch activation metrics');
    return res.json();
  },

  async getActivationImportance(): Promise<Record<string, number>> {
    const res = await fetch(`${API_BASE}/ml/activation/importance`);
    if (!res.ok) throw new Error('Failed to fetch activation importance');
    return res.json();
  },

  async getActivationReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/ml/activation/report`);
    if (!res.ok) throw new Error('Failed to fetch activation report');
    return res.json();
  },

  async getSegmentProfiles(): Promise<ClusterProfile[]> {
    const res = await fetch(`${API_BASE}/ml/segments/profiles`);
    if (!res.ok) throw new Error('Failed to fetch segment profiles');
    return res.json();
  },

  async getRevenueMetrics(): Promise<ModelMetrics> {
    const res = await fetch(`${API_BASE}/ml/revenue/metrics`);
    if (!res.ok) throw new Error('Failed to fetch revenue metrics');
    return res.json();
  },
  
  async getRevenueImportance(): Promise<Record<string, number>> {
    const res = await fetch(`${API_BASE}/ml/revenue/importance`);
    if (!res.ok) throw new Error('Failed to fetch revenue importance');
    return res.json();
  },

  async getEdaSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/summary`);
    if (!res.ok) throw new Error('Failed to fetch EDA summary');
    return res.json();
  },

  async getEdaDistributions(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/distributions`);
    if (!res.ok) throw new Error('Failed to fetch EDA distributions');
    return res.json();
  },

  async getEdaKeywordPerformance(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/keyword-performance`);
    if (!res.ok) throw new Error('Failed to fetch EDA keyword performance');
    return res.json();
  },

  async getEdaTierBreakdown(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/tier-breakdown`);
    if (!res.ok) throw new Error('Failed to fetch EDA tier breakdown');
    return res.json();
  },

  async getEdaBudgetScatter(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/budget-scatter`);
    if (!res.ok) throw new Error('Failed to fetch EDA budget scatter');
    return res.json();
  },

  async getEdaDiscountVsUnits(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/discount-vs-units`);
    if (!res.ok) throw new Error('Failed to fetch EDA discount vs units');
    return res.json();
  },

  async getEdaSatisfactionDistribution(): Promise<any> {
    const res = await fetch(`${API_BASE}/eda/satisfaction-distribution`);
    if (!res.ok) throw new Error('Failed to fetch EDA satisfaction distribution');
    return res.json();
  }
};
