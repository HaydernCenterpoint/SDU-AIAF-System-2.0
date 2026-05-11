import axios, { AxiosError } from 'axios';
import { tokenStorage } from './token-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

let onUnauthorized: (() => void) | null = null;

function requestHasAuthorizationHeader(headers: unknown) {
  if (!headers || typeof headers !== 'object') return false;
  const candidate = headers as { Authorization?: unknown; authorization?: unknown; get?: (name: string) => unknown };
  return Boolean(candidate.Authorization || candidate.authorization || candidate.get?.('Authorization'));
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    const hasAuthorizationHeader = requestHasAuthorizationHeader(error.config?.headers);
    if (error.response?.status === 401 && hasAuthorizationHeader) {
      await tokenStorage.clearAuth();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getApiErrorMessage(error: unknown, fallback = 'Không thể kết nối máy chủ') {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    return error.response?.data?.error || error.response?.data?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
