import { useState, useEffect, useCallback } from 'react';
import { tailorsApi, TailorFilters } from '../../../api/tailors.api';
import { TailorItem } from '../../../types/api';

const DEFAULT_TAILORS: TailorItem[] = [
  {
    id: '1',
    name: 'Rekha Tailors',
    rating: 4.8,
    reviews: 128,
    distance: '2.1 km',
    specialty: 'Specializes in Bridal, Suits, Sarees',
    image: require('@/assets/illustrations/customer-tabs/tailors/rekha.png'),
    topRated: true,
    verified: true,
  },
  {
    id: '2',
    name: 'Stitch Craft',
    rating: 4.7,
    reviews: 96,
    distance: '3.4 km',
    specialty: "Specializes in Men's Wear",
    image: require('@/assets/illustrations/customer-tabs/tailors/stitch-craft.png'),
    verified: true,
  },
  {
    id: '3',
    name: 'Aarav Bespoke',
    rating: 4.6,
    reviews: 72,
    distance: '4.2 km',
    specialty: 'Specializes in Indo-Western',
    image: require('@/assets/illustrations/customer-tabs/tailors/aarav-bespoke.png'),
    verified: true,
  },
  {
    id: '4',
    name: 'Noor & Thread',
    rating: 4.5,
    reviews: 64,
    distance: '5.1 km',
    specialty: 'Specializes in Sarees',
    image: require('@/assets/illustrations/customer-tabs/tailors/noor-thread.png'),
    verified: false,
  },
];

export function useTailors(initialFilters?: TailorFilters) {
  const [tailors, setTailors] = useState<TailorItem[]>(DEFAULT_TAILORS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchTailors = useCallback(async (filters?: TailorFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await tailorsApi.getTailors(filters);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setTailors(res.data);
      } else {
        // Fallback to default list if backend has no tailors seeded yet
        setTailors(DEFAULT_TAILORS);
      }
    } catch (err: any) {
      console.warn('Failed to load tailors from backend, using fallback:', err.message);
      setError(err.message || 'Failed to load tailors');
      setTailors(DEFAULT_TAILORS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTailors(initialFilters);
  }, [fetchTailors, initialFilters]);

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
        if (isMounted) {
          if (res.data) {
            setTailor(res.data);
          } else {
            const fallback = DEFAULT_TAILORS.find((t) => t.id === tailorId) || DEFAULT_TAILORS[0];
            setTailor(fallback);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const fallback = DEFAULT_TAILORS.find((t) => t.id === tailorId) || DEFAULT_TAILORS[0];
          setTailor(fallback);
          setError(err.message);
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
