'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/feedback/ToastProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
