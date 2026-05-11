import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { toPublicUser } from '../src/models/user.model.js';
import { createMemoryAuthRepository } from './helpers/memory-auth-repository.js';

test('POST /api/auth/register creates a student account with unified response', async () => {
  const response = await withExpressApp((baseUrl) =>
    fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'Password123!',
        fullName: 'Nguyễn Văn A',
        studentCode: 'SV001',
        accountType: 'university_student',
        phone: '0987654321',
        major: 'Công nghệ thông tin',
      }),
    }),
  );

  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.success, true);
  assert.equal(payload.message, 'Đăng ký thành công');
  assert.equal(payload.data.user.email, 'student@example.com');
  assert.equal(payload.data.user.role, 'student');
  assert.equal(payload.data.user.accountType, 'university_student');
  assert.equal(payload.data.user.passwordHash, undefined);
  assert.ok(payload.data.accessToken);
  assert.ok(payload.data.refreshToken);
});

test('POST /api/auth/register stores accountType and derives role for each account type', async () => {
  const cases = [
    ['university_teacher', 'teacher'],
    ['highschool_teacher', 'teacher'],
    ['highschool_student', 'student'],
    ['university_student', 'student'],
    ['guest_public', 'student'],
  ];

  for (const [accountType, expectedRole] of cases) {
    const response = await withExpressApp((baseUrl) =>
      fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${accountType}@example.com`,
          password: 'Password123!',
          fullName: 'Nguyễn Văn A',
          studentCode: `CODE-${accountType}`,
          phone: '0987654321',
          major: 'Công nghệ thông tin',
          accountType,
        }),
      }),
    );

    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.data.user.accountType, accountType);
    assert.equal(payload.data.user.role, expectedRole);
  }
});

test('POST /api/auth/register allows public guest accounts without studentCode', async () => {
  const response = await withExpressApp((baseUrl) =>
    fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'guest@example.com',
        password: 'Password123!',
        fullName: 'Khách tham quan',
        accountType: 'guest_public',
        major: 'Tìm hiểu trường',
      }),
    }),
  );

  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.data.user.email, 'guest@example.com');
  assert.equal(payload.data.user.accountType, 'guest_public');
  assert.equal(payload.data.user.role, 'student');
});

test('POST /api/auth/register rejects an unsupported accountType', async () => {
  const response = await withExpressApp((baseUrl) =>
    fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bad-type@example.com',
        password: 'Password123!',
        fullName: 'Nguyễn Văn A',
        studentCode: 'SV-BAD',
        accountType: 'parent',
      }),
    }),
  );

  const payload = await response.json();

  assert.equal(response.status, 422);
  assert.equal(payload.success, false);
  assert.ok(payload.errors.some((error) => error.field === 'accountType'));
});

test('public user response falls back to university_student for legacy users', () => {
  const legacyUser = {
    id: 'legacy-user',
    email: 'legacy@example.com',
    fullName: 'Legacy Student',
    role: 'student',
    status: 'active',
    createdAt: '2026-04-29T00:00:00.000Z',
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  assert.equal(toPublicUser(legacyUser).accountType, 'university_student');
});

test('POST /api/auth/register returns validation errors for invalid input', async () => {
  const response = await withExpressApp((baseUrl) =>
    fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    }),
  );

  const payload = await response.json();

  assert.equal(response.status, 422);
  assert.equal(payload.success, false);
  assert.equal(payload.message, 'Dữ liệu không hợp lệ');
  assert.ok(payload.errors.some((error) => error.field === 'email'));
  assert.ok(payload.errors.some((error) => error.field === 'password'));
});

test('POST /api/auth/login issues tokens for valid credentials', async () => {
  const response = await withExpressApp(async (baseUrl) => {
    await registerStudent(baseUrl);

    return fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@example.com', password: 'Password123!' }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.user.email, 'student@example.com');
  assert.ok(payload.data.accessToken);
  assert.ok(payload.data.refreshToken);
});

test('PUT /api/auth/change-password requires a valid JWT and changes credentials', async () => {
  const response = await withExpressApp(async (baseUrl) => {
    const registerPayload = await registerStudent(baseUrl);

    return fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${registerPayload.data.accessToken}`,
      },
      body: JSON.stringify({ oldPassword: 'Password123!', newPassword: 'NewPassword123!' }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.message, 'Đổi mật khẩu thành công');
});

async function registerStudent(baseUrl) {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@example.com',
      password: 'Password123!',
      fullName: 'Nguyễn Văn A',
      studentCode: 'SV001',
      accountType: 'university_student',
      phone: '0987654321',
      major: 'Công nghệ thông tin',
    }),
  });

  assert.equal(response.status, 201);
  return response.json();
}

async function withExpressApp(run) {
  const authRepository = createMemoryAuthRepository();
  const app = createApp({ authRepository });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await run(baseUrl);
  } finally {
    server.close();
    await once(server, 'close');
  }
}
