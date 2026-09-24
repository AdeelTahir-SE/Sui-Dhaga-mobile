import { Platform } from 'react-native';
import { apiClient } from './client';
import { OrderItem } from '../types/api';

export interface CreateOrderPayload {
  tailorId: string;
  itemName?: string;
  item_name?: string;
  price?: number;
  totalAmount?: number;
  total_amount?: number;
  amount?: number;
  notes?: string;
  additionalNotes?: string;
  additional_notes?: string;
  measurements?: Record<string, any>;
  measurementId?: string;
  measurementsId?: string;
  designId?: string;
  designImages?: string[];
  design_images?: string[];
  deliveryDate?: string;
  delivery_date?: string;
  serviceId?: string;
}

export const ordersApi = {
  async getOrders(params?: { status?: string }) {
    return apiClient<OrderItem[]>('/orders', {
      method: 'GET',
      params,
    });
  },

  async getMyOrders() {
    return apiClient<OrderItem[]>('/orders/my', {
      method: 'GET',
    });
  },

  async getOrderById(id: string) {
    return apiClient<OrderItem>(`/orders/${id}`, {
      method: 'GET',
    });
  },

  async getOrderParties(id: string) {
    return apiClient<{
      orderId: string;
      customer: {
        id?: string;
        fullName?: string;
        phone?: string;
        address?: string;
        city?: string;
        avatarUrl?: string;
      } | null;
      tailor: {
        id?: string;
        userId?: string;
        name?: string;
        shopName?: string;
        phone?: string;
        city?: string;
        address?: string;
        avatarUrl?: string;
        rating?: number;
        reviewCount?: number;
        specialties?: string[];
        verified?: boolean;
      } | null;
    }>(`/orders/${id}/parties`, {
      method: 'GET',
    });
  },

  async createOrder(payload: CreateOrderPayload) {
    return apiClient<OrderItem>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateOrderStatus(id: string, status: string) {
    return apiClient<OrderItem>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async uploadOrderDesignImage(uri: string, name?: string): Promise<string> {
    try {
      const formData = new FormData();
      const rawName = name || uri.split('/').pop() || `design-${Date.now()}.png`;
      const cleanName = rawName.includes('.') ? rawName : `${rawName}.png`;
      const ext = cleanName.split('.').pop()?.toLowerCase() || 'png';
      const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png';

      if (Platform.OS === 'web') {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('image', blob, cleanName);
        } catch {
          formData.append('image', { uri, name: cleanName, type: mimeType } as any);
        }
      } else {
        formData.append('image', { uri, name: cleanName, type: mimeType } as any);
      }
      formData.append('folder', 'order-designs');
      formData.append('bucket', 'order-designs');

      const res = await apiClient<{ url?: string; fileUrl?: string }>('/uploads/image', {
        method: 'POST',
        body: formData,
      });
      return (res.data as any)?.url || (res.data as any)?.fileUrl || uri;
    } catch {
      return uri;
    }
  },
};

