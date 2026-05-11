import * as Notifications from 'expo-notifications';
import { apiClient } from './api-client';

export type ReminderPayload = {
  title: string;
  content?: string;
  type: 'assignment_deadline' | 'study_time' | 'exam' | 'task' | 'sleep' | 'water' | 'workout' | 'meal' | 'custom';
  remind_at: string;
  repeat_type: 'none' | 'daily' | 'weekly' | 'monthly';
};

export const notificationApi = {
  listReminders: () => apiClient.get('reminders'),
  createReminder: (payload: ReminderPayload) => apiClient.post('reminders', payload),
  listNotifications: () => apiClient.get('notifications'),
  markNotificationRead: (id: string) => apiClient.put(`notifications/${id}/read`),
  registerPushToken: (token: string) => apiClient.post('notifications/push-token', { token }),
};

export async function registerForPushNotifications() {
  const permissions = await Notifications.requestPermissionsAsync();
  if (!permissions.granted) return null;
  const token = await Notifications.getExpoPushTokenAsync();
  await notificationApi.registerPushToken(token.data);
  return token.data;
}

export async function scheduleLocalReminder(title: string, body: string, seconds = 2) {
  // Local notification fallback for reminders when push delivery is unavailable.
  return Notifications.scheduleNotificationAsync({
    content: { title, body, data: { source: 'Local notification' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
  });
}
