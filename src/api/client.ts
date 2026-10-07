import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';
import { ApiResponse } from '../types/api';

const TOKEN_KEY = 'sui_dhaga_auth_token';
const REFRESH_TOKEN_KEY = 'sui_dhaga_refresh_token';
const USER_KEY = 'sui_dhaga_user_data';

// Helper for cross-platform secure storage
export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (err) {
      console.warn('Failed to save token to storage', err);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (err) {
      console.warn('Failed to remove token from storage', err);
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
      }
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      } else {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (err) {
      console.warn('Failed to save refresh token to storage', err);
    }
  },

  async removeRefreshToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem(REFRESH_TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch (err) {
      console.warn('Failed to remove refresh token from storage', err);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      if (Platform.OS === 'web') {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
        return raw ? JSON.parse(raw) : null;
      }
      const raw = await SecureStore.getItemAsync(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: any): Promise<void> {
    try {
      const serialized = JSON.stringify(user);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(USER_KEY, serialized);
      } else {
        await SecureStore.setItemAsync(USER_KEY, serialized);
      }
    } catch (err) {
      console.warn('Failed to save user to storage', err);
    }
  },

  async getTailorProfile(userId?: string): Promise<any | null> {
    try {
      const key = `sui_dhaga_tailor_profile_${userId || 'default'}`;
      if (Platform.OS === 'web') {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
        return raw ? JSON.parse(raw) : null;
      }
      const raw = await SecureStore.getItemAsync(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async setTailorProfile(userId: string | undefined, profile: any): Promise<void> {
    try {
      const key = `sui_dhaga_tailor_profile_${userId || 'default'}`;
      const serialized = JSON.stringify(profile);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.setItem(key, serialized);
      } else {
        await SecureStore.setItemAsync(key, serialized);
      }
    } catch (err) {
      console.warn('Failed to save tailor profile to storage', err);
    }
  },

  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
      } else {
        await SecureStore.deleteItemAsync(USER_KEY);
      }
    } catch (err) {
      console.warn('Failed to remove user from storage', err);
    }
  },
};

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

function formatErrorDetails(obj: any): string[] {
  if (!obj) return [];
  const messages: string[] = [];

  if (typeof obj === 'string') {
    return [obj.trim()];
  }

  // Zod flatten structure: { formErrors: string[], fieldErrors: Record<string, string[]> }
  if (obj.fieldErrors && typeof obj.fieldErrors === 'object') {
    Object.entries(obj.fieldErrors).forEach(([field, errs]) => {
      if (Array.isArray(errs) && errs.length > 0) {
        const validErrs = errs.filter((e) => typeof e === 'string' && e.trim());
        if (validErrs.length > 0) {
          messages.push(`${field}: ${validErrs.join(', ')}`);
        }
      } else if (typeof errs === 'string' && errs.trim()) {
        messages.push(`${field}: ${errs.trim()}`);
      }
    });
  }

  if (obj.formErrors && Array.isArray(obj.formErrors) && obj.formErrors.length > 0) {
    const validForms = obj.formErrors.filter((e: any) => typeof e === 'string' && e.trim());
    messages.push(...validForms);
  }

  // Zod issues array: { issues: [{ path: string[], message: string }] }
  if (Array.isArray(obj.issues)) {
    obj.issues.forEach((issue: any) => {
      if (issue?.message) {
        const path = Array.isArray(issue.path) && issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
        messages.push(`${path}${issue.message}`);
      }
    });
  }

  // General errors array
  if (Array.isArray(obj.errors)) {
    obj.errors.forEach((e: any) => {
      if (typeof e === 'string') {
        messages.push(e);
      } else if (e?.message) {
        const field = e.field || e.param || (Array.isArray(e.path) ? e.path.join('.') : e.path);
        messages.push(field ? `${field}: ${e.message}` : e.message);
      } else if (e?.msg) {
        const field = e.field || e.param || (Array.isArray(e.path) ? e.path.join('.') : e.path);
        messages.push(field ? `${field}: ${e.msg}` : e.msg);
      }
    });
  } else if (obj.errors && typeof obj.errors === 'object' && !obj.fieldErrors) {
    const sub = formatErrorDetails(obj.errors);
    if (sub.length > 0) {
      messages.push(...sub);
    } else {
      Object.entries(obj.errors).forEach(([field, val]) => {
        if (typeof val === 'string') messages.push(`${field}: ${val}`);
        else if (Array.isArray(val)) messages.push(`${field}: ${val.join(', ')}`);
        else if (val && typeof val === 'object' && (val as any).message) messages.push(`${field}: ${(val as any).message}`);
      });
    }
  }

  // General details array or object
  if (Array.isArray(obj.details)) {
    obj.details.forEach((d: any) => {
      if (typeof d === 'string') {
        messages.push(d);
      } else if (d?.message) {
        const path = Array.isArray(d.path) ? d.path.join('.') : d.path;
        messages.push(path ? `${path}: ${d.message}` : d.message);
      }
    });
  } else if (obj.details && typeof obj.details === 'object') {
    messages.push(...formatErrorDetails(obj.details));
  }

  return messages;
}

function extractErrorMessage(data: any, status: number): string {
  if (!data) return `Request failed with status ${status}`;

  if (typeof data === 'string') return data;

  // 1. Check for detailed Zod/fieldErrors/validation issues across all payload levels
  const detailedMessages = [
    ...(data.fieldErrors || data.formErrors ? formatErrorDetails(data) : []),
    ...(data.errors ? formatErrorDetails(data.errors) : []),
    ...(data.error && typeof data.error === 'object' ? formatErrorDetails(data.error) : []),
    ...(data.details ? formatErrorDetails(data.details) : []),
    ...(data.data && typeof data.data === 'object' ? formatErrorDetails(data.data) : []),
  ].filter(Boolean);

  if (detailedMessages.length > 0) {
    const unique = Array.from(new Set(detailedMessages));
    return unique.join('. ');
  }

  // 2. If data.message is an array
  if (Array.isArray(data.message)) {
    return data.message.join('. ');
  }

  // 3. If data.message is a string
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  // 4. If data.error is a string
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

  return `Request failed with status ${status}`;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

type AuthExpiredCallback = () => void;
let authExpiredListener: AuthExpiredCallback | null = null;

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) return null;

      const baseUrl = CONFIG.API_URL.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/api/v1/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      const session = json?.data?.session || json?.session || json?.data;
      const newToken = session?.access_token || session?.accessToken || session?.token;
      const newRefreshToken = session?.refresh_token || session?.refreshToken;

      if (newToken && typeof newToken === 'string') {
        await storage.setToken(newToken);
        if (newRefreshToken && typeof newRefreshToken === 'string') {
          await storage.setRefreshToken(newRefreshToken);
        }
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function onAuthExpired(callback: AuthExpiredCallback) {
  authExpiredListener = callback;
}

function handleAuthExpirationIfNeeded(status: number, message: string) {
  // Never automatically log out or wipe user credentials without user action.
  // Sessions persist until the user explicitly selects "Log Out" in settings.
}

export async function apiClient<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  let baseUrl = CONFIG.API_URL.replace(/\/+$/, '');
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!path.startsWith('/api/v1')) {
    path = `/api/v1${path}`;
  }

  let url = `${baseUrl}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const isFormData =
    (typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData) ||
    Boolean(fetchOptions.body && typeof (fetchOptions.body as any).append === 'function');

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  } else if (isFormData) {
    delete headers['Content-Type'];
  }

  if (!skipAuth) {
    const token = await storage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // If body is FormData, use XMLHttpRequest to prevent expo/fetch "Unsupported FormDataPart implementation" error
  if (isFormData) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(fetchOptions.method || 'POST', url, true);

      Object.entries(headers).forEach(([key, value]) => {
        if (value) {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.onload = () => {
        let data: any = {};
        try {
          data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          data = { raw: xhr.responseText };
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: data.success !== undefined ? data.success : true,
            message: data.message,
            data: data.data !== undefined ? data.data : data,
            error: data.error,
          });
        } else {
          const errorMessage = extractErrorMessage(data, xhr.status);
          reject(new ApiError(errorMessage, xhr.status, data));
        }
      };

      xhr.onerror = () => {
        reject(new ApiError('Network request failed. Please check your internet connection.', 0));
      };

      xhr.ontimeout = () => {
        reject(new ApiError('Request timed out. Please try again.', 0));
      };

      xhr.timeout = 60000;
      xhr.send(fetchOptions.body as any);
    });
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const responseText = await response.text();
    let data: any = {};
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      // If 401 Unauthorized, automatically attempt to refresh token and retry request seamlessly
      if (
        response.status === 401 &&
        !skipAuth &&
        !endpoint.includes('refresh-token') &&
        !endpoint.includes('login') &&
        !endpoint.includes('register')
      ) {
        const newToken = await tryRefreshToken();
        if (newToken) {
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          const retryRes = await fetch(url, {
            ...fetchOptions,
            headers: retryHeaders,
          });
          const retryText = await retryRes.text();
          let retryData: any = {};
          try {
            retryData = retryText ? JSON.parse(retryText) : {};
          } catch {
            retryData = { raw: retryText };
          }
          if (retryRes.ok) {
            return {
              success: retryData.success !== undefined ? retryData.success : true,
              message: retryData.message,
              data: retryData.data !== undefined ? retryData.data : retryData,
              error: retryData.error,
            };
          }
        }
      }

      const errorMessage = extractErrorMessage(data, response.status);
      throw new ApiError(errorMessage, response.status, data);
    }

    return {
      success: data.success !== undefined ? data.success : true,
      message: data.message,
      data: data.data !== undefined ? data.data : data,
      error: data.error,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error?.message || 'Network request failed. Please check your internet connection.', 0);
  }
}
