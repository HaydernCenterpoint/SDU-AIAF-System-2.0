'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api-client';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { AuthUser } from '@/types';

export default function AdminLoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState('ADMIN');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    try {
      const response = await apiPost<{ user: AuthUser; token: string }>('/auth/login', { studentId, password });
      if (response.data.user.role !== 'admin') {
        setError('User thường không được truy cập admin route');
        return;
      }
      localStorage.setItem('saodo_token', response.data.token);
      useAuthStore.setState({ user: response.data.user, token: response.data.token, isAuthenticated: true, isLoading: false, error: null });
      router.push('/admin/dashboard');
    } catch {
      setError('Đăng nhập admin thất bại');
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface-page p-4">
      <section className="w-full max-w-md rounded-3xl border border-blue-border bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Đăng nhập admin</p>
        <h1 className="mt-2 text-3xl font-black text-text">Admin Sao Đỏ</h1>
        <input value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-6 w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 font-bold" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mật khẩu admin" className="mt-3 w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 font-bold" />
        {error ? <p className="mt-3 text-sm font-bold text-primary">{error}</p> : null}
        <button onClick={submit} className="brand-gradient-red mt-5 w-full rounded-2xl px-5 py-3 font-black text-white">Đăng nhập admin</button>
      </section>
    </main>
  );
}
