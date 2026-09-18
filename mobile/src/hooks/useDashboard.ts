import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { API_ENDPOINTS } from '../constants/api';
import { DashboardData } from '../types';

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const result = await api.get<DashboardData>(API_ENDPOINTS.dashboard);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await load();
  }, [load]);

  return { data, isLoading, error, refresh };
};
