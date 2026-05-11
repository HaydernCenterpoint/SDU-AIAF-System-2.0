'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrandMark } from '@/components/BrandMark';
import { useAuth } from '@/contexts/AuthContext';
import { PUBLIC_GUEST_ACCOUNT_TYPE } from '@/lib/account-types';
import { schoolConfigs } from '@/lib/school-config';
import {
  getSchoolDashboardPath,
  getSchoolLoginPath,
  resolveBackendSchoolId,
  resolveSchoolSlug,
} from '@/lib/school-site';
import styles from './RegisterPage.module.css';

const guestRegisterSchema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ và tên.'),
  email: z.string().trim().email('Email không hợp lệ.'),
  major: z.string().trim().optional(),
  password: z.string().min(6, 'Mật khẩu cần tối thiểu 6 ký tự.'),
  confirmPassword: z.string().min(6, 'Vui lòng nhập lại mật khẩu.'),
}).refine((values) => values.password === values.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp.',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof guestRegisterSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const school = resolveSchoolSlug(searchParams.get('school'));
  const schoolConfig = schoolConfigs[school];
  const schoolId = resolveBackendSchoolId(school);
  const { register: registerAccount, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(guestRegisterSchema),
    defaultValues: {
      fullName: '',
      email: '',
      major: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = handleSubmit(async ({ confirmPassword: _confirmPassword, ...values }) => {
    const result = await registerAccount({
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      password: values.password,
      accountType: PUBLIC_GUEST_ACCOUNT_TYPE,
      schoolId,
      major: values.major?.trim() || undefined,
    });

    if (result.success && result.hasToken) {
      router.push(getSchoolDashboardPath(school));
    }
  });

  return (
    <main className={styles.page}>
      <aside className={styles.brandPanel} aria-label={schoolConfig.name}>
        <span className={styles.stars} aria-hidden="true" />
        <div className={styles.brandContent}>
          <div className={styles.brandHeader}>
            <BrandMark tone="light" size="md" school={school} />
          </div>

          <div className={styles.greeting}>
            <p className={styles.hello}>Xin chào,</p>
            <h1 className={styles.studentName}>{school === 'ntd' ? 'Khách tham quan NTD' : 'Khách tham quan SDU'}</h1>
            <div className={styles.studentInfo}>
              <span>{school === 'ntd' ? 'Tài khoản khám phá trường' : 'Tài khoản khách dùng AI'}</span>
              <span>{schoolConfig.shortName}</span>
            </div>
          </div>

          <address className={styles.address}>
            {school === 'ntd'
              ? 'Ai cũng có thể tạo tài khoản khách để hỏi AI, đọc cộng đồng và tìm hiểu thêm về THPT Nguyễn Thị Duệ.'
              : 'Ai cũng có thể tạo tài khoản khách để dùng AI, đọc cộng đồng và tìm hiểu thêm về Trường Đại học Sao Đỏ.'}
          </address>
        </div>
        <svg className={styles.brandWave} viewBox="0 0 92 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M34.8,0 C56,18 56,34 43.5,50 C31,66 31,82 34.8,100 L92,100 L92,0 Z" />
        </svg>
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.card}>
          <div className={styles.mobileLogo}>
            <BrandMark size="lg" school={school} />
          </div>

          <h2 className={styles.title}>Tạo tài khoản khách</h2>
          <p className={styles.subtitle}>
            Ai cũng có thể tạo tài khoản để dùng AI, xem cộng đồng và đọc thêm thông tin về trường.
          </p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="fullName">Họ và tên</label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                placeholder="Nguyễn Văn An"
                autoComplete="name"
              />
              {errors.fullName?.message && <p className={styles.fieldError}>{errors.fullName.message}</p>}
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email đăng nhập</label>
              <input
                id="email"
                type="email"
                {...register('email')}
                placeholder="ban@example.com"
                autoComplete="email"
              />
              {errors.email?.message ? (
                <p className={styles.fieldError}>{errors.email.message}</p>
              ) : (
                <p className={styles.helperText}>Dùng để đăng nhập lại, nhận thông báo và khôi phục mật khẩu.</p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="major">Bạn muốn tìm hiểu gì?</label>
              <input
                id="major"
                type="text"
                {...register('major')}
                placeholder="VD: ngành CNTT, học phí, môi trường học tập"
                autoComplete="organization-title"
              />
              <p className={styles.helperText}>
                Thông tin này giúp AI và mục cộng đồng gợi ý nội dung phù hợp hơn.
              </p>
            </div>

            <div className={styles.passwordGrid}>
              <div className={styles.field}>
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                />
                {errors.password?.message && <p className={styles.fieldError}>{errors.password.message}</p>}
              </div>
              <div className={styles.field}>
                <label htmlFor="confirmPassword">Xác nhận</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="Nhập lại"
                  autoComplete="new-password"
                />
                {errors.confirmPassword?.message && <p className={styles.fieldError}>{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading || isSubmitting} className={styles.primaryButton}>
              {isLoading || isSubmitting ? 'Đang xử lý...' : 'Vào portal'}
            </button>
          </form>

          <p className={styles.loginNote}>
            Đã có tài khoản?{' '}
            <Link href={getSchoolLoginPath(school)} className={styles.loginLink}>
              Đăng nhập
            </Link>
          </p>
          <p className={styles.securityNote}>
            Kết nối được bảo vệ. Tài khoản khách cho phép dùng AI và đọc nội dung cộng đồng của trường.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <section className={styles.formPanel}>
            <div className={styles.card}>
              <div className="py-10 text-center text-sm font-semibold text-text-sub">Đang tải...</div>
            </div>
          </section>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
