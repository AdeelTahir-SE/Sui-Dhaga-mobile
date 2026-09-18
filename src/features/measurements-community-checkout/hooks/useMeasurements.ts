import { useState, useEffect, useCallback } from 'react';
import { measurementsApi, CreateMeasurementPayload } from '../../../api/measurements.api';
import { MeasurementItem } from '../../../types/api';

export const INITIAL_DEFAULT_PROFILES: MeasurementItem[] = [
  {
    id: 'm_1',
    profileName: 'Ayesha - Daily Kurti & Trouser',
    gender: 'female',
    unit: 'inches',
    chest: 36,
    waist: 30,
    hips: 40,
    shoulder: 14.5,
    sleeveLength: 21,
    shirtLength: 40,
    trouserLength: 37.5,
    inseam: 28,
    neck: 14,
    notes: 'Keep 2-inch extra margin inside seams for alterations. Side chaak at 20 inches.',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-15T10:00:00.000Z',
  },
  {
    id: 'm_2',
    profileName: 'Ayesha - Bridal Lehenga & Choli',
    gender: 'female',
    unit: 'inches',
    chest: 36.5,
    waist: 29.5,
    hips: 40,
    shoulder: 14,
    sleeveLength: 11,
    shirtLength: 14.5,
    trouserLength: 42,
    inseam: 30,
    neck: 14,
    notes: 'In-built padded cups in choli. Deep back neck with latkan ties. Lehenga length measured with 3-inch heels.',
    createdAt: '2026-09-02T12:00:00.000Z',
    updatedAt: '2026-09-02T12:00:00.000Z',
  },
  {
    id: 'm_3',
    profileName: 'Mother - Classic Shalwar Suit',
    gender: 'female',
    unit: 'inches',
    chest: 41,
    waist: 37,
    hips: 45,
    shoulder: 15.5,
    sleeveLength: 21.5,
    shirtLength: 42,
    trouserLength: 39,
    inseam: 27,
    neck: 15,
    notes: 'Comfort relaxed fit. Broad paincha with canvas buckram stiffener.',
    createdAt: '2026-08-28T09:30:00.000Z',
    updatedAt: '2026-08-28T09:30:00.000Z',
  },
  {
    id: 'm_4',
    profileName: 'Ali - Slim Fit Kurta Pajama',
    gender: 'male',
    unit: 'inches',
    chest: 40,
    waist: 34,
    hips: 42,
    shoulder: 18,
    sleeveLength: 25,
    shirtLength: 41,
    trouserLength: 40.5,
    inseam: 31,
    neck: 16,
    notes: 'Modern Sherwani stand collar. Concealed front placket buttons.',
    createdAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-10T14:00:00.000Z',
  },
];

// In-memory cache for profiles during the app session
let cachedProfiles: MeasurementItem[] = [...INITIAL_DEFAULT_PROFILES];

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
      } else if (cachedProfiles.length === 0) {
        cachedProfiles = [...INITIAL_DEFAULT_PROFILES];
        setMeasurements(cachedProfiles);
        setActiveProfile(cachedProfiles[0]);
      } else {
        setMeasurements(cachedProfiles);
        if (!activeProfile && cachedProfiles.length > 0) {
          setActiveProfile(cachedProfiles[0]);
        }
      }
    } catch (err: any) {
      console.warn('Backend measurements unavailable, using local profiles:', err.message);
      setMeasurements(cachedProfiles);
      if (!activeProfile && cachedProfiles.length > 0) {
        setActiveProfile(cachedProfiles[0]);
      }
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
