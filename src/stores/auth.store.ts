import { create } from 'zustand';
import { User } from '../types/api';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';
import { storage } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getToken();
      const savedUser = await storage.getUser();

      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({ token, user: savedUser, isAuthenticated: !!savedUser });

      // Refresh user profile from backend
      try {
        const res = await authApi.getMe();
        if (res.data) {
          await storage.setUser(res.data);
          set({ user: res.data, isAuthenticated: true });
        }
      } catch {
        // If network error, keep using saved user from storage
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(payload);
      const data = res.data;
      if (data?.accessToken && data?.user) {
        await storage.setToken(data.accessToken);
        await storage.setUser(data.user);
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        throw new Error(res.message || 'Login failed: Invalid server response');
      }
    } catch (err: any) {
      const message = err?.message || 'Login failed. Please verify your credentials.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(payload);
      const data = res.data;
      if (data?.accessToken && data?.user) {
        await storage.setToken(data.accessToken);
        await storage.setUser(data.user);
        set({
          user: data.user,
          token: data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      const message = err?.message || 'Registration failed. Please check your details.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout().catch(() => {});
    } finally {
      await storage.removeToken();
      await storage.removeUser();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
