import { apiClient } from './client';
import { AppointmentItem } from '../types/api';

export interface CreateAppointmentPayload {
  tailorId: string;
  tailor_id?: string;
  serviceId?: string;
  service_id?: string;
  date?: string;
  time?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  serviceType?: string;
  service_type?: string;
  location?: string;
  price?: number;
  tailorName?: string;
  customerName?: string;
  duration?: string;
}

export const appointmentsApi = {
  /**
   * GET /appointments
   * Get appointments for the authenticated user (customer or tailor)
   * Query params: page, limit, status
   */
  async getAppointments(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient<AppointmentItem[]>('/appointments', {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        ...(params?.status ? { status: params.status } : {}),
      },
    });
  },

  /**
   * Alias for getAppointments
   */
  async getMyAppointments(params?: { page?: number; limit?: number; status?: string }) {
    return this.getAppointments(params);
  },

  /**
   * GET /appointments/{appointmentId}
   * Get appointment details by ID
   */
  async getAppointmentById(id: string) {
    return apiClient<AppointmentItem>(`/appointments/${id}`, {
      method: 'GET',
    });
  },

  /**
   * POST /appointments
   * Book a new tailor appointment
   * Matches database schema columns: appointment_date, appointment_time, tailor_id, service_id
   */
  async createAppointment(payload: CreateAppointmentPayload) {
    const todayStr = new Date().toISOString().split('T')[0];
    const date = payload.date || payload.appointment_date || payload.appointmentDate || todayStr;
    const time = payload.time || payload.appointment_time || payload.appointmentTime || '10:00';
    const tailorId = payload.tailorId || payload.tailor_id || '';
    const serviceId = payload.serviceId || payload.service_id;

    const requestBody: Record<string, any> = {
      // Swagger / API Validator required fields
      date: date,
      time: time,
      tailorId: tailorId,

      // Database schema cache compatibility
      appointment_date: date,
      appointment_time: time,
      appointmentDate: date,
      appointmentTime: time,
      tailor_id: tailorId,
    };

    if (serviceId) {
      requestBody.serviceId = serviceId;
      requestBody.service_id = serviceId;
    }
    if (payload.notes) {
      requestBody.notes = payload.notes;
    }
    if (payload.serviceType) {
      requestBody.serviceType = payload.serviceType;
      requestBody.service_type = payload.serviceType;
    }
    if (payload.location) {
      requestBody.location = payload.location;
    }
    if (payload.price !== undefined) {
      requestBody.price = payload.price;
    }

    return apiClient<AppointmentItem>('/appointments', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  /**
   * DELETE /appointments/{appointmentId}
   * Cancel or delete an appointment
   */
  async deleteAppointment(id: string) {
    return apiClient<any>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Cancel appointment (calls DELETE /appointments/{appointmentId} or PATCH status)
   */
  async cancelAppointment(id: string, reason?: string) {
    try {
      return await apiClient<any>(`/appointments/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback: update status to cancelled
      return apiClient<AppointmentItem>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled', notes: reason }),
      });
    }
  },

  /**
   * PATCH /appointments/{appointmentId}/status
   * Update appointment status (pending, confirmed, completed, cancelled)
   */
  async updateAppointmentStatus(id: string, status: string) {
    return apiClient<AppointmentItem>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: status.toLowerCase() }),
    });
  },

  /**
   * PATCH /appointments/{appointmentId}/reschedule
   * Reschedule appointment to a new date and time
   */
  async rescheduleAppointment(
    id: string,
    payload: {
      date?: string;
      time?: string;
      appointmentDate?: string;
      appointmentTime?: string;
      appointment_date?: string;
      appointment_time?: string;
      notes?: string;
    }
  ) {
    const todayStr = new Date().toISOString().split('T')[0];
    const date = payload.date || payload.appointment_date || payload.appointmentDate || todayStr;
    const time = payload.time || payload.appointment_time || payload.appointmentTime || '10:00';

    return apiClient<AppointmentItem>(`/appointments/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify({
        date: date,
        time: time,
        appointment_date: date,
        appointment_time: time,
        appointmentDate: date,
        appointmentTime: time,
      }),
    });
  },
};


