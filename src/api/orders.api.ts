import { apiClient } from './client';
import { OrderItem } from '../types/api';

export interface CreateOrderPayload {
  tailorId: string;
  itemName: string;
  price: number;
  notes?: string;
  measurementsId?: string;
  designId?: string;
  deliveryDate?: string;
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
};
