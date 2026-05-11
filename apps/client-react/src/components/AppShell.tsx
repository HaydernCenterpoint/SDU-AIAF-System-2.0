'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AICompanionWidget } from '@/components/AICompanionWidget';
import { ChatPage } from '@/components/pages/ChatPage';
import { CommunityPage } from '@/components/pages/CommunityPage';
import { CoursesPage } from '@/components/pages/CoursesPage';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { DocumentsPage } from '@/components/pages/DocumentsPage';
import { GradesPage } from '@/components/pages/GradesPage';
import { HealthDashboardPage } from '@/components/pages/HealthDashboardPage';
import { NtdCommunityPage } from '@/components/pages/NtdCommunityPage';
import { NtdDashboardPage } from '@/components/pages/NtdDashboardPage';
import { NtdDocumentsPage } from '@/components/pages/NtdDocumentsPage';
import { NtdRemindersPage } from '@/components/pages/NtdRemindersPage';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { RemindersPage } from '@/components/pages/RemindersPage';
import { SchedulePage } from '@/components/pages/SchedulePage';
import { StatisticsDashboardPage } from '@/components/pages/StatisticsDashboardPage';
import { UnifiedCommunityPage } from '@/components/pages/UnifiedCommunityPage';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { schoolConfigs } from '@/lib/school-config';
import {
  getSchoolDashboardPath,
  getSchoolCvPath,
  getSchoolGatewayPath,
  getSchoolProfilePath,
  type SchoolSlug,
} from '@/lib/school-site';
import type { AppTab } from '@/types';

type NavGroup = 'Học tập' | 'Cộng đồng' | 'Sức khỏe';

type NavItem = {
  id: AppTab | 'profile';
  label: string;
  short: string;
  icon: string;
  group: NavGroup;
};

function getNavItems(school: SchoolSlug): NavItem[] {
  const common: NavItem[] = [
    { id: 'dashboard', label: 'Tổng quan', short: 'Nhà', group: 'Học tập', icon: 'M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5M9 20v-6h6v6' },
    { id: 'schedule', label: school === 'ntd' ? 'Lịch học' : 'Học tập', short: 'Học', group: 'Học tập', icon: 'M8 3v4m8-4v4M4 9h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2' },
    { id: 'documents', label: school === 'ntd' ? 'Tài liệu' : 'Tài liệu AI', short: 'Tệp', group: 'Học tập', icon: 'M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z' },
    { id: 'chat', label: 'Chat AI', short: 'AI', group: 'Học tập', icon: 'M21 15a4 4 0 0 1-4 4H8l-5 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z' },
    { id: 'reminders', label: 'Lịch & Nhắc nhở', short: 'Nhắc', group: 'Cộng đồng', icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' },
    { id: 'notifications', label: 'Cộng đồng', short: 'Tin', group: 'Cộng đồng', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { id: 'health', label: 'Sức khỏe', short: 'Khỏe', group: 'Sức khỏe', icon: 'M12 21s-7-4.35-9.2-8.27C.75 9.07 2.75 5 6.7 5c2.08 0 3.33 1.18 5.3 3.18C13.97 6.18 15.22 5 17.3 5c3.95 0 5.95 4.07 3.9 7.73C19 16.65 12 21 12 21z' },
    { id: 'profile', label: 'Hồ sơ', short: 'Tôi', group: 'Cộng đồng', icon: 'M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
  ];

  if (school === 'ntd') {
    return [
      common[0],
      { id: 'learningspace', label: 'Không gian học tập', short: 'KGHT', group: 'Học tập', icon: 'M12 14l9-5-9-5-9 5 9 5m0 0v6.3a9 9 0 0 1-.87 4.1L12 22l-1.13-3.6a9 9 0 0 1-.87-4.1V14' },
      common[1],
      common[2],
      common[3],
      common[4],
      common[5],
      common[6],
    ];
  }

  return [
    common[0],
    common[1],
    { id: 'courses', label: 'Công việc', short: 'Việc', group: 'Cộng đồng', icon: 'M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z' },
    common[2],
    common[3],
    common[6],
    common[4],
    common[5],
    common[7],
  ];
}

function Icon({ path, className = 'h-5 w-5' }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function getRoleLabel(user: ReturnType<typeof useAuthStore.getState>['user'], school: SchoolSlug) {
  if (user?.accountType === 'guest_public') return school === 'ntd' ? 'Khách tham quan' : 'Khách dùng AI';
  if (!user) return school === 'ntd' ? 'Học sinh' : 'Sinh viên';
  if (user.role === 'admin') return school === 'ntd' ? 'Ban giám hiệu' : 'Quản trị';
  if (user.role === 'teacher') return school === 'ntd' ? 'Giáo viên THPT' : 'Giảng viên';
  if (user.accountType === 'highschool_media_student') return 'Học sinh (Truyền thông)';
  return school === 'ntd' ? 'Học sinh' : 'Sinh viên';
}

export function AppShell({
  children,
  activeNavId,
  school,
}: {
  children?: ReactNode;
  activeNavId?: NavItem['id'];
  school: SchoolSlug;
}) {
  const { currentTab, setCurrentTab } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const navItems = getNavItems(school);
  const visibleNavId = activeNavId || currentTab;
  const availableNavIds = new Set(navItems.map((item) => item.id));

  useEffect(() => {
    if (!availableNavIds.has(currentTab)) {
      setCurrentTab('dashboard');
    }
  }, [availableNavIds, currentTab, setCurrentTab]);

  const handleNav = (id: NavItem['id']) => {
    if (id === 'profile') {
      router.push(getSchoolProfilePath(school));
      return;
    }
    setCurrentTab(id);
    if (children) {
      router.push(getSchoolDashboardPath(school));
    }
  };

  const isChat = currentTab === 'chat';

  return (
    <div
      className="student-os-shell flex h-screen overflow-hidden text-slate-950"
      style={school === 'ntd' ? {
        '--ntd-primary': '#4D97FF',
        '--ntd-primary-light': '#80b3ff',
        '--ntd-primary-dark': '#0F3460',
        '--ntd-primary-soft': '#e8f4ff',
        '--ntd-accent': '#FCDC62',
        '--ntd-accent-soft': '#fffbeb',
        '--ntd-page': '#f8fafc',
        '--ntd-tint': '#eff6ff',
        '--ntd-border': '#dbeafe',
        '--primary': '#4D97FF',
        '--primary-dark': '#0F3460',
      } as React.CSSProperties : {}}
    >
      <Sidebar school={school} navItems={navItems} currentTab={visibleNavId} onNavigate={handleNav} />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          school={school}
          studentName={user?.fullName || (school === 'ntd' ? 'Học sinh NTD' : 'Minh Anh')}
          roleLabel={getRoleLabel(user, school)}
          onOpenNotifications={() => handleNav('notifications')}
          onNavigate={handleNav}
        />

        <div className={`flex-1 overflow-hidden ${isChat ? 'flex flex-col' : 'overflow-y-auto pb-24 lg:pb-0'}`}>
          {isChat ? (
            <div className="flex h-full flex-col px-4 py-4 sm:px-6 lg:px-6">
              <ChatPage school={school} />
            </div>
          ) : (
            <div className="mx-auto flex min-h-full w-full max-w-[1540px] flex-col px-4 py-5 sm:px-6 lg:px-8">
              {children || (
                <>
                  {currentTab === 'dashboard' && (school === 'ntd' ? <NtdDashboardPage /> : <DashboardPage />)}
                  {currentTab === 'learningspace' && school === 'ntd' && (
                    <div className="flex min-h-[60vh] flex-col items-center justify-center">
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                        <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-50" />
                        <svg className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                        </svg>
                      </div>
                      <h2 className="mt-6 text-xl font-bold text-slate-800">Đang trong quá trình phát triển</h2>
                      <p className="mt-2 max-w-sm text-center text-sm text-slate-400">
                        Tính năng Không gian học tập cho trường THPT Nguyễn Thị Duệ đang được xây dựng. Vui lòng quay lại sau.
                      </p>
                    </div>
                  )}
                  {currentTab === 'schedule' && <SchedulePage school={school} />}
                  {currentTab === 'documents' && (school === 'ntd' ? <NtdDocumentsPage /> : <DocumentsPage school={school} />)}
                  {currentTab === 'reminders' && (school === 'ntd' ? <NtdRemindersPage /> : <RemindersPage school={school} />)}
                  {currentTab === 'notifications' && <UnifiedCommunityPage />}
                  {currentTab === 'courses' && school === 'sdu' && <CoursesPage />}
                  {currentTab === 'grades' && <GradesPage />}
                  {currentTab === 'health' && <HealthDashboardPage />}
                  {currentTab === 'statistics' && <StatisticsDashboardPage />}
                </>
              )}
            </div>
          )}
        </div>

        <MobileNavigation school={school} navItems={navItems} currentTab={visibleNavId} onNavigate={handleNav} />
      </main>

      {!isChat && <AICompanionWidget school={school} onOpenFullChat={() => handleNav('chat')} />}
    </div>
  );
}

function Sidebar({
  school,
  navItems,
  currentTab,
  onNavigate,
}: {
  school: SchoolSlug;
  navItems: NavItem[];
  currentTab: NavItem['id'];
  onNavigate: (id: NavItem['id']) => void;
}) {
  const schoolConfig = schoolConfigs[school];
  const groups = Array.from(new Set(navItems.map((item) => item.group)));
  const sidebarItems = navItems.filter((item) => !['profile', 'health'].includes(item.id));

  return (
    <aside className="hidden w-[280px] shrink-0 border-r border-[#D7F3FF]/60 bg-white px-4 py-5 shadow-[0_8px_30px_rgba(23,132,218,0.06)] lg:flex lg:flex-col">
      <div className="p-2 text-[#112641]">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-[0_14px_26px_rgba(227,29,28,0.18)] ring-1 ring-[#F7D428]/50">
            <Image src={schoolConfig.logo} alt={`Logo ${schoolConfig.name}`} width={52} height={52} priority className="h-12 w-12 object-contain" />
          </span>
          <div>
            <h2 className="text-base font-black leading-tight text-[#1784DA]">{schoolConfig.name}</h2>
            <p className="text-sm font-bold text-[#E31D1C]">{school === 'ntd' ? 'Cổng nội bộ THPT' : 'Trợ lý AI của bạn'}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-2" aria-label="Điều hướng Student OS">
        {groups.map((group) => (
          <div key={group} className="space-y-2">
            {sidebarItems.filter((item) => item.group === group).map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`student-os-hover flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-extrabold transition ${
                    active
                      ? school === 'ntd'
                        ? 'bg-ntd-primary text-white shadow-card'
                        : 'bg-primary text-white shadow-card'
                      : school === 'ntd'
                        ? 'hover:bg-ntd-primary-soft hover:!text-ntd-primary-dark text-text-sub'
                        : 'text-text-sub hover:bg-blue-soft hover:text-blue-dark'
                  }`}
                >
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ${
                    active
                      ? school === 'ntd'
                        ? 'bg-white/22 text-white'
                        : 'bg-white/22 text-white'
                      : school === 'ntd'
                        ? 'bg-white text-ntd-primary shadow-sm'
                        : 'bg-white text-[#1784DA] shadow-sm'
                  }`}>
                    <Icon path={item.icon} />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-5 academic-card-quiet p-4 text-left">
        <p className="academic-section-eyebrow">Hôm nay</p>
        <p className="mt-2 text-sm font-bold leading-6 text-text-sub">
          {school === 'ntd'
            ? 'Mở Tổng quan để xem lịch học, cộng đồng và nhắc nhở của trường.'
            : 'Mở Dashboard để xem lịch học, tài liệu và gợi ý AI mới nhất.'}
        </p>
      </div>
    </aside>
  );
}

function Topbar({
  school,
  studentName,
  roleLabel,
  onOpenNotifications,
  onNavigate,
}: {
  school: SchoolSlug;
  studentName: string;
  roleLabel: string;
  onOpenNotifications: () => void;
  onNavigate: (id: NavItem['id']) => void;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#D7F3FF]/60 bg-[#F7FCFF]/80 px-4 py-3 shadow-[0_4px_24px_rgba(23,132,218,0.06)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4">
        <div className="reference-search-bar hidden min-w-0 flex-1 justify-center lg:flex">
          <div className="flex w-full max-w-[620px] items-center gap-3 rounded-[22px] border border-[#BFEFFF] bg-white px-5 py-3 text-sm font-semibold text-[#8A9AAF] shadow-[0_12px_30px_rgba(23,132,218,0.08)]">
            <span className="text-xl text-[#0F172A]">⌕</span>
            <span className="flex-1">
              {school === 'ntd' ? 'Tìm thông báo, tài liệu, sinh hoạt lớp...' : 'Tìm kiếm tài liệu, bài tập, kỹ năng...'}
            </span>
            <span className="rounded-lg bg-[#F1F5FF] px-2 py-1 text-xs font-black text-[#64748B]">⌘ K</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown onOpenAll={onOpenNotifications} />
          <StudentMenu school={school} studentName={studentName} roleLabel={roleLabel} onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  );
}

function StudentMenu({
  school,
  studentName,
  roleLabel,
  onNavigate,
}: {
  school: SchoolSlug;
  studentName: string;
  roleLabel: string;
  onNavigate: (id: NavItem['id']) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();
  const router = useRouter();

  const choose = (id: NavItem['id']) => {
    setIsOpen(false);
    onNavigate(id);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout(school, getSchoolGatewayPath());
    router.replace(getSchoolGatewayPath());
  };

  return (
    <div className="relative hidden pl-3 sm:block">
      <button onClick={() => setIsOpen((value) => !value)} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/70" aria-expanded={isOpen} aria-haspopup="menu">
        <div className="h-11 w-11 rounded-full bg-[radial-gradient(circle_at_50%_28%,#F8D2BF_0_24%,#111827_25%_46%,#DBEAFE_47%)] shadow-sm" />
        <div>
          <p className="text-sm font-black text-[#112641]">{studentName}</p>
          <p className="text-xs font-semibold text-[#64748B]">{roleLabel}</p>
        </div>
        <span className={`text-[#112641] transition ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-3xl border border-[#D8E3FF] bg-white p-2 shadow-[0_18px_48px_rgba(37,99,235,0.18)]" role="menu">
          <button onClick={() => choose('profile')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#334155] transition hover:bg-[#E9F9FF] hover:text-[#1784DA]" role="menuitem">
            <Icon path="M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
            Hồ sơ
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              router.push(getSchoolCvPath(school));
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#334155] transition hover:bg-[#E9F9FF] hover:text-[#1784DA]"
            role="menuitem"
          >
            <Icon path="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM14 3v5h5M9 13h6M9 17h6M9 9h2" />
            CV của bạn
          </button>
          <button onClick={() => choose('health')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#334155] transition hover:bg-[#E9F9FF] hover:text-[#1784DA]" role="menuitem">
            <Icon path="M12 21s-7-4.35-9.2-8.27C.75 9.07 2.75 5 6.7 5c2.08 0 3.33 1.18 5.3 3.18C13.97 6.18 15.22 5 17.3 5c3.95 0 5.95 4.07 3.9 7.73C19 16.65 12 21 12 21z" />
            Sức khỏe
          </button>
          <div className="my-1 h-px bg-[#E6EEFF]" />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#E31D1C] transition hover:bg-[#FFF0F0]" role="menuitem">
            <Icon path="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

function MobileNavigation({
  school,
  navItems,
  currentTab,
  onNavigate,
}: {
  school: SchoolSlug;
  navItems: NavItem[];
  currentTab: NavItem['id'];
  onNavigate: (id: NavItem['id']) => void;
}) {
  const mobileItems = navItems.filter((item) => ['dashboard', 'schedule', 'chat', 'documents', 'reminders'].includes(item.id));

  return (
    <nav className={`fixed inset-x-0 bottom-0 z-30 border-t bg-white px-2 pb-2 pt-2 shadow-card lg:hidden ${school === 'ntd' ? 'border-[#dbeafe]' : 'border-border'}`} aria-label="Điều hướng dưới">
      <div className="grid grid-cols-5 gap-1">
        {mobileItems.map((item) => {
          const active = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-extrabold transition ${
                active
                  ? school === 'ntd'
                    ? 'bg-ntd-primary text-white shadow-card'
                    : 'bg-primary text-white shadow-card'
                  : school === 'ntd'
                    ? 'hover:bg-ntd-primary-soft hover:!text-ntd-primary-dark text-text-muted'
                    : 'text-text-muted hover:bg-blue-soft hover:text-blue-dark'
              }`}
              aria-label={item.label}
            >
              <Icon path={item.icon} />
              <span>{item.short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
