import { create } from "zustand";
import { measurementsApi, CreateMeasurementPayload } from "../api/measurements.api";
import { storage } from "../api/client";
import { MeasurementItem } from "../types/api";

export function normalizeMeasurement(raw: any): MeasurementItem {
  return {
    id: String(raw.id),
    userId: raw.userId || raw.user_id,
    profileName: raw.profileName || raw.title || raw.profile_name || "My Measurements",
    gender: raw.gender,
    unit: (raw.unit === "cm" ? "cm" : "inches") as "inches" | "cm",
    chest: raw.chest != null && !isNaN(Number(raw.chest)) ? Number(raw.chest) : undefined,
    waist: raw.waist != null && !isNaN(Number(raw.waist)) ? Number(raw.waist) : undefined,
    hips: raw.hips != null && !isNaN(Number(raw.hips)) ? Number(raw.hips) : undefined,
    shoulder: raw.shoulder != null && !isNaN(Number(raw.shoulder)) ? Number(raw.shoulder) : undefined,
    sleeveLength:
      (raw.sleeveLength ?? raw.sleeve_length) != null && !isNaN(Number(raw.sleeveLength ?? raw.sleeve_length))
        ? Number(raw.sleeveLength ?? raw.sleeve_length)
        : undefined,
    shirtLength:
      (raw.shirtLength ?? raw.shirt_length) != null && !isNaN(Number(raw.shirtLength ?? raw.shirt_length))
        ? Number(raw.shirtLength ?? raw.shirt_length)
        : undefined,
    trouserLength:
      (raw.trouserLength ?? raw.trouser_length) != null && !isNaN(Number(raw.trouserLength ?? raw.trouser_length))
        ? Number(raw.trouserLength ?? raw.trouser_length)
        : undefined,
    inseam: raw.inseam != null && !isNaN(Number(raw.inseam)) ? Number(raw.inseam) : undefined,
    neck: raw.neck != null && !isNaN(Number(raw.neck)) ? Number(raw.neck) : undefined,
    notes: raw.notes || "",
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

interface MeasurementsState {
  measurements: MeasurementItem[];
  activeProfile: MeasurementItem | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isHydrated: boolean;
  error: string | null;

  hydrate: () => Promise<MeasurementItem[]>;
  fetchMeasurements: () => Promise<void>;
  refresh: () => Promise<void>;
  addMeasurement: (data: CreateMeasurementPayload) => Promise<MeasurementItem>;
  updateMeasurement: (id: string, data: Partial<CreateMeasurementPayload>) => Promise<MeasurementItem | null>;
  deleteMeasurement: (id: string) => Promise<void>;
  setActiveProfile: (profile: MeasurementItem | null) => void;
}

export const useMeasurementsStore = create<MeasurementsState>((set, get) => ({
  measurements: [],
  activeProfile: null,
  isLoading: false,
  isRefreshing: false,
  isHydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const stored = await storage.getStoredMeasurements();
      if (stored && Array.isArray(stored) && stored.length > 0) {
        const normalized = stored.map(normalizeMeasurement);
        const currentActive = get().activeProfile;
        const matchingActive = currentActive ? normalized.find((m) => m.id === currentActive.id) : null;
        set({
          measurements: normalized,
          activeProfile: matchingActive || normalized[0] || null,
          isHydrated: true,
        });
        return normalized;
      }
    } catch (e) {
      console.warn("Error hydrating measurements from storage:", e);
    }
    set({ isHydrated: true });
    return get().measurements;
  },

  fetchMeasurements: async () => {
    const state = get();
    // Hydrate from storage first if not hydrated or empty so saved profiles appear immediately
    if (!state.isHydrated || state.measurements.length === 0) {
      await state.hydrate();
    }

    set({ isLoading: get().measurements.length === 0, error: null });

    try {
      const res = await measurementsApi.getMyMeasurements().catch(() => measurementsApi.getMeasurements());
      if (res && res.data && Array.isArray(res.data)) {
        const serverList = res.data.map(normalizeMeasurement);
        const currentList = get().measurements;

        // Merge: keep any locally created profiles that have not synced to server yet
        const localOnly = currentList.filter(
          (local) =>
            local.id.startsWith("m_") &&
            !serverList.some((srv) => srv.id === local.id || srv.profileName === local.profileName)
        );

        const merged = [...localOnly, ...serverList];
        const currentActive = get().activeProfile;
        const matchingActive = currentActive ? merged.find((m) => m.id === currentActive.id) : null;

        set({
          measurements: merged,
          activeProfile: matchingActive || merged[0] || null,
          isLoading: false,
          isRefreshing: false,
        });

        // Persist merged profiles to storage
        await storage.setStoredMeasurements(merged);
        return;
      }
    } catch {
      // On network failure or auth error, keep local storage items intact
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    await get().fetchMeasurements();
  },

  addMeasurement: async (data: CreateMeasurementPayload) => {
    set({ isLoading: true });

    // Create local profile immediately
    const tempId = `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const localProfile: MeasurementItem = {
      ...data,
      id: tempId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentList = get().measurements;
    const updatedList = [localProfile, ...currentList.filter((m) => m.id !== tempId)];

    // Optimistically update store and persist immediately so profile is never lost
    set({
      measurements: updatedList,
      activeProfile: localProfile,
      isLoading: false,
    });
    await storage.setStoredMeasurements(updatedList);

    // Sync to backend
    const payload: any = {
      title: data.profileName,
      profileName: data.profileName,
      unit: data.unit === "cm" ? "cm" : "in",
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

    try {
      const res = await measurementsApi.createMeasurement(payload);
      if (res && res.data && res.data.id) {
        const serverProfile = normalizeMeasurement(res.data);
        const syncedList = get().measurements.map((m) => (m.id === tempId ? serverProfile : m));
        set({
          measurements: syncedList,
          activeProfile: serverProfile,
        });
        await storage.setStoredMeasurements(syncedList);
        return serverProfile;
      }
    } catch (e) {
      console.warn("Background API sync failed for measurement, kept local profile:", e);
    }

    return localProfile;
  },

  updateMeasurement: async (id: string, data: Partial<CreateMeasurementPayload>) => {
    set({ isLoading: true });

    let updatedItem: MeasurementItem | null = null;
    const currentList = get().measurements;
    const updatedList = currentList.map((m) => {
      if (m.id === id) {
        updatedItem = { ...m, ...data, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return m;
    });

    set({
      measurements: updatedList,
      activeProfile: get().activeProfile?.id === id && updatedItem ? updatedItem : get().activeProfile,
      isLoading: false,
    });
    await storage.setStoredMeasurements(updatedList);

    // Sync to server if it's a server ID
    if (!id.startsWith("m_")) {
      const payload: any = {
        ...(data.profileName ? { title: data.profileName, profileName: data.profileName } : {}),
        ...(data.unit ? { unit: data.unit === "cm" ? "cm" : "in" } : {}),
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

      try {
        const res = await measurementsApi.updateMeasurement(id, payload);
        if (res && res.data && res.data.id) {
          const serverItem = normalizeMeasurement(res.data);
          const syncedList = get().measurements.map((m) => (m.id === id ? serverItem : m));
          set({
            measurements: syncedList,
            activeProfile: get().activeProfile?.id === id ? serverItem : get().activeProfile,
          });
          await storage.setStoredMeasurements(syncedList);
          return serverItem;
        }
      } catch (e) {
        console.warn("Background API update failed for measurement, kept local changes:", e);
      }
    }

    return updatedItem;
  },

  deleteMeasurement: async (id: string) => {
    const filtered = get().measurements.filter((m) => m.id !== id);
    const newActive = get().activeProfile?.id === id ? filtered[0] || null : get().activeProfile;
    set({
      measurements: filtered,
      activeProfile: newActive,
    });
    await storage.setStoredMeasurements(filtered);

    if (!id.startsWith("m_")) {
      try {
        await measurementsApi.deleteMeasurement(id);
      } catch (e) {
        console.warn("Background API delete failed for measurement:", e);
      }
    }
  },

  setActiveProfile: (profile: MeasurementItem | null) => {
    set({ activeProfile: profile });
  },
}));
