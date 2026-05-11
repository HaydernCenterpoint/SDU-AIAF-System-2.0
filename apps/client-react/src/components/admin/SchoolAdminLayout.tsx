'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SchoolConfig } from '@/lib/school-config';
import styles from './SchoolAdminLayout.module.css';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

function getNavItems(schoolId: string): NavItem[] {
  const base = `/admin/${schoolId}`;
  return [
    { label: 'Tổng quan', href: `${base}/dashboard`, icon: '📊' },
    { label: 'Quản lý học sinh', href: `${base}/students`, icon: '🎓' },
    { label: 'Quản lý giáo viên', href: `${base}/teachers`, icon: '👨‍🏫' },
  ];
}

type Props = {
  school: SchoolConfig;
  children: ReactNode;
};

export function SchoolAdminLayout({ school, children }: Props) {
  const pathname = usePathname();
  const navItems = getNavItems(school.id);

  return (
    <div
      className={styles.layout}
      style={{
        '--admin-primary': school.theme.primary,
        '--admin-primary-soft': school.theme.primarySoft,
        '--admin-primary-dark': school.theme.primaryDark,
        '--admin-accent': school.theme.accent,
        '--admin-sidebar-bg': school.theme.sidebarBg,
        '--admin-sidebar-border': school.theme.sidebarBorder,
        '--admin-gradient-from': school.theme.gradientFrom,
        '--admin-gradient-to': school.theme.gradientTo,
      } as React.CSSProperties}
    >
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <img src={school.logo} alt={`Logo ${school.shortName}`} className={styles.sidebarLogo} />
          <div>
            <p className={styles.sidebarBadge}>{school.shortName} Admin</p>
            <h1 className={styles.sidebarTitle}>Bảng quản trị</h1>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/login" className={styles.logoutBtn}>
            ← Đăng xuất
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <header className={styles.topBar}>
          <div>
            <p className={styles.topBarSchool}>{school.name}</p>
            <p className={styles.topBarSub}>Hệ thống quản trị</p>
          </div>
          <div className={styles.topBarRight}>
            <span className={styles.avatarBadge}>
              {school.shortName}
            </span>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
