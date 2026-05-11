'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { NtdSidebar } from './NtdSidebar';
import styles from './NtdProfile.module.css';

export function NtdProfilePage() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/ntd/login');
    }
  }, [user, isLoading, router]);

  if (!user) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Đang tải...</p>
      </div>
    );
  }

  const profileData = {
    fullName: user.fullName || 'Nguyễn Trần Trúc Mai',
    studentId: user.studentId || 'NTD001',
    email: user.email || 'mai.ntd@test.com',
    phone: user.phone || '0912345678',
    dateOfBirth: user.dateOfBirth || '2008-05-12',
    class: user.faculty || '12A1',
    school: 'THPT Nguyễn Thị Duệ',
    address: 'Chí Linh, Hải Dương',
  };

  return (
    <div className={styles.container}>
      <NtdSidebar activeItem="profile" />
      
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Hồ sơ cá nhân</h1>
          <p className={styles.subtitle}>Quản lý thông tin của bạn</p>
        </header>

        <div className={styles.content}>
          {/* Avatar Section */}
          <section className={styles.avatarSection}>
            <div className={styles.avatarCard}>
              <div className={styles.avatarLarge}>
                {profileData.fullName.charAt(0)}
              </div>
              <h2 className={styles.avatarName}>{profileData.fullName}</h2>
              <p className={styles.avatarClass}>Lớp {profileData.class}</p>
              <button className={styles.changeAvatarBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Đổi ảnh đại diện
              </button>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsCard}>
              <h3 className={styles.statsTitle}>Thống kê</h3>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>156</span>
                  <span className={styles.statLabel}>Bài viết</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>89</span>
                  <span className={styles.statLabel}>Tương tác</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>23</span>
                  <span className={styles.statLabel}>Bạn bè</span>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Form */}
          <section className={styles.formSection}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Thông tin cá nhân
              </h3>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>Họ và tên</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" value={profileData.fullName} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Mã học sinh</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <input type="text" value={profileData.studentId} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Email</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input type="email" value={profileData.email} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Số điện thoại</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input type="tel" value={profileData.phone} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Ngày sinh</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <input type="text" value={new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN')} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Lớp</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <input type="text" value={profileData.class} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Trường học</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    <input type="text" value={profileData.school} className={styles.input} readOnly />
                  </div>
                </div>

                <div className={styles.formField}>
                  <label className={styles.label}>Địa chỉ</label>
                  <div className={styles.inputWrapper}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <input type="text" value={profileData.address} className={styles.input} readOnly />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.editBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Chỉnh sửa hồ sơ
                </button>
                <button className={styles.changePasswordBtn}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
