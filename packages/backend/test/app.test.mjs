import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-backend-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');

test('GET /api/health returns service metadata and assistant status', async () => {
  const response = await withServer(async (baseUrl) => fetch(`${baseUrl}/api/health`));
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(payload.service, 'saodo-assistant-backend');
  assert.equal(payload.assistant.mode, 'local');
});

test('POST /api/chat/send rejects invalid JSON for authenticated users', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'BADJSON001');
    return fetch(`${baseUrl}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: '{"message":',
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Invalid JSON body');
});

test('POST /api/chat/send returns a local fallback reply and sources', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'CHAT001');
    return fetch(`${baseUrl}/api/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversationId: 'conv-main', message: 'Cho mình lịch học hôm nay' }),
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.conversation.id, 'conv-main');
  assert.match(payload.message.content, /lịch học/i);
  assert.ok(Array.isArray(payload.message.sources));
  assert.ok(payload.message.sources.length > 0);
});

test('POST /api/chat/send can use injected assistant adapter', async () => {
  const response = await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'AGENT001');
      return fetch(`${baseUrl}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conversationId: 'conv-main', message: 'Ping agent' }),
      });
    },
    {
      assistantReply: async ({ message, catalog }) => ({
        content: `Agent nhận: ${message} cho ${catalog.user.name}`,
        sources: [{ title: 'NemoClaw agent', type: 'agent' }],
      }),
    },
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.message.content, /Agent nhận/);
  assert.deepEqual(payload.message.sources, [{ title: 'NemoClaw agent', type: 'agent' }]);
});

test('GET /api/conversations/:id returns 404 for missing conversation', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'MISS001');
    return fetch(`${baseUrl}/api/conversations/missing-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.error, 'Conversation not found');
});

test('server uses configured CORS origin instead of wildcard when provided', async () => {
  let corsHeader = null;

  await withServer(
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/health`);
      corsHeader = response.headers.get('access-control-allow-origin');
      return response;
    },
    { corsAllowOrigin: 'http://localhost:3000' },
  );

  assert.equal(corsHeader, 'http://localhost:3000');
});

test('server accepts localhost and 127.0.0.1 as equivalent loopback CORS origins', async () => {
  let corsHeader = null;

  await withServer(
    async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://127.0.0.1:3000' },
      });
      corsHeader = response.headers.get('access-control-allow-origin');
      return response;
    },
    { corsAllowOrigin: 'http://localhost:3000' },
  );

  assert.equal(corsHeader, 'http://127.0.0.1:3000');
});

test('OPTIONS preflight allows the X-School-ID header used by the frontend client', async () => {
  const response = await withServer(
    async (baseUrl) =>
      fetch(`${baseUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,x-school-id',
        },
      }),
    { corsAllowOrigin: 'http://localhost:3000' },
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  assert.match(response.headers.get('access-control-allow-headers') || '', /x-school-id/i);
});

test('POST /api/auth/register can create a guest portal account and log in by email immediately', async () => {
  const result = await withServer(async (baseUrl) => {
    const register = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId: 'sao-do',
        accountType: 'guest_public',
        fullName: 'Khách tham quan Sao Đỏ',
        email: 'guest.portal@example.com',
        password: 'secret123',
        major: 'Tìm hiểu ngành CNTT',
      }),
    });

    const registerPayload = await register.json();

    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId: 'sao-do',
        email: 'guest.portal@example.com',
        password: 'secret123',
      }),
    });

    const loginPayload = await login.json();

    return { register, registerPayload, login, loginPayload };
  });

  assert.equal(result.register.status, 200);
  assert.equal(result.registerPayload.user.accountType, 'guest_public');
  assert.equal(result.registerPayload.user.fullName, 'Khách tham quan Sao Đỏ');
  assert.ok(result.registerPayload.token);
  assert.equal(result.login.status, 200);
  assert.equal(result.loginPayload.user.email, 'guest.portal@example.com');
  assert.equal(result.loginPayload.user.accountType, 'guest_public');
});

test('jobs marketplace APIs expose visible-immediately posts, sources, and safe crawler ingestion', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'JOB001');

    const jobs = await fetch(`${baseUrl}/api/jobs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sources = await fetch(`${baseUrl}/api/job-sources`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const crawl = await fetch(`${baseUrl}/api/jobs/crawl/public-sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sourceType: 'public', region: 'Chí Linh, Hải Dương', sourceUrl: 'https://example.edu/jobs' }),
    });

    return { jobs, sources, crawl };
  });

  const jobsPayload = await response.jobs.json();
  const sourcesPayload = await response.sources.json();
  const crawlPayload = await response.crawl.json();

  assert.equal(response.jobs.status, 200);
  assert.equal(response.sources.status, 200);
  assert.equal(response.crawl.status, 202);
  assert.ok(jobsPayload.jobs.some((job) => job.sourceType === 'crawler'));
  assert.ok(jobsPayload.jobs.every((job) => job.moderationStatus === 'visible_immediately'));
  assert.ok(jobsPayload.jobs.every((job) => ['low', 'medium', 'high'].includes(job.riskLevel)));
  assert.ok(sourcesPayload.sources.some((source) => source.endpoint === 'crawl/public-sources'));
  assert.equal(crawlPayload.accepted, true);
  assert.match(crawlPayload.policy, /public|official|community/i);
});

test('auth and user data are physically isolated by selected school database', async () => {
  const result = await withServer(async (baseUrl) => {
    const saoDoToken = await createUserAndToken(baseUrl, 'DUP001', {
      schoolId: 'sao-do',
      fullName: 'Sinh viên Sao Đỏ',
      faculty: 'Công nghệ thông tin',
    });
    const nguyenThiDueToken = await createUserAndToken(baseUrl, 'DUP001', {
      schoolId: 'nguyen-thi-due',
      fullName: 'Học sinh Nguyễn Thị Duệ',
      faculty: 'Lớp 12A1',
    });

    const saoDoLogin = await loginUser(baseUrl, 'DUP001', 'secret123', 'sao-do');
    const nguyenThiDueLogin = await loginUser(baseUrl, 'DUP001', 'secret123', 'nguyen-thi-due');
    const saoDoBootstrap = await fetch(`${baseUrl}/api/app/bootstrap`, { headers: { Authorization: `Bearer ${saoDoToken}` } });
    const nguyenThiDueBootstrap = await fetch(`${baseUrl}/api/app/bootstrap`, { headers: { Authorization: `Bearer ${nguyenThiDueToken}` } });

    return { saoDoLogin, nguyenThiDueLogin, saoDoBootstrap, nguyenThiDueBootstrap };
  });

  const saoDoLoginPayload = await result.saoDoLogin.json();
  const nguyenThiDueLoginPayload = await result.nguyenThiDueLogin.json();
  const saoDoBootstrapPayload = await result.saoDoBootstrap.json();
  const nguyenThiDueBootstrapPayload = await result.nguyenThiDueBootstrap.json();

  assert.equal(result.saoDoLogin.status, 200);
  assert.equal(result.nguyenThiDueLogin.status, 200);
  assert.equal(saoDoLoginPayload.user.fullName, 'Sinh viên Sao Đỏ');
  assert.equal(nguyenThiDueLoginPayload.user.fullName, 'Học sinh Nguyễn Thị Duệ');
  assert.equal(saoDoLoginPayload.user.schoolId, 'sao-do');
  assert.equal(nguyenThiDueLoginPayload.user.schoolId, 'nguyen-thi-due');
  assert.equal(saoDoBootstrapPayload.user.school, 'Trường Đại học Sao Đỏ');
  assert.equal(nguyenThiDueBootstrapPayload.user.school, 'Trường THPT Nguyễn Thị Duệ');
});

test('GET /api/profile returns academic, personal, and family student details', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, '2200286', {
      fullName: 'Nguyễn Văn Đạt',
      dateOfBirth: '2004-07-03',
      phone: '0936651618',
    });

    return fetch(`${baseUrl}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.user.fullName, 'Nguyễn Văn Đạt');
  assert.equal(payload.profile.academicInfo.studentCode, '2200286');
  assert.equal(payload.profile.academicInfo.className, 'DK13-CNTT1');
  assert.equal(payload.profile.personalInfo.dateOfBirth, '2004-07-03');
  assert.equal(payload.profile.personalInfo.phone, '0936651618');
  assert.equal(payload.profile.familyInfo.fatherName, 'Nguyễn Văn Thành');
});

test('PUT /api/profile persists editable personal fields', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'PROFILEPUT001');

    return fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Đạt',
        phone: '0936651618',
        email: '2200286@sv.saodo.edu.vn',
        dateOfBirth: '2004-07-03',
        personalInfo: {
          ethnicity: 'Kinh',
          religion: 'Không',
          nationality: 'Việt Nam',
          region: 'Khu vực 1',
          issuedDate: '2023-03-01',
          issuedBy: 'Cục Cảnh sát QLHC về TTXH',
          subjectGroup: 'Khu vực 1',
          unionDate: '2020-03-26',
          partyDate: '',
          contactAddress: '471, Tổ 4, Khu Quang Trung, Mạo Khê, Đông Triều, Quảng Ninh',
          permanentAddress: 'Số nhà 471, Tổ 4, Khu Quang Trung, Phường Mạo Khê, Tỉnh Quảng Ninh',
        },
      }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.user.email, '2200286@sv.saodo.edu.vn');
  assert.equal(payload.profile.personalInfo.ethnicity, 'Kinh');
  assert.equal(payload.profile.personalInfo.issuedBy, 'Cục Cảnh sát QLHC về TTXH');
  assert.equal(payload.profile.personalInfo.subjectGroup, 'Khu vực 1');
  assert.equal(payload.profile.personalInfo.unionDate, '2020-03-26');
  assert.equal(payload.profile.personalInfo.contactAddress, '471, Tổ 4, Khu Quang Trung, Mạo Khê, Đông Triều, Quảng Ninh');
});

test('PUT /api/profile/avatar persists avatar data URL', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AVATAR001');

    return fetch(`${baseUrl}/api/profile/avatar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatarUrl: 'data:image/png;base64,aW1hZ2U=' }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.user.avatarUrl, 'data:image/png;base64,aW1hZ2U=');
  assert.equal(payload.profile.avatarUrl, 'data:image/png;base64,aW1hZ2U=');
});

test('PUT /api/profile rejects duplicate email updates', async () => {
  const response = await withServer(async (baseUrl) => {
    await createUserAndToken(baseUrl, 'EMAIL001', { email: 'owner@saodo.edu.vn' });
    const token = await createUserAndToken(baseUrl, 'EMAIL002', { email: 'second@saodo.edu.vn' });

    return fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: 'owner@saodo.edu.vn' }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 409);
  assert.equal(payload.error, 'Email đã được sử dụng bởi tài khoản khác');
});

test('PUT /api/profile/avatar rejects remote avatar URLs', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AVATARURL001');

    return fetch(`${baseUrl}/api/profile/avatar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ avatarUrl: 'https://example.com/avatar.png' }),
    });
  });

  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error, 'Ảnh đại diện phải là dữ liệu ảnh hợp lệ');
});

async function createUserAndToken(baseUrl, studentId, options = {}) {
  const email = options.email || `${studentId.toLowerCase()}@saodo.edu.vn`;
  const password = 'secret123';
  const schoolId = options.schoolId || 'sao-do';

  const register = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password, email, schoolId }),
  });
  assert.equal(register.status, 200);

  const complete = await fetch(`${baseUrl}/api/auth/complete-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId,
      schoolId,
      fullName: options.fullName || `Sinh viên ${studentId}`,
      dateOfBirth: options.dateOfBirth || '2004-01-01',
      faculty: options.faculty || 'Công nghệ thông tin',
      phone: options.phone || '0912345678',
    }),
  });
  assert.equal(complete.status, 200);
  const payload = await complete.json();
  return payload.token;
}

async function loginUser(baseUrl, studentId, password, schoolId) {
  return fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password, schoolId }),
  });
}

async function withServer(run, options = {}) {
  const server = createAppServer(options);

  server.listen(0, '127.0.0.1');
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
