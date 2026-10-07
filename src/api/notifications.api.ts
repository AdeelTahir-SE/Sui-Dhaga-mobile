import { apiClient } from './client';
import { NotificationItem } from '../types/api';

export const notificationsApi = {
  async getNotifications(page = 1, limit = 50) {
    return apiClient<NotificationItem[]>(`/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  async getUnreadCount() {
    return apiClient<{ unreadCount: number }>('/notifications/unread-count', {
      method: 'GET',
    });
  },

  async registerPushToken(pushToken: string) {
    return apiClient('/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
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

  async deleteNotification(id: string) {
    return apiClient(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },
};

