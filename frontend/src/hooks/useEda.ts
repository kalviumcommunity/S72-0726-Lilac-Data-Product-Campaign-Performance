import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ModelMetrics, ClusterProfile } from '../types';

export function useModelMetrics() {
  const [metrics, setMetrics] = useState<{
    conversion?: ModelMetrics;
    activation?: ModelMetrics;
    revenue?: ModelMetrics;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [conv, act, rev] = await Promise.all([
          api.getConversionMetrics(),
          api.getActivationMetrics(),
          api.getRevenueMetrics(),
        ]);
        setMetrics({ conversion: conv, activation: act, revenue: rev });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { metrics, loading, error };
}

export function useFeatureImportance() {
  const [importances, setImportances] = useState<{
    conversion?: Record<string, number>;
    activation?: Record<string, number>;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [conv, act] = await Promise.all([
          api.getConversionImportance(),
          api.getActivationImportance(),
        ]);
        setImportances({ conversion: conv, activation: act });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { importances, loading, error };
}

export function useSegments() {
  const [profiles, setProfiles] = useState<ClusterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        setLoading(true);
        const data = await api.getSegmentProfiles();
        setProfiles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSegments();
  }, []);

  return { profiles, loading, error };
}
