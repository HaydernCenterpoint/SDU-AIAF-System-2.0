'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { useAuthStore } from '@/hooks/useAuthStore';
import { consumePostLogoutRedirectPath } from '@/lib/school-session';
import { getSchoolLoginPath, type SchoolSlug } from '@/lib/school-site';

export function ProtectedRoute({
  children,
  school,
}: {
  children: React.ReactNode;
  school: SchoolSlug;
}) {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, fetchMe, syncSessionFromStorage } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    syncSessionFromStorage(school);
  }, [school, syncSessionFromStorage]);

  useEffect(() => {
    if (token && !isAuthenticated) fetchMe(school);
  }, [token, isAuthenticated, fetchMe, school]);

  useEffect(() => {
    if (!isLoading && !token && !isAuthenticated) {
      const postLogoutRedirectPath = consumePostLogoutRedirectPath();
      router.replace(postLogoutRedirectPath || getSchoolLoginPath(school));
    }
  }, [isLoading, token, isAuthenticated, router, school]);

  if (!hasMounted) return null;

  if (isLoading || (!isAuthenticated && token)) {
    return (
      <div className="brand-gradient-page flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <BrandMark size="lg" showText={false} school={school} />
          </div>
          <p className="text-sm font-semibold text-text-sub">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
