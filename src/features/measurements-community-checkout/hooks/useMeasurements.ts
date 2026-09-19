import { useState, useEffect, useCallback } from 'react';
import { measurementsApi, CreateMeasurementPayload } from '../../../api/measurements.api';
import { MeasurementItem } from '../../../types/api';

export const INITIAL_DEFAULT_PROFILES: MeasurementItem[] = [];

// In-memory cache for profiles during the app session
let cachedProfiles: MeasurementItem[] = [];

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<MeasurementItem[]>(cachedProfiles);
  const [activeProfile, setActiveProfile] = useState<MeasurementItem | null>(cachedProfiles[0] || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchMeasurements = useCallback(async () => {
    setError(null);
    try {
      const res = await measurementsApi.getMyMeasurements().catch(() => measurementsApi.getMeasurements());
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const dataList = res.data;
        cachedProfiles = dataList;
        setMeasurements(dataList);
        setActiveProfile((prev) => {
          if (!prev) return dataList[0];
          const found = dataList.find((m) => m.id === prev.id);
          return found || dataList[0];
        });
      } else {
        setMeasurements(cachedProfiles);
        setActiveProfile((prev) => {
          if (!prev) return cachedProfiles[0] || null;
          const found = cachedProfiles.find((m) => m.id === prev.id);
          return found || cachedProfiles[0] || null;
        });
      }
    } catch (err: any) {
      setMeasurements(cachedProfiles);
      setActiveProfile((prev) => {
        if (!prev) return cachedProfiles[0] || null;
        const found = cachedProfiles.find((m) => m.id === prev.id);
        return found || cachedProfiles[0] || null;
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMeasurements();
  }, [fetchMeasurements]);

  const addMeasurement = async (data: CreateMeasurementPayload) => {
    const newProfile: MeasurementItem = {
      ...data,
      id: `m_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Send title and unit in backend compatible format
      const payload: any = {
        title: data.profileName,
        unit: data.unit === 'cm' ? 'cm' : 'in',
        chest: data.chest,
        waist: data.waist,
        hips: data.hips,
        shoulder: data.shoulder,
        sleeveLength: data.sleeveLength,
        shirtLength: data.shirtLength,
        trouserLength: data.trouserLength,
        inseam: data.inseam,
        neck: data.neck,
        notes: data.notes,
      };
      await measurementsApi.createMeasurement(payload).catch(() => {});
    } catch {
      // continue with local update
    }

    cachedProfiles = [newProfile, ...cachedProfiles];
    setMeasurements([...cachedProfiles]);
    setActiveProfile(newProfile);
    return newProfile;
  };

  const updateMeasurement = async (id: string, data: Partial<CreateMeasurementPayload>) => {
    try {
      await measurementsApi.updateMeasurement(id, data).catch(() => {});
    } catch {
      // continue with local update
    }

    cachedProfiles = cachedProfiles.map((m) =>
      m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
    );
    setMeasurements([...cachedProfiles]);
    const updated = cachedProfiles.find((m) => m.id === id) || null;
    setActiveProfile(updated);
    return updated;
  };

  const deleteMeasurement = async (id: string) => {
    try {
      await measurementsApi.deleteMeasurement(id).catch(() => {});
    } catch {
      // continue with local update
    }

    cachedProfiles = cachedProfiles.filter((m) => m.id !== id);
    if (cachedProfiles.length === 0) {
      cachedProfiles = [...INITIAL_DEFAULT_PROFILES];
    }
    setMeasurements([...cachedProfiles]);
    setActiveProfile(cachedProfiles[0] || null);
  };

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
