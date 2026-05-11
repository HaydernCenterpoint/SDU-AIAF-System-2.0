import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDb, saveDb } from './auth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_AI_LOG_PATH = join(__dirname, '..', 'data', 'ai-queries.jsonl');

export function requireAdminUser(user) {
  if (!user) return { status: 401, payload: { error: 'Unauthorized' } };
  if (user.role !== 'admin') return { status: 403, payload: { error: 'Admin role required' } };
  return null;
}

export function listAdminUsers(schoolId, search = '') {
  const needle = search.trim().toLowerCase();
  const db = loadDb(schoolId);
  return db.users
    .filter((user) => !needle || `${user.studentId} ${user.fullName} ${user.email}`.toLowerCase().includes(needle))
    .map(safeUser);
}

export function getAdminUserDetail(schoolId, id) {
  return safeUser(loadDb(schoolId).users.find((user) => user.id === id));
}

export function updateUserStatus({ admin, userId, status, schoolId }) {
  const db = loadDb(schoolId);
  if (!Array.isArray(db.adminLogs)) db.adminLogs = [];
  const user = db.users.find((item) => item.id === userId);
  if (!user) return null;
  user.status = status === 'active' ? 'active' : 'locked';
  db.adminLogs.unshift({
    id: `admin-log-${Date.now()}`,
    adminId: admin.id,
    action: user.status === 'locked' ? 'lock_user' : 'unlock_user',
    targetUserId: user.id,
    createdAt: new Date().toISOString(),
  });
  saveDb(db, schoolId);
  return safeUser(user);
}

export function getAdminStatistics(schoolId) {
  const db = loadDb(schoolId);
  const aiLogs = readAiLogs();
  const users = db.users || [];
  const totalTeachers = users.filter((user) => user.role === 'teacher').length;
  const totalStudents = users.filter((user) => user.role !== 'teacher' && user.role !== 'admin').length;

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => (user.status || 'active') === 'active').length,
    lockedUsers: users.filter((user) => user.status === 'locked').length,
    totalStudents,
    totalTeachers,
    adminUsers: users.filter((user) => user.role === 'admin').length,
    aiUsage: {
      totalQueries: aiLogs.length,
      byAssistantType: aiLogs.reduce((acc, log) => {
        const type = log.assistantType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

export function readAiLogs(limit = 100) {
  const path = process.env.SAODO_AI_LOG_PATH || DEFAULT_AI_LOG_PATH;
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .slice(-limit)
    .reverse();
}

export function readAdminLogs(schoolId, limit = 100) {
  const db = loadDb(schoolId);
  return Array.isArray(db.adminLogs) ? db.adminLogs.slice(0, limit) : [];
}

export function getAdminCatalog() {
  return {
    systemNotifications: [{ id: 'sys-welcome', title: 'Chào mừng sinh viên', status: 'active' }],
    cvTemplates: [{ id: 'cv-basic', title: 'CV sinh viên cơ bản', category: 'career' }],
    reportTemplates: [{ id: 'report-basic', title: 'Báo cáo học phần', category: 'academic' }],
    categories: ['academic', 'career', 'health', 'finance', 'system'],
  };
}

function safeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    studentId: user.studentId,
    fullName: user.fullName,
    faculty: user.faculty,
    email: user.email,
    phone: user.phone,
    role: user.role || 'student',
    status: user.status || 'active',
    createdAt: user.createdAt,
  };
}
