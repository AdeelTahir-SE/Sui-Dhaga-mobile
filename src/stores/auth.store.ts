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

function extractAuthData(
  response: any,
  fallbackPayload?: { email?: string; name?: string; fullName?: string; role?: string; phone?: string }
): { token: string; user: User } | null {
  if (!response) return null;

  // The payload might be in response.data, response itself, or response.data.data
  const root = response;
  const d = response.data !== undefined ? response.data : response;

  // Search for token across all possible backend conventions
  const token =
    d?.accessToken ||
    d?.token ||
    d?.access_token ||
    d?.jwt ||
    d?.session?.access_token ||
    d?.session?.token ||
    d?.data?.accessToken ||
    d?.data?.token ||
    d?.data?.access_token ||
    root?.accessToken ||
    root?.token ||
    root?.access_token ||
    root?.jwt;

  if (!token || typeof token !== 'string') {
    return null;
  }

  // Search for user object across possible backend conventions
  let rawUser =
    d?.user ||
    d?.session?.user ||
    d?.data?.user ||
    d?.profile ||
    root?.user ||
    null;

  // If user object is not separately nested, check if d has user properties
  if (!rawUser && (d?.id || d?._id || d?.email || fallbackPayload?.email)) {
    rawUser = d;
  }

  const email = rawUser?.email || fallbackPayload?.email || '';
  const id = String(rawUser?.id || rawUser?._id || rawUser?.userId || email || 'user_' + Date.now());
  const fullName =
    rawUser?.fullName ||
    rawUser?.name ||
    fallbackPayload?.fullName ||
    fallbackPayload?.name ||
    (email ? email.split('@')[0] : 'User');
  const name = rawUser?.name || fullName;
  const role = (rawUser?.role || fallbackPayload?.role || 'customer') as any;
  const phone = rawUser?.phone || fallbackPayload?.phone;
  const avatar = rawUser?.avatar || rawUser?.avatarUrl;

  const user: User = {
    id,
    email,
    fullName,
    name,
    role,
    phone,
    avatar,
    avatarUrl: avatar,
    bio: rawUser?.bio,
    createdAt: rawUser?.createdAt,
    updatedAt: rawUser?.updatedAt,
  };

  return { token, user };
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
        const extracted = extractAuthData(res) || (res.data ? { token, user: res.data } : null);
        if (extracted?.user) {
          await storage.setUser(extracted.user);
          set({ user: extracted.user, isAuthenticated: true });
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
      const authData = extractAuthData(res, { email: payload.email });

      if (authData) {
        await storage.setToken(authData.token);
        await storage.setUser(authData.user);
        set({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        const errorMsg =
          (res.success === false && (res.error || res.message)) ||
          res.error ||
          res.message ||
          'Login failed: Invalid server response';
        throw new Error(errorMsg);
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
      let authData = extractAuthData(res, {
        email: payload.email,
        name: payload.name,
        fullName: payload.name,
        role: payload.role,
        phone: payload.phone,
      });

      // If backend registered user successfully (HTTP 201) but did not return a session token in registration response, auto-login
      if (!authData) {
        try {
          const loginRes = await authApi.login({
            email: payload.email,
            password: payload.password,
          });
          authData = extractAuthData(loginRes, {
            email: payload.email,
            name: payload.name,
            fullName: payload.name,
            role: payload.role,
            phone: payload.phone,
          });
        } catch {
          // If auto-login fails, registration itself was still successful
        }
      }

      if (authData) {
        await storage.setToken(authData.token);
        await storage.setUser(authData.user);
        set({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        // If registration succeeded without errors, create state
        if (res.success !== false) {
          const fallbackUser: User = {
            id: 'user_' + Date.now(),
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            fullName: payload.name || payload.email.split('@')[0],
            role: (payload.role || 'customer') as any,
            phone: payload.phone,
          };
          await storage.setUser(fallbackUser);
          set({
            user: fallbackUser,
            token: null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }

        const errorMsg =
          (res.success === false && (res.error || res.message)) ||
          res.error ||
          res.message ||
          'Registration failed';
        throw new Error(errorMsg);
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
