import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUser } from '../types';
import { apiClient, getApiErrorMessage, setUnauthorizedHandler } from '../services/api-client';
import { tokenStorage } from '../services/token-storage';

type LoginInput = { identifier?: string; email?: string; studentId?: string; password: string };
type RegisterInput = { fullName: string; studentId: string; email: string; password: string };
type AuthPayload = { user?: AuthUser; token?: string; accessToken?: string; refreshToken?: string; studentId?: string };
type AuthResult = { success: boolean; error?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult & { studentId?: string }>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const mountedRef = useRef(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.clearAuth();
    if (!mountedRef.current) return;
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const persistAuth = useCallback(async (payload: AuthPayload) => {
    const nextToken = payload.accessToken || payload.token;
    if (!nextToken || !payload.user) return false;

    await tokenStorage.setAccessToken(nextToken);
    if (payload.refreshToken) {
      await tokenStorage.setRefreshToken(payload.refreshToken);
    }
    if (!mountedRef.current) return true;
    setToken(nextToken);
    setUser(payload.user);
    return true;
  }, []);

  const refreshMe = useCallback(async () => {
    const refreshToken = await tokenStorage.getAccessToken();
    if (!mountedRef.current) return;
    if (!refreshToken) return;

    setToken(refreshToken);
    try {
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
      const currentToken = await tokenStorage.getAccessToken();
      if (!mountedRef.current || currentToken !== refreshToken) return;
      setUser(response.data.user);
    } catch {
      const currentToken = await tokenStorage.getAccessToken();
      if (!mountedRef.current || currentToken !== refreshToken) return;
      await logout();
    }
  }, [logout]);

  useEffect(() => {
    let active = true;
    mountedRef.current = true;

    setUnauthorizedHandler(() => {
      void logout();
    });
    refreshMe().finally(() => {
      if (active) setIsInitializing(false);
    });

    return () => {
      active = false;
      mountedRef.current = false;
      setUnauthorizedHandler(null);
    };
  }, [logout, refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isInitializing,
      isLoading,
      error,
      async login(input) {
        setIsLoading(true);
        setError(null);
        try {
          const identifier = input.identifier || input.email || input.studentId || '';
          const response = await apiClient.post<AuthPayload>('/auth/login', {
            email: input.email || identifier,
            studentId: input.studentId || identifier,
            password: input.password,
          });
          if (!(await persistAuth(response.data))) {
            const message = 'Phản hồi đăng nhập không hợp lệ';
            if (mountedRef.current) setError(message);
            return { success: false, error: message };
          }
          return { success: true };
        } catch (loginError) {
          const message = getApiErrorMessage(loginError, 'Đăng nhập thất bại');
          if (mountedRef.current) setError(message);
          return { success: false, error: message };
        } finally {
          if (mountedRef.current) setIsLoading(false);
        }
      },
      async register(input) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await apiClient.post<AuthPayload>('/auth/register', {
            fullName: input.fullName,
            studentId: input.studentId,
            studentCode: input.studentId,
            email: input.email,
            password: input.password,
          });
          if (!(await persistAuth(response.data))) {
            const message = 'Phản hồi đăng ký không hợp lệ';
            if (mountedRef.current) setError(message);
            return { success: false, error: message };
          }
          return { success: true, studentId: response.data.studentId || input.studentId };
        } catch (registerError) {
          const message = getApiErrorMessage(registerError, 'Đăng ký thất bại');
          if (mountedRef.current) setError(message);
          return { success: false, error: message };
        } finally {
          if (mountedRef.current) setIsLoading(false);
        }
      },
      async forgotPassword(email) {
        setIsLoading(true);
        setError(null);
        try {
          await apiClient.post('/auth/forgot-password', { email });
          return { success: true };
        } catch (forgotError) {
          const message = getApiErrorMessage(forgotError, 'Không thể gửi yêu cầu cấp lại mật khẩu');
          if (mountedRef.current) setError(message);
          return { success: false, error: message };
        } finally {
          if (mountedRef.current) setIsLoading(false);
        }
      },
      refreshMe,
      logout,
      clearError,
    }),
    [user, token, isInitializing, isLoading, error, persistAuth, refreshMe, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
