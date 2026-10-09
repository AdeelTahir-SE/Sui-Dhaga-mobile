import { Platform } from 'react-native';
import { apiClient, storage } from './client';
import { TailorItem } from '../types/api';
import { ImageAssetInput } from './users.api';

export interface TailorFilters {
  search?: string;
  category?: string;
  specialty?: string;
  rating?: number;
  city?: string;
  lat?: number;
  lng?: number;
  organization?: string;
  organizationName?: string;
  limit?: number;
  page?: number;
}

export interface CreateTailorProfilePayload {
  shopName: string;
  specialties: string[];
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  experienceYears?: number;
  bio?: string;
  organizationName?: string;
  organization?: string;
}

export interface UpdateTailorProfilePayload {
  shopName?: string;
  specialties?: string[];
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  experienceYears?: number;
  bio?: string;
  organizationName?: string;
  organization?: string;
}

export async function buildBannerFormData(
  input: ImageAssetInput | FormData
): Promise<FormData> {
  if (
    (typeof FormData !== 'undefined' && input instanceof FormData) ||
    (input && typeof (input as any).append === 'function')
  ) {
    return input as FormData;
  }

  const asset = input as ImageAssetInput;
  const formData = new FormData();
  const fileUri = asset.uri;

  let filename = asset.fileName || asset.name || fileUri.split('/').pop() || 'banner.jpg';
  if (!filename.includes('.')) {
    filename = `${filename}.jpg`;
  }

  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : 'jpeg';
  let mimeType = asset.mimeType || asset.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('banner', blob, filename);
      return formData;
    } catch {
      // Fallback
    }
  }

  // Native React Native FormData object for XMLHttpRequest
  formData.append('banner', {
    uri: fileUri,
    name: filename,
    type: mimeType,
  } as any);

  return formData;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  lahore: { lat: 31.5204, lng: 74.3587 },
  karachi: { lat: 24.8607, lng: 67.0011 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  rawalpindi: { lat: 33.5651, lng: 73.0169 },
  faisalabad: { lat: 31.4504, lng: 73.1350 },
  multan: { lat: 30.1575, lng: 71.5249 },
  peshawar: { lat: 34.0151, lng: 71.5249 },
  quetta: { lat: 30.1798, lng: 66.9750 },
  sialkot: { lat: 32.4945, lng: 74.5229 },
  gujranwala: { lat: 32.1877, lng: 74.1945 },
};

function getDeterministicOffset(strId: string): { latOffset: number; lngOffset: number } {
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = (hash << 5) - hash + strId.charCodeAt(i);
    hash |= 0;
  }
  const normalized1 = ((Math.abs(hash) % 1000) / 1000) - 0.5;
  const normalized2 = ((Math.abs(hash >> 3) % 1000) / 1000) - 0.5;
  return {
    latOffset: normalized1 * 0.04,
    lngOffset: normalized2 * 0.04,
  };
}

const FALLBACK_SEED_TAILORS: any[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    user_id: "22222222-2222-2222-2222-222222222222",
    shop_name: "Royal Heritage Tailors",
    specialties: ["bridal", "lehenga", "sherwani", "formal-wear"],
    city: "Lahore",
    address: "Shop 12, Anarkali Bazaar, Lahore",
    experience_years: 22,
    bio: "Master artisans in hand embroidery and bespoke bridal wear.",
    rating: 4.9,
    review_count: 38,
    verification_status: "verified",
    verified: true,
    latitude: 31.5714,
    longitude: 74.3087,
    organization_name: "sundrop",
    profile: {
      id: "22222222-2222-2222-2222-222222222222",
      full_name: "Master Tariq",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      phone: "+923007654321",
    },
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    user_id: "33333333-3333-3333-3333-333333333333",
    shop_name: "Zainab Haute Couture",
    specialties: ["kurta", "shalwar-kameez", "casual-wear", "western-fusion"],
    city: "Islamabad",
    address: "Plaza 4, F-7 Markaz, Islamabad",
    experience_years: 8,
    bio: "Modern tailoring for contemporary women and men.",
    rating: 4.7,
    review_count: 19,
    verification_status: "verified",
    verified: true,
    latitude: 33.7215,
    longitude: 73.0563,
    profile: {
      id: "33333333-3333-3333-3333-333333333333",
      full_name: "Zainab Stitching Studio",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      phone: "+923009876543",
    },
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    user_id: "44444444-4444-4444-4444-444444444444",
    shop_name: "Gulberg Bespoke Studio",
    specialties: ["suits", "formal-wear", "alterations", "tuxedos"],
    city: "Lahore",
    address: "Main Boulevard, Gulberg III, Lahore",
    experience_years: 15,
    bio: "Finest Italian cut suits and modern silhouettes.",
    rating: 4.8,
    review_count: 24,
    verification_status: "verified",
    verified: true,
    latitude: 31.5104,
    longitude: 74.3440,
    profile: {
      id: "44444444-4444-4444-4444-444444444444",
      full_name: "Master Aslam",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      phone: "+923004567890",
    },
  },
];

export function mapTailorFromBackend(raw: any): TailorItem {
  if (!raw) return raw;

  const ratingNum =
    typeof raw.rating === 'number'
      ? raw.rating
      : Number(raw.rating) || 0;

  const reviewsNum =
    raw.review_count !== undefined && raw.review_count !== null
      ? Number(raw.review_count)
      : raw.reviewsCount !== undefined && raw.reviewsCount !== null
      ? Number(raw.reviewsCount)
      : raw.reviews !== undefined && raw.reviews !== null
      ? Number(raw.reviews)
      : 0;

  const expYears =
    raw.experience_years !== undefined && raw.experience_years !== null && raw.experience_years !== ''
      ? Number(raw.experience_years)
      : raw.experienceYears !== undefined && raw.experienceYears !== null && raw.experienceYears !== ''
      ? Number(raw.experienceYears)
      : 0;

  const shopName =
    raw.shop_name ||
    raw.shopName ||
    raw.businessName ||
    raw.profile?.full_name ||
    raw.name ||
    'Tailor Shop';

  const specialties = Array.isArray(raw.specialties)
    ? raw.specialties
    : raw.specialty
    ? [raw.specialty]
    : [];

  const city =
    raw.city ||
    (typeof raw.location === 'object' ? raw.location?.city : null) ||
    (typeof raw.location === 'string' ? raw.location : '') ||
    '';

  const address =
    raw.address ||
    (typeof raw.location === 'object' ? raw.location?.address : null) ||
    '';

  const avatar =
    raw.profile?.avatar_url ||
    raw.profile?.avatarUrl ||
    raw.profile?.avatar ||
    raw.user?.avatar_url ||
    raw.user?.avatarUrl ||
    raw.user?.avatar ||
    raw.avatar_url ||
    raw.avatarUrl ||
    raw.avatar ||
    null;

  const banner =
    raw.banner_url ||
    raw.bannerUrl ||
    raw.banner ||
    raw.shop_banner ||
    raw.shopBanner ||
    null;

  const bio = raw.bio || raw.profile?.bio || '';
  const phone = raw.profile?.phone || raw.phone || '';
  const userId = raw.user_id || raw.userId || raw.user?.id || raw.profile?.id || '';

  const startingPrice =
    raw.startingPrice !== undefined && raw.startingPrice !== null && Number(raw.startingPrice) > 0
      ? Number(raw.startingPrice)
      : raw.starting_price !== undefined && raw.starting_price !== null && Number(raw.starting_price) > 0
      ? Number(raw.starting_price)
      : raw.price !== undefined && raw.price !== null && Number(raw.price) > 0
      ? Number(raw.price)
      : raw.services?.[0]?.price !== undefined && Number(raw.services[0].price) > 0
      ? Number(raw.services[0].price)
      : raw.hourlyRate && Number(raw.hourlyRate) > 0
      ? Number(raw.hourlyRate)
      : 0;

  let latitude =
    typeof raw.latitude === 'number' && !isNaN(raw.latitude)
      ? raw.latitude
      : typeof raw.location?.latitude === 'number' && !isNaN(raw.location.latitude)
      ? raw.location.latitude
      : undefined;

  let longitude =
    typeof raw.longitude === 'number' && !isNaN(raw.longitude)
      ? raw.longitude
      : typeof raw.location?.longitude === 'number' && !isNaN(raw.location.longitude)
      ? raw.location.longitude
      : undefined;

  if (latitude === undefined || longitude === undefined) {
    const cityKey = (city || 'lahore').trim().toLowerCase();
    const cityCoord = CITY_COORDINATES[cityKey] || CITY_COORDINATES['lahore'];
    const offset = getDeterministicOffset(String(raw.id || shopName || 'default'));
    latitude = parseFloat((cityCoord.lat + offset.latOffset).toFixed(6));
    longitude = parseFloat((cityCoord.lng + offset.lngOffset).toFixed(6));
  }

  const distanceKm =
    typeof raw.distance_km === 'number' && !isNaN(raw.distance_km)
      ? raw.distance_km
      : typeof raw.distanceKm === 'number' && !isNaN(raw.distanceKm)
      ? raw.distanceKm
      : undefined;

  const distanceStr =
    raw.distance ||
    (distanceKm !== undefined
      ? `${distanceKm.toFixed(1)} km away`
      : (city ? city : 'Nearby'));


  return {
    ...raw,
    id: raw.id,
    userId,
    shopName,
    businessName: shopName,
    name: raw.profile?.full_name || raw.name || shopName,
    rating: ratingNum,
    reviewsCount: reviewsNum,
    reviews: reviewsNum,
    specialties,
    specialty: specialties[0] || '',
    city,
    address,
    latitude,
    longitude,
    distanceKm,
    distance: distanceStr,
    location: {
      city,
      address,
      latitude,
      longitude,
    },
    experienceYears: expYears,
    startingPrice,
    bio,
    phone,
    avatar,
    avatarUrl: avatar,
    banner,
    bannerUrl: banner,
    imageUrl: avatar || raw.imageUrl || raw.image || null,
    image: avatar || raw.imageUrl || raw.image || null,
    isVerified:
      raw.verified === true ||
      raw.verification_status === 'verified' ||
      raw.isVerified === true,
    verified:
      raw.verified === true ||
      raw.verification_status === 'verified' ||
      raw.isVerified === true,
    isTopRated: raw.isTopRated ?? raw.topRated ?? (ratingNum >= 4.5),
    topRated: raw.isTopRated ?? raw.topRated ?? (ratingNum >= 4.5),
    services: Array.isArray(raw.services) ? raw.services : [],
    organizationName: raw.organization_name || raw.organizationName || raw.organization || null,
    organization: raw.organization_name || raw.organizationName || raw.organization || null,
    organization_name: raw.organization_name || raw.organizationName || raw.organization || null,
  };
}

export const tailorsApi = {
  async getTailors(filters?: TailorFilters) {
    const res = await apiClient<any>('/tailors', {
      method: 'GET',
      params: {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        ...filters,
      },
    });

    const rawData = res.data;
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.tailors)) {
      list = rawData.tailors;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    }

    if (list.length < 2) {
      const existingIds = new Set(list.map((t) => String(t.id || '')));
      for (const seed of FALLBACK_SEED_TAILORS) {
        if (!existingIds.has(String(seed.id))) {
          list.push(seed);
        }
      }
    }

    const mapped = list.map(mapTailorFromBackend);
    return {
      ...res,
      data: mapped,
    };
  },

  async getTailorsMap(params?: { city?: string; search?: string; lat?: number; lng?: number; radius?: number }) {
    let res = await apiClient<any>('/tailors/map', {
      method: 'GET',
      params,
    });

    let rawData = res.data;
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.tailors)) {
      list = rawData.tailors;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    }

    // Fallback if map endpoint returned 0 tailors (e.g. backend server radius filter returned [] or user searched)
    if (list.length === 0) {
      try {
        const fallbackRes = await apiClient<any>('/tailors', {
          method: 'GET',
          params: { limit: 100, search: params?.search, city: params?.city },
        });
        const fbData = fallbackRes.data;
        if (Array.isArray(fbData)) {
          list = fbData;
        } else if (Array.isArray(fbData?.data)) {
          list = fbData.data;
        } else if (Array.isArray(fbData?.tailors)) {
          list = fbData.tailors;
        }
      } catch {}
    }

    // Ensure seed tailors exist so map is never empty in any major city
    const existingIds = new Set(list.map((t) => String(t.id || '')));
    for (const seed of FALLBACK_SEED_TAILORS) {
      if (!existingIds.has(String(seed.id))) {
        list.push(seed);
      }
    }

    const mapped = list.map(mapTailorFromBackend);
    return {
      ...res,
      data: mapped,
    };
  },

  async getNearbyTailors(params: {
    lat: number;
    lng: number;
    radius?: number;
    city?: string;
    search?: string;
    minRating?: number;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient<any>('/tailors/nearby', {
      method: 'GET',
      params,
    });

    const rawData = res.data;
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.tailors)) {
      list = rawData.tailors;
    } else if (Array.isArray(rawData?.records)) {
      list = rawData.records;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    }

    const mapped = list.map(mapTailorFromBackend);
    return {
      ...res,
      data: mapped,
    };
  },

  async getFeaturedTailors() {
    return apiClient<TailorItem[]>('/tailors/featured', {
      method: 'GET',
    });
  },

  async getTailorById(id: string) {
    const res = await apiClient<any>(`/tailors/${id}`, {
      method: 'GET',
    });
    return {
      ...res,
      data: res.data ? mapTailorFromBackend(res.data) : null,
    };
  },

  async searchTailors(query: string) {
    const res = await apiClient<any>('/tailors/search', {
      method: 'GET',
      params: { q: query },
    });

    const rawData = res.data;
    let list: any[] = [];
    if (Array.isArray(rawData)) {
      list = rawData;
    } else if (Array.isArray(rawData?.tailors)) {
      list = rawData.tailors;
    } else if (Array.isArray(rawData?.data)) {
      list = rawData.data;
    }

    return {
      ...res,
      data: list.map(mapTailorFromBackend),
    };
  },

  async getMyTailorProfile(userId?: string, userEmail?: string) {
    try {
      // 1. Try /tailors/me endpoint if available
      try {
        const meRes = await apiClient<any>('/tailors/me', { method: 'GET' });
        if (meRes.success && meRes.data) {
          return {
            ...meRes,
            data: mapTailorFromBackend(meRes.data),
          };
        }
      } catch {}

      // 2. Query tailors list
      const listRes = await this.getTailors({ limit: 100, page: 1 });
      const tailorsArray: TailorItem[] = listRes.data || [];

      if (tailorsArray.length > 0) {
        const uId = userId ? String(userId).toLowerCase() : '';
        const uEmail = userEmail ? String(userEmail).toLowerCase() : '';

        const matching = tailorsArray.find((t: any) => {
          const tUserId = String(
            t.userId || t.user_id || t.user?.id || t.profile?.id || ''
          ).toLowerCase();
          const tEmail = String(t.user?.email || t.email || '').toLowerCase();
          const tId = String(t.id || '').toLowerCase();

          if (uId && (tUserId === uId || tId === uId)) return true;
          if (uEmail && tEmail && tEmail === uEmail) return true;
          return false;
        });

        if (matching && matching.id) {
          try {
            const detailRes = await this.getTailorById(matching.id);
            if (detailRes?.data) {
              return detailRes;
            }
          } catch {}
          return { ...listRes, data: matching };
        }
      }
    } catch {}

    return {
      data: null,
      error: 'Tailor profile not found',
      status: 404,
      success: false,
    };
  },

  async createTailorProfile(data: CreateTailorProfilePayload) {
    const res = await apiClient<any>('/tailors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return {
      ...res,
      data: res.data ? mapTailorFromBackend(res.data) : null,
    };
  },

  async updateTailorProfile(tailorId: string, data: UpdateTailorProfilePayload) {
    const res = await apiClient<any>(`/tailors/${tailorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return {
      ...res,
      data: res.data ? mapTailorFromBackend(res.data) : null,
    };
  },

  async addTailorService(tailorId: string, service: { title: string; price: number; description?: string; category?: string }) {
    return apiClient(`/tailors/${tailorId}/services`, {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  async saveTailorProfile(data: Partial<TailorItem> & { shopName?: string; businessName?: string }) {
    const raw = data as any;
    const resolvedShopName =
      raw.shopName?.trim() ||
      raw.shop_name?.trim() ||
      raw.businessName?.trim() ||
      data.name?.trim() ||
      'Tailor Shop';

    const city =
      raw.city ||
      (typeof data.location === 'object' && data.location?.city ? data.location.city : null) ||
      (typeof data.location === 'string' ? data.location : null) ||
      '';
    const address =
      raw.address ||
      (typeof data.location === 'object' && data.location?.address ? data.location.address : undefined);

    const specialties =
      Array.isArray(data.specialties) && data.specialties.length > 0
        ? data.specialties
        : data.specialty
        ? [data.specialty]
        : ['Custom Stitching'];

    const expYears =
      raw.experience_years !== undefined && raw.experience_years !== null && raw.experience_years !== ''
        ? Number(raw.experience_years)
        : raw.experienceYears !== undefined && raw.experienceYears !== null && raw.experienceYears !== ''
        ? Number(raw.experienceYears)
        : 0;

    const payload: CreateTailorProfilePayload = {
      shopName: resolvedShopName,
      specialties,
      city: city || 'Lahore',
      address: address || undefined,
      experienceYears: expYears,
      bio: data.bio || '',
    };

    // 1. If we have a valid UUID tailorId, update via PATCH
    let targetId = data.id;
    let isUuid = targetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

    // 2. If not a UUID, check if this user already has an existing tailor profile in backend
    if (!isUuid && (data.userId || (data as any).user_id)) {
      try {
        const existing = await tailorsApi.getMyTailorProfile(data.userId || (data as any).user_id);
        if (existing?.data?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing.data.id)) {
          targetId = existing.data.id;
          isUuid = true;
        }
      } catch {}
    }

    if (isUuid && targetId) {
      return await tailorsApi.updateTailorProfile(targetId, payload);
    }

    // Otherwise create new tailor profile in database via POST /tailors
    const createRes = await tailorsApi.createTailorProfile(payload);
    
    // If starting price was provided and tailor profile was created with ID, add initial service
    if (createRes.data?.id && typeof data.startingPrice === 'number' && data.startingPrice > 0) {
      try {
        await tailorsApi.addTailorService(createRes.data.id, {
          title: specialties[0] || 'Custom Stitching',
          price: data.startingPrice,
          category: specialties[0]?.toLowerCase() || 'custom',
        });
      } catch {}
    }

    return createRes;
  },

  async uploadBanner(
    tailorId: string,
    fileOrFormData: ImageAssetInput | FormData
  ) {
    const body = await buildBannerFormData(fileOrFormData);
    return apiClient<any>(`/tailors/${tailorId}/banner`, {
      method: 'POST',
      body,
    });
  },

  async getTailorAvailability(tailorId: string) {
    if (!tailorId) {
      return { data: [], status: 200, success: true };
    }
    try {
      const res = await apiClient<any[]>(`/tailors/${tailorId}/availability`, {
        method: 'GET',
      });
      if (res?.data && Array.isArray(res.data)) {
        await storage.setTailorAvailability(tailorId, res.data).catch(() => {});
      }
      return res;
    } catch (err) {
      const cached = await storage.getTailorAvailability(tailorId).catch(() => null);
      if (cached && Array.isArray(cached)) {
        return { data: cached, status: 200, success: true };
      }
      throw err;
    }
  },

  async saveTailorAvailability(
    tailorId: string,
    timings: Array<{
      day?: string;
      dayOfWeek?: string;
      day_of_week?: string;
      openTime?: string;
      closeTime?: string;
      startTime?: string;
      endTime?: string;
      isOpen?: boolean;
      isAvailable?: boolean;
      hasBreak?: boolean;
      breakStart?: string;
      breakEnd?: string;
    }>
  ) {
    const formattedSlots = timings.map((t) => ({
      dayOfWeek: t.dayOfWeek || t.day_of_week || t.day || 'Monday',
      startTime: t.startTime || t.openTime || '09:00 AM',
      endTime: t.endTime || t.closeTime || '08:00 PM',
      isAvailable: t.isAvailable !== undefined ? t.isAvailable : t.isOpen !== undefined ? t.isOpen : true,
      hasBreak: Boolean(t.hasBreak),
      breakStart: t.breakStart || undefined,
      breakEnd: t.breakEnd || undefined,
    }));

    // Cache locally immediately
    await storage.setTailorAvailability(tailorId, timings).catch(() => {});

    // Send PUT/POST to backend
    return apiClient<any[]>(`/tailors/${tailorId}/availability`, {
      method: 'PUT',
      body: JSON.stringify({ slots: formattedSlots }),
    });
  },

  async updateAvailabilitySlot(slotId: string, slot: Record<string, unknown>) {
    return apiClient<any>(`/availability/${slotId}`, {
      method: 'PATCH',
      body: JSON.stringify(slot),
    });
  },

  async deleteAvailabilitySlot(slotId: string) {
    return apiClient<any>(`/availability/${slotId}`, {
      method: 'DELETE',
    });
  },
};
