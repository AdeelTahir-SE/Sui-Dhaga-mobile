import { apiClient } from './client';
import { AuthSession, User } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  role?: 'customer' | 'tailor';
  phone?: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    return apiClient<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
      }),
      skipAuth: true,
    });
  },

  async register(payload: RegisterPayload) {
    const body: Record<string, any> = {
      email: payload.email.trim(),
      password: payload.password,
    };

    if (payload.role) {
      body.role = payload.role === 'tailor' ? 'tailor' : 'customer';
    }

    if (payload.name && payload.name.trim()) {
      body.name = payload.name.trim();
    }

    if (payload.phone && payload.phone.trim()) {
      body.phone = payload.phone.trim();
    }

    return apiClient<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
  },

  async forgotPassword(email: string) {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    });
  },

  async resetPassword(password: string, token?: string) {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password, token }),
    });
  },

  async logout() {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return apiClient<User>('/users/me', {
      method: 'GET',
    });
  },
};
