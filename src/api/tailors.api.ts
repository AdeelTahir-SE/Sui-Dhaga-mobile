import { apiClient } from './client';
import { TailorItem } from '../types/api';

export interface TailorFilters {
  search?: string;
  category?: string;
  specialty?: string;
  rating?: number;
  city?: string;
  lat?: number;
  lng?: number;
  limit?: number;
  page?: number;
}

export interface CreateTailorProfilePayload {
  shopName: string;
  specialties: string[];
  city: string;
  address?: string;
  experienceYears?: number;
  bio?: string;
}

export interface UpdateTailorProfilePayload {
  shopName?: string;
  specialties?: string[];
  city?: string;
  address?: string;
  experienceYears?: number;
  bio?: string;
}

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
    raw.avatar_url ||
    raw.imageUrl ||
    raw.image ||
    raw.avatar ||
    null;

  const bio = raw.bio || raw.profile?.bio || '';
  const phone = raw.profile?.phone || raw.phone || '';
  const userId = raw.user_id || raw.userId || raw.user?.id || raw.profile?.id || '';

  const startingPrice =
    raw.startingPrice !== undefined && raw.startingPrice !== null && Number(raw.startingPrice) > 0
      ? Number(raw.startingPrice)
      : raw.services?.[0]?.price !== undefined && Number(raw.services[0].price) > 0
      ? Number(raw.services[0].price)
      : raw.hourlyRate || 0;

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
    location: {
      city,
      address,
    },
    experienceYears: expYears,
    startingPrice,
    bio,
    phone,
    imageUrl: avatar,
    image: avatar,
    avatar,
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

  async saveTailorProfile(data: Partial<TailorItem> & { shopName?: string }) {
    const raw = data as any;
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
      shopName: raw.shopName || raw.shop_name || raw.businessName || data.name || 'Tailor Shop',
      specialties,
      city: city || 'Lahore',
      address: address || undefined,
      experienceYears: expYears,
      bio: data.bio || '',
    };

    // If we have an existing valid UUID tailorId, update via PATCH
    const isUuid = data.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    if (isUuid) {
      try {
        const patchRes = await tailorsApi.updateTailorProfile(data.id!, payload);
        if (patchRes.success && patchRes.data) {
          return patchRes;
        }
      } catch {}
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
};
