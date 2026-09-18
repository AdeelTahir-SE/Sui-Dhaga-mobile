import { apiClient, storage } from './client';
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
      body: JSON.stringify({ email: email.trim() }),
      skipAuth: true,
    });
  },

  async resetPassword(password: string, token?: string, email?: string) {
    const hasStoredToken = !!(await storage.getToken());
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        password,
        token: token ? token.trim() : undefined,
        email: email ? email.trim() : undefined,
      }),
      skipAuth: !token && !hasStoredToken,
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

  async googleAuth(payload: {
    token?: string;
    accessToken?: string;
    idToken?: string;
    email?: string;
    name?: string;
    fullName?: string;
    avatar?: string;
    avatarUrl?: string;
    phone?: string;
  }) {
    return apiClient<AuthSession & { needsProfileCompletion?: boolean }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
  },

  async completeProfile(payload: {
    role: 'customer' | 'tailor';
    phone?: string;
    name?: string;
    fullName?: string;
    shopName?: string;
    city?: string;
    address?: string;
    specialties?: string[];
  }) {
    return apiClient<{ user: User; profile: any; message: string }>('/auth/complete-profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getGoogleAuthUrl(redirectUri?: string) {
    const params = redirectUri ? { redirectUri } : undefined;
    return apiClient<{ url: string | null }>('/auth/google-url', {
      method: 'GET',
      params,
      skipAuth: true,
    });
  },

  async uploadAvatar(fileOrFormData: any) {
    const { usersApi } = await import('./users.api');
    return usersApi.uploadAvatar(fileOrFormData);
  },
};

