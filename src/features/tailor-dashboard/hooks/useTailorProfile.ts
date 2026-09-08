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
      // 1. Fetch from backend API /tailors/me
      let remoteProfile: TailorItem | null = null;
      try {
        const res = await tailorsApi.getMyTailorProfile();
        const raw = (res?.data && (res.data as any).id ? res.data : (res as any)?.id ? res : null) as any;
        if (raw) {
          remoteProfile = {
            ...raw,
            id: raw.id,
            userId: raw.userId || user.id,
            shopName: raw.shopName || raw.businessName || '',
            businessName: raw.shopName || raw.businessName || '',
            name: raw.name || raw.user?.fullName || raw.user?.name || user.fullName || user.name || (user.email ? user.email.split('@')[0] : 'Tailor'),
            phone: raw.phone || raw.user?.phone || user.phone || '',
            city: raw.city || raw.location?.city || '',
            address: raw.address || raw.location?.address || '',
            location: {
              city: raw.city || raw.location?.city || '',
              address: raw.address || raw.location?.address || '',
            },
            experienceYears: typeof raw.experienceYears === 'number' ? raw.experienceYears : 0,
            startingPrice: typeof raw.startingPrice === 'number' ? raw.startingPrice : (raw.services?.[0]?.price ? Number(raw.services[0].price) : 0),
            specialties: Array.isArray(raw.specialties) ? raw.specialties : (raw.specialty ? [raw.specialty] : []),
            specialty: raw.specialty || (Array.isArray(raw.specialties) ? raw.specialties[0] : ''),
            bio: raw.bio || '',
            rating: typeof raw.rating === 'number' ? raw.rating : 5.0,
            imageUrl: raw.imageUrl || raw.image || raw.avatar || user.avatar || user.avatarUrl,
            image: raw.imageUrl || raw.image || raw.avatar || user.avatar || user.avatarUrl,
            avatar: raw.avatar || raw.imageUrl || raw.image || user.avatar || user.avatarUrl,
          };
        }
      } catch (err) {
        console.warn('Error fetching tailor profile via /tailors/me:', err);
      }

      // 2. Fallback: Search in tailors list for matching user.id
      if (!remoteProfile) {
        try {
          const listRes = await tailorsApi.getTailors();
          if (listRes?.data && Array.isArray(listRes.data)) {
            const found = listRes.data.find(
              (t: any) => t.userId === user.id || t.user?.id === user.id
            ) as any;
            if (found) {
              remoteProfile = {
                ...found,
                id: found.id,
                userId: found.userId || user.id,
                shopName: found.shopName || found.businessName || '',
                businessName: found.shopName || found.businessName || '',
                name: found.name || found.user?.fullName || user.fullName || user.name || 'Tailor',
                phone: found.phone || found.user?.phone || user.phone || '',
                city: found.city || found.location?.city || '',
                address: found.address || found.location?.address || '',
                location: {
                  city: found.city || found.location?.city || '',
                  address: found.address || found.location?.address || '',
                },
                experienceYears: typeof found.experienceYears === 'number' ? found.experienceYears : 0,
                startingPrice: typeof found.startingPrice === 'number' ? found.startingPrice : (found.services?.[0]?.price ? Number(found.services[0].price) : 0),
                specialties: Array.isArray(found.specialties) ? found.specialties : (found.specialty ? [found.specialty] : []),
                bio: found.bio || '',
                rating: typeof found.rating === 'number' ? found.rating : 5.0,
                imageUrl: found.imageUrl || found.image || found.avatar || user.avatar || user.avatarUrl,
              };
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
