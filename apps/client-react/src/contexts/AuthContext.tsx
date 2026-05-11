'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { apiPost } from '@/lib/api-client';
import type { AccountType } from '@/lib/account-types';
import { valueToSchoolSlug } from '@/lib/school-session';
import type { AuthUser } from '@/types';

type AuthPayload = {
  user?: AuthUser;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  studentId?: string;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  accountType: AccountType;
  studentCode?: string;
  schoolId?: 'sao-do' | 'nguyen-thi-due';
  phone?: string;
  major?: string;
};

type LoginInput = {
  identifier: string;
  password: string;
  schoolId?: 'sao-do' | 'nguyen-thi-due';
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string; hasToken?: boolean; studentId?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuth(payload: AuthPayload) {
  const token = payload.accessToken || payload.token;
  if (!token || !payload.user) return false;
  useAuthStore.getState().setSession({
    user: payload.user,
    token,
    school: valueToSchoolSlug(payload.user.schoolId),
  });
  return true;
}

async function verifyPasswordSHA256(password: string, salt: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex === storedHash;
  } catch {
    return false;
  }
}

type JsonUser = {
  id: string;
  studentId: string;
  email: string;
  fullName: string;
  role?: string;
  faculty?: string;
  phone?: string;
  dateOfBirth?: string;
  password: string;
  schoolId: string;
};

async function mockLogin(identifier: string, password: string, schoolId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/data-demo/auth-db.json');
    if (!res.ok) throw new Error('Cannot load auth data');
    const db = await res.json() as { users: JsonUser[] };
    const matched = db.users.find(
      (u) =>
        (u.email?.toLowerCase() === identifier.toLowerCase() ||
          u.studentId?.toLowerCase() === identifier.toLowerCase()) &&
        u.schoolId === schoolId
    );
    if (!matched) return { success: false, error: 'Tài khoản không tồn tại' };

    const parts = matched.password.split(':');
    if (parts.length !== 2) return { success: false, error: 'Dữ liệu tài khoản không hợp lệ' };
    const [salt, storedHash] = parts;
    const valid = await verifyPasswordSHA256(password, salt, storedHash);
    if (!valid) return { success: false, error: 'Mật khẩu không đúng' };

    const user: AuthUser = {
      id: matched.id,
      fullName: matched.fullName,
      email: matched.email,
      role: matched.role === 'admin' ? 'admin' : 'student',
      schoolId: matched.schoolId,
      studentId: matched.studentId,
      phone: matched.phone,
      faculty: matched.faculty || '',
    };
    useAuthStore.getState().setSession({
      user,
      token: `mock-token-${matched.id}`,
      school: valueToSchoolSlug(matched.schoolId),
    });
    return { success: true };
  } catch {
    return { success: false, error: 'Không thể xác thực tài khoản' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore();

  const value = useMemo<AuthContextValue>(() => ({
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    error: authStore.error,

    async login({ identifier, password, schoolId = 'sao-do' }) {
      useAuthStore.setState({ isLoading: true, error: null });

      try {
        const response = await apiPost<AuthPayload>('/auth/login', {
          email: identifier,
          studentId: identifier,
          password,
          schoolId,
        });
        persistAuth(response.data);
        useAuthStore.setState({ isLoading: false });
        return { success: true };
      } catch {
        // Backend unavailable — fallback to mock JSON auth
        const result = await mockLogin(identifier, password, schoolId);
        useAuthStore.setState({ isLoading: false, error: result.error || null });
        return result;
      }
    },

    async register(input) {
      useAuthStore.setState({ isLoading: true, error: null });
      try {
        const normalizedStudentCode = input.studentCode?.trim().toUpperCase();
        const response = await apiPost<AuthPayload>('/auth/register', {
          fullName: input.fullName,
          email: input.email,
          password: input.password,
          accountType: input.accountType,
          schoolId: input.schoolId || (input.accountType.startsWith('highschool') ? 'nguyen-thi-due' : 'sao-do'),
          phone: input.phone,
          major: input.major,
          ...(normalizedStudentCode ? { studentCode: normalizedStudentCode, studentId: normalizedStudentCode } : {}),
        });
        const hasToken = persistAuth(response.data);
        if (!hasToken) useAuthStore.setState({ isLoading: false });
        return { success: true, hasToken, studentId: response.data.studentId || normalizedStudentCode };
      } catch (error) {
        const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Đăng ký thất bại';
        useAuthStore.setState({ isLoading: false, error: message });
        return { success: false, error: message };
      }
    },

    logout() {
      authStore.logout();
    },
  }), [authStore]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
