import { create } from 'zustand';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { User } from '../types/api';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';
import { storage, onAuthExpired } from '../api/client';

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<{ success: boolean; needsProfileCompletion?: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; needsProfileCompletion?: boolean; error?: string }>;
  handleAuthCallback: (params: {
    accessToken?: string;
    code?: string;
    email?: string;
    name?: string;
  }) => Promise<{ success: boolean; needsProfileCompletion?: boolean; error?: string }>;
  completeProfile: (payload: {
    role: 'customer' | 'tailor';
    phone?: string;
    name?: string;
    fullName?: string;
    shopName?: string;
    city?: string;
    address?: string;
    specialties?: string[];
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}


function parseAuthUrl(url: string): { accessToken?: string; code?: string; error?: string } {
  let accessToken: string | undefined;
  let code: string | undefined;
  let error: string | undefined;

  try {
    if (url.includes('#')) {
      const hash = url.split('#')[1];
      const hashParams = new URLSearchParams(hash);
      accessToken = hashParams.get('access_token') || undefined;
      code = hashParams.get('code') || undefined;
      error = hashParams.get('error_description') || hashParams.get('error') || undefined;
    }

    const parsed = Linking.parse(url);
    if (!accessToken && parsed.queryParams?.access_token) {
      accessToken = String(parsed.queryParams.access_token);
    }
    if (!accessToken && parsed.queryParams?.token) {
      accessToken = String(parsed.queryParams.token);
    }
    if (!code && parsed.queryParams?.code) {
      code = String(parsed.queryParams.code);
    }
    if (!error && (parsed.queryParams?.error_description || parsed.queryParams?.error)) {
      error = String(parsed.queryParams.error_description || parsed.queryParams.error);
    }

    // Direct regex fallback for custom schemes where URL parsing might omit fragments or queries
    if (!accessToken) {
      const tokenMatch = url.match(/[?#&]access_token=([^&#]+)/);
      if (tokenMatch) accessToken = decodeURIComponent(tokenMatch[1]);
    }
    if (!accessToken) {
      const tokenMatch = url.match(/[?#&]token=([^&#]+)/);
      if (tokenMatch) accessToken = decodeURIComponent(tokenMatch[1]);
    }
    if (!code) {
      const codeMatch = url.match(/[?#&]code=([^&#]+)/);
      if (codeMatch) code = decodeURIComponent(codeMatch[1]);
    }
    if (!error) {
      const errMatch = url.match(/[?#&](?:error_description|error)=([^&#]+)/);
      if (errMatch) error = decodeURIComponent(errMatch[1]);
    }
  } catch {}

  return { accessToken, code, error };
}


function extractAuthData(
  response: any,
  fallbackPayload?: { email?: string; name?: string; fullName?: string; role?: string; phone?: string }
): { token: string; refreshToken?: string; user: User } | null {
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

  // Search for refresh token
  const refreshToken =
    d?.refreshToken ||
    d?.refresh_token ||
    d?.session?.refresh_token ||
    d?.session?.refreshToken ||
    d?.data?.refreshToken ||
    d?.data?.refresh_token ||
    root?.refreshToken ||
    root?.refresh_token ||
    undefined;

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
  const emailPrefix = email ? email.split('@')[0] : 'User';
  const id = String(rawUser?.id || rawUser?._id || rawUser?.userId || email || 'user_' + Date.now());
  const fullName =
    rawUser?.fullName?.trim() ||
    rawUser?.name?.trim() ||
    rawUser?.user_metadata?.full_name?.trim() ||
    rawUser?.user_metadata?.name?.trim() ||
    fallbackPayload?.fullName?.trim() ||
    fallbackPayload?.name?.trim() ||
    emailPrefix;
  const name = rawUser?.name?.trim() || fullName || emailPrefix;

  const rawRole =
    rawUser?.user_metadata?.role ||
    rawUser?.app_metadata?.role ||
    (rawUser?.role && rawUser.role !== 'authenticated' ? rawUser.role : undefined) ||
    fallbackPayload?.role;

  const role: User['role'] =
    rawRole?.toLowerCase?.() === 'tailor'
      ? 'tailor'
      : rawRole?.toLowerCase?.() === 'designer'
      ? 'designer'
      : 'customer';

  const phone = rawUser?.phone || rawUser?.user_metadata?.phone || fallbackPayload?.phone;
  const avatar = rawUser?.avatar || rawUser?.avatarUrl || rawUser?.user_metadata?.avatar_url;

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

  return { token, refreshToken, user };
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

      if (!token && !savedUser) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Immediately restore authentication from local storage so the user remains logged in
      if (savedUser) {
        set({ token, user: savedUser, isAuthenticated: true });
      } else if (token) {
        set({ token, isAuthenticated: true });
      }

      // Try background refresh of profile if network is available
      try {
        const res = await authApi.getMe();
        const extracted = extractAuthData(res) || (res.data ? { token: token || '', user: res.data } : null);
        if (extracted?.user) {
          await storage.setUser(extracted.user);
          set({ user: extracted.user, isAuthenticated: true });
        }
      } catch {
        // If offline or network error, retain the saved user session
      }
    } catch {
      // Do not clear user on transient storage errors
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
        if (authData.refreshToken) {
          await storage.setRefreshToken(authData.refreshToken);
        }
        await storage.setUser(authData.user);
        set({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        const needsProfileCompletion =
          (res as any)?.data?.needsProfileCompletion ??
          (res as any)?.needsProfileCompletion ??
          (!authData.user.phone || !authData.user.role);

        return { success: true, needsProfileCompletion };
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
      return { success: false, error: message };
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
        if (authData.refreshToken) {
          await storage.setRefreshToken(authData.refreshToken);
        }
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

  handleAuthCallback: async (params: {
    accessToken?: string;
    code?: string;
    email?: string;
    name?: string;
  }) => {
    set({ isLoading: true, error: null });
    try {
      const payload: any = {};
      if (params.accessToken) payload.accessToken = params.accessToken;
      if (params.code) payload.code = params.code;
      if (params.email) payload.email = params.email;
      if (params.name) payload.name = params.name;

      if (!payload.accessToken && !payload.code && !payload.email) {
        throw new Error('Authentication callback was missing authorization credentials.');
      }

      const res = await authApi.googleAuth(payload);
      const authData = extractAuthData(res, {
        email: payload.email,
        name: payload.name,
        fullName: payload.fullName,
      });

      if (authData) {
        await storage.setToken(authData.token);
        if (authData.refreshToken) {
          await storage.setRefreshToken(authData.refreshToken);
        }
        await storage.setUser(authData.user);
        set({
          user: authData.user,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        const needsProfileCompletion = (res as any)?.data?.needsProfileCompletion ?? (res as any)?.needsProfileCompletion ?? true;
        return { success: true, needsProfileCompletion };
      } else {
        throw new Error(res.message || 'Google authentication response was invalid.');
      }
    } catch (err: any) {
      const message = err?.message || 'Google authentication failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    let subscription: { remove: () => void } | null = null;
    try {
      // 1. Determine app redirect URI based on platform and Expo environment
      const appRedirectUri = Linking.createURL('auth/callback');

      // 2. Wrap app redirect in the backend's callback bridge so Chrome 302 redirects are never blocked
      const backendBase = (
        process.env.EXPO_PUBLIC_BACKEND_URL ||
        process.env.EXPO_PUBLIC_API_URL ||
        'https://sui-dhaga-backend.vercel.app'
      ).replace(/\/+$/, '');
      const bridgeUrl = `${backendBase}/api/v1/auth/google/callback?appRedirect=${encodeURIComponent(appRedirectUri)}`;

      // 3. Request Google OAuth authorization URL from backend
      let authUrl: string | null = null;
      try {
        const urlRes = await authApi.getGoogleAuthUrl(bridgeUrl);
        if (urlRes?.data?.url) {
          authUrl = urlRes.data.url;
        }
      } catch {
        // Backend url endpoint not accessible or network issue
      }

      // 3b. Direct Supabase authorize fallback if backend URL endpoint was unavailable
      if (!authUrl) {
        const supabaseUrl = (
          process.env.EXPO_PUBLIC_SUPABASE_URL ||
          'https://nnuxpvskiypxsjsotvnz.supabase.co'
        ).trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
        authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(bridgeUrl)}`;
      }

      let finalRedirectUrl: string | null = null;

      // 4. Set up deep link listener to catch incoming token URL
      const urlPromise = new Promise<string>((resolve) => {
        subscription = Linking.addEventListener('url', (event) => {
          if (
            event.url &&
            (event.url.includes('auth/callback') ||
              event.url.includes('access_token') ||
              event.url.includes('code='))
          ) {
            try {
              WebBrowser.dismissAuthSession();
            } catch {}
            resolve(event.url);
          }
        });
      });

      // 5. Open browser auth session with custom tab / system browser
      const browserPromise = WebBrowser.openAuthSessionAsync(authUrl, appRedirectUri, {
        showInRecents: true,
      });

      // Wait for either the deep link to be caught or the browser session to complete
      const raceResult = await Promise.race([
        browserPromise,
        urlPromise.then((url) => ({ type: 'deep_link' as const, url })),
      ]);

      if (raceResult.type === 'deep_link' && raceResult.url) {
        finalRedirectUrl = raceResult.url;
      } else if (raceResult.type === 'success' && (raceResult as any).url) {
        finalRedirectUrl = (raceResult as any).url;
      } else if (raceResult.type === 'cancel' || raceResult.type === 'dismiss') {
        // On Android, switching to the app or tapping 'Open Sui Dhaga App' in the bridge
        // fires a dismiss/cancel on the Custom Tabs session. Wait up to 3 seconds for deep link event.
        const graceTimeout = new Promise<null>((res) => setTimeout(() => res(null), 3000));
        const lateUrl = await Promise.race([urlPromise, graceTimeout]);
        if (lateUrl) {
          finalRedirectUrl = lateUrl;
        } else {
          set({ isLoading: false });
          return { success: false, error: 'Sign in was cancelled.' };
        }
      }

      if (subscription && typeof (subscription as any).remove === 'function') {
        (subscription as any).remove();
        subscription = null;
      }

      if (!finalRedirectUrl) {
        // As a final check, inspect if initial URL has tokens
        const initUrl = await Linking.getInitialURL();
        if (initUrl && (initUrl.includes('access_token') || initUrl.includes('code='))) {
          finalRedirectUrl = initUrl;
        }
      }

      if (!finalRedirectUrl) {
        set({ isLoading: false });
        return { success: false, error: 'Google sign-in could not be completed. Please try again.' };
      }

      const parsedParams = parseAuthUrl(finalRedirectUrl);
      if (parsedParams.error) {
        set({ isLoading: false });
        return { success: false, error: parsedParams.error };
      }

      if (!parsedParams.accessToken && !parsedParams.code) {
        set({ isLoading: false });
        return { success: false, error: 'Authorization credentials were not returned. Please try again.' };
      }

      const authPayload = {
        accessToken: parsedParams.accessToken || undefined,
        code: parsedParams.code || undefined,
      };

      const res = await authApi.googleAuth(authPayload);
      const authData = extractAuthData(res, {
        email: authPayload.accessToken ? undefined : undefined,
      });

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

        const needsProfileCompletion = (res as any)?.data?.needsProfileCompletion ?? (res as any)?.needsProfileCompletion ?? true;
        return { success: true, needsProfileCompletion };
      } else {
        throw new Error(res.message || 'Google authentication response was invalid.');
      }
    } catch (err: any) {
      const message = err?.message || 'Google authentication failed. Please try again.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    } finally {
      if (subscription && typeof (subscription as any).remove === 'function') {
        (subscription as any).remove();
      }
    }
  },

  completeProfile: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.completeProfile(payload);
      const currentUser = useAuthStore.getState().user;
      const updatedUser: User = {
        ...(currentUser || {}),
        id: currentUser?.id || res.data?.user?.id || 'user_' + Date.now(),
        email: currentUser?.email || res.data?.user?.email || '',
        role: payload.role,
        phone: payload.phone || currentUser?.phone,
        name: payload.fullName || payload.name || currentUser?.name,
        fullName: payload.fullName || payload.name || currentUser?.fullName,
      };

      await storage.setUser(updatedUser);
      set({ user: updatedUser, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const message = err?.message || 'Failed to complete profile. Please try again.';
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
      await storage.removeRefreshToken();
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

onAuthExpired(() => {
  // Deliberately no-op: user remains logged in at all times until specifically clicking Log Out in Settings.
});
