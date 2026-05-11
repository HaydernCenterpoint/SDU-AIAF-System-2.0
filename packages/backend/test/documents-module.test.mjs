import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync } from 'node:fs';
import { chdir, cwd } from 'node:process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const { createAppServer } = await import('../src/app.mjs');

test('POST /api/documents on the runtime server accepts authenticated multipart uploads with document metadata', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'DOCMOD001');
    const form = new FormData();
    form.set('title', 'Tài liệu hệ điều hành');
    form.set('description', 'Ôn tập giữa kỳ');
    form.set('tags', 'Hệ điều hành, OS');
    form.set('file', new Blob(['operating-system-pdf'], { type: 'application/pdf' }), 'he-dieu-hanh.pdf');

    return fetch(`${baseUrl}/api/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.success, true);
  assert.equal(payload.data.title, 'Tài liệu hệ điều hành');
  assert.equal(payload.data.description, 'Ôn tập giữa kỳ');
  assert.deepEqual(payload.data.tags, ['Hệ điều hành', 'OS']);
  assert.equal(payload.data.file.originalName, 'he-dieu-hanh.pdf');
  assert.equal(payload.data.file.mimeType, 'application/pdf');
  assert.equal(payload.data.file.size, 'operating-system-pdf'.length);
  assert.equal(payload.data.canManage, true);
  assert.ok(payload.data.createdAt);
  assert.ok(payload.data.updatedAt);
});

test('GET /api/documents on the runtime server returns the newest uploaded document first for the authenticated owner', async () => {
  const responses = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'DOCMOD002');

    await uploadDocument(baseUrl, token, {
      title: 'Tài liệu cũ',
      description: 'Đợt một',
      tags: 'cũ',
      fileName: 'tai-lieu-cu.pdf',
      fileContent: 'old-content',
    });

    await uploadDocument(baseUrl, token, {
      title: 'Tài liệu mới',
      description: 'Đợt hai',
      tags: 'mới',
      fileName: 'tai-lieu-moi.pdf',
      fileContent: 'new-content',
    });

    return fetch(`${baseUrl}/api/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
  const payload = await responses.json();

  assert.equal(responses.status, 200);
  assert.equal(payload.data[0].title, 'Tài liệu mới');
  assert.equal(payload.data[0].canManage, true);
  assert.equal(payload.data[0].file.originalName, 'tai-lieu-moi.pdf');
});

async function uploadDocument(baseUrl, token, options) {
  const form = new FormData();
  form.set('title', options.title);
  form.set('description', options.description || '');
  form.set('tags', options.tags || '');
  form.set(
    'file',
    new Blob([options.fileContent || 'document content'], { type: options.fileType || 'application/pdf' }),
    options.fileName,
  );

  const response = await fetch(`${baseUrl}/api/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  assert.equal(response.status, 201);
  return response;
}

async function createUserAndToken(baseUrl, studentId) {
  const password = 'secret123';
  const email = `${studentId.toLowerCase()}@saodo.edu.vn`;

  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password, email, schoolId: 'sao-do' }),
  });
  assert.equal(register.status, 200);

  const complete = await fetch(`${baseUrl}/api/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      schoolId: 'sao-do',
      fullName: `Sinh viên ${studentId}`,
      dateOfBirth: '2004-01-01',
      faculty: 'Công nghệ thông tin',
      phone: '0912345678',
    }),
  });
  assert.equal(complete.status, 200);
  const payload = await complete.json();
  return payload.token;
}

async function withServer(run) {
  const originalCwd = cwd();
  const testDir = mkdtempSync(join(tmpdir(), 'saodo-documents-runtime-'));
  process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
  process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
  chdir(testDir);

  const server = createAppServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await run(baseUrl);
  } finally {
    server.close();
    await once(server, 'close');
    chdir(originalCwd);
  }
}
