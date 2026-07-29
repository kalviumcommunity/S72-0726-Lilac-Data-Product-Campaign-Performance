import axios from 'axios'
import type {
  EdaSummary,
  CorrelationData,
  DistributionsData,
  VanityVsActivationData,
  KeywordPerformanceRow,
  TierBreakdownRow,
} from '../types'

const client = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export const api = {
  getSummary: () => client.get<EdaSummary>('/eda/summary').then(r => r.data),
  getCorrelation: () => client.get<CorrelationData>('/eda/correlation').then(r => r.data),
  getDistributions: () => client.get<DistributionsData>('/eda/distributions').then(r => r.data),
  getVanityVsActivation: () =>
    client.get<VanityVsActivationData>('/eda/vanity-vs-activation').then(r => r.data),
  getKeywordPerformance: () =>
    client.get<KeywordPerformanceRow[]>('/eda/keyword-performance').then(r => r.data),
  getTierBreakdown: () =>
    client.get<TierBreakdownRow[]>('/eda/tier-breakdown').then(r => r.data),
}
