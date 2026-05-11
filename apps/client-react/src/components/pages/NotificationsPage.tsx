'use client';

import { useEffect, useState } from 'react';
import { notificationApi } from '@/lib/notification-api';

type NotificationItem = { id: string; title: string; content?: string; type?: string; is_read?: boolean; created_at?: string };

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    notificationApi.listNotifications()
      .then((result) => {
        const data = result.data as { notifications?: NotificationItem[] };
        setNotifications(data.notifications || []);
      })
      .catch(() => undefined);
  }, []);

  async function markRead(id: string) {
    await notificationApi.markNotificationRead(id).catch(() => undefined);
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
  }

  return (
    <section className="space-y-5">
      <header className="rounded-3xl border border-blue-border bg-white p-6 shadow-card">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Danh sách thông báo</p>
        <h1 className="mt-2 text-3xl font-black text-text">Trung tâm thông báo</h1>
        <p className="mt-2 text-sm font-semibold text-text-muted">Deadline alert, task quá hạn, lịch học, giấc ngủ, uống nước và vận động.</p>
      </header>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-8 text-center text-sm font-bold text-text-muted shadow-card">Chưa có thông báo.</div>
        ) : (
          notifications.map((item) => (
            <article key={item.id} className="interactive-card rounded-3xl border border-border bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-dark">{item.type || 'custom'}</p>
                  <h2 className="mt-1 text-lg font-black text-text">{item.title}</h2>
                  <p className="mt-2 text-sm font-semibold text-text-muted">{item.content}</p>
                </div>
                <button onClick={() => markRead(item.id)} className="pressable rounded-2xl bg-blue-soft px-4 py-2 text-sm font-black text-blue-dark">
                  Đánh dấu đã đọc
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
