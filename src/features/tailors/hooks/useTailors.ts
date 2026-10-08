import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { tailorsApi, TailorFilters } from '../../../api/tailors.api';
import { TailorItem } from '../../../types/api';

export function useTailors(initialFilters?: TailorFilters) {
  const queryKey = ['tailors', initialFilters];

  const {
    data: tailors = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery<TailorItem[], Error>({
    queryKey,
    queryFn: async () => {
      const res = await tailorsApi.getTailors(initialFilters);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    tailors,
    isLoading,
    isRefreshing: isRefetching,
    error: error ? error.message : null,
    refresh,
  };
}

export function useTailorDetails(tailorId: string) {
  const {
    data: tailor = null,
    isLoading,
    error,
    refetch,
  } = useQuery<TailorItem | null, Error>({
    queryKey: ['tailor', tailorId],
    queryFn: async () => {
      if (!tailorId) return null;
      const res = await tailorsApi.getTailorById(tailorId);
      return res.data || null;
    },
    enabled: !!tailorId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    tailor,
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
}

export function useTailorsMap(params?: {
  city?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}) {
  const {
    data: tailors = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TailorItem[], Error>({
    queryKey: ['tailors-map', params],
    queryFn: async () => {
      const res = await tailorsApi.getTailorsMap(params);
      if (res.data && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    staleTime: 3 * 60 * 1000,
  });

  return {
    tailors,
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
}

export function useNearbyTailors(params?: {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  search?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}) {
  const isEnabled =
    params?.lat !== undefined &&
    params?.lng !== undefined &&
    !isNaN(params.lat) &&
    !isNaN(params.lng);

  const {
    data: tailors = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TailorItem[], Error>({
    queryKey: ['tailors-nearby', params],
    queryFn: async () => {
      const res = await tailorsApi.getNearbyTailors(params as any);
      return res.data || [];
    },
    enabled: isEnabled,
    staleTime: 3 * 60 * 1000,
  });

  return {
    tailors,
    isLoading: isEnabled ? isLoading : false,
    error: error ? error.message : null,
    refetch,
  };
}
