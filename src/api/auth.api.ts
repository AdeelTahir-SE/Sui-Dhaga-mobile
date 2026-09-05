import { apiClient } from './client';
import { AuthSession, User } from '../types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  name?: string;
  role?: string;
  phone?: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    return apiClient<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async register(payload: RegisterPayload) {
    return apiClient<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
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
