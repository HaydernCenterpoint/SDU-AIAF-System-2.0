'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandMark } from '@/components/BrandMark';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { schoolConfigs } from '@/lib/school-config';
import { getSchoolGatewayPath, getSchoolProfilePath, resolveSchoolSlugFromBackendId } from '@/lib/school-site';
import type { AppTab } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

const tabs: { id: AppTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Trang chủ', icon: 'M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5M9 20v-6h6v6' },
  { id: 'reminders', label: 'Thông báo', icon: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' },
  { id: 'schedule', label: 'Lịch học', icon: 'M8 3v4m8-4v4M4 9h16M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2' },
  { id: 'documents', label: 'Tài liệu', icon: 'M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z' },
  { id: 'chat', label: 'Trợ lý AI', icon: 'M7 8h10M7 12h6m-8 8l4-4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4' },
];

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

function formatConversationTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export function ConversationSidebar() {
  const { conversations, activeConversationId, setActiveConversation, currentTab, setCurrentTab } = useAppStore();
  const { token, user: authUser, logout } = useAuthStore();
  const router = useRouter();
  const currentSchool = resolveSchoolSlugFromBackendId(authUser?.schoolId);
  const schoolConfig = schoolConfigs[currentSchool];

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          useAppStore.setState({ conversations: data.conversations });
        }
      })
      .catch(() => {});
  }, [token]);

  const handleNewConversation = async () => {
    if (!token) {
      setActiveConversation('new');
      setCurrentTab('chat');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: 'Cuộc trò chuyện mới' }),
      });
      if (res.ok) {
        const data = await res.json();
        useAppStore.setState((state) => ({
          conversations: [data.conversation, ...state.conversations],
          conversationDetails: {
            ...state.conversationDetails,
            [data.conversation.id]: {
              id: data.conversation.id,
              title: data.conversation.title,
              updatedAt: data.conversation.updatedAt,
              messages: [],
            },
          },
        }));
        setActiveConversation(data.conversation.id);
      } else {
        setActiveConversation('new');
      }
    } catch {
      setActiveConversation('new');
    }
    setCurrentTab('chat');
  };

  const handleLogout = () => {
    logout(currentSchool, getSchoolGatewayPath());
    router.replace(getSchoolGatewayPath());
  };

  return (
    <aside className="hidden h-full w-[316px] shrink-0 flex-col border-r border-white/10 bg-surface-navy text-white shadow-soft lg:flex">
      <div className="brand-gradient-blue p-5">
        <BrandMark tone="light" size="md" school={currentSchool} />
        <button
          onClick={handleNewConversation}
          className="pressable brand-gradient-red mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-card focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <span className="text-lg leading-none">+</span>
          Cuộc trò chuyện mới
        </button>
      </div>

      <nav className="border-b border-white/10 px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Menu chính</p>
        <div className="space-y-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`pressable flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold ${
                  isActive ? 'bg-white text-text shadow-card' : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-blue' : 'text-accent'}>
                  <Icon path={tab.icon} />
                </span>
                <span className="flex-1 text-left">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="min-h-0 flex-1 px-3 py-4">
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">Lịch sử hỏi đáp</p>
          <span className="rounded-full bg-white/12 px-2 py-0.5 text-[11px] font-semibold text-white/70">
            {conversations.length}
          </span>
        </div>
        <div className="h-full space-y-1 overflow-y-auto pr-1">
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/18 p-4 text-sm leading-5 text-white/60">
              Chưa có cuộc trò chuyện. Bắt đầu bằng một câu hỏi về lịch học hoặc tài liệu.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.id && currentTab === 'chat';
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    setCurrentTab('chat');
                  }}
                  className={`interactive-card w-full rounded-2xl px-3 py-2.5 text-left ${
                    isActive ? 'bg-blue text-white' : 'text-white/72 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">{conv.title}</span>
                    <span className="text-[11px] opacity-70">{formatConversationTime(conv.updatedAt)}</span>
                  </div>
                  <p className="mt-1 truncate text-xs opacity-70">{conv.preview || 'Chưa có nội dung'}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={() => router.push(getSchoolProfilePath(currentSchool))}
          className="pressable flex w-full items-center gap-3 rounded-2xl bg-white/[0.08] p-3 text-left hover:bg-white/[0.12]"
        >
          <div className="brand-gradient-red flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white">
            {authUser?.fullName?.charAt(0) || 'S'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{authUser?.fullName || schoolConfig.studentLabel}</p>
            <p className="truncate text-xs text-white/60">{authUser?.studentId || authUser?.faculty || schoolConfig.name}</p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="pressable mt-3 w-full rounded-2xl border border-white/14 px-3 py-2 text-sm font-semibold text-white/75 hover:border-accent hover:bg-white/10 hover:text-white"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
