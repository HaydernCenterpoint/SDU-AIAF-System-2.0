'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';
const composerFieldClassName =
  'h-14 w-full rounded-full border border-border bg-surface-alt px-5 text-sm font-semibold text-text outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/10';
const composerSelectClassName = `${composerFieldClassName} appearance-none pr-12 font-bold`;

interface Reminder {
  id: string;
  title: string;
  content?: string;
  type?: string;
  remind_at?: string;
  repeat_type?: string;
  status?: string;
  dueDate: string;
  done: boolean;
}

const reminderTypeOptions = [
  { value: 'assignment_deadline', label: 'Hạn nộp bài' },
  { value: 'study_time', label: 'Giờ tự học' },
  { value: 'exam', label: 'Lịch kiểm tra' },
  { value: 'task', label: 'Việc cần làm' },
  { value: 'sleep', label: 'Giờ đi ngủ' },
  { value: 'water', label: 'Uống nước' },
  { value: 'workout', label: 'Tập luyện' },
  { value: 'meal', label: 'Bữa ăn' },
  { value: 'custom', label: 'Tùy chọn khác' },
] as const;

const repeatTypeOptions = [
  { value: 'none', label: 'Không lặp' },
  { value: 'daily', label: 'Hằng ngày' },
  { value: 'weekly', label: 'Hằng tuần' },
  { value: 'monthly', label: 'Hằng tháng' },
] as const;

export function RemindersPage(_props?: { school?: 'ntd' | 'sdu' }) {
  const { token } = useAuthStore();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('custom');
  const [newRepeatType, setNewRepeatType] = useState('none');
  const [newDueDate, setNewDueDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/reminders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setReminders(data.reminders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const addReminder = async () => {
    if (!token || !newTitle.trim()) return;
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle, content: newTitle, type: newType, remind_at: newDueDate || new Date().toISOString(), repeat_type: newRepeatType }),
    });
    if (res.ok) {
      const data = await res.json();
      setReminders([...reminders, data.reminder]);
      setNewTitle('');
      setNewDueDate('');
    }
  };

  const toggleDone = async (reminder: Reminder) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/reminders/${reminder.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ done: !reminder.done }),
    });
    if (res.ok) {
      const data = await res.json();
      setReminders(reminders.map((r) => (r.id === reminder.id ? data.reminder : r)));
    }
  };

  const deleteReminder = async (id: string) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setReminders(reminders.filter((r) => r.id !== id));
    }
  };

  const pending = reminders.filter((r) => !r.done);
  const done = reminders.filter((r) => r.done);

  return (
    <section className="space-y-5">
      <header className="animate-enter rounded-2xl border border-blue-border bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Thông báo</p>
        <h1 className="mt-1 text-2xl font-black text-text">Quản lý nhắc nhở</h1>
        <p className="mt-2 text-sm leading-6 text-text-sub">Tạo nhắc nhở cho bài tập, lịch nộp và chuẩn bị trước giờ học.</p>
      </header>

      <section className="animate-enter rounded-2xl border border-border bg-white p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_180px_170px_auto]">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nội dung thông báo hoặc nhắc nhở..."
            aria-label="Nội dung nhắc nhở"
            className={composerFieldClassName}
          />
          <input
            type="datetime-local"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            aria-label="Thời gian nhắc"
            className={composerFieldClassName}
          />
          <SelectField ariaLabel="Loại nhắc nhở" value={newType} onChange={setNewType}>
            {reminderTypeOptions.map((typeOption) => (
              <option key={typeOption.value} value={typeOption.value}>
                {typeOption.label}
              </option>
            ))}
          </SelectField>
          <SelectField ariaLabel="Chu kỳ lặp" value={newRepeatType} onChange={setNewRepeatType}>
            {repeatTypeOptions.map((repeatOption) => (
              <option key={repeatOption.value} value={repeatOption.value}>
                {repeatOption.label}
              </option>
            ))}
          </SelectField>
          <button
            onClick={addReminder}
            disabled={!newTitle.trim()}
            className="pressable brand-gradient-red h-14 rounded-full px-6 text-sm font-extrabold text-white shadow-card disabled:opacity-45"
          >
            Thêm
          </button>
        </div>
      </section>

      {loading ? (
        <Loading />
      ) : reminders.length === 0 ? (
        <Empty text="Chưa có nhắc nhở nào." />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <ReminderList title={`Chưa hoàn thành (${pending.length})`} reminders={pending} onToggle={toggleDone} onDelete={deleteReminder} />
          <ReminderList title={`Đã hoàn thành (${done.length})`} reminders={done} onToggle={toggleDone} onDelete={deleteReminder} muted />
        </div>
      )}
    </section>
  );
}

function SelectField({
  ariaLabel,
  value,
  onChange,
  children,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={composerSelectClassName}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ReminderList({
  title,
  reminders,
  muted = false,
  onToggle,
  onDelete,
}: {
  title: string;
  reminders: Reminder[];
  muted?: boolean;
  onToggle: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="animate-enter rounded-2xl border border-border bg-white p-5 shadow-card">
      <h2 className="text-lg font-black text-text">{title}</h2>
      <div className="mt-4 space-y-2">
        {reminders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface-alt p-4 text-sm font-semibold text-text-muted">
            Không có mục nào.
          </p>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="interactive-card flex items-start gap-3 rounded-2xl border border-border bg-surface-alt p-3">
              <button
                onClick={() => onToggle(reminder)}
                className={`pressable mt-0.5 h-5 w-5 shrink-0 rounded-lg border-2 ${
                  reminder.done ? 'border-blue bg-blue' : 'border-blue bg-white'
                }`}
                aria-label={reminder.done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold ${muted ? 'text-text-muted line-through' : 'text-text'}`}>{reminder.title}</p>
                {reminder.dueDate && (
                  <p className="mt-1 text-xs font-semibold text-text-muted">
                    Hạn: {new Date(reminder.dueDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
              <button onClick={() => onDelete(reminder.id)} className="pressable rounded-xl px-2 py-1 text-sm font-bold text-text-muted hover:bg-primary-soft hover:text-primary">
                Xóa
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function Loading() {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-card">
      <div className="mx-auto flex w-max gap-2">
        <span className="loading-dot h-2.5 w-2.5 rounded-full bg-blue" />
        <span className="loading-dot h-2.5 w-2.5 rounded-full bg-primary [animation-delay:120ms]" />
        <span className="loading-dot h-2.5 w-2.5 rounded-full bg-accent [animation-delay:240ms]" />
      </div>
      <p className="mt-3 text-sm font-semibold text-text-muted">Đang tải nhắc nhở...</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm font-semibold text-text-muted shadow-card">
      {text}
    </div>
  );
}
