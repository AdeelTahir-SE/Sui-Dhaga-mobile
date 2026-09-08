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
    const hasBusinessName = !!(
      (p.businessName && p.businessName.trim().length > 0) ||
      (p.shopName && p.shopName.trim().length > 0)
    );
    const hasSpecialties = !!(
      (p.specialties && p.specialties.length > 0) ||
      (p.specialty && p.specialty.trim().length > 0)
    );
    const loc = p.location as any;
    const hasCity = !!(
      p.city?.trim() ||
      (typeof loc === 'object' && loc?.city && typeof loc.city === 'string' && loc.city.trim().length > 0) ||
      (typeof loc === 'string' && loc.trim().length > 0)
    );
    const hasPrice =
      (typeof p.startingPrice === 'number' && p.startingPrice > 0) ||
      (p.services && p.services.length > 0 && typeof p.services[0].price === 'number' && p.services[0].price > 0);
    return hasBusinessName && hasSpecialties && hasCity && !!hasPrice;
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
      let remoteProfile: TailorItem | null = null;
      try {
        const res = await tailorsApi.getMyTailorProfile(user.id, user.email);
        if (res?.data && res.data.id) {
          remoteProfile = res.data;
        }
      } catch (err) {
        console.warn('Error fetching tailor profile via getMyTailorProfile:', err);
      }

      // 2. Fallback: Search in tailors list for matching user.id
      if (!remoteProfile) {
        try {
          const listRes = await tailorsApi.getTailors({ limit: 100, page: 1 });
          if (listRes?.data && Array.isArray(listRes.data)) {
            const found = listRes.data.find(
              (t: any) =>
                String(t.userId || t.user_id || t.user?.id || t.profile?.id || '').toLowerCase() === String(user.id).toLowerCase() ||
                (user.email && String(t.user?.email || t.email || '').toLowerCase() === String(user.email).toLowerCase())
            );
            if (found) {
              remoteProfile = found;
            }
          }
        } catch {}
      }

      const effectiveProfile: TailorItem = remoteProfile || {
        id: `tailor_${user.id}`,
        userId: user.id,
        name: user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Tailor'),
        businessName: '',
        shopName: '',
        rating: 5.0,
        reviewsCount: 0,
        specialties: [],
        specialty: '',
        startingPrice: 0,
        experienceYears: 0,
        city: '',
        address: '',
        location: {
          address: '',
          city: '',
        },
        bio: '',
        phone: user.phone || '',
        imageUrl: user.avatar || user.avatarUrl,
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
