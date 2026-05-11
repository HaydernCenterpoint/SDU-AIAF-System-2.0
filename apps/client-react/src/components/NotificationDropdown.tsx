'use client';

import { useEffect, useState } from 'react';
import { notificationApi } from '@/lib/notification-api';

type NotificationItem = {
  id: string;
  title: string;
  content?: string;
  is_read?: boolean;
  created_at?: string;
};

export function NotificationDropdown({ onOpenAll }: { onOpenAll: () => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationApi.listNotifications()
      .then((result) => {
        const data = result.data as { notifications?: NotificationItem[]; unreadCount?: number };
        setItems(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => undefined);
  }, []);

  async function markNotificationRead(id: string) {
    await notificationApi.markNotificationRead(id).catch(() => undefined);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="pressable relative rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-black text-text shadow-card">
        Thông báo
        {unreadCount > 0 ? <span className="badge absolute -right-2 -top-2 rounded-full bg-primary px-2 py-0.5 text-xs font-black text-white">{unreadCount}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-40 w-80 rounded-3xl border border-border bg-white p-3 shadow-soft">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-sm font-black text-text">Notification dropdown</p>
            <button onClick={onOpenAll} className="text-xs font-black text-blue-dark">Xem tất cả</button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="rounded-2xl bg-surface-alt p-4 text-sm font-semibold text-text-muted">Chưa có thông báo mới.</p>
            ) : (
              items.slice(0, 5).map((item) => (
                <button key={item.id} onClick={() => markNotificationRead(item.id)} className="w-full rounded-2xl border border-border bg-surface-alt p-3 text-left hover:bg-blue-soft">
                  <p className="text-sm font-black text-text">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-text-muted">{item.content || 'Đánh dấu đã đọc'}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
