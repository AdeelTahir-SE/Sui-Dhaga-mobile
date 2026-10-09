import { useEffect } from 'react';
import { useMeasurementsStore, normalizeMeasurement } from '../../../stores/measurements.store';
import { CreateMeasurementPayload } from '../../../api/measurements.api';
import { MeasurementItem } from '../../../types/api';

export const INITIAL_DEFAULT_PROFILES: MeasurementItem[] = [];

export { normalizeMeasurement };

export function useMeasurements() {
  const measurements = useMeasurementsStore((s) => s.measurements);
  const activeProfile = useMeasurementsStore((s) => s.activeProfile);
  const isLoading = useMeasurementsStore((s) => s.isLoading);
  const isRefreshing = useMeasurementsStore((s) => s.isRefreshing);
  const error = useMeasurementsStore((s) => s.error);
  const isHydrated = useMeasurementsStore((s) => s.isHydrated);

  const fetchMeasurements = useMeasurementsStore((s) => s.fetchMeasurements);
  const refresh = useMeasurementsStore((s) => s.refresh);
  const addMeasurement = useMeasurementsStore((s) => s.addMeasurement);
  const updateMeasurement = useMeasurementsStore((s) => s.updateMeasurement);
  const deleteMeasurement = useMeasurementsStore((s) => s.deleteMeasurement);
  const setActiveProfile = useMeasurementsStore((s) => s.setActiveProfile);

  useEffect(() => {
    // If not hydrated yet or measurements empty, ensure we fetch/hydrate
    if (!isHydrated || measurements.length === 0) {
      fetchMeasurements();
    }
  }, [isHydrated, measurements.length, fetchMeasurements]);

  return {
    measurements,
    activeProfile,
    setActiveProfile,
    isLoading,
    isRefreshing,
    error,
    refresh,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
  };
}
