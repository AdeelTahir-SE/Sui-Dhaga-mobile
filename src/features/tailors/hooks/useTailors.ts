import { useState, useEffect, useCallback } from 'react';
import { tailorsApi, TailorFilters } from '../../../api/tailors.api';
import { TailorItem } from '../../../types/api';

export function useTailors(initialFilters?: TailorFilters) {
  const [tailors, setTailors] = useState<TailorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchTailors = useCallback(async (filters?: TailorFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tailorsApi.getTailors(filters);
      if (res.data && Array.isArray(res.data)) {
        setTailors(res.data);
      } else {
        setTailors([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tailors');
      setTailors([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);
    tailorsApi.getTailors(initialFilters)
      .then((res) => {
        if (isMounted) {
          if (res.data && Array.isArray(res.data)) {
            setTailors(res.data);
          } else {
            setTailors([]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load tailors');
          setTailors([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialFilters]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTailors(initialFilters);
  }, [fetchTailors, initialFilters]);

  return {
    tailors,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}

export function useTailorDetails(tailorId: string) {
  const [tailor, setTailor] = useState<TailorItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tailorId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    tailorsApi.getTailorById(tailorId)
      .then((res) => {
        if (isMounted && res.data) {
          setTailor(res.data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load tailor details');
          setTailor(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [tailorId]);

  return { tailor, isLoading, error };
}


