import { useState, useEffect, useCallback } from 'react';
import { designsApi, CreateDesignPayload } from '../../../api/designs.api';
import { DesignItem } from '../../../types/api';

export function useDesigns() {
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [templates, setTemplates] = useState<DesignItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDesigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [designsRes, templatesRes] = await Promise.all([
        designsApi.getMyDesigns().catch(() => designsApi.getDesigns()).catch(() => ({ data: [] })),
        designsApi.getTemplates().catch(() => ({ data: [] })),
      ]);

      if (designsRes.data && Array.isArray(designsRes.data)) {
        setDesigns(designsRes.data);
      } else {
        setDesigns([]);
      }

      if (templatesRes.data && Array.isArray(templatesRes.data)) {
        setTemplates(templatesRes.data);
      } else {
        setTemplates([]);
      }
    } catch (err: any) {
      console.warn('Failed to load designs from backend:', err.message);
      setError(err.message || 'Failed to load designs');
      setDesigns([]);
      setTemplates([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDesigns();
  }, [fetchDesigns]);

  const createDesign = async (payload: CreateDesignPayload) => {
    const res = await designsApi.createDesign(payload);
    await fetchDesigns();
    return res;
  };

  return {
    designs,
    templates,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createDesign,
  };
}
