import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { AuthUser } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    studentId: string,
    password: string,
    email: string
  ) => Promise<{ success: boolean; error?: string; studentId?: string }>;
  completeProfile: (data: {
    studentId: string;
    fullName: string;
    dateOfBirth: string;
    faculty: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  init: async () => {
    const token = await AsyncStorage.getItem('saodo_token');
    if (token) {
      set({ token });
      await get().fetchMe();
    }
  },

  login: async (studentId, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      await AsyncStorage.setItem('saodo_token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false, error: 'Lỗi kết nối đến máy chủ' });
      return { success: false, error: 'Lỗi kết nối đến máy chủ' };
    }
  },

  register: async (studentId, password, email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true, studentId: data.studentId };
    } catch {
      set({ isLoading: false, error: 'Lỗi kết nối đến máy chủ' });
      return { success: false, error: 'Lỗi kết nối đến máy chủ' };
    }
  },

  completeProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: result.error });
        return { success: false, error: result.error };
      }
      await AsyncStorage.setItem('saodo_token', result.token);
      set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false, error: 'Lỗi kết nối đến máy chủ' });
      return { success: false, error: 'Lỗi kết nối đến máy chủ' };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true };
    } catch {
      set({ isLoading: false, error: 'Lỗi kết nối đến máy chủ' });
      return { success: false, error: 'Lỗi kết nối đến máy chủ' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('saodo_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        await get().logout();
        return;
      }
      const data = await res.json();
      set({ user: data.user, isAuthenticated: true });
    } catch {
      // ignore - offline mode
    }
  },

  clearError: () => set({ error: null }),
}));
