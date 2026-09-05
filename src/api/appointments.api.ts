import { apiClient } from './client';
import { AppointmentItem } from '../types/api';

export interface CreateAppointmentPayload {
  tailorId: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  location?: string;
}

export const appointmentsApi = {
  async getAppointments(params?: { status?: string }) {
    return apiClient<AppointmentItem[]>('/appointments', {
      method: 'GET',
      params,
    });
  },

  async getMyAppointments() {
    return apiClient<AppointmentItem[]>('/appointments/my', {
      method: 'GET',
    });
  },

  async getAppointmentById(id: string) {
    return apiClient<AppointmentItem>(`/appointments/${id}`, {
      method: 'GET',
    });
  },

  async createAppointment(payload: CreateAppointmentPayload) {
    return apiClient<AppointmentItem>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async cancelAppointment(id: string, reason?: string) {
    return apiClient<AppointmentItem>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },
};
