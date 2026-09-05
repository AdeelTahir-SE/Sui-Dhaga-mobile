import { apiClient } from './client';
import { DesignItem } from '../types/api';

export interface CreateDesignPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  garmentType?: string;
  fabric?: string;
  color?: string;
  tags?: string[];
  prompt?: string;
}

export const designsApi = {
  async getDesigns() {
    return apiClient<DesignItem[]>('/designs', {
      method: 'GET',
    });
  },

  async getMyDesigns() {
    return apiClient<DesignItem[]>('/designs/my', {
      method: 'GET',
    });
  },

  async getTemplates() {
    return apiClient<DesignItem[]>('/designs/templates', {
      method: 'GET',
    });
  },

  async getDesignById(id: string) {
    return apiClient<DesignItem>(`/designs/${id}`, {
      method: 'GET',
    });
  },

  async createDesign(payload: CreateDesignPayload) {
    return apiClient<DesignItem>('/designs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generateAiDesign(prompt: string, options?: { style?: string; garmentType?: string }) {
    return apiClient<{ imageUrl: string; description: string }>('/designs/generate-ai', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    });
  },
};
