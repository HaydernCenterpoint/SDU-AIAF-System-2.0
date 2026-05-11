import { apiGet, apiPost, apiPut } from '@/lib/api-client';

export type ReminderPayload = {
  title: string;
  content?: string;
  type: 'assignment_deadline' | 'study_time' | 'exam' | 'task' | 'sleep' | 'water' | 'workout' | 'meal' | 'custom';
  remind_at: string;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly';
};

export const notificationApi = {
  listReminders: () => apiGet('reminders'),
  createReminder: (payload: ReminderPayload) => apiPost('reminders', payload),
  updateReminder: (id: string, payload: Partial<ReminderPayload> & { done?: boolean }) => apiPut(`reminders/${id}`, payload),
  listNotifications: () => apiGet('notifications'),
  markNotificationRead: (id: string) => apiPut(`notifications/${id}/read`),
  registerPushToken: (token: string) => apiPost('notifications/push-token', { token }),
};
