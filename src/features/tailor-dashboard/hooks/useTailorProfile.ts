import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { tailorsApi } from '../../../api/tailors.api';
import { storage } from '../../../api/client';
import { TailorItem } from '../../../types/api';

const TAILOR_STORAGE_KEY = 'sui_dhaga_tailor_profile';

export function useTailorProfile() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<TailorItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkIsComplete = (p: Partial<TailorItem> | null): boolean => {
    if (!p) return false;
    const hasBusinessName = !!(p.businessName && p.businessName.trim().length > 0);
    const hasSpecialties = !!(
      (p.specialties && p.specialties.length > 0) ||
      (p.specialty && p.specialty.trim().length > 0)
    );
    const loc = p.location as any;
    const hasCity = !!(
      (typeof loc === 'object' && loc?.city && typeof loc.city === 'string' && loc.city.trim().length > 0) ||
      (typeof loc === 'string' && loc.trim().length > 0)
    );
    const hasPrice = typeof p.startingPrice === 'number' && p.startingPrice > 0;
    return hasBusinessName && hasSpecialties && hasCity && hasPrice;
  };

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // 1. Check local storage first
      const storedRaw = await storage.getUser();
      const localProfileKey = `${TAILOR_STORAGE_KEY}_${user.id}`;
      let cachedProfile: TailorItem | null = null;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = window.localStorage.getItem(localProfileKey);
          if (raw) cachedProfile = JSON.parse(raw);
        }
      } catch {}

      // 2. Fetch from backend API
      let remoteProfile: TailorItem | null = null;
      try {
        const res = await tailorsApi.getMyTailorProfile();
        if (res.data && res.data.id) {
          remoteProfile = res.data;
        }
      } catch {}

      const effectiveProfile: TailorItem = remoteProfile || cachedProfile || {
        id: `tailor_${user.id}`,
        userId: user.id,
        name: user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Tailor'),
        businessName: '',
        rating: 5.0,
        reviewsCount: 0,
        specialties: [],
        specialty: '',
        startingPrice: 0,
        experienceYears: 0,
        location: {
          address: '',
          city: '',
        },
        bio: '',
        phone: user.phone || '',
        isVerified: false,
        isTopRated: false,
      };

      effectiveProfile.isProfileComplete = checkIsComplete(effectiveProfile);
      setProfile(effectiveProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to load tailor profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const saveProfile = async (data: Partial<TailorItem>): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const updated: TailorItem = {
        ...(profile || {
          id: `tailor_${user?.id || Date.now()}`,
          userId: user?.id,
          name: user?.fullName || user?.name || 'Tailor',
          rating: 5.0,
          reviewsCount: 0,
        }),
        ...data,
      };

      updated.isProfileComplete = checkIsComplete(updated);

      // Save to backend API (POST /tailors or PATCH /tailors/:id)
      const res = await tailorsApi.saveTailorProfile(updated);
      if (res?.data && res.data.id) {
        updated.id = res.data.id;
        updated.userId = res.data.userId || user?.id;
      }

      // Save locally
      if (user?.id && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          `${TAILOR_STORAGE_KEY}_${user.id}`,
          JSON.stringify(updated)
        );
      }

      setProfile(updated);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save tailor profile');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    isComplete: checkIsComplete(profile),
    error,
    refresh: loadProfile,
    saveProfile,
  };
}
