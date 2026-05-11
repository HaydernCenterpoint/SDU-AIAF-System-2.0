import { randomUUID } from 'node:crypto';

export const REMINDER_TYPES = new Set(['assignment_deadline', 'study_time', 'exam', 'task', 'sleep', 'water', 'workout', 'meal', 'custom']);
export const REPEAT_TYPES = new Set(['none', 'daily', 'weekly', 'monthly']);

export function createDefaultNotificationData() {
  return {
    notifications: [],
    pushTokens: [],
  };
}

export function ensureNotificationData(userData) {
  if (!Array.isArray(userData.reminders)) userData.reminders = [];
  if (!Array.isArray(userData.notifications)) userData.notifications = [];
  if (!Array.isArray(userData.pushTokens)) userData.pushTokens = [];
  userData.reminders = userData.reminders.map(normalizeReminder);
  return userData;
}

export function createReminder(userId, body = {}) {
  const now = new Date().toISOString();
  const type = REMINDER_TYPES.has(body.type) ? body.type : 'custom';
  const repeatType = REPEAT_TYPES.has(body.repeat_type || body.repeatType) ? (body.repeat_type || body.repeatType) : 'none';
  const remindAt = body.remind_at || body.remindAt || body.dueDate || now;

  return {
    id: body.id || randomUUID(),
    user_id: userId,
    title: String(body.title || '').trim(),
    content: String(body.content || body.title || '').trim(),
    type,
    remind_at: new Date(remindAt).toISOString(),
    repeat_type: repeatType,
    status: body.status || 'active',
    is_sent: Boolean(body.is_sent || body.isSent || false),
    created_at: body.created_at || body.createdAt || now,
    updated_at: now,
    done: Boolean(body.done || false),
    dueDate: body.dueDate || body.remind_at || body.remindAt || remindAt,
  };
}

export function updateReminder(reminder, body = {}) {
  if (body.title !== undefined) reminder.title = String(body.title).trim();
  if (body.content !== undefined) reminder.content = String(body.content).trim();
  if (body.type !== undefined && REMINDER_TYPES.has(body.type)) reminder.type = body.type;
  if (body.remind_at !== undefined || body.remindAt !== undefined || body.dueDate !== undefined) {
    reminder.remind_at = new Date(body.remind_at || body.remindAt || body.dueDate).toISOString();
    reminder.dueDate = body.dueDate || reminder.remind_at;
    reminder.is_sent = false;
  }
  if (body.repeat_type !== undefined || body.repeatType !== undefined) {
    const repeatType = body.repeat_type || body.repeatType;
    if (REPEAT_TYPES.has(repeatType)) reminder.repeat_type = repeatType;
  }
  if (body.status !== undefined) reminder.status = body.status;
  if (body.is_sent !== undefined || body.isSent !== undefined) reminder.is_sent = Boolean(body.is_sent ?? body.isSent);
  if (body.done !== undefined) reminder.done = Boolean(body.done);
  reminder.updated_at = new Date().toISOString();
  return reminder;
}

export async function runDueReminderJob(userData, { now = new Date(), pushNotifier } = {}) {
  ensureNotificationData(userData);
  const createdNotifications = [];

  for (const reminder of userData.reminders) {
    if (reminder.status !== 'active' || reminder.is_sent) continue;
    if (new Date(reminder.remind_at).getTime() > now.getTime()) continue;

    const notification = createNotificationFromReminder(reminder);
    userData.notifications.unshift(notification);
    createdNotifications.push(notification);

    for (const token of userData.pushTokens) {
      await pushNotifier?.({ token, title: notification.title, body: notification.content, data: { reminderId: reminder.id, notificationId: notification.id } });
    }

    advanceReminder(reminder);
  }

  return { created: createdNotifications.length, notifications: createdNotifications };
}

export function markNotificationRead(userData, id) {
  const notification = userData.notifications.find((item) => item.id === id);
  if (!notification) return null;
  notification.is_read = true;
  notification.read_at = new Date().toISOString();
  return notification;
}

export function registerPushToken(userData, token) {
  ensureNotificationData(userData);
  if (token && !userData.pushTokens.includes(token)) userData.pushTokens.push(token);
  return userData.pushTokens;
}

function normalizeReminder(reminder) {
  if (reminder.remind_at) return reminder;
  return createReminder(reminder.user_id || 'legacy-user', {
    ...reminder,
    content: reminder.content || reminder.title,
    remind_at: reminder.dueDate || new Date().toISOString(),
    type: reminder.type || 'custom',
    status: reminder.done ? 'completed' : 'active',
    is_sent: reminder.is_sent || false,
  });
}

function createNotificationFromReminder(reminder) {
  const titlePrefix = reminder.type === 'task' ? 'Task quá hạn' : reminder.type === 'assignment_deadline' ? 'Deadline gần đến' : 'Nhắc nhở';
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    user_id: reminder.user_id,
    reminder_id: reminder.id,
    title: `${titlePrefix}: ${reminder.title}`,
    content: reminder.content || reminder.title,
    type: reminder.type,
    is_read: false,
    created_at: now,
    read_at: null,
  };
}

function advanceReminder(reminder) {
  if (reminder.repeat_type === 'none') {
    reminder.is_sent = true;
    reminder.status = reminder.status === 'active' ? 'sent' : reminder.status;
    reminder.updated_at = new Date().toISOString();
    return;
  }

  const next = new Date(reminder.remind_at);
  if (reminder.repeat_type === 'daily') next.setDate(next.getDate() + 1);
  if (reminder.repeat_type === 'weekly') next.setDate(next.getDate() + 7);
  if (reminder.repeat_type === 'monthly') next.setMonth(next.getMonth() + 1);
  reminder.remind_at = next.toISOString();
  reminder.dueDate = reminder.remind_at;
  reminder.is_sent = false;
  reminder.updated_at = new Date().toISOString();
}
