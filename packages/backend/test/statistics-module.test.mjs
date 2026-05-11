import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-statistics-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');

test('statistics APIs return dashboard, study, task, health, and finance chart data with period filter', async () => {
  await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'ST001');
    const auth = { Authorization: `Bearer ${token}` };
    const upcomingReminderAt = offsetIsoDate(2);
    const overdueReminderAt = offsetIsoDate(-30);
    const recentWeightLogAt = offsetIsoDate(-7);
    const recentHealthDate = offsetDateLabel(-8);

    await jsonFetch(baseUrl, '/api/health/profile', { method: 'PUT', headers: auth, body: { heightCm: 170 } });
    await jsonFetch(baseUrl, '/api/health/weight-logs', { method: 'POST', headers: auth, body: { weightKg: 72, loggedAt: recentWeightLogAt } });
    await jsonFetch(baseUrl, '/api/health/sleep-logs', { method: 'POST', headers: auth, body: { sleepDate: recentHealthDate, durationHours: 6.5 } });
    await jsonFetch(baseUrl, '/api/health/meal-logs', { method: 'POST', headers: auth, body: { mealDate: recentHealthDate, mealType: 'lunch', calories: 650 } });
    await jsonFetch(baseUrl, '/api/health/workout-logs', { method: 'POST', headers: auth, body: { workoutDate: recentHealthDate, workoutType: 'walk', durationMinutes: 30 } });
    await jsonFetch(baseUrl, '/api/health/mood-logs', { method: 'POST', headers: auth, body: { moodDate: recentHealthDate, moodScore: 4 } });
    await jsonFetch(baseUrl, '/api/reminders', {
      method: 'POST',
      headers: auth,
      body: { title: 'Nộp bài tập', type: 'assignment_deadline', remind_at: upcomingReminderAt, repeat_type: 'none' },
    });
    await jsonFetch(baseUrl, '/api/reminders', {
      method: 'POST',
      headers: auth,
      body: { title: 'Task quá hạn', type: 'task', remind_at: overdueReminderAt, repeat_type: 'none' },
    });

    for (const path of ['/api/statistics/dashboard', '/api/statistics/study', '/api/statistics/tasks', '/api/statistics/health', '/api/statistics/finance']) {
      const response = await jsonFetch(baseUrl, `${path}?period=month`, { headers: auth });
      assert.equal(response.status, 200, path);
      assert.equal(response.body.period, 'month');
      assert.ok(Array.isArray(response.body.charts.line), `${path} line chart`);
      assert.ok(Array.isArray(response.body.charts.bar), `${path} bar chart`);
      assert.ok(Array.isArray(response.body.charts.pie), `${path} pie chart`);
    }

    const dashboard = await jsonFetch(baseUrl, '/api/statistics/dashboard?period=week', { headers: auth });
    assert.equal(dashboard.body.study.totalCourses, 3);
    assert.ok(dashboard.body.study.upcomingDeadlines >= 1);
    assert.ok(dashboard.body.tasks.totalTasks >= 1);
    assert.equal(dashboard.body.health.currentBmi.value, 24.91);
    assert.equal(dashboard.body.health.averageCalories, 650);
    for (const key of ['balance', 'budgetAlerts', 'budgetUsedPercent', 'expenseByCategory', 'totalExpense', 'totalIncome']) {
      assert.ok(key in dashboard.body.finance);
    }
    assert.ok(Array.isArray(dashboard.body.calendarHeatmap));
  });
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

async function withServer(run) {
  const server = createAppServer();
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

function offsetIsoDate(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(10, 0, 0, 0);
  return date.toISOString();
}

function offsetDateLabel(days) {
  return offsetIsoDate(days).slice(0, 10);
}
