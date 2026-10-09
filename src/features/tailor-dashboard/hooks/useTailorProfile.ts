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
      // 1. Try to load cached tailor profile first for instant UI response
      const cached = await storage.getTailorProfile(user.id);
      if (cached) {
        cached.isProfileComplete = checkIsComplete(cached);
        setProfile(cached);
      }

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

      if (remoteProfile) {
        const resolvedShopName =
          remoteProfile.shopName?.trim() ||
          remoteProfile.businessName?.trim() ||
          (cached && (cached.shopName || cached.businessName)) ||
          '';

        const latVal =
          typeof remoteProfile.latitude === 'number' && !isNaN(remoteProfile.latitude)
            ? remoteProfile.latitude
            : remoteProfile.latitude !== undefined && remoteProfile.latitude !== null && !isNaN(Number(remoteProfile.latitude))
            ? Number(remoteProfile.latitude)
            : typeof remoteProfile.location?.latitude === 'number' && !isNaN(remoteProfile.location.latitude)
            ? remoteProfile.location.latitude
            : typeof cached?.latitude === 'number' && !isNaN(cached.latitude)
            ? cached.latitude
            : undefined;

        const lngVal =
          typeof remoteProfile.longitude === 'number' && !isNaN(remoteProfile.longitude)
            ? remoteProfile.longitude
            : remoteProfile.longitude !== undefined && remoteProfile.longitude !== null && !isNaN(Number(remoteProfile.longitude))
            ? Number(remoteProfile.longitude)
            : typeof remoteProfile.location?.longitude === 'number' && !isNaN(remoteProfile.location.longitude)
            ? remoteProfile.location.longitude
            : typeof cached?.longitude === 'number' && !isNaN(cached.longitude)
            ? cached.longitude
            : undefined;

        const resolvedStartingPrice =
          typeof remoteProfile.startingPrice === 'number' && remoteProfile.startingPrice > 0
            ? remoteProfile.startingPrice
            : typeof (remoteProfile as any).starting_price === 'number' && (remoteProfile as any).starting_price > 0
            ? (remoteProfile as any).starting_price
            : Array.isArray(remoteProfile.services) && remoteProfile.services.length > 0 && typeof remoteProfile.services[0].price === 'number' && remoteProfile.services[0].price > 0
            ? remoteProfile.services[0].price
            : typeof cached?.startingPrice === 'number' && cached.startingPrice > 0
            ? cached.startingPrice
            : 0;

        const mergedProfile: TailorItem = {
          ...(cached || {}),
          ...remoteProfile,
          shopName: resolvedShopName,
          businessName: resolvedShopName,
          startingPrice: resolvedStartingPrice,
          latitude: latVal,
          longitude: lngVal,
          location: {
            city: remoteProfile.city || (typeof remoteProfile.location === 'object' ? remoteProfile.location?.city : '') || cached?.city || '',
            address: remoteProfile.address || (typeof remoteProfile.location === 'object' ? remoteProfile.location?.address : '') || cached?.address || '',
            latitude: latVal,
            longitude: lngVal,
          },
        };

        mergedProfile.isProfileComplete = checkIsComplete(mergedProfile);
        setProfile(mergedProfile);
        await storage.setTailorProfile(user.id, mergedProfile).catch(() => {});
      } else if (!cached) {
        const effectiveProfile: TailorItem = {
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
          avatar: user.avatar || user.avatarUrl,
          banner: undefined,
          bannerUrl: undefined,
          imageUrl: user.avatar || user.avatarUrl,
          isVerified: false,
          isTopRated: false,
        };

        effectiveProfile.isProfileComplete = checkIsComplete(effectiveProfile);
        setProfile(effectiveProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tailor profile');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    loadProfile();
  }, [user?.id, user?.email]);

  const saveProfile = async (data: Partial<TailorItem>): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const resolvedShopName =
        (data as any).shopName?.trim() ||
        (data as any).shop_name?.trim() ||
        (data as any).businessName?.trim() ||
        profile?.shopName?.trim() ||
        profile?.businessName?.trim() ||
        '';

      const priceNum =
        typeof (data as any).startingPrice === 'number'
          ? (data as any).startingPrice
          : !isNaN(Number((data as any).startingPrice)) && (data as any).startingPrice !== ''
          ? Number((data as any).startingPrice)
          : typeof (data as any).starting_price === 'number'
          ? (data as any).starting_price
          : !isNaN(Number((data as any).starting_price)) && (data as any).starting_price !== ''
          ? Number((data as any).starting_price)
          : profile?.startingPrice || 0;

      const updated: TailorItem = {
        ...(profile || {
          id: `tailor_${user?.id || Date.now()}`,
          userId: user?.id,
          name: user?.fullName || user?.name || 'Tailor',
          rating: 5.0,
          reviewsCount: 0,
        }),
        ...data,
        startingPrice: priceNum,
        shopName: resolvedShopName,
        businessName: resolvedShopName,
      };

      updated.isProfileComplete = checkIsComplete(updated);

      // Save to backend API (POST /tailors or PATCH /tailors/:id)
      const res = await tailorsApi.saveTailorProfile(updated);

      // NEVER EVER treat a failed response or error as a success!
      if (!res || res.success === false) {
        const errorMsg =
          res?.error ||
          (res as any)?.message ||
          'Failed to save tailor profile on the server.';
        setError(errorMsg);
        return false;
      }

      if (res?.data && res.data.id) {
        updated.id = res.data.id;
        updated.userId = res.data.userId || user?.id;
        if (res.data.shopName) {
          updated.shopName = res.data.shopName;
          updated.businessName = res.data.shopName;
        }
        if (res.data.city) {
          updated.city = res.data.city;
        }
        if (res.data.address) {
          updated.address = res.data.address;
        }
        if (typeof res.data.latitude === 'number' && !isNaN(res.data.latitude)) {
          updated.latitude = res.data.latitude;
        }
        if (typeof res.data.longitude === 'number' && !isNaN(res.data.longitude)) {
          updated.longitude = res.data.longitude;
        }
        if (res.data.location && typeof res.data.location === 'object') {
          updated.location = res.data.location;
        } else if (updated.latitude !== undefined && updated.longitude !== undefined) {
          updated.location = {
            city: updated.city || '',
            address: updated.address || '',
            latitude: updated.latitude,
            longitude: updated.longitude,
          };
        }
        const serverOrg = res.data.organizationName ?? res.data.organization ?? res.data.organization_name;
        if (serverOrg !== undefined) {
          updated.organizationName = serverOrg || undefined;
          updated.organization = serverOrg || undefined;
          updated.organization_name = serverOrg || undefined;
        }
        const serverPrice =
          typeof res.data.startingPrice === 'number' && res.data.startingPrice > 0
            ? res.data.startingPrice
            : typeof (res.data as any).starting_price === 'number' && (res.data as any).starting_price > 0
            ? (res.data as any).starting_price
            : Array.isArray(res.data.services) && res.data.services.length > 0 && typeof res.data.services[0].price === 'number' && res.data.services[0].price > 0
            ? res.data.services[0].price
            : priceNum;
        if (serverPrice > 0) {
          updated.startingPrice = serverPrice;
        }
      }

      setProfile(updated);
      if (user?.id) {
        await storage.setTailorProfile(user.id, updated).catch(() => {});
      }
      return true;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to save tailor profile';
      setError(errMsg);
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
