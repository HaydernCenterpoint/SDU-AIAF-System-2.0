'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Toast = {
  id: string;
  title: string;
  tone?: 'success' | 'error' | 'info';
};

type ToastContextValue = {
  notify: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { ...toast, id }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3200);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] space-y-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-enter rounded-2xl border px-4 py-3 text-sm font-bold shadow-soft ${
              toast.tone === 'error'
                ? 'border-state-error bg-state-errorBg text-state-errorText'
                : toast.tone === 'success'
                  ? 'border-state-success bg-state-successBg text-state-successText'
                  : 'border-blue-border bg-blue-soft text-blue-dark'
            }`}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
