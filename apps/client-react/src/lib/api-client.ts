import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { getCurrentSchoolSlug, readSchoolToken } from '@/lib/school-session';

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string }>;
  status: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const slug = getCurrentSchoolSlug();
  const token = readSchoolToken(slug);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-School-ID'] = slug;
  return config;
});

function normalizeApiPath(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const trimmed = String(url || '').trim();
  const withoutApiPrefix = trimmed.replace(/^\/?api(?=\/|$)/, '');
  if (!withoutApiPrefix) return '/';
  return withoutApiPrefix.startsWith('/') ? withoutApiPrefix : `/${withoutApiPrefix}`;
}

function normalizeLegacyPayload<T>(payload: unknown): ApiSuccess<T> {
  return {
    success: true,
    message: 'Thành công',
    data: payload as T,
  };
}

function normalizeError(error: unknown): ApiFailure {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const payload = error.response?.data as { message?: string; errors?: ApiFailure['errors']; error?: string } | undefined;
    return {
      success: false,
      status,
      message: payload?.message || payload?.error || 'Không thể kết nối máy chủ',
      errors: Array.isArray(payload?.errors) ? payload.errors : [],
    };
  }

  return {
    success: false,
    status: 500,
    message: 'Không thể kết nối máy chủ',
    errors: [],
  };
}

export function getApiErrorMessage(error: unknown, fallback = 'Không thể kết nối máy chủ') {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
  try {
    const response = await apiClient.get(normalizeApiPath(url), config);
    if (response.data?.success === true) return response.data as ApiSuccess<T>;
    return normalizeLegacyPayload<T>(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
  try {
    const response = await apiClient.post(normalizeApiPath(url), body, config);
    if (response.data?.success === true) return response.data as ApiSuccess<T>;
    return normalizeLegacyPayload<T>(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccess<T>> {
  try {
    const response = await apiClient.put(normalizeApiPath(url), body, config);
    if (response.data?.success === true) return response.data as ApiSuccess<T>;
    return normalizeLegacyPayload<T>(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function apiFetch(url: string, options: any = {}) {
  const method = options.method || 'GET';
  const headers = options.headers || {};
  const data = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined;
  
  try {
    if (method === 'GET') {
      const res = await apiGet<any>(url, { headers });
      return res.data;
    } else if (method === 'POST') {
      const res = await apiPost<any>(url, data, { headers });
      return res.data;
    }
    return {};
  } catch (error: any) {
    if (error?.status === 401 && typeof window !== 'undefined') {
      // Delay import to avoid circular dependency
      import('@/hooks/useAuthStore').then(({ useAuthStore }) => {
        const schoolStr = getCurrentSchoolSlug(window.location.pathname);
        useAuthStore.getState().logout(schoolStr);
        window.location.href = `/${schoolStr}/login`;
      });
      // Return empty payload to prevent further errors while redirecting
      return {};
    }
    throw error;
  }
}
