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
};
