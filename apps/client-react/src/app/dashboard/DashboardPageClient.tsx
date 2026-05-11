'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { SchoolSlug } from '@/lib/school-site';

export function StudentDashboardPage({ school = 'sdu' }: { school?: SchoolSlug }) {
  const { token, isAuthenticated, syncSessionFromStorage } = useAuthStore();
  const { bootstrap } = useAppStore();

  useEffect(() => {
    syncSessionFromStorage(school);
  }, [school, syncSessionFromStorage]);

  useEffect(() => {
    if (isAuthenticated && token) bootstrap(token);
  }, [isAuthenticated, token, bootstrap]);

  return (
    <ProtectedRoute school={school}>
      <AppShell school={school} />
    </ProtectedRoute>
  );
}

export default function DashboardRoute() {
  return <StudentDashboardPage school="sdu" />;
}
