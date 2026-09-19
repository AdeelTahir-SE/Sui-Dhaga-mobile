import { useState, useEffect, useCallback } from 'react';
import { measurementsApi, CreateMeasurementPayload } from '../../../api/measurements.api';
import { MeasurementItem } from '../../../types/api';

export const INITIAL_DEFAULT_PROFILES: MeasurementItem[] = [];

// In-memory cache for profiles during the app session
let cachedProfiles: MeasurementItem[] = [];

export function normalizeMeasurement(raw: any): MeasurementItem {
  return {
    id: String(raw.id),
    profileName: raw.profileName || raw.title || raw.profile_name || 'My Measurements',
    unit: (raw.unit === 'cm' ? 'cm' : 'inches') as 'inches' | 'cm',
    chest: raw.chest != null ? Number(raw.chest) : undefined,
    waist: raw.waist != null ? Number(raw.waist) : undefined,
    hips: raw.hips != null ? Number(raw.hips) : undefined,
    shoulder: raw.shoulder != null ? Number(raw.shoulder) : undefined,
    sleeveLength:
      (raw.sleeveLength ?? raw.sleeve_length) != null
        ? Number(raw.sleeveLength ?? raw.sleeve_length)
        : undefined,
    shirtLength:
      (raw.shirtLength ?? raw.shirt_length) != null
        ? Number(raw.shirtLength ?? raw.shirt_length)
        : undefined,
    trouserLength:
      (raw.trouserLength ?? raw.trouser_length) != null
        ? Number(raw.trouserLength ?? raw.trouser_length)
        : undefined,
    inseam: raw.inseam != null ? Number(raw.inseam) : undefined,
    neck: raw.neck != null ? Number(raw.neck) : undefined,
    notes: raw.notes || '',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

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
      if (res.data && Array.isArray(res.data)) {
        const dataList = res.data.map(normalizeMeasurement);
        cachedProfiles = dataList;
        setMeasurements(dataList);
        setActiveProfile((prev) => {
          if (!prev) return dataList[0] || null;
          const found = dataList.find((m) => m.id === prev.id);
          return found || dataList[0] || null;
        });
      } else {
        setMeasurements(cachedProfiles);
      }
    } catch {
      setMeasurements(cachedProfiles);
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
    setIsLoading(true);
    const payload: any = {
      title: data.profileName,
      profileName: data.profileName,
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

    let savedProfile: MeasurementItem;
    try {
      const res = await measurementsApi.createMeasurement(payload);
      if (res.data && res.data.id) {
        savedProfile = normalizeMeasurement(res.data);
      } else {
        throw new Error('No ID returned from server');
      }
    } catch {
      // Fallback for offline or local preview
      savedProfile = {
        ...data,
        id: `m_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } finally {
      setIsLoading(false);
    }

    cachedProfiles = [savedProfile, ...cachedProfiles.filter((p) => p.id !== savedProfile.id)];
    setMeasurements([...cachedProfiles]);
    setActiveProfile(savedProfile);
    return savedProfile;
  };

  const updateMeasurement = async (id: string, data: Partial<CreateMeasurementPayload>) => {
    setIsLoading(true);
    const payload: any = {
      ...(data.profileName ? { title: data.profileName, profileName: data.profileName } : {}),
      ...(data.unit ? { unit: data.unit === 'cm' ? 'cm' : 'in' } : {}),
      ...(data.chest !== undefined ? { chest: data.chest } : {}),
      ...(data.waist !== undefined ? { waist: data.waist } : {}),
      ...(data.hips !== undefined ? { hips: data.hips } : {}),
      ...(data.shoulder !== undefined ? { shoulder: data.shoulder } : {}),
      ...(data.sleeveLength !== undefined ? { sleeveLength: data.sleeveLength } : {}),
      ...(data.shirtLength !== undefined ? { shirtLength: data.shirtLength } : {}),
      ...(data.trouserLength !== undefined ? { trouserLength: data.trouserLength } : {}),
      ...(data.inseam !== undefined ? { inseam: data.inseam } : {}),
      ...(data.neck !== undefined ? { neck: data.neck } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    };

    let updatedItem: MeasurementItem | null = null;
    try {
      const res = await measurementsApi.updateMeasurement(id, payload);
      if (res.data && res.data.id) {
        updatedItem = normalizeMeasurement(res.data);
      }
    } catch {
      // Fallback local update
    } finally {
      setIsLoading(false);
    }

    cachedProfiles = cachedProfiles.map((m) => {
      if (m.id === id) {
        return updatedItem || { ...m, ...data, updatedAt: new Date().toISOString() };
      }
      return m;
    });
    setMeasurements([...cachedProfiles]);
    const active = cachedProfiles.find((m) => m.id === id) || null;
    setActiveProfile(active);
    return active;
  };

  const deleteMeasurement = async (id: string) => {
    try {
      await measurementsApi.deleteMeasurement(id);
    } catch {
      // continue local delete
    }

    cachedProfiles = cachedProfiles.filter((m) => m.id !== id);
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
