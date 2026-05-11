import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const SYSTEM_PROMPT_PATH = join(__dirname, '..', '..', 'agent-runtime', 'config', 'system-prompt.md');

const NEMOCLAW_API_URL = process.env.NEMOCLAW_API_URL;
const NEMOCLAW_BEARER_TOKEN = process.env.NEMOCLAW_BEARER_TOKEN;
const NEMOCLAW_SANDBOX_NAME = process.env.NEMOCLAW_SANDBOX_NAME;
const NEMOCLAW_TIMEOUT_MS = Number(process.env.NEMOCLAW_TIMEOUT_MS || 30000);
const SAODO_AGENT_MODE = process.env.SAODO_AGENT_MODE || 'auto';
const OPENCLAW_AGENT = process.env.OPENCLAW_AGENT || 'main';
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || (process.platform === 'win32' ? 'openclaw.cmd' : 'openclaw');
const OPENSHELL_BIN = process.env.OPENSHELL_BIN || (process.platform === 'win32' ? 'openshell.cmd' : 'openshell');
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_API_URL = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4-pro';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemma-4-26b-a4b-it:free';
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'Sao Do Assistant';
const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = process.env.XAI_API_URL || 'https://api.x.ai/v1/chat/completions';
const XAI_MODEL = process.env.XAI_MODEL || 'grok-4.20';
const KROUTER_API_KEY = process.env.KROUTER_API_KEY;
const KROUTER_API_URL = process.env.KROUTER_API_URL || 'https://sv1.krouter.net/v1/chat/completions';
const KROUTER_MODEL = process.env.KROUTER_MODEL || 'cx/gpt-5.4';

export function getAssistantRuntimeStatus() {
  const mode = resolveRuntimeMode();
  return {
    mode,
    configured: isRuntimeConfigured(mode),
    http: mode === 'http',
    sandbox: mode === 'openshell' ? NEMOCLAW_SANDBOX_NAME || null : null,
    openclawCli: mode === 'openclaw-cli',
    nvidia: mode === 'nvidia',
    openai: mode === 'openai',
    openrouter: mode === 'openrouter',
    xai: mode === 'xai',
    krouter: mode === 'krouter',
    model: mode === 'nvidia' ? NVIDIA_MODEL
      : mode === 'openrouter' ? OPENROUTER_MODEL
      : mode === 'openai' ? OPENAI_MODEL
      : mode === 'xai' ? XAI_MODEL
      : mode === 'krouter' ? KROUTER_MODEL
      : null,
    timeoutMs: NEMOCLAW_TIMEOUT_MS,
  };
}

export async function generateAssistantReply({ message, conversation, catalog, prompt, attachments = [] }) {
  const context = buildAssistantContext({ message, conversation, catalog, promptOverride: prompt, attachments });
  const mode = resolveRuntimeMode();
  const runtimeConfigured = isRuntimeConfigured(mode);

  if (mode === 'http') {
    const remoteReply = await requestRemoteReply(context);
    if (remoteReply) return remoteReply;
  }

  if (mode === 'openshell') {
    const sandboxReply = await requestOpenShellReply(context);
    if (sandboxReply) return sandboxReply;
  }

  if (mode === 'openclaw-cli') {
    const cliReply = await requestOpenClawCliReply(context);
    if (cliReply) return cliReply;
  }

  if (mode === 'nvidia') {
    const nvidiaReply = await requestNvidia(context);
    if (nvidiaReply) return nvidiaReply;
  }

  if (mode === 'openai') {
    const openaiReply = await requestOpenAI(context);
    if (openaiReply) return openaiReply;
  }

  if (mode === 'openrouter') {
    const openRouterReply = await requestOpenRouter(context);
    if (openRouterReply) return openRouterReply;
  }

  if (mode === 'xai') {
    const xaiReply = await requestXAI(context);
    if (xaiReply) return xaiReply;
  }

  if (mode === 'krouter') {
    const krouterReply = await requestKRouter(context);
    if (krouterReply) return krouterReply;
  }

  return buildLocalReply(message, catalog, {
    runtimeMode: mode,
    runtimeConfigured,
    runtimeFailure: mode !== 'local' && runtimeConfigured,
  });
}

function resolveRuntimeMode() {
  if (SAODO_AGENT_MODE !== 'auto') {
    // Validate that the configured mode actually has credentials before using it.
    // This prevents crashes when SAODO_AGENT_MODE is hardcoded but the key is missing/expired.
    const configured = isRuntimeConfigured(SAODO_AGENT_MODE);
    if (configured) return SAODO_AGENT_MODE;
    // Fall through to auto-detection if the explicit mode has no valid credentials
  }
  // Auto-detection: try providers in priority order
  if (NEMOCLAW_API_URL) return 'http';
  if (NEMOCLAW_SANDBOX_NAME) return 'openshell';
  if (process.env.OPENCLAW_CLI === '1') return 'openclaw-cli';
  if (KROUTER_API_KEY) return 'krouter';
  if (NVIDIA_API_KEY) return 'nvidia';
  if (XAI_API_KEY) return 'xai';
  if (OPENROUTER_API_KEY) return 'openrouter';
  if (OPENAI_API_KEY) return 'openai';
  return 'local';
}

function isRuntimeConfigured(mode) {
  switch (mode) {
    case 'http':
      return Boolean(NEMOCLAW_API_URL);
    case 'openshell':
      return Boolean(NEMOCLAW_SANDBOX_NAME);
    case 'openclaw-cli':
      return process.env.OPENCLAW_CLI === '1';
    case 'nvidia':
      return Boolean(NVIDIA_API_KEY);
    case 'openai':
      return Boolean(OPENAI_API_KEY);
    case 'openrouter':
      return Boolean(OPENROUTER_API_KEY);
    case 'xai':
      return Boolean(XAI_API_KEY);
    case 'krouter':
      return Boolean(KROUTER_API_KEY);
    default:
      return false;
  }
}

function buildAssistantContext({ message, conversation, catalog, promptOverride, attachments = [] }) {
  const systemPrompt = readSystemPrompt();
  const recentMessages = conversation.messages
    .slice(-10)
    .map((item) => `${item.role === 'assistant' ? 'Trợ lý' : 'Sinh viên'}: ${item.content}`)
    .join('\n');

  const todaySchedule = formatSchedule(catalog.schedule);
  const courses = formatCourses(catalog.courses);
  const documents = formatDocuments(catalog.documents);

  const prompt = promptOverride || `${systemPrompt}

Ngữ cảnh sinh viên:
- Tên: ${catalog.user?.name || 'Sinh viên'}
- Trường: ${catalog.user?.school || 'Đại học Sao Đỏ'}
- Khoa/ngành: ${catalog.user?.major || 'Chưa cập nhật'}

Lịch học hôm nay:
${todaySchedule}

Môn học:
${courses}

Tài liệu:
${documents}

Lịch sử gần đây:
${recentMessages || 'Chưa có lịch sử trò chuyện.'}

Câu hỏi mới của sinh viên:
${message}

Hãy trả lời bằng tiếng Việt, ngắn gọn, thực tế, không bịa thông tin chính thức.`;

  return {
    message,
    prompt,
    conversation,
    catalog,
    attachments: Array.isArray(attachments) ? attachments : [],
    sessionId: sanitizeSessionId(conversation.id),
  };
}

async function requestRemoteReply({ message, prompt, conversation, catalog, sessionId }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NEMOCLAW_TIMEOUT_MS);

  try {
    const response = await fetch(`${NEMOCLAW_API_URL.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NEMOCLAW_BEARER_TOKEN ? { Authorization: `Bearer ${NEMOCLAW_BEARER_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        message,
        prompt,
        sessionId,
        conversationId: conversation.id,
        context: {
          user: catalog.user,
          courseCatalog: catalog.courses ?? [],
          todaySchedule: catalog.schedule ?? [],
          documentCatalog: catalog.documents ?? [],
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = extractReplyContent(data);
    if (!content) return null;

    return {
      content,
      sources: normalizeSources(data.sources),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestOpenShellReply(context) {
  if (!NEMOCLAW_SANDBOX_NAME) return null;
  return runAgentCommand(OPENSHELL_BIN, [
    'sandbox',
    'exec',
    NEMOCLAW_SANDBOX_NAME,
    OPENCLAW_BIN,
    'agent',
    '--agent',
    OPENCLAW_AGENT,
    '--local',
    '-m',
    context.prompt,
    '--session-id',
    context.sessionId,
  ]);
}

async function requestOpenClawCliReply(context) {
  return runAgentCommand(OPENCLAW_BIN, [
    'agent',
    '--agent',
    OPENCLAW_AGENT,
    '--local',
    '-m',
    context.prompt,
    '--session-id',
    context.sessionId,
  ]);
}

async function runAgentCommand(command, args) {
  try {
    const { stdout } = await execFileAsync(command, args, {
      timeout: NEMOCLAW_TIMEOUT_MS,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
      env: process.env,
    });
    const content = cleanCliOutput(stdout);
    if (!content) return null;
    return { content, sources: [] };
  } catch {
    return null;
  }
}

async function requestNvidia({ message, conversation, catalog, prompt }) {
  return requestChatCompletions({
    apiUrl: NVIDIA_API_URL,
    apiKey: NVIDIA_API_KEY,
    model: NVIDIA_MODEL,
    message,
    conversation,
    catalog,
    prompt,
    temperature: 1,
    topP: 0.95,
    maxTokens: 16384,
    extraBody: {
      chat_template_kwargs: {
        thinking: false,
      },
    },
  });
}

async function requestOpenAI({ message, conversation, catalog, prompt }) {
  return requestChatCompletions({
    apiUrl: OPENAI_API_URL,
    apiKey: OPENAI_API_KEY,
    model: OPENAI_MODEL,
    message,
    conversation,
    catalog,
    prompt,
  });
}

async function requestOpenRouter({ message, conversation, catalog, prompt }) {
  return requestChatCompletions({
    apiUrl: OPENROUTER_API_URL,
    apiKey: OPENROUTER_API_KEY,
    model: OPENROUTER_MODEL,
    message,
    conversation,
    catalog,
    prompt,
    extraHeaders: {
      'HTTP-Referer': OPENROUTER_SITE_URL,
      'X-Title': OPENROUTER_APP_NAME,
    },
  });
}

async function requestXAI({ message, conversation, catalog, prompt }) {
  return requestChatCompletions({
    apiUrl: XAI_API_URL,
    apiKey: XAI_API_KEY,
    model: XAI_MODEL,
    message,
    conversation,
    catalog,
    prompt,
  });
}

async function requestKRouter({ message, conversation, catalog, prompt, attachments = [] }) {
  // Extract base64 images from attachments for vision support
  const imageAttachments = attachments
    .filter((a) => a.type === 'image' && a.dataUrl)
    .map((a) => ({ dataUrl: a.dataUrl, name: a.name }));

  return requestChatCompletions({
    apiUrl: KROUTER_API_URL,
    apiKey: KROUTER_API_KEY,
    model: KROUTER_MODEL,
    message,
    conversation,
    catalog,
    prompt,
    temperature: 0.5,
    maxTokens: 2000,
    imageAttachments,
  });
}

async function requestChatCompletions({
  apiUrl,
  apiKey,
  model,
  message,
  conversation,
  catalog,
  prompt,
  extraHeaders = {},
  extraBody = {},
  temperature = 0.4,
  topP,
  maxTokens = 1000,
  imageAttachments = [],
}) {
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NEMOCLAW_TIMEOUT_MS);

  const messages = [
    {
      role: 'system',
      content: `${prompt}

Important behavior rules:
- Answer only the student's latest message.
- If the latest message is a greeting, short ping, or casual chat, answer naturally and ask what the student needs.
- Use schedule, documents, courses, or reminders only when the latest message asks for them.
- Do not repeat an older answer just because it appears in conversation history.
- Answer in Vietnamese.`,
    },
  ];
  const recentMessages = conversation.messages.slice(-10);
  for (const [index, msg] of recentMessages.entries()) {
    const isCurrentUserMessage =
      index === recentMessages.length - 1 &&
      msg.role === 'user' &&
      normalizeText(msg.content) === normalizeText(message);
    if (isCurrentUserMessage) continue;
    messages.push({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content });
  }
  // Build final user message: multimodal if images present, plain text otherwise
  const userText = `Câu hỏi mới nhất của sinh viên: ${message}`;
  let finalUserContent;
  if (imageAttachments.length > 0) {
    finalUserContent = [
      { type: 'text', text: userText },
      ...imageAttachments.map((img) => ({
        type: 'image_url',
        image_url: { url: img.dataUrl, detail: 'auto' },
      })),
    ];
  } else {
    finalUserContent = userText;
  }
  messages.push({ role: 'user', content: finalUserContent });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        ...(topP === undefined ? {} : { top_p: topP }),
        max_tokens: maxTokens,
        ...extraBody,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Xin lỗi, mình chưa thể trả lời câu hỏi này.';

    return { content, sources: inferSources(message, catalog) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildLocalReply(message, catalog, options = {}) {
  const {
    runtimeMode = 'local',
    runtimeConfigured = false,
    runtimeFailure = false,
  } = options;
  const normalized = normalizeText(message);

  if (matchesAny(normalized, ['lich', 'hoc hom nay', 'thoi khoa bieu', 'hoc gi', 'mon nao'])) {
    const classes = catalog.schedule.map((item) => `- ${item.time}: ${item.title} (${item.room})`).join('\n');
    return {
      content: `Hôm nay bạn có các lịch học sau:\n${classes || '- Chưa có lịch học.'}\n\nNếu muốn, mình có thể giúp bạn chuẩn bị tài liệu cho buổi học tiếp theo.`,
      sources: catalog.schedule.map((item) => ({ title: item.title, type: 'schedule' })),
    };
  }

  if (matchesAny(normalized, ['tai lieu', 'slide', 'syllabus', 'document'])) {
    const docs = catalog.documents
      .slice(0, 3)
      .map((item) => `- ${item.title} (${item.meta})`)
      .join('\n');
    return {
      content: `Mình tìm thấy một số tài liệu phù hợp:\n${docs || '- Chưa có tài liệu.'}\n\nBạn có thể yêu cầu mình tóm tắt một tài liệu cụ thể khi hệ thống đã kết nối nguồn học liệu thật.`,
      sources: catalog.documents.slice(0, 3).map((item) => ({ title: item.title, type: 'document' })),
    };
  }

  if (matchesAny(normalized, ['mon hoc', 'tin chi', 'hoc ky', 'course'])) {
    const courses = catalog.courses?.map((c) => `- ${c.code}: ${c.title} (${c.credits} TC) - ${c.teacher}`).join('\n');
    const totalCredits = catalog.courses?.reduce((sum, course) => sum + course.credits, 0) || 0;
    return {
      content: `Các môn học học kỳ này:\n${courses || '- Chưa có thông tin môn học.'}\n\nTổng cộng: ${totalCredits} tín chỉ.`,
      sources: catalog.courses?.map((course) => ({ title: course.title, type: 'course' })) || [],
    };
  }

  if (matchesAny(normalized, ['diem', 'thi', 'gpa', 'ket qua'])) {
    return {
      content: 'Phần điểm số cần kết nối hệ thống đào tạo chính thức. Mình sẽ không tự bịa điểm. Bạn có thể hỏi mình về lịch học, môn học hoặc tài liệu hiện có.',
      sources: [],
    };
  }

  if (matchesAny(normalized, ['chao', 'hello', 'hi', 'xin chao'])) {
    return {
      content: `Chào ${catalog.user?.name || 'bạn'}! Mình là trợ lý học tập Sao Đỏ. Bạn có thể hỏi mình về lịch học, tài liệu, môn học, nhắc nhở hoặc cách chuẩn bị bài.`,
      sources: [],
    };
  }

  if (matchesAny(normalized, ['nhac', 'reminder', 'deadline', 'han nop'])) {
    return {
      content: `Bạn hiện có ${catalog.schedule?.length || 0} lớp trong lịch học. Nếu muốn quản lý việc cần làm, hãy thêm nhắc nhở ở tab Nhắc nhở để mình theo dõi cùng bạn.`,
      sources: [],
    };
  }

  return {
    content: buildRuntimeFallbackNotice({ runtimeMode, runtimeConfigured, runtimeFailure }),
    sources: [],
  };
}

function buildRuntimeFallbackNotice({ runtimeMode, runtimeConfigured, runtimeFailure }) {
  const sharedKrouterSetupNotice = 'Mình có thể giúp bạn về lịch học, tài liệu, môn học và nhắc nhở. Cả hai trường hiện dùng chung setup KRouter, nên để có câu trả lời AI hãy cấu hình `KROUTER_API_KEY` và bảo đảm backend đang chạy với `SAODO_AGENT_MODE=krouter`.';

  if (runtimeMode === 'krouter') {
    if (runtimeFailure) {
      return 'KRouter đang tạm thời không phản hồi, nên mình đang trả lời bằng dữ liệu nội bộ. Bạn vẫn có thể hỏi về lịch học, tài liệu, môn học và nhắc nhở, hoặc thử lại sau khi backend kết nối lại với KRouter.';
    }

    if (!runtimeConfigured) {
      return sharedKrouterSetupNotice;
    }
  }

  if (runtimeMode === 'local') return sharedKrouterSetupNotice;

  return 'Mình có thể giúp bạn về lịch học, tài liệu, môn học và nhắc nhở. Hệ thống AI đang tạm thời chưa sẵn sàng, nên hiện mình trả lời bằng dữ liệu nội bộ của trường.';
}

function readSystemPrompt() {
  try {
    return readFileSync(SYSTEM_PROMPT_PATH, 'utf8').trim();
  } catch {
    return 'You are the daily study assistant for Sao Do University students. Answer in Vietnamese.';
  }
}

function formatSchedule(schedule = []) {
  if (!schedule.length) return 'Không có lịch học.';
  return schedule.map((item) => `- ${item.time}: ${item.title} tại ${item.room} (${item.type})`).join('\n');
}

function formatCourses(courses = []) {
  if (!courses.length) return 'Không có thông tin môn học.';
  return courses.map((course) => `- ${course.code}: ${course.title} (${course.credits} tín chỉ) - GV: ${course.teacher}`).join('\n');
}

function formatDocuments(documents = []) {
  if (!documents.length) return 'Không có tài liệu.';
  return documents.map((doc) => `- ${doc.title} (${doc.meta})`).join('\n');
}

function inferSources(message, catalog) {
  const normalized = normalizeText(message);
  const sources = [];
  if (matchesAny(normalized, ['lich', 'hoc'])) {
    sources.push(...(catalog.schedule || []).slice(0, 3).map((item) => ({ title: item.title, type: 'schedule' })));
  }
  if (matchesAny(normalized, ['tai lieu', 'slide'])) {
    sources.push(...(catalog.documents || []).slice(0, 3).map((item) => ({ title: item.title, type: 'document' })));
  }
  return sources;
}

function extractReplyContent(data) {
  if (typeof data === 'string') return data;
  if (typeof data?.content === 'string') return data.content;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.reply === 'string') return data.reply;
  if (typeof data?.response === 'string') return data.response;
  if (typeof data?.message?.content === 'string') return data.message.content;
  if (typeof data?.output?.content === 'string') return data.output.content;
  return '';
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => {
      if (typeof source === 'string') return { title: source, type: 'agent' };
      return {
        title: source.title || source.name || 'Nguồn từ agent',
        type: source.type || source.kind || 'agent',
      };
    })
    .filter((source) => source.title);
}

function cleanCliOutput(stdout = '') {
  return stdout
    .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() && !/^warning[:\s]/i.test(line.trim()))
    .join('\n')
    .trim();
}

function sanitizeSessionId(id = 'saodo') {
  return String(id).replace(/[^a-zA-Z0-9_.-]/g, '-').slice(0, 80) || 'saodo';
}

function normalizeText(value) {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function matchesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}
