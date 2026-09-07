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

export const tailorsApi = {
  async getTailors(filters?: TailorFilters) {
    return apiClient<TailorItem[]>('/tailors', {
      method: 'GET',
      params: filters as Record<string, string | number | boolean | undefined>,
    });
  },

  async getFeaturedTailors() {
    return apiClient<TailorItem[]>('/tailors/featured', {
      method: 'GET',
    });
  },

  async getTailorById(id: string) {
    return apiClient<TailorItem>(`/tailors/${id}`, {
      method: 'GET',
    });
  },

  async searchTailors(query: string) {
    return apiClient<TailorItem[]>('/tailors/search', {
      method: 'GET',
      params: { q: query },
    });
  },

  async getMyTailorProfile() {
    return apiClient<TailorItem>('/tailors/me', {
      method: 'GET',
    });
  },

  async createTailorProfile(data: CreateTailorProfilePayload) {
    return apiClient<TailorItem>('/tailors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTailorProfile(tailorId: string, data: UpdateTailorProfilePayload) {
    return apiClient<TailorItem>(`/tailors/${tailorId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async addTailorService(tailorId: string, service: { title: string; price: number; description?: string; category?: string }) {
    return apiClient(`/tailors/${tailorId}/services`, {
      method: 'POST',
      body: JSON.stringify(service),
    });
  },

  async saveTailorProfile(data: Partial<TailorItem> & { shopName?: string }) {
    const payload: CreateTailorProfilePayload = {
      shopName: data.shopName || data.businessName || data.name || 'Tailor Shop',
      specialties: data.specialties && data.specialties.length > 0 ? data.specialties : (data.specialty ? [data.specialty] : ['Custom Stitching']),
      city: typeof data.location === 'object' && data.location?.city ? data.location.city : (typeof data.location === 'string' ? data.location : 'Lahore'),
      address: typeof data.location === 'object' && data.location?.address ? data.location.address : undefined,
      experienceYears: typeof data.experienceYears === 'number' ? data.experienceYears : 0,
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
          title: data.specialties?.[0] || 'Custom Stitching',
          price: data.startingPrice,
          category: data.specialties?.[0]?.toLowerCase() || 'custom',
        });
      } catch {}
    }

    return createRes;
  },
};
