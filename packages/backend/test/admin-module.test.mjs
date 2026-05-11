import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { appendFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-admin-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AI_LOG_PATH = join(testDir, 'ai-queries.jsonl');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');
const { hashPassword, loadDb, saveDb } = await import('../src/auth.mjs');

test('admin APIs require admin role and support users, stats, AI logs, and audit logs', async () => {
  appendFileSync(process.env.SAODO_AI_LOG_PATH, `${JSON.stringify({ userId: 'user-student', assistantType: 'study', message: 'Hỏi AI', createdAt: '2026-04-28T10:00:00.000Z' })}\n`);

  await withServer(async (baseUrl) => {
    const userToken = await createUserAndToken(baseUrl, 'US001');
    seedAdmin();
    const adminLogin = await jsonFetch(baseUrl, '/api/auth/login', { method: 'POST', body: { studentId: 'ADMIN', password: 'admin123' } });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.body.user.role, 'admin');
    const adminAuth = { Authorization: `Bearer ${adminLogin.body.token}` };

    const forbidden = await jsonFetch(baseUrl, '/api/admin/users', { headers: { Authorization: `Bearer ${userToken}` } });
    assert.equal(forbidden.status, 403);

    const users = await jsonFetch(baseUrl, '/api/admin/users?search=US001', { headers: adminAuth });
    assert.equal(users.status, 200);
    assert.ok(users.body.users.some((user) => user.studentId === 'US001'));

    const student = users.body.users.find((user) => user.studentId === 'US001');
    const locked = await jsonFetch(baseUrl, `/api/admin/users/${student.id}/status`, { method: 'PUT', headers: adminAuth, body: { status: 'locked' } });
    assert.equal(locked.status, 200);
    assert.equal(locked.body.user.status, 'locked');

    const lockedLogin = await jsonFetch(baseUrl, '/api/auth/login', { method: 'POST', body: { studentId: 'US001', password: 'secret123' } });
    assert.equal(lockedLogin.status, 403);

    const detail = await jsonFetch(baseUrl, `/api/admin/users/${student.id}`, { headers: adminAuth });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.user.id, student.id);

    const stats = await jsonFetch(baseUrl, '/api/admin/statistics', { headers: adminAuth });
    assert.equal(stats.status, 200);
    assert.ok(stats.body.statistics.totalUsers >= 2);
    assert.ok('aiUsage' in stats.body.statistics);

    const aiLogs = await jsonFetch(baseUrl, '/api/admin/ai-logs', { headers: adminAuth });
    assert.equal(aiLogs.status, 200);
    assert.equal(aiLogs.body.logs[0].assistantType, 'study');

    const adminLogs = await jsonFetch(baseUrl, '/api/admin/logs', { headers: adminAuth });
    assert.equal(adminLogs.status, 200);
    assert.ok(adminLogs.body.logs.some((log) => log.action === 'lock_user'));
  });
});

function seedAdmin() {
  const db = loadDb();
  db.users.push({
    id: 'admin-user',
    studentId: 'ADMIN',
    password: hashPassword('admin123'),
    email: 'admin@saodo.edu.vn',
    fullName: 'Quản trị viên',
    faculty: 'Admin',
    phone: '0900000000',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    profileComplete: true,
  });
  saveDb(db);
}

async function createUserAndToken(baseUrl, studentId) {
  const email = `${studentId.toLowerCase()}@saodo.edu.vn`;
  const password = 'secret123';
  const register = await fetch(`${baseUrl}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, password, email }) });
  assert.equal(register.status, 200);
  const complete = await fetch(`${baseUrl}/api/auth/complete-profile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId, fullName: `Sinh viên ${studentId}`, dateOfBirth: '2004-01-01', faculty: 'Công nghệ thông tin', phone: '0912345678' }) });
  assert.equal(complete.status, 200);
  const payload = await complete.json();
  return payload.token;
}

async function jsonFetch(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, { method: options.method || 'GET', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, body: options.body ? JSON.stringify(options.body) : undefined });
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
