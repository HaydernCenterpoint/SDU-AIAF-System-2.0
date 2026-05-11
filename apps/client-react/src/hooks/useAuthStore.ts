import { create } from 'zustand';
import {
  clearPostLogoutRedirectPath,
  clearSchoolSession,
  getCurrentSchoolSlug,
  markPostLogoutRedirectPath,
  readSchoolToken,
  valueToBackendSchoolId,
  valueToSchoolSlug,
  writeSchoolSession,
} from '@/lib/school-session';
import type { SchoolSlug } from '@/lib/school-site';
import type { AuthUser } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

type BackendSchoolId = 'sao-do' | 'nguyen-thi-due';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  activeSchool: SchoolSlug | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (studentId: string, password: string, school?: SchoolSlug | BackendSchoolId) => Promise<{ success: boolean; error?: string }>;
  register: (studentId: string, password: string, email: string, school?: SchoolSlug | BackendSchoolId) => Promise<{ success: boolean; error?: string; studentId?: string }>;
  completeProfile: (data: {
    studentId: string;
    schoolId?: BackendSchoolId;
    fullName: string;
    dateOfBirth: string;
    faculty: string;
    phone: string;
  }) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string, school?: SchoolSlug | BackendSchoolId) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (email: string, code: string, school?: SchoolSlug | BackendSchoolId) => Promise<{ success: boolean; resetToken?: string; error?: string }>;
  resetPassword: (resetToken: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  fetchMe: (school?: SchoolSlug | BackendSchoolId) => Promise<void>;
  syncSessionFromStorage: (school?: SchoolSlug | BackendSchoolId) => void;
  setSession: (session: { user: AuthUser; token: string; school?: SchoolSlug | BackendSchoolId }) => void;
  logout: (school?: SchoolSlug | BackendSchoolId, redirectPath?: string | null) => void;
  clearError: () => void;
}

function resolveSchool(school?: SchoolSlug | BackendSchoolId | string) {
  const activeSchool = school || getCurrentSchoolSlug();
  return {
    slug: valueToSchoolSlug(activeSchool),
    backendId: valueToBackendSchoolId(activeSchool),
  };
}

function getMessage(error: unknown, fallback: string) {
  return error && typeof error === 'object' && 'message' in error ? String(error.message) : fallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? readSchoolToken(getCurrentSchoolSlug()) : null,
  activeSchool: typeof window !== 'undefined' ? getCurrentSchoolSlug() : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  async login(studentId, password, school) {
    const target = resolveSchool(school);
    set({ isLoading: true, error: null, activeSchool: target.slug });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password, schoolId: target.backendId }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }

      writeSchoolSession(target.slug, {
        token: data.token,
        displayName: data.user?.fullName,
      });
      clearPostLogoutRedirectPath();
      set({ user: data.user, token: data.token, activeSchool: target.slug, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  async register(studentId, password, email, school) {
    const target = resolveSchool(school);
    set({ isLoading: true, error: null, activeSchool: target.slug });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password, email, schoolId: target.backendId }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true, studentId: data.studentId };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  async completeProfile(data) {
    const target = resolveSchool(data.schoolId);
    set({ isLoading: true, error: null, activeSchool: target.slug });
    try {
      const res = await fetch(`${API_BASE}/auth/complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, schoolId: target.backendId }),
      });
      const result = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: result.error });
        return { success: false, error: result.error };
      }

      writeSchoolSession(target.slug, {
        token: result.token,
        displayName: result.user?.fullName,
      });
      clearPostLogoutRedirectPath();
      set({ user: result.user, token: result.token, activeSchool: target.slug, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  async forgotPassword(email, school) {
    const target = resolveSchool(school);
    set({ isLoading: true, error: null, activeSchool: target.slug });
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, schoolId: target.backendId }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  async verifyCode(email, code, school) {
    const target = resolveSchool(school);
    set({ isLoading: true, error: null, activeSchool: target.slug });
    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, schoolId: target.backendId }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true, resetToken: data.resetToken };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  async resetPassword(resetToken, newPassword) {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return { success: false, error: data.error };
      }
      set({ isLoading: false });
      return { success: true };
    } catch {
      const message = 'Lỗi kết nối đến máy chủ';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  syncSessionFromStorage(school) {
    const target = resolveSchool(school);
    const token = readSchoolToken(target.slug);
    const currentUser = get().user;
    const currentUserSchool = currentUser?.schoolId ? valueToSchoolSlug(currentUser.schoolId) : null;

    set({
      activeSchool: target.slug,
      token,
      isAuthenticated: Boolean(token) && currentUserSchool === target.slug && Boolean(currentUser),
      user: currentUserSchool === target.slug ? currentUser : null,
    });
  },

  setSession({ user, token, school }) {
    const target = resolveSchool(school || user.schoolId);
    writeSchoolSession(target.slug, {
      token,
      displayName: user.fullName,
    });
    clearPostLogoutRedirectPath();
    set({
      user,
      token,
      activeSchool: target.slug,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  logout(school, redirectPath) {
    const target = resolveSchool(school || get().activeSchool || undefined);
    clearSchoolSession(target.slug);
    if (redirectPath) {
      markPostLogoutRedirectPath(redirectPath);
    } else {
      clearPostLogoutRedirectPath();
    }
    set({
      user: null,
      token: null,
      activeSchool: target.slug,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  async fetchMe(school) {
    const target = resolveSchool(school || get().activeSchool || undefined);
    const token = get().token || readSchoolToken(target.slug);
    if (!token) {
      set({ user: null, token: null, activeSchool: target.slug, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true, activeSchool: target.slug, token, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        get().logout(target.slug);
        return;
      }
      const data = await res.json();
      const userSchool = valueToSchoolSlug(data.user?.schoolId);
      if (userSchool !== target.slug) {
        get().logout(target.slug);
        return;
      }

      writeSchoolSession(target.slug, {
        token,
        displayName: data.user?.fullName,
      });
      set({ user: data.user, token, activeSchool: target.slug, isAuthenticated: true, isLoading: false, error: null });
    } catch (error) {
      const message = getMessage(error, 'Lỗi kết nối đến máy chủ');
      set({ isLoading: false, error: message });
      get().logout(target.slug);
    }
  },

  clearError: () => set({ error: null }),
}));
