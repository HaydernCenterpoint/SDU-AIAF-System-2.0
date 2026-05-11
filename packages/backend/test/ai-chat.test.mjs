import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testDir = mkdtempSync(join(tmpdir(), 'saodo-ai-chat-'));
process.env.SAODO_AUTH_DB_PATH = join(testDir, 'auth-db.json');
process.env.SAODO_USER_DATA_PATH = join(testDir, 'user-data.json');
process.env.SAODO_AI_LOG_PATH = join(testDir, 'ai-logs.jsonl');
process.env.SAODO_AGENT_MODE = 'local';

const { createAppServer } = await import('../src/app.mjs');
const { ASSISTANT_TYPES, getAssistantSystemPrompt } = await import('../src/ai/prompt-registry.mjs');
const { summarizeLongConversation } = await import('../src/ai/summarizer.mjs');

test('prompt registry exposes expanded Vietnamese system prompts for all assistant types', () => {
  assert.deepEqual(ASSISTANT_TYPES, [
    'study',
    'document',
    'report',
    'coding',
    'career',
    'interview',
    'health',
    'finance',
    'productivity',
  ]);

  for (const assistantType of ASSISTANT_TYPES) {
    const prompt = getAssistantSystemPrompt(assistantType);
    assert.match(prompt, /tiếng Việt/i);
    assert.match(prompt, /Không bịa|không bịa/i);
    assert.match(prompt, /API key|dữ liệu hệ thống|system prompt/i);
  }

  const studyPrompt = getAssistantSystemPrompt('study');
  assert.match(studyPrompt, /Study Assistant|Trợ lý học tập/i);
  assert.match(studyPrompt, /Hướng dẫn làm bài tập|từng bước|tư duy/i);
  assert.match(studyPrompt, /Tóm tắt ngắn vấn đề/i);
  assert.match(studyPrompt, /Giải thích chi tiết/i);
  assert.match(studyPrompt, /Câu hỏi ôn tập/i);
  assert.match(studyPrompt, /gian lận học tập|Không làm bài nộp thay/i);

  const healthPrompt = getAssistantSystemPrompt('health');
  assert.match(healthPrompt, /Health Assistant|Trợ lý sức khỏe/i);
  assert.match(healthPrompt, /ngủ|uống nước|ăn uống|tập luyện/i);
  assert.match(healthPrompt, /BMI|tâm trạng/i);
  assert.match(healthPrompt, /Không thay thế bác sĩ/i);
  assert.match(healthPrompt, /Không chẩn đoán bệnh/i);
  assert.match(healthPrompt, /Không kê đơn thuốc/i);
  assert.match(healthPrompt, /Nhận xét tình trạng hiện tại/i);
  assert.match(healthPrompt, /Kế hoạch nhỏ dễ thực hiện/i);

  const careerPrompt = getAssistantSystemPrompt('career');
  assert.match(careerPrompt, /Career Assistant|Trợ lý nghề nghiệp/i);
  assert.match(careerPrompt, /Phân tích kỹ năng hiện tại/i);
  assert.match(careerPrompt, /lộ trình học tập nghề nghiệp|Lộ trình học/i);
  assert.match(careerPrompt, /CV|phỏng vấn|thực tập/i);
  assert.match(careerPrompt, /dự án cá nhân|dự án thực tế/i);
  assert.match(careerPrompt, /Không hứa hẹn chắc chắn có việc|Không cam kết chắc chắn/i);
  assert.match(careerPrompt, /Kế hoạch 1 tháng \/ 3 tháng \/ 6 tháng/i);

  const reportPrompt = getAssistantSystemPrompt('report');
  assert.match(reportPrompt, /Report Assistant|Trợ lý viết báo cáo/i);
  assert.match(reportPrompt, /MỞ ĐẦU/i);
  assert.match(reportPrompt, /CHƯƠNG 1\. CƠ SỞ LÝ THUYẾT/i);
  assert.match(reportPrompt, /CHƯƠNG 2\. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG/i);
  assert.match(reportPrompt, /CHƯƠNG 3\. THIẾT KẾ CHI TIẾT HỆ THỐNG/i);
  assert.match(reportPrompt, /use case|activity|sequence|class|ERD/i);
  assert.match(reportPrompt, /PlantUML|Mermaid/i);
  assert.match(reportPrompt, /Không bịa tài liệu tham khảo|Không tạo nguồn giả/i);
});

test('POST /api/ai/chat returns normalized assistant response and stores conversation', async () => {
  const response = await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'AI001');
      return fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assistant_type: 'study',
          message: 'Giúp em lập kế hoạch ôn thi môn trí tuệ nhân tạo',
        }),
      });
    },
    {
      assistantReply: async ({ message, prompt }) => ({
        content: `Kế hoạch học tập cho: ${message}. Prompt có ${prompt.includes('Trợ lý học tập') ? 'đúng' : 'sai'} ngữ cảnh.`,
        sources: [],
      }),
    },
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.reply, /Kế hoạch học tập/);
  assert.equal(payload.assistant_type, 'study');
  assert.match(payload.conversation_id, /[a-f0-9-]{16,}/i);
  assert.ok(Array.isArray(payload.suggested_actions));
  assert.ok(payload.suggested_actions.includes('Tạo kế hoạch ôn tập'));
});

test('POST /api/ai/chat rejects invalid assistant type and sensitive secrets', async () => {
  const invalidType = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AI002');
    return fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assistant_type: 'unknown', message: 'Xin chào' }),
    });
  });
  assert.equal(invalidType.status, 400);

  const secretMessage = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AI003');
    return fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assistant_type: 'coding', message: 'Đây là API key sk-1234567890abcdef, sửa code giúp em' }),
    });
  });
  const payload = await secretMessage.json();

  assert.equal(secretMessage.status, 400);
  assert.match(payload.error, /thông tin nhạy cảm|API key|mật khẩu/i);
});

test('POST /api/ai/chat rejects common personal data before provider calls', async () => {
  const piiMessage = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AI005');
    return fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assistant_type: 'finance', message: 'SĐT của em là 0912345678 và email là test@example.com' }),
    });
  });
  const payload = await piiMessage.json();

  assert.equal(piiMessage.status, 400);
  assert.match(payload.error, /dữ liệu cá nhân|thông tin nhạy cảm/i);
});

test('POST /api/ai/chat rejects oversized JSON bodies before parsing full payload', async () => {
  const response = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AI006');
    return fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ assistant_type: 'study', message: 'x'.repeat(1_100_000) }),
    });
  });
  const payload = await response.json();

  assert.equal(response.status, 413);
  assert.match(payload.error, /quá lớn|too large/i);
});

test('summarizeLongConversation preserves older user and assistant turns', () => {
  const conversation = {
    summary: '',
    messages: Array.from({ length: 24 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: index % 2 === 0 ? `Câu hỏi cũ ${index}` : `Kết luận trợ lý ${index}`,
    })),
  };

  const summary = summarizeLongConversation(conversation);

  assert.match(summary, /Sinh viên/);
  assert.match(summary, /Trợ lý/);
  assert.ok(conversation.messages.length <= 10);
});

test('POST /api/ai/chat rate limits repeated requests per assistant type', async () => {
  const statuses = await withServer(async (baseUrl) => {
    const token = await createUserAndToken(baseUrl, 'AI004');
    const results = [];
    for (let index = 0; index < 7; index += 1) {
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assistant_type: 'productivity', message: `Lập lịch học ${index}` }),
      });
      results.push(response.status);
    }
    return results;
  });

  assert.equal(statuses.at(-1), 429);
});

test('POST /api/ai/chat forwards CV context to the career assistant prompt', async () => {
  let capturedPrompt = '';

  const response = await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'AI007');
      return fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assistant_type: 'career',
          message: 'Hãy góp ý để CV của em thuyết phục hơn',
          context: {
            cvProfile: {
              desiredRole: 'Thực tập sinh Frontend',
              summary: 'Sinh viên CNTT thích xây giao diện học tập rõ ràng.',
              skills: ['React', 'TypeScript', 'Figma'],
              projects: [
                {
                  name: 'Student Planner',
                  impact: 'Giảm thời gian theo dõi deadline cho lớp còn 1 màn hình',
                },
              ],
            },
          },
        }),
      });
    },
    {
      assistantReply: async ({ prompt }) => {
        capturedPrompt = prompt;
        return { content: 'Đã đọc CV và đưa góp ý.', sources: [] };
      },
    },
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.reply, /Đã đọc CV và đưa góp ý/i);
  assert.match(capturedPrompt, /CV hiện tại của sinh viên/i);
  assert.match(capturedPrompt, /Thực tập sinh Frontend/i);
  assert.match(capturedPrompt, /React, TypeScript, Figma/i);
  assert.match(capturedPrompt, /Student Planner/i);
});

test('POST /api/ai/chat forwards health context to the health assistant prompt', async () => {
  let capturedPrompt = '';

  const response = await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'AI008');
      return fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assistant_type: 'health',
          message: 'Dựa trên tuần này, em nên ưu tiên cải thiện điều gì trước?',
          context: {
            healthProfile: {
              summary: 'Tuần này ngủ thất thường, uống nước chưa đều và stress cao vào đầu tuần.',
              sleepAverage: '7.2h',
              hydrationAverage: '6.4 ly',
              activityAverage: '39 phút',
              stressAverage: '48/100',
              days: [
                {
                  day: 'Thứ 2',
                  sleep: '6.4h',
                  water: '5 ly',
                  stress: '71/100',
                  note: 'Ngủ muộn do hoàn thiện slide nhóm.',
                },
              ],
            },
          },
        }),
      });
    },
    {
      assistantReply: async ({ prompt }) => {
        capturedPrompt = prompt;
        return { content: 'Đã đọc dữ liệu sức khỏe tuần này và đưa khuyến nghị.', sources: [] };
      },
    },
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.reply, /Đã đọc dữ liệu sức khỏe tuần này và đưa khuyến nghị/i);
  assert.match(capturedPrompt, /Dữ liệu sức khỏe hiện tại của sinh viên/i);
  assert.match(capturedPrompt, /7\.2h/i);
  assert.match(capturedPrompt, /6\.4 ly/i);
  assert.match(capturedPrompt, /Thứ 2/i);
  assert.match(capturedPrompt, /Ngủ muộn do hoàn thiện slide nhóm/i);
});

test('POST /api/ai/chat injects Sao Do admissions knowledge into the assistant prompt', async () => {
  let capturedPrompt = '';

  const response = await withServer(
    async (baseUrl) => {
      const token = await createUserAndToken(baseUrl, 'AI009');
      return fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assistant_type: 'study',
          message: 'Trường có những phương thức tuyển sinh nào cho ngành Công nghệ thông tin?',
        }),
      });
    },
    {
      assistantReply: async ({ prompt }) => {
        capturedPrompt = prompt;
        return { content: 'Đã đọc không gian tuyển sinh.', sources: [] };
      },
    },
  );

  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.match(payload.reply, /không gian tuyển sinh/i);
  assert.match(capturedPrompt, /Các khoa đào tạo/i);
  assert.match(capturedPrompt, /Công nghệ thông tin/i);
  assert.match(capturedPrompt, /SDU04/i);
  assert.match(capturedPrompt, /A00/i);
  assert.match(capturedPrompt, /Phương thức 1: Xét tuyển thẳng/i);
  assert.match(capturedPrompt, /Phương thức 4: Xét tuyển sử dụng kết quả bài thi đánh giá năng lực/i);
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
    body: JSON.stringify({
      studentId,
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
