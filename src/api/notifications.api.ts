import { apiClient } from './client';
import { NotificationItem } from '../types/api';

export const notificationsApi = {
  async getNotifications() {
    return apiClient<NotificationItem[]>('/notifications', {
      method: 'GET',
    });
  },

  async markAsRead(id: string) {
    return apiClient(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllAsRead() {
    return apiClient('/notifications/read-all', {
      method: 'POST',
    });
  },
};
