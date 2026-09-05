import { apiClient } from './client';
import { MeasurementItem } from '../types/api';

export type CreateMeasurementPayload = Omit<MeasurementItem, 'id' | 'createdAt' | 'updatedAt'>;

export const measurementsApi = {
  async getMeasurements() {
    return apiClient<MeasurementItem[]>('/measurements', {
      method: 'GET',
    });
  },

  async getMyMeasurements() {
    return apiClient<MeasurementItem[]>('/measurements/my', {
      method: 'GET',
    });
  },

  async getMeasurementById(id: string) {
    return apiClient<MeasurementItem>(`/measurements/${id}`, {
      method: 'GET',
    });
  },

  async createMeasurement(payload: CreateMeasurementPayload) {
    return apiClient<MeasurementItem>('/measurements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateMeasurement(id: string, payload: Partial<CreateMeasurementPayload>) {
    return apiClient<MeasurementItem>(`/measurements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteMeasurement(id: string) {
    return apiClient(`/measurements/${id}`, {
      method: 'DELETE',
    });
  },
};
