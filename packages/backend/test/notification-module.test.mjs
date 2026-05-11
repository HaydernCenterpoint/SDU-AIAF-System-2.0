import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-notifications-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');

test('Prisma schema defines reminders and notifications tables', () => {
  const schema = readFileSync(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');

  for (const model of ['Reminder', 'Notification']) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  assert.match(schema, /@@map\("reminders"\)/);
  assert.match(schema, /@@map\("notifications"\)/);
  assert.match(schema, /type\s+String\s+@db\.VarChar\(40\)/);
  assert.match(schema, /repeatType\s+String\s+@default\("none"\)/);
});

test('reminder CRUD and notification read flow work with due reminder job and push hook', async () => {
  const pushed = [];
  await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'NT001');
      const auth = { Authorization: `Bearer ${token}` };

      const existingReminders = await jsonFetch(baseUrl, '/api/reminders', { headers: auth });
      assert.equal(existingReminders.status, 200);
      await Promise.all(
        existingReminders.body.reminders.map((reminder) =>
          jsonFetch(baseUrl, `/api/reminders/${reminder.id}`, { method: 'DELETE', headers: auth }),
        ),
      );

      const tokenResult = await jsonFetch(baseUrl, '/api/notifications/push-token', {
        method: 'POST',
        headers: auth,
        body: { token: 'ExpoPushToken[test-student]' },
      });
      assert.equal(tokenResult.status, 200);

      const dueAt = new Date(Date.now() - 60_000).toISOString();
      const create = await jsonFetch(baseUrl, '/api/reminders', {
        method: 'POST',
        headers: auth,
        body: {
          title: 'Nộp báo cáo AI',
          content: 'Deadline báo cáo đang đến hạn',
          type: 'assignment_deadline',
          remind_at: dueAt,
          repeat_type: 'none',
        },
      });
      assert.equal(create.status, 201);
      assert.equal(create.body.reminder.type, 'assignment_deadline');
      assert.equal(create.body.reminder.status, 'active');
      assert.equal(create.body.reminder.is_sent, false);

      const update = await jsonFetch(baseUrl, `/api/reminders/${create.body.reminder.id}`, {
        method: 'PUT',
        headers: auth,
        body: { content: 'Deadline còn rất gần' },
      });
      assert.equal(update.status, 200);
      assert.equal(update.body.reminder.content, 'Deadline còn rất gần');

      const job = await jsonFetch(baseUrl, '/api/reminders/run-due-job', { method: 'POST', headers: auth, body: {} });
      assert.equal(job.status, 200);
      assert.equal(job.body.created, 1);
      assert.equal(pushed.length, 1);
      assert.equal(pushed[0].token, 'ExpoPushToken[test-student]');
      assert.match(pushed[0].title, /Nộp báo cáo AI/);

      const notifications = await jsonFetch(baseUrl, '/api/notifications', { headers: auth });
      assert.equal(notifications.status, 200);
      assert.equal(notifications.body.unreadCount, 1);
      assert.equal(notifications.body.notifications[0].reminder_id, create.body.reminder.id);

      const read = await jsonFetch(baseUrl, `/api/notifications/${notifications.body.notifications[0].id}/read`, { method: 'PUT', headers: auth });
      assert.equal(read.status, 200);
      assert.equal(read.body.notification.is_read, true);

      const remove = await jsonFetch(baseUrl, `/api/reminders/${create.body.reminder.id}`, { method: 'DELETE', headers: auth });
      assert.equal(remove.status, 200);
    },
    {
      pushNotifier: async (message) => {
        pushed.push(message);
      },
    },
  );
});

async function createUserAndToken(baseUrl, studentId) {
  const email = `${studentId.toLowerCase()}@saodo.edu.vn`;
  const password = 'secret123';
  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password, email }),
  });
  assert.equal(register.status, 200);

  const complete = await fetch(`${baseUrl}/api/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, fullName: `Sinh viên ${studentId}`, dateOfBirth: '2004-01-01', faculty: 'Công nghệ thông tin', phone: '0912345678' }),
  });
  assert.equal(complete.status, 200);
  const payload = await complete.json();
  return payload.token;
}

async function jsonFetch(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

async function withServer(run, options = {}) {
  const server = createAppServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
}
