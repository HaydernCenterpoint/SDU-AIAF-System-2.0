'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthFrame } from '@/components/AuthFrame';
import { useAuthStore } from '@/hooks/useAuthStore';
import { getSchoolDashboardPath, resolveSchoolSlugFromBackendId } from '@/lib/school-site';

function ProfileSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeProfile, isLoading, error } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phone, setPhone] = useState('');

  const studentId = searchParams.get('studentId') || '';
  const schoolId = (searchParams.get('schoolId') === 'nguyen-thi-due' ? 'nguyen-thi-due' : 'sao-do') as 'sao-do' | 'nguyen-thi-due';
  const school = resolveSchoolSlugFromBackendId(schoolId);

  useEffect(() => {
    if (!studentId) router.push(`/register?school=${school}`);
  }, [studentId, router, school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await completeProfile({
      studentId,
      schoolId,
      fullName,
      dateOfBirth,
      faculty,
      phone,
    });
    if (result.success) router.push(getSchoolDashboardPath(school));
  };

  return (
    <AuthFrame
      school={school}
      title="Hoàn thiện hồ sơ"
      subtitle="Thông tin này giúp trợ lý cá nhân hóa lịch học, tài liệu và nhắc nhở."
      asideTitle="Hồ sơ người dùng"
      asideText="Cập nhật thông tin cơ bản để hệ thống hiển thị đúng lớp, khoa và các tiện ích học tập."
    >
      {error && (
        <div className="mb-5 rounded-lg border border-accent-border bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-text">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-bold text-text">Mã định danh</label>
          <input
            type="text"
            value={studentId}
            disabled
            className="w-full rounded-lg border border-border bg-surface-inset px-4 py-3 text-sm font-semibold text-text-muted"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-text">Họ và tên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-text">Ngày sinh</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-text">Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-text">{school === 'ntd' ? 'Lớp / tổ chuyên môn' : 'Khoa'}</label>
          <input
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            placeholder={school === 'ntd' ? 'VD: 12A1 - THPT Nguyễn Thị Duệ' : 'VD: Công nghệ thông tin'}
            className="w-full rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !fullName || !dateOfBirth || !faculty || !phone}
          className="w-full rounded-lg bg-primary px-5 py-3.5 text-base font-extrabold text-white shadow-card transition hover:bg-primary-dark disabled:opacity-50"
        >
          {isLoading ? 'Đang lưu...' : 'Hoàn tất đăng ký'}
        </button>
      </form>
    </AuthFrame>
  );
}

export default function ProfileSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface-page">
          <p className="text-sm font-semibold text-text-sub">Đang tải...</p>
        </div>
      }
    >
      <ProfileSetupContent />
    </Suspense>
  );
}
