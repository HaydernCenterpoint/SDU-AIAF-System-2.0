'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { AuthFrame } from '@/components/AuthFrame';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getSchoolLoginPath, resolveSchoolSlug, type SchoolSlug } from '@/lib/school-site';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { forgotPassword, verifyCode, resetPassword, isLoading, error } = useAuthStore();
  const school = resolveSchoolSlug(searchParams.get('school')) as SchoolSlug;

  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await forgotPassword(email, school);
    if (result.success) setStep('code');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyCode(email, code, school);
    if (result.success && result.resetToken) {
      setResetToken(result.resetToken);
      setStep('reset');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    const result = await resetPassword(resetToken, newPassword);
    if (result.success) router.push(getSchoolLoginPath(school));
  };

  const title = step === 'email' ? 'Quên mật khẩu' : step === 'code' ? 'Xác minh mã' : 'Đặt mật khẩu mới';
  const subtitle =
    step === 'email'
      ? 'Nhập email đã đăng ký để nhận mã xác minh.'
      : step === 'code'
        ? `Nhập mã 6 số đã gửi đến ${email}.`
        : 'Mật khẩu mới cần tối thiểu 6 ký tự.';

  return (
    <AuthFrame school={school} title={title} subtitle={subtitle}>
      {error && (
        <div className="mb-5 rounded-lg border border-accent-border bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-text">
          {error}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-text">Email đã đăng ký</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sinhvien@saodo.edu.vn"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full rounded-lg bg-primary px-5 py-3.5 text-base font-extrabold text-white shadow-card transition hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi mã xác minh'}
          </button>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-4 text-center text-2xl font-black tracking-[0.35em] outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            required
          />
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full rounded-lg bg-primary px-5 py-3.5 text-base font-extrabold text-white shadow-card transition hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Đang xác minh...' : 'Xác minh'}
          </button>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full rounded-lg border border-border px-5 py-3 text-sm font-bold text-text-sub hover:bg-surface-alt"
          >
            Quay lại
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mật khẩu mới"
            minLength={6}
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            minLength={6}
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            required
          />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm font-semibold text-accent">Mật khẩu xác nhận không khớp.</p>
          )}
          <button
            type="submit"
            disabled={isLoading || !newPassword || newPassword !== confirmPassword}
            className="w-full rounded-lg bg-primary px-5 py-3.5 text-base font-extrabold text-white shadow-card transition hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-sub">
        <Link href={getSchoolLoginPath(school)} className="font-extrabold text-primary hover:text-primary-dark">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthFrame>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthFrame
          school="sdu"
          title="Quên mật khẩu"
          subtitle="Đang tải thông tin đăng nhập theo trường."
        >
          <div className="py-10 text-center text-sm font-semibold text-text-sub">Đang tải...</div>
        </AuthFrame>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
