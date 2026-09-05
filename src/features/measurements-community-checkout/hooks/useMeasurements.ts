import { useState, useEffect, useCallback } from 'react';
import { measurementsApi, CreateMeasurementPayload } from '../../../api/measurements.api';
import { MeasurementItem } from '../../../types/api';

const DEFAULT_MEASUREMENTS: MeasurementItem[] = [
  {
    id: '1',
    profileName: 'Standard Profile',
    unit: 'inches',
    chest: 34,
    waist: 28,
    hips: 36,
    shoulder: 14.5,
    sleeveLength: 22,
    shirtLength: 15,
  },
];

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<MeasurementItem[]>(DEFAULT_MEASUREMENTS);
  const [activeProfile, setActiveProfile] = useState<MeasurementItem | null>(DEFAULT_MEASUREMENTS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchMeasurements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await measurementsApi.getMyMeasurements().catch(() => measurementsApi.getMeasurements());
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMeasurements(res.data);
        setActiveProfile(res.data[0]);
      } else {
        setMeasurements(DEFAULT_MEASUREMENTS);
        setActiveProfile(DEFAULT_MEASUREMENTS[0]);
      }
    } catch (err: any) {
      console.warn('Failed to load measurements from backend, using fallback:', err.message);
      setError(err.message || 'Failed to load measurements');
      setMeasurements(DEFAULT_MEASUREMENTS);
      setActiveProfile(DEFAULT_MEASUREMENTS[0]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMeasurements();
  }, [fetchMeasurements]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMeasurements();
  }, [fetchMeasurements]);

  const addMeasurement = async (data: CreateMeasurementPayload) => {
    const res = await measurementsApi.createMeasurement(data);
    await fetchMeasurements();
    return res;
  };

  const updateMeasurement = async (id: string, data: Partial<CreateMeasurementPayload>) => {
    const res = await measurementsApi.updateMeasurement(id, data);
    await fetchMeasurements();
    return res;
  };

  const deleteMeasurement = async (id: string) => {
    const res = await measurementsApi.deleteMeasurement(id);
    await fetchMeasurements();
    return res;
  };

  return {
    measurements,
    activeProfile,
    isLoading,
    isRefreshing,
    error,
    refresh,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  };
}
