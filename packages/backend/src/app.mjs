import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAssistantReply, getAssistantRuntimeStatus } from './nemoclaw-client.mjs';
import { createAuthRoutes, getUserFromToken, loadDb, saveDb } from './auth.mjs';
import { sendAiMessage } from './ai/index.mjs';
import { createAiReasoningRoutes } from './ai-reasoning.mjs';
import {
  buildAiHealthSuggestion,
  buildHealthStatistics,
  calculateBmi,
  createDefaultHealthData,
  createHealthLog,
  deleteHealthLog,
  ensureHealthData,
  listHealthLogs,
  updateHealthLog,
  upsertHealthProfile,
} from './health.mjs';
import {
  createDefaultNotificationData,
  createReminder,
  ensureNotificationData,
  markNotificationRead,
  registerPushToken,
  runDueReminderJob,
  updateReminder,
} from './reminders.mjs';
import { buildStatistics, buildStatisticsSection } from './statistics.mjs';
import {
  getAdminCatalog,
  getAdminStatistics,
  getAdminUserDetail,
  listAdminUsers,
  readAdminLogs,
  readAiLogs,
  requireAdminUser,
  updateUserStatus,
} from './admin.mjs';
import { createJobPost, ensureJobsData, ingestPublicJobSource } from './jobs.mjs';
import { handleGroupRoutes } from './groups.mjs';
import { handleDocumentRoutes } from './documents.mjs';
import { DEFAULT_SCHOOL_ID, getSchoolConfig, getSchoolScopedPath, normalizeSchoolId } from './schools.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USER_DATA_PATH = process.env.SAODO_USER_DATA_PATH || join(__dirname, '..', 'data', 'user-data.json');

const DEFAULT_ACADEMIC_INFO = {
  status: 'Đang học',
  recordCode: '221SDUOM.00028',
  entryDate: '2022-09-23',
  className: 'DK13-CNTT1',
  campus: 'Đại học Sao Đỏ - Cơ sở 1',
  educationLevel: 'Đại học',
  trainingType: 'Chính quy',
  faculty: 'Khoa Công nghệ thông tin',
  specialization: 'Công nghệ phần mềm',
  cohort: '2022',
  courseRange: '2022 - 2026',
};

const HIGH_SCHOOL_ACADEMIC_INFO = {
  status: 'Đang học',
  recordCode: 'NTD-2025-12A1-018',
  entryDate: '2023-09-05',
  className: '12A1',
  campus: 'THPT Nguyễn Thị Duệ',
  educationLevel: 'THPT',
  trainingType: 'Chính quy',
  faculty: 'Khối 12',
  specialization: 'Ban cơ bản',
  cohort: '2023',
  courseRange: '2023 - 2026',
};

const DEFAULT_PERSONAL_INFO = {
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  region: 'Khu vực 1',
  identityNumber: '022204004356',
  issuedDate: '',
  issuedBy: '',
  subjectGroup: '',
  unionDate: '',
  partyDate: '',
  contactAddress: '471, Tổ 4, Khu Quang Trung, Mạo Khê, Đông Triều, Quảng Ninh',
  permanentAddress: 'Số nhà 471, Tổ 4, Khu Quang Trung, Phường Mạo Khê, Tỉnh Quảng Ninh',
};

const HIGH_SCHOOL_PERSONAL_INFO = {
  ethnicity: 'Kinh',
  religion: 'Không',
  nationality: 'Việt Nam',
  region: 'Khu vực 2',
  identityNumber: '030508004356',
  issuedDate: '',
  issuedBy: '',
  subjectGroup: 'A00',
  unionDate: '2024-03-26',
  partyDate: '',
  contactAddress: 'Tổ dân phố Chu Văn An, Chí Linh, Hải Dương',
  permanentAddress: 'Tổ dân phố Chu Văn An, Chí Linh, Hải Dương',
};

const DEFAULT_FAMILY_INFO = {
  fatherName: 'Nguyễn Văn Thành',
  fatherBirthYear: '1966',
  fatherOccupation: 'Kinh doanh',
  fatherPhone: '0904388848',
  motherName: 'Đặng Thị Tự',
  motherBirthYear: '1972',
  motherOccupation: 'Kinh doanh',
  motherPhone: '0936792369',
};

const HIGH_SCHOOL_FAMILY_INFO = {
  fatherName: 'Nguyễn Văn Huy',
  fatherBirthYear: '1974',
  fatherOccupation: 'Kinh doanh',
  fatherPhone: '0912345670',
  motherName: 'Trần Thị Hương',
  motherBirthYear: '1978',
  motherOccupation: 'Giáo viên',
  motherPhone: '0912345671',
};

const DEFAULT_BOOTSTRAP_SUGGESTIONS = [
  'Hôm nay học môn gì?',
  'Tóm tắt bài giảng CSDL',
  'Tìm tài liệu Trí tuệ nhân tạo',
  'Lịch thi tuần này',
];

const HIGH_SCHOOL_BOOTSTRAP_SUGGESTIONS = [
  'Lịch học hôm nay của em',
  'Tóm tắt bài Toán ngày mai',
  'Nhắc em nộp bài Văn',
  'Tìm thông báo mới của lớp',
];

const DEFAULT_SCHEDULE = [
  { id: 'sch-1', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Lý thuyết', day: 'Thứ 2' },
  { id: 'sch-2', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 2' },
  { id: 'sch-3', title: 'Hệ quản trị cơ sở dữ liệu', time: '13:30 - 15:00', room: 'Phòng A302', type: 'Lý thuyết', day: 'Thứ 3' },
  { id: 'sch-4', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Bài tập', day: 'Thứ 4' },
  { id: 'sch-5', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 5' },
];

const HIGH_SCHOOL_SCHEDULE = [
  { id: 'sch-1', title: 'Toán', time: '07:00 - 07:45', room: 'P.12A1', type: 'Chính khóa', day: 'Thứ 2' },
  { id: 'sch-2', title: 'Ngữ văn', time: '07:55 - 08:40', room: 'P.12A1', type: 'Chính khóa', day: 'Thứ 2' },
  { id: 'sch-3', title: 'Tiếng Anh', time: '08:50 - 09:35', room: 'P.12A1', type: 'Chính khóa', day: 'Thứ 2' },
  { id: 'sch-4', title: 'Vật lí', time: '13:30 - 14:15', room: 'P.12A1', type: 'Tăng cường', day: 'Thứ 3' },
  { id: 'sch-5', title: 'Sinh hoạt lớp', time: '15:00 - 15:45', room: 'P.12A1', type: 'Hoạt động', day: 'Thứ 6' },
];

const DEFAULT_DOCUMENTS = [
  { id: 'doc-1', title: 'Đề cương học phần - CS101', meta: 'PDF - 1.2 MB', note: 'Mới cập nhật hôm nay' },
  { id: 'doc-2', title: 'Slide bài giảng Flutter căn bản', meta: 'PPT - 8.1 MB', note: 'Bộ môn CNTT' },
  { id: 'doc-3', title: 'Tài liệu Hệ quản trị CSDL', meta: 'PDF - 2.6 MB', note: 'Dành cho học kỳ này' },
];

const HIGH_SCHOOL_DOCUMENTS = [
  { id: 'doc-1', title: 'Đề cương ôn tập Toán 12', meta: 'PDF - 1.8 MB', note: 'Khối 12 - học kỳ II' },
  { id: 'doc-2', title: 'Ngữ liệu phân tích Văn học', meta: 'DOCX - 0.9 MB', note: 'Tổ Ngữ văn' },
  { id: 'doc-3', title: 'Bộ đề tiếng Anh chuyên đề', meta: 'PDF - 2.1 MB', note: 'Phụ trách bởi tổ Ngoại ngữ' },
];

const DEFAULT_REMINDERS = [
  { id: 'rem-1', title: 'Nộp bài tập CSDL', dueDate: '2026-05-05', done: false },
  { id: 'rem-2', title: 'Ôn thi Trí tuệ nhân tạo', dueDate: '2026-05-10', done: false },
];

const HIGH_SCHOOL_REMINDERS = [
  { id: 'rem-1', title: 'Nộp bài tập Toán chuyên đề', dueDate: '2026-05-05', done: false },
  { id: 'rem-2', title: 'Chuẩn bị sinh hoạt lớp cuối tuần', dueDate: '2026-05-10', done: false },
];

const DEFAULT_COURSES = [
  { id: 'course-1', code: 'CS301', title: 'Trí tuệ nhân tạo', credits: 3, teacher: 'TS. Nguyễn Văn B' },
  { id: 'course-2', code: 'CS302', title: 'Lập trình Flutter', credits: 3, teacher: 'ThS. Trần Thị C' },
  { id: 'course-3', code: 'CS303', title: 'Hệ quản trị CSDL', credits: 3, teacher: 'PGS. Lê Văn D' },
];

const HIGH_SCHOOL_COURSES = [
  { id: 'course-1', code: 'MATH12', title: 'Toán 12', credits: 0, teacher: 'Cô Nguyễn Thu Hà' },
  { id: 'course-2', code: 'LIT12', title: 'Ngữ văn 12', credits: 0, teacher: 'Cô Phạm Minh Tâm' },
  { id: 'course-3', code: 'ENG12', title: 'Tiếng Anh 12', credits: 0, teacher: 'Thầy Trần Huy Hoàng' },
];

const EDITABLE_PERSONAL_FIELDS = [
  'ethnicity',
  'religion',
  'nationality',
  'region',
  'identityNumber',
  'issuedDate',
  'issuedBy',
  'subjectGroup',
  'unionDate',
  'partyDate',
  'contactAddress',
  'permanentAddress',
];

function isHighSchool(schoolId = DEFAULT_SCHOOL_ID) {
  return normalizeSchoolId(schoolId) === 'nguyen-thi-due';
}

function getDefaultAcademicInfo(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_ACADEMIC_INFO : DEFAULT_ACADEMIC_INFO;
}

function getDefaultPersonalInfo(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_PERSONAL_INFO : DEFAULT_PERSONAL_INFO;
}

function getDefaultFamilyInfo(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_FAMILY_INFO : DEFAULT_FAMILY_INFO;
}

function getDefaultBootstrapSuggestions(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_BOOTSTRAP_SUGGESTIONS : DEFAULT_BOOTSTRAP_SUGGESTIONS;
}

function getUserDataPath(schoolId = DEFAULT_SCHOOL_ID) {
  return getSchoolScopedPath(USER_DATA_PATH, schoolId, 'user-data.json');
}

function loadUserData(schoolId = DEFAULT_SCHOOL_ID) {
  try {
    const dataPath = getUserDataPath(schoolId);
    const dir = dirname(dataPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!existsSync(dataPath)) {
      const initial = {};
      writeFileSync(dataPath, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(readFileSync(dataPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveUserData(data, schoolId = DEFAULT_SCHOOL_ID) {
  const dataPath = getUserDataPath(schoolId);
  const dir = dirname(dataPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getUserRef(userOrId) {
  if (typeof userOrId === 'object' && userOrId) {
    return { id: userOrId.id, schoolId: normalizeSchoolId(userOrId.schoolId) };
  }
  return { id: userOrId, schoolId: DEFAULT_SCHOOL_ID };
}

function getUserData(userOrId) {
  const { id: userId, schoolId } = getUserRef(userOrId);
  const all = loadUserData(schoolId);
  if (!all[userId]) {
    all[userId] = createDefaultUserData(schoolId);
    saveUserData(all, schoolId);
  }
  return all[userId];
}

function createDefaultUserData(schoolId = DEFAULT_SCHOOL_ID) {
  return {
    conversations: createInitialConversations(schoolId),
    schedule: getDefaultSchedule(schoolId),
    documents: getDefaultDocuments(schoolId),
    reminders: getDefaultReminders(schoolId),
    courses: getDefaultCourses(schoolId),
    grades: [],
    health: createDefaultHealthData(),
    ...createDefaultNotificationData(),
  };
}

function getDefaultSchedule(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_SCHEDULE : DEFAULT_SCHEDULE;
}

function getDefaultDocuments(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_DOCUMENTS : DEFAULT_DOCUMENTS;
}

function getDefaultReminders(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_REMINDERS : DEFAULT_REMINDERS;
}

function getDefaultCourses(schoolId = DEFAULT_SCHOOL_ID) {
  return isHighSchool(schoolId) ? HIGH_SCHOOL_COURSES : DEFAULT_COURSES;
}

export function createInitialConversations(schoolId = DEFAULT_SCHOOL_ID) {
  if (isHighSchool(schoolId)) {
    return [
      {
        id: 'conv-main',
        title: 'Trợ lý học tập Nguyễn Thị Duệ',
        updatedAt: new Date().toISOString(),
        messages: [
          {
            id: randomUUID(),
            role: 'assistant',
            content:
              'Xin chào. Mình là trợ lý nội bộ của THPT Nguyễn Thị Duệ. Mình có thể giúp em xem lịch học, nhắc bài tập, tìm tài liệu ôn tập và tóm tắt nội dung bài học.',
            createdAt: new Date().toISOString(),
            sources: [],
          },
        ],
      },
    ];
  }

  return [
    {
      id: 'conv-main',
      title: 'Trợ lý học tập Sao Đỏ',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: randomUUID(),
          role: 'assistant',
          content:
            'Xin chào. Mình là trợ lý học tập Sao Đỏ. Bạn có thể hỏi lịch học, tìm tài liệu, tóm tắt bài giảng hoặc nhắc nhở công việc học tập hằng ngày.',
          createdAt: new Date().toISOString(),
          sources: [],
        },
      ],
    },
  ];
}

export function createCatalog(user = { id: 'test-user', fullName: 'Sinh viên', faculty: 'Công nghệ thông tin' }) {
  const school = getSchoolConfig(user.schoolId);
  return {
    user: {
      id: user.id,
      name: user.fullName,
      school: school.name,
      major: user.faculty,
    },
    schedule: getDefaultSchedule(user.schoolId),
    documents: getDefaultDocuments(user.schoolId),
    reminders: getDefaultReminders(user.schoolId),
    courses: getDefaultCourses(user.schoolId),
    grades: [],
  };
}

function requireAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return getUserFromToken(authHeader.slice(7));
}

export function createAppServer(options = {}) {
  const {
    assistantReply = generateAssistantReply,
    pushNotifier,
    corsAllowOrigin = process.env.CORS_ALLOW_ORIGIN || '*',
  } = options;

  const authRoutes = createAuthRoutes();
  const aiReasoningRoutes = createAiReasoningRoutes();

  return createServer(async (req, res) => {
    setCors(req, res, corsAllowOrigin);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const routeKey = `${req.method} ${url.pathname}`;

      if (authRoutes[routeKey]) {
        return authRoutes[routeKey](req, res);
      }

      // AI Reasoning routes
      if (aiReasoningRoutes[routeKey]) {
        return aiReasoningRoutes[routeKey](req, res);
      }

      if (req.method === 'GET' && url.pathname === '/api/health') {
        const port = Number(process.env.PORT || 9191);
        return sendJson(res, 200, {
          ok: true,
          service: 'saodo-assistant-backend',
          port,
          assistant: getAssistantRuntimeStatus(),
        });
      }

      // Temporary debug endpoint - remove after verifying deployment
      if (req.method === 'GET' && url.pathname === '/api/debug/users') {
        const db = loadDb('sao-do');
        return sendJson(res, 200, {
          userCount: db.users.length,
          userEmails: db.users.map(u => u.email),
          userIds: db.users.map(u => u.studentId),
        });
      }

      const user = requireAuth(req);

      if (url.pathname.startsWith('/api/groups')) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const handled = await handleGroupRoutes(req, res, url, user);
        if (handled) return;
      }

      if (url.pathname.startsWith('/api/documents')) {
        const handled = await handleDocumentRoutes(req, res, url);
        if (handled) return;
      }

      if (req.method === 'GET' && url.pathname === '/api/app/bootstrap') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const todayReminders = userData.reminders.filter(r => !r.done);
        const unreadNotifications = userData.notifications.filter((item) => !item.is_read).length;
        return sendJson(res, 200, {
          user: {
            id: user.id,
            name: user.fullName,
            school: getSchoolConfig(user.schoolId).name,
            major: user.faculty,
          },
          stats: {
            classesToday: userData.schedule.length,
            reminders: todayReminders.length + unreadNotifications,
            documents: userData.documents.length,
          },
          suggestions: getDefaultBootstrapSuggestions(user.schoolId),
          schedule: userData.schedule,
          documents: userData.documents,
          conversations: summarizeConversations(userData.conversations),
        });
      }

      if (req.method === 'GET' && url.pathname === '/api/conversations') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { conversations: summarizeConversations(userData.conversations) });
      }

      if (req.method === 'POST' && url.pathname === '/api/conversations') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const conversation = {
          id: randomUUID(),
          title: body?.title || 'Hỏi đáp mới',
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        userData.conversations.unshift(conversation);
        saveUserDataForUser(user, userData);
        return sendJson(res, 201, { conversation: summarizeConversation(conversation) });
      }

      if (req.method === 'GET') {
        const conversationId = getConversationId(url.pathname);
        if (conversationId) {
          if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
          const userData = getUserData(user);
          let conversation = userData.conversations.find((item) => item.id === conversationId);
          if (!conversation) {
            conversation = {
              id: conversationId,
              title: 'Hỏi đáp mới',
              updatedAt: new Date().toISOString(),
              messages: [],
            };
            userData.conversations.unshift(conversation);
            saveUserDataForUser(user, userData);
          }
          return sendJson(res, 200, {
            conversation: summarizeConversation(conversation),
            messages: conversation.messages,
          });
        }
      }

      if (req.method === 'POST' && url.pathname === '/api/chat/send') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const message = String(body?.message || '').trim();
        const userData = getUserData(user);
        if (!message) return sendJson(res, 400, { error: 'Message is required' });

        // Use client-provided conversationId to keep frontend-backend in sync
        const requestedId = String(body?.conversationId || '').trim();
        let conversation = requestedId
          ? userData.conversations.find((item) => item.id === requestedId)
          : userData.conversations[0];

        if (!conversation) {
          conversation = {
            id: requestedId || randomUUID(),
            title: 'H\u1ecfi \u0111\u00e1p m\u1edbi',
            updatedAt: new Date().toISOString(),
            messages: [],
          };
          userData.conversations.unshift(conversation);
        }

        conversation.messages.push({
          id: randomUUID(),
          role: 'user',
          content: message,
          createdAt: new Date().toISOString(),
        });

        const catalog = {
          user: { id: user.id, name: user.fullName, school: getSchoolConfig(user.schoolId).name, major: user.faculty },
          schedule: userData.schedule,
          documents: userData.documents,
          courses: userData.courses,
        };
        const attachments = Array.isArray(body?.attachments) ? body.attachments : [];
        const assistant = await assistantReply({ message, conversation, catalog, attachments });
        const assistantMessage = {
          id: randomUUID(),
          role: 'assistant',
          content: assistant.content,
          createdAt: new Date().toISOString(),
          sources: assistant.sources || [],
        };

        conversation.messages.push(assistantMessage);
        conversation.updatedAt = assistantMessage.createdAt;
        conversation.title = buildConversationTitle(conversation);
        saveUserDataForUser(user, userData);

        return sendJson(res, 200, {
          conversation: summarizeConversation(conversation),
          message: assistantMessage,
        });
      }

      if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const result = await sendAiMessage({
          body,
          user,
          userData,
          assistantReply,
          saveUserData: saveUserDataForUser,
        });
        return sendJson(res, result.status, result.payload);
      }

      if (url.pathname.startsWith('/api/health/')) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const result = await handleHealthRoute({ req, url, userData, assistantReply });
        if (!result) return sendJson(res, 404, { error: 'Not found' });
        if (result.save) saveUserDataForUser(user, userData);
        return sendJson(res, result.status, result.payload);
      }

      if (req.method === 'GET' && url.pathname.startsWith('/api/statistics/')) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const period = url.searchParams.get('period') || 'month';
        const section = url.pathname.split('/').pop();
        if (section === 'dashboard') return sendJson(res, 200, buildStatistics(userData, period));
        if (['study', 'tasks', 'health', 'finance'].includes(section)) {
          return sendJson(res, 200, buildStatisticsSection(userData, section, period));
        }
        return sendJson(res, 404, { error: 'Statistics section not found' });
      }

      if (url.pathname.startsWith('/api/admin')) {
        const adminError = requireAdminUser(user);
        if (adminError) return sendJson(res, adminError.status, adminError.payload);

        if (req.method === 'GET' && url.pathname === '/api/admin/users') {
          return sendJson(res, 200, { users: listAdminUsers(user.schoolId, url.searchParams.get('search') || '') });
        }

        const userDetailMatch = /^\/api\/admin\/users\/([^/]+)$/.exec(url.pathname);
        if (req.method === 'GET' && userDetailMatch) {
          const detail = getAdminUserDetail(user.schoolId, userDetailMatch[1]);
          return detail ? sendJson(res, 200, { user: detail }) : sendJson(res, 404, { error: 'User not found' });
        }

        const statusMatch = /^\/api\/admin\/users\/([^/]+)\/status$/.exec(url.pathname);
        if (req.method === 'PUT' && statusMatch) {
          const body = await readJson(req);
          const updated = updateUserStatus({ admin: user, userId: statusMatch[1], status: body.status, schoolId: user.schoolId });
          return updated ? sendJson(res, 200, { user: updated }) : sendJson(res, 404, { error: 'User not found' });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/statistics') {
          return sendJson(res, 200, { statistics: getAdminStatistics(user.schoolId) });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/ai-logs') {
          return sendJson(res, 200, { logs: readAiLogs() });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/logs') {
          return sendJson(res, 200, { logs: readAdminLogs(user.schoolId) });
        }

        if (req.method === 'GET' && url.pathname === '/api/admin/catalog') {
          return sendJson(res, 200, getAdminCatalog());
        }

        return sendJson(res, 404, { error: 'Admin route not found' });
      }


      if (req.method === 'GET' && url.pathname === '/api/schedule/today') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { schedule: userData.schedule });
      }

      if (req.method === 'GET' && url.pathname === '/api/documents') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { documents: userData.documents });
      }

      if (req.method === 'POST' && url.pathname === '/api/documents/search') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const query = String(body?.query || '').toLowerCase();
        const results = userData.documents.filter((item) => `${item.title} ${item.note}`.toLowerCase().includes(query));
        return sendJson(res, 200, { results });
      }

      if (req.method === 'GET' && url.pathname === '/api/reminders') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        ensureNotificationData(userData);
        return sendJson(res, 200, { reminders: userData.reminders });
      }

      if (req.method === 'POST' && url.pathname === '/api/reminders') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const reminder = createReminder(user.id, body);
        if (!reminder.title) return sendJson(res, 400, { error: 'Reminder title is required' });
        userData.reminders.push(reminder);
        saveUserDataForUser(user, userData);
        return sendJson(res, 201, { reminder });
      }

      if (req.method === 'POST' && url.pathname === '/api/reminders/run-due-job') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const result = await runDueReminderJob(userData, { pushNotifier });
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, result);
      }

      if (req.method === 'PUT' && url.pathname.match(/^\/api\/reminders\/[^/]+$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').pop();
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const reminder = userData.reminders.find(r => r.id === id);
        if (!reminder) return sendJson(res, 404, { error: 'Reminder not found' });
        const body = await readJson(req);
        updateReminder(reminder, body);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { reminder });
      }

      if (req.method === 'DELETE' && url.pathname.match(/^\/api\/reminders\/[^/]+$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').pop();
        const userData = getUserData(user);
        userData.reminders = userData.reminders.filter(r => r.id !== id);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { message: 'Deleted' });
      }

      if (req.method === 'GET' && url.pathname === '/api/notifications') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const notifications = [...userData.notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sendJson(res, 200, { notifications, unreadCount: notifications.filter((item) => !item.is_read).length });
      }

      if (req.method === 'PUT' && url.pathname.match(/^\/api\/notifications\/[^/]+\/read$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').at(-2);
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const notification = markNotificationRead(userData, id);
        if (!notification) return sendJson(res, 404, { error: 'Notification not found' });
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { notification });
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications/push-token') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const pushTokens = registerPushToken(userData, body?.token);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { pushTokens });
      }

      if (req.method === 'GET' && url.pathname === '/api/courses') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { courses: userData.courses });
      }

      if (req.method === 'GET' && url.pathname === '/api/jobs') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { jobs } = ensureJobsData(userData);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { jobs });
      }

      if (req.method === 'POST' && url.pathname === '/api/jobs') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { jobs } = ensureJobsData(userData);
        const job = createJobPost(user, await readJson(req));
        if (!job) return sendJson(res, 400, { error: 'Job title is required' });
        jobs.unshift(job);
        saveUserDataForUser(user, userData);
        return sendJson(res, 201, { job });
      }

      if (req.method === 'GET' && url.pathname === '/api/job-sources') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { sources } = ensureJobsData(userData);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { sources });
      }

      if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const result = await sendAiMessage({
          body,
          user,
          userData,
          assistantReply,
          saveUserData: saveUserDataForUser,
        });
        return sendJson(res, result.status, result.payload);
      }

      if (url.pathname.startsWith('/api/health/')) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const result = await handleHealthRoute({ req, url, userData, assistantReply });
        if (!result) return sendJson(res, 404, { error: 'Not found' });
        if (result.save) saveUserDataForUser(user, userData);
        return sendJson(res, result.status, result.payload);
      }

      if (req.method === 'GET' && url.pathname.startsWith('/api/statistics/')) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const period = url.searchParams.get('period') || 'month';
        const section = url.pathname.split('/').pop();
        if (section === 'dashboard') return sendJson(res, 200, buildStatistics(userData, period));
        if (['study', 'tasks', 'health', 'finance'].includes(section)) {
          return sendJson(res, 200, buildStatisticsSection(userData, section, period));
        }
        return sendJson(res, 404, { error: 'Statistics section not found' });
      }


      if (req.method === 'GET' && url.pathname === '/api/schedule/today') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { schedule: userData.schedule });
      }

      if (req.method === 'GET' && url.pathname === '/api/reminders') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        ensureNotificationData(userData);
        return sendJson(res, 200, { reminders: userData.reminders });
      }

      if (req.method === 'POST' && url.pathname === '/api/reminders') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const reminder = createReminder(user.id, body);
        if (!reminder.title) return sendJson(res, 400, { error: 'Reminder title is required' });
        userData.reminders.push(reminder);
        saveUserDataForUser(user, userData);
        return sendJson(res, 201, { reminder });
      }

      if (req.method === 'POST' && url.pathname === '/api/reminders/run-due-job') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const result = await runDueReminderJob(userData, { pushNotifier });
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, result);
      }

      if (req.method === 'PUT' && url.pathname.match(/^\/api\/reminders\/[^/]+$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').pop();
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const reminder = userData.reminders.find(r => r.id === id);
        if (!reminder) return sendJson(res, 404, { error: 'Reminder not found' });
        const body = await readJson(req);
        updateReminder(reminder, body);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { reminder });
      }

      if (req.method === 'DELETE' && url.pathname.match(/^\/api\/reminders\/[^/]+$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').pop();
        const userData = getUserData(user);
        userData.reminders = userData.reminders.filter(r => r.id !== id);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { message: 'Deleted' });
      }

      if (req.method === 'GET' && url.pathname === '/api/notifications') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const notifications = [...userData.notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sendJson(res, 200, { notifications, unreadCount: notifications.filter((item) => !item.is_read).length });
      }

      if (req.method === 'PUT' && url.pathname.match(/^\/api\/notifications\/[^/]+\/read$/)) {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const id = url.pathname.split('/').at(-2);
        const userData = getUserData(user);
        ensureNotificationData(userData);
        const notification = markNotificationRead(userData, id);
        if (!notification) return sendJson(res, 404, { error: 'Notification not found' });
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { notification });
      }

      if (req.method === 'POST' && url.pathname === '/api/notifications/push-token') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const userData = getUserData(user);
        const pushTokens = registerPushToken(userData, body?.token);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { pushTokens });
      }

      if (req.method === 'GET' && url.pathname === '/api/courses') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { courses: userData.courses });
      }

      if (req.method === 'GET' && url.pathname === '/api/jobs') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { jobs } = ensureJobsData(userData);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { jobs });
      }

      if (req.method === 'POST' && url.pathname === '/api/jobs') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { jobs } = ensureJobsData(userData);
        const job = createJobPost(user, await readJson(req));
        if (!job) return sendJson(res, 400, { error: 'Job title is required' });
        jobs.unshift(job);
        saveUserDataForUser(user, userData);
        return sendJson(res, 201, { job });
      }

      if (req.method === 'GET' && url.pathname === '/api/job-sources') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { sources } = ensureJobsData(userData);
        saveUserDataForUser(user, userData);
        return sendJson(res, 200, { sources });
      }

      if (req.method === 'POST' && url.pathname === '/api/jobs/crawl/public-sources') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        const { jobs } = ensureJobsData(userData);
        const result = ingestPublicJobSource(await readJson(req));
        if (result.status === 202) {
          jobs.unshift(...result.payload.ingestedJobs);
          saveUserDataForUser(user, userData);
        }
        return sendJson(res, result.status, result.payload);
      }

      if (req.method === 'GET' && url.pathname === '/api/grades') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const userData = getUserData(user);
        return sendJson(res, 200, { grades: userData.grades });
      }

      if (req.method === 'GET' && url.pathname === '/api/profile') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const db = loadDb(user.schoolId);
        const userEntry = db.users.find(u => u.id === user.id);
        if (!userEntry) return sendJson(res, 404, { error: 'User not found' });
        return sendJson(res, 200, buildProfilePayload(userEntry, user.schoolId));
      }

      if (req.method === 'PUT' && url.pathname === '/api/profile/avatar') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const db = loadDb(user.schoolId);
        const userEntry = db.users.find(u => u.id === user.id);
        if (!userEntry) return sendJson(res, 404, { error: 'User not found' });
        userEntry.avatarUrl = normalizeAvatarUrl(body.avatarUrl);
        saveDb(db, user.schoolId);
        return sendJson(res, 200, buildProfilePayload(userEntry, user.schoolId));
      }

      if (req.method === 'PUT' && url.pathname === '/api/profile') {
        if (!user) return sendJson(res, 401, { error: 'Unauthorized' });
        const body = await readJson(req);
        const db = loadDb(user.schoolId);
        const userEntry = db.users.find(u => u.id === user.id);
        if (!userEntry) return sendJson(res, 404, { error: 'User not found' });
        applyEditableProfileFields(userEntry, body, db);
        saveDb(db, user.schoolId);
        return sendJson(res, 200, buildProfilePayload(userEntry, user.schoolId));
      }

      return sendJson(res, 404, { error: 'Not found' });
    } catch (error) {
      if (error instanceof HttpError) {
        return sendJson(res, error.statusCode, { error: error.message });
      }
      return sendJson(res, 500, { error: 'Internal server error' });
    }
  });
}

function saveUserDataForUser(userOrId, data) {
  const { id: userId, schoolId } = getUserRef(userOrId);
  const all = loadUserData(schoolId);
  all[userId] = data;
  saveUserData(all, schoolId);
}

function inferAccountType(userEntry, schoolId) {
  if (userEntry.accountType) return userEntry.accountType;
  if (schoolId === 'nguyen-thi-due') {
    if (userEntry.role === 'admin') return 'highschool_principal';
    if (userEntry.role === 'teacher') return 'highschool_teacher';
    if (userEntry.role === 'student_media') return 'highschool_media_student';
    return 'highschool_student';
  }
  if (userEntry.role === 'teacher') return 'university_teacher';
  return 'university_student';
}

function buildProfilePayload(userEntry, schoolId) {
  const profile = buildStudentProfile(userEntry, schoolId);
  return {
    user: buildProfileUser(userEntry, schoolId, profile),
    profile,
  };
}

function buildProfileUser(userEntry, schoolId, profile = buildStudentProfile(userEntry, schoolId)) {
  const accountType = inferAccountType(userEntry, schoolId);
  return {
    id: userEntry.id,
    studentId: userEntry.studentId,
    schoolId,
    schoolName: getSchoolConfig(schoolId).name,
    fullName: userEntry.fullName,
    faculty: userEntry.faculty,
    email: userEntry.email,
    phone: userEntry.phone,
    dateOfBirth: userEntry.dateOfBirth,
    avatarUrl: userEntry.avatarUrl || null,
    role: userEntry.role || 'student',
    accountType,
    status: userEntry.status || 'active',
    profile,
  };
}

function buildStudentProfile(userEntry, schoolId) {
  const academicInfo = {
    ...getDefaultAcademicInfo(schoolId),
    ...(userEntry.academicInfo || {}),
    studentCode: userEntry.studentId,
    schoolName: getSchoolConfig(schoolId).name,
    major: userEntry.academicInfo?.major || userEntry.faculty || 'Công nghệ thông tin',
  };

  const personalInfo = {
    ...getDefaultPersonalInfo(schoolId),
    ...(userEntry.personalInfo || {}),
    fullName: userEntry.fullName,
    dateOfBirth: userEntry.dateOfBirth || userEntry.personalInfo?.dateOfBirth || '',
    phone: userEntry.phone || userEntry.personalInfo?.phone || '',
    email: userEntry.email || userEntry.personalInfo?.email || '',
  };

  return {
    avatarUrl: userEntry.avatarUrl || null,
    academicInfo,
    personalInfo,
    familyInfo: {
      ...getDefaultFamilyInfo(schoolId),
      ...(userEntry.familyInfo || {}),
    },
  };
}

function applyEditableProfileFields(userEntry, body, db) {
  const topLevelStringFields = ['fullName', 'phone', 'email', 'dateOfBirth'];
  for (const field of topLevelStringFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      const value = normalizeProfileString(body[field], field === 'fullName' ? 120 : 255);
      if (field === 'fullName' && !value) throw new HttpError(400, 'Họ tên không được để trống');
      if (field === 'email' && value) {
        const normalizedEmail = value.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new HttpError(400, 'Email không hợp lệ');
        if (db.users.some((user) => user.id !== userEntry.id && user.email?.toLowerCase() === normalizedEmail)) {
          throw new HttpError(409, 'Email đã được sử dụng bởi tài khoản khác');
        }
        userEntry.email = normalizedEmail;
        continue;
      }
      userEntry[field] = value;
    }
  }

  if (body.personalInfo && typeof body.personalInfo === 'object') {
    userEntry.personalInfo = userEntry.personalInfo || {};
    for (const field of EDITABLE_PERSONAL_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body.personalInfo, field)) {
        userEntry.personalInfo[field] = normalizeProfileString(body.personalInfo[field], 500);
      }
    }
  }
}

function normalizeProfileString(value, maxLength) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') throw new HttpError(400, 'Dữ liệu hồ sơ không hợp lệ');
  return value.trim().slice(0, maxLength);
}

function normalizeAvatarUrl(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new HttpError(400, 'Ảnh đại diện không hợp lệ');
  const trimmed = value.trim();
  if (trimmed.length > 750_000) throw new HttpError(413, 'Ảnh đại diện quá lớn');
  const isImageDataUrl = /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=\s]+$/i.test(trimmed);
  if (!isImageDataUrl) throw new HttpError(400, 'Ảnh đại diện phải là dữ liệu ảnh hợp lệ');
  return trimmed;
}

async function handleHealthRoute({ req, url, userData, assistantReply }) {
  const health = ensureHealthData(userData);
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/health/profile') {
    return { status: 200, payload: { profile: health.profile } };
  }

  if (req.method === 'PUT' && pathname === '/api/health/profile') {
    const profile = upsertHealthProfile(health, await readJson(req));
    return { status: 200, payload: { profile }, save: true };
  }

  if (req.method === 'GET' && pathname === '/api/health/statistics') {
    return { status: 200, payload: { statistics: buildHealthStatistics(health) } };
  }

  if (req.method === 'POST' && pathname === '/api/health/bmi') {
    const body = await readJson(req);
    const bmi = calculateBmi({ weightKg: body.weightKg, heightCm: body.heightCm || health.profile.heightCm });
    if (!bmi) return { status: 400, payload: { error: 'Cân nặng hoặc chiều cao không hợp lệ.' } };
    return { status: 200, payload: { bmi } };
  }

  if (req.method === 'POST' && pathname === '/api/health/ai-suggestions') {
    const suggestion = await buildAiHealthSuggestion({ health, assistantReply });
    return { status: 200, payload: suggestion };
  }

  const collectionMatch = /^\/api\/health\/(weight-logs|sleep-logs|meal-logs|workout-plans|workout-logs|mood-logs)(?:\/([^/]+))?$/.exec(pathname);
  if (!collectionMatch) return null;
  const [, collectionName, id] = collectionMatch;

  if (req.method === 'GET' && !id) {
    const logs = listHealthLogs(health, collectionName);
    return logs ? { status: 200, payload: { logs } } : null;
  }

  if (req.method === 'POST' && !id) {
    const log = createHealthLog(health, collectionName, await readJson(req));
    return log ? { status: 201, payload: { log }, save: true } : null;
  }

  if (req.method === 'PUT' && id) {
    const log = updateHealthLog(health, collectionName, id, await readJson(req));
    return log ? { status: 200, payload: { log }, save: true } : { status: 404, payload: { error: 'Health log not found' } };
  }

  if (req.method === 'DELETE' && id) {
    const deleted = deleteHealthLog(health, collectionName, id);
    return deleted ? { status: 200, payload: { message: 'Deleted' }, save: true } : { status: 404, payload: { error: 'Health log not found' } };
  }

  return null;
}

function setCors(req, res, corsAllowOrigin) {
  res.setHeader('Access-Control-Allow-Origin', resolveCorsOrigin(req, corsAllowOrigin));
  res.setHeader('Access-Control-Allow-Headers', resolveCorsHeaders(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
}

function resolveCorsHeaders(req) {
  const allowHeaders = new Map([
    ['content-type', 'Content-Type'],
    ['authorization', 'Authorization'],
    ['x-school-id', 'X-School-ID'],
  ]);

  const requestedHeaders = String(req.headers['access-control-request-headers'] || '')
    .split(',')
    .map((header) => header.trim())
    .filter(Boolean);

  for (const header of requestedHeaders) {
    const normalizedHeader = header.toLowerCase();
    if (!allowHeaders.has(normalizedHeader)) {
      allowHeaders.set(normalizedHeader, header);
    }
  }

  return Array.from(allowHeaders.values()).join(', ');
}

function resolveCorsOrigin(req, corsAllowOrigin) {
  if (!corsAllowOrigin || corsAllowOrigin === '*') return '*';

  const configuredOrigins = corsAllowOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) return '*';

  const requestedOrigin = String(req.headers.origin || '').trim();
  if (!requestedOrigin) return configuredOrigins[0];

  const allowedOrigins = new Set(configuredOrigins.flatMap(expandLoopbackOriginVariants));
  return allowedOrigins.has(requestedOrigin) ? requestedOrigin : configuredOrigins[0];
}

function expandLoopbackOriginVariants(origin) {
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost') {
      const loopbackUrl = new URL(origin);
      loopbackUrl.hostname = '127.0.0.1';
      return [origin, loopbackUrl.toString().replace(/\/$/, '')];
    }
    if (url.hostname === '127.0.0.1') {
      const localhostUrl = new URL(origin);
      localhostUrl.hostname = 'localhost';
      return [origin, localhostUrl.toString().replace(/\/$/, '')];
    }
  } catch {
    return [origin];
  }
  return [origin];
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function summarizeConversations(conversations) {
  return conversations.map(summarizeConversation);
}

function summarizeConversation(conversation) {
  return {
    id: conversation.id,
    title: conversation.title,
    updatedAt: conversation.updatedAt,
    preview: conversation.messages.at(-1)?.content || '',
  };
}

function buildConversationTitle(conversation) {
  const firstUserMessage = conversation.messages.find((item) => item.role === 'user');
  if (!firstUserMessage) return conversation.title;
  return firstUserMessage.content.slice(0, 36);
}

function getConversationId(pathname) {
  const match = /^\/api\/conversations\/([^/]+)$/.exec(pathname);
  return match?.[1] || null;
}

async function readJson(req) {
  const maxBodyBytes = Number(process.env.SAODO_MAX_JSON_BODY_BYTES || 1024 * 1024);
  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > maxBodyBytes) {
    throw new HttpError(413, 'Request body quá lớn');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      throw new HttpError(413, 'Request body quá lớn');
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}


