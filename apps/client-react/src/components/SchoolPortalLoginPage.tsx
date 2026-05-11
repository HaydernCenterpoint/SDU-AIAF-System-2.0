'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/hooks/useAuthStore';
import { clearPostLogoutRedirectPath } from '@/lib/school-session';
import {
  getSchoolDashboardPath,
  getSchoolLoginPath,
  resolveBackendSchoolId,
  resolveSchoolSlugFromBackendId,
  type SchoolSlug,
} from '@/lib/school-site';
import { SchoolPortalLogin } from './SchoolPortalLogin';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Vui lòng nhập email hoặc mã tài khoản.'),
  password: z.string().min(3, 'Mật khẩu cần tối thiểu 3 ký tự.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type BackendSchoolId = 'sao-do' | 'nguyen-thi-due';

type SchoolPortalLoginPageProps = {
  mode?: 'gateway' | 'login';
  school?: SchoolSlug;
};

export function SchoolPortalLoginPage({
  mode = 'login',
  school = 'sdu',
}: SchoolPortalLoginPageProps) {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const user = useAuthStore((state) => state.user);
  const schoolId = resolveBackendSchoolId(school) as BackendSchoolId;
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      const targetSchool = resolveSchoolSlugFromBackendId(user?.schoolId || schoolId);
      if (user?.role === 'admin') {
        router.push(`/admin/${targetSchool}/dashboard`);
      } else {
        router.push(getSchoolDashboardPath(targetSchool));
      }
    }
  }, [isAuthenticated, user, router, schoolId]);

  useEffect(() => {
    if (mode === 'gateway') clearPostLogoutRedirectPath();
  }, [mode]);

  const validationError = errors.identifier?.message || errors.password?.message || null;
  const username = watch('identifier');
  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    if (mode !== 'login') return;
    const result = await login({ ...values, schoolId });
    if (result.success) {
      // The useEffect will handle the redirection once the state updates.
    }
  });

  return (
    <SchoolPortalLogin
      username={username}
      password={password}
      isLoading={isLoading}
      error={validationError || error}
      onUsernameChange={(value) => setValue('identifier', value, { shouldDirty: true, shouldValidate: true })}
      onPasswordChange={(value) => setValue('password', value, { shouldDirty: true, shouldValidate: true })}
      mode={mode}
      presetSchool={schoolId}
      onNavigateToSchool={(nextSchool) => {
        router.push(getSchoolLoginPath(nextSchool));
      }}
      onBackToSelection={() => {
        router.push('/');
      }}
      onSubmit={onSubmit}
    />
  );
}
