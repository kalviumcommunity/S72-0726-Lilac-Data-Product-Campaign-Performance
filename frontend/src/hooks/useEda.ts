import { useState, useEffect } from 'react'
import { api } from '../services/api'
import type {
  EdaSummary,
  VanityVsActivationData,
  KeywordPerformanceRow,
  TierBreakdownRow,
  DistributionsData,
} from '../types'

function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetcher()
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e?.message ?? 'Unknown error') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error }
}

export const useSummary = () => useFetch<EdaSummary>(api.getSummary)
export const useVanityVsActivation = () => useFetch<VanityVsActivationData>(api.getVanityVsActivation)
export const useKeywordPerformance = () => useFetch<KeywordPerformanceRow[]>(api.getKeywordPerformance)
export const useTierBreakdown = () => useFetch<TierBreakdownRow[]>(api.getTierBreakdown)
export const useDistributions = () => useFetch<DistributionsData>(api.getDistributions)
