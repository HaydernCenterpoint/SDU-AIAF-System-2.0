'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import styles from './NtdSidebar.module.css';

type NavItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: 'home', path: '/ntd/dashboard' },
  { id: 'schedule', label: 'Lịch học', icon: 'calendar', path: '/ntd/schedule' },
  { id: 'assignments', label: 'Bài tập', icon: 'clipboard', path: '/ntd/assignments' },
  { id: 'chat', label: 'Trò chuyện AI', icon: 'message', path: '/ntd/chat' },
  { id: 'community', label: 'Cộng đồng', icon: 'users', path: '/ntd/community', badge: 5 },
  { id: 'notifications', label: 'Thông báo', icon: 'bell', path: '/ntd/notifications', badge: 3 },
  { id: 'profile', label: 'Hồ sơ', icon: 'user', path: '/ntd/profile' },
];

const icons: Record<string, React.JSX.Element> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  message: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

interface NtdSidebarProps {
  activeItem?: string;
}

export function NtdSidebar({ activeItem = 'dashboard' }: NtdSidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout('ntd', '/ntd/login');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4L4 14v20l20 10 20-10V14L24 4z" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M24 24v20M4 14l20 10 20-10" stroke="currentColor" strokeWidth="2"/>
            <circle cx="24" cy="14" r="4" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>NTD</span>
          <span className={styles.logoSubtitle}>Nguyễn Thị Duệ</span>
        </div>
      </div>

      {/* User Info */}
      <div className={styles.userCard}>
        <div className={styles.avatar}>
          {user?.fullName?.charAt(0) || 'H'}
        </div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{user?.fullName || 'Học sinh'}</p>
          <p className={styles.userRole}>
            {user?.role === 'admin' ? 'Ban giám hiệu' : 'Học sinh'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <p className={styles.navLabel}>Menu</p>
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`${styles.navItem} ${activeItem === item.id ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{icons[item.icon]}</span>
              <span className={styles.navText}>{item.label}</span>
              {item.badge && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.navSection}>
          <p className={styles.navLabel}>Cá nhân</p>
          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`${styles.navItem} ${activeItem === item.id ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{icons[item.icon]}</span>
              <span className={styles.navText}>{item.label}</span>
              {item.badge && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.navIcon}>{icons.logout}</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
