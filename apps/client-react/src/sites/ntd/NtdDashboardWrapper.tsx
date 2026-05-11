'use client';

import { useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';

export function NtdDashboardWrapper() {
  const { token, isAuthenticated, syncSessionFromStorage } = useAuthStore();
  const { bootstrap } = useAppStore();

  useEffect(() => {
    syncSessionFromStorage('ntd');
  }, [syncSessionFromStorage]);

  useEffect(() => {
    if (isAuthenticated && token) bootstrap(token);
  }, [isAuthenticated, token, bootstrap]);

  return (
    <ProtectedRoute school="ntd">
      <AppShell school="ntd" activeNavId="dashboard">
        {/* children handled by AppShell */}
      </AppShell>
    </ProtectedRoute>
  );
}
