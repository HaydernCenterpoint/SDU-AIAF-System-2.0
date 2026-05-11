import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { createMemoryAuthRepository } from './helpers/memory-auth-repository.js';

test('POST /api/documents uploads a public document with tags and file metadata', async () => {
  await withDocumentApp(async ({ baseUrl }) => {
    const token = await registerAndLogin(baseUrl, 'owner@example.com', 'SV-DOC-1');
    const response = await uploadDocument(baseUrl, token, {
      title: 'Đề cương Cơ sở dữ liệu',
      description: 'Tài liệu ôn tập giữa kỳ cho môn CSDL',
      tags: 'Cơ sở dữ liệu, CS301',
      fileName: 'database-outline.pdf',
      fileType: 'application/pdf',
      fileContent: 'pdf content',
    });
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.success, true);
    assert.equal(payload.data.title, 'Đề cương Cơ sở dữ liệu');
    assert.deepEqual(payload.data.tags, ['Cơ sở dữ liệu', 'CS301']);
    assert.equal(payload.data.file.originalName, 'database-outline.pdf');
    assert.equal(payload.data.owner.email, 'owner@example.com');
    assert.equal(payload.data.canManage, true);
    assert.ok(payload.data.createdAt);
    assert.ok(payload.data.updatedAt);
  });
});

test('GET /api/documents searches text and filters by tag plus date fields', async () => {
  await withDocumentApp(async ({ baseUrl }) => {
    const token = await registerAndLogin(baseUrl, 'searcher@example.com', 'SV-DOC-2');
    await uploadDocument(baseUrl, token, {
      title: 'Slide Flutter nâng cao',
      description: 'Widget, navigation và state management',
      tags: 'Flutter, Mobile',
      fileName: 'flutter.pptx',
    });
    await uploadDocument(baseUrl, token, {
      title: 'Bài tập Hệ quản trị CSDL',
      description: 'SQL join và transaction',
      tags: 'Cơ sở dữ liệu, CS302',
      fileName: 'database.txt',
    });

    const today = new Date().toISOString().slice(0, 10);
    const response = await fetch(`${baseUrl}/api/documents?search=transaction&tag=C%C6%A1%20s%E1%BB%9F%20d%E1%BB%AF%20li%E1%BB%87u&createdFrom=${today}&updatedFrom=${today}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.length, 1);
    assert.equal(payload.data[0].title, 'Bài tập Hệ quản trị CSDL');
    assert.equal(payload.data[0].tags.includes('Cơ sở dữ liệu'), true);
  });
});

test('DELETE /api/documents/:id allows owners and rejects other students', async () => {
  await withDocumentApp(async ({ baseUrl }) => {
    const ownerToken = await registerAndLogin(baseUrl, 'owner-delete@example.com', 'SV-DOC-3');
    const otherToken = await registerAndLogin(baseUrl, 'other-delete@example.com', 'SV-DOC-4');
    const uploadResponse = await uploadDocument(baseUrl, ownerToken, {
      title: 'Tài liệu AI',
      tags: 'Trí tuệ nhân tạo',
      fileName: 'ai.pdf',
    });
    const uploadPayload = await uploadResponse.json();

    const forbidden = await fetch(`${baseUrl}/api/documents/${uploadPayload.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    const deleted = await fetch(`${baseUrl}/api/documents/${uploadPayload.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${ownerToken}` },
    });

    assert.equal(forbidden.status, 403);
    assert.equal(deleted.status, 200);
  });
});

test('POST /api/documents rejects dangerous executable-like files', async () => {
  await withDocumentApp(async ({ baseUrl }) => {
    const token = await registerAndLogin(baseUrl, 'safe@example.com', 'SV-DOC-5');
    const response = await uploadDocument(baseUrl, token, {
      title: 'Script nguy hiểm',
      tags: 'An toàn thông tin',
      fileName: 'hack.bat',
      fileType: 'application/octet-stream',
    });
    const payload = await response.json();

    assert.equal(response.status, 422);
    assert.equal(payload.success, false);
    assert.match(payload.message, /không được hỗ trợ|nguy hiểm/i);
  });
});

async function uploadDocument(baseUrl, token, options) {
  const form = new FormData();
  form.set('title', options.title);
  form.set('description', options.description || '');
  form.set('tags', options.tags || '');
  form.set(
    'file',
    new Blob([options.fileContent || 'document content'], { type: options.fileType || 'text/plain' }),
    options.fileName,
  );

  return fetch(`${baseUrl}/api/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

async function registerAndLogin(baseUrl, email, studentCode) {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password123!',
      fullName: 'Nguyễn Văn A',
      studentCode,
      accountType: 'university_student',
      major: 'Công nghệ thông tin',
    }),
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  return payload.data.accessToken;
}

async function withDocumentApp(run) {
  const uploadDir = await mkdtemp(path.join(tmpdir(), 'saodo-docs-'));
  const app = createApp({
    authRepository: createMemoryAuthRepository(),
    documentOptions: { uploadDir, maxUploadMb: 25 },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await run({ baseUrl, uploadDir });
  } finally {
    server.close();
    await once(server, 'close');
    await rm(uploadDir, { recursive: true, force: true });
  }
}
