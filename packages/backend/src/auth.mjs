import { randomBytes, scryptSync, timingSafeEqual, randomInt } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ACCOUNT_TYPES, DEFAULT_ACCOUNT_TYPE, roleForAccountType } from './account-types.js';
import { DEFAULT_SCHOOL_ID, getAllSchoolIds, getSchoolConfig, getSchoolScopedPath, normalizeSchoolId } from './schools.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBaseDbPath() {
  return process.env.SAODO_AUTH_DB_PATH || join(__dirname, '..', 'data', 'auth-db.json');
}

function getDbPath(schoolId = DEFAULT_SCHOOL_ID) {
  return getSchoolScopedPath(getBaseDbPath(), schoolId, 'auth-db.json');
}

function ensureDir(schoolId = DEFAULT_SCHOOL_ID) {
  const dir = dirname(getDbPath(schoolId));
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function loadDb(schoolId = DEFAULT_SCHOOL_ID) {
  const dbPath = getDbPath(schoolId);
  if (!existsSync(dbPath)) {
    const initial = { users: [], pendingRegistrations: [], resetTokens: [] };
    ensureDir(schoolId);
    writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

export function saveDb(db, schoolId = DEFAULT_SCHOOL_ID) {
  ensureDir(schoolId);
  writeFileSync(getDbPath(schoolId), JSON.stringify(db, null, 2));
}

export function getUserFromToken(token) {
  const match = findTokenEntry(token);
  if (!match) return null;
  const user = match.db.users.find(u => u.id === match.tokenEntry.userId);
  return user ? { ...user, schoolId: match.schoolId, schoolName: getSchoolConfig(match.schoolId).name } : null;
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const derivedHash = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedHash, 'hex'));
}

function generateToken(length = 32) {
  return randomBytes(length).toString('hex');
}

function generateVerificationCode() {
  return String(randomInt(100000, 999999));
}

function issueSessionToken(db, userId, schoolId) {
  const token = generateToken();
  db.resetTokens.push({
    token,
    userId,
    schoolId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  return token;
}

function generateGuestStudentId(db) {
  let next = db.users.filter((user) => String(user.studentId || '').startsWith('GUEST-')).length + 1;
  let candidate = '';

  do {
    candidate = `GUEST-${String(next).padStart(4, '0')}`;
    next += 1;
  } while (db.users.some((user) => user.studentId === candidate));

  return candidate;
}

function defaultAccountTypeForSchool(schoolId) {
  return schoolId === 'nguyen-thi-due' ? 'highschool_student' : DEFAULT_ACCOUNT_TYPE;
}

function inferAccountType(user, schoolId) {
  if (user.accountType) return user.accountType;

  if (schoolId === 'nguyen-thi-due') {
    if (user.role === 'admin') return 'highschool_principal';
    if (user.role === 'teacher') return 'highschool_teacher';
    if (user.role === 'student_media') return 'highschool_media_student';
    return 'highschool_student';
  }

  if (user.role === 'teacher') return 'university_teacher';
  return DEFAULT_ACCOUNT_TYPE;
}

export function createAuthRoutes() {
  const routes = {};

  routes['POST /api/auth/register'] = async (req, res) => {
    const body = await readJson(req);
    const { studentId, password, email, fullName, major } = body;
    const schoolId = normalizeSchoolId(body.schoolId);
    const school = getSchoolConfig(schoolId);
    const accountType = String(body.accountType || defaultAccountTypeForSchool(schoolId));
    const isPublicGuest = accountType === ACCOUNT_TYPES.GUEST_PUBLIC;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if ((!studentId && !isPublicGuest) || !password || !normalizedEmail || (isPublicGuest && !fullName)) {
      return sendJson(res, 400, { error: 'Thiếu thông tin bắt buộc' });
    }
    if (password.length < 6) {
      return sendJson(res, 400, { error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return sendJson(res, 400, { error: 'Email không hợp lệ' });
    }

    const db = loadDb(schoolId);
    const normalizedStudentId = isPublicGuest ? generateGuestStudentId(db) : String(studentId).trim().toUpperCase();

    if (db.users.find((user) => user.studentId === normalizedStudentId || user.email?.toLowerCase() === normalizedEmail)) {
      return sendJson(res, 409, { error: 'Mã định danh đã được đăng ký trong cơ sở dữ liệu trường này' });
    }

    if (isPublicGuest) {
      const user = {
        id: `user-${Date.now()}`,
        studentId: normalizedStudentId,
        schoolId,
        accountType,
        password: hashPassword(password),
        email: normalizedEmail,
        fullName: String(fullName).trim(),
        dateOfBirth: '',
        faculty: String(major || '').trim() || 'Khách tham quan',
        phone: '',
        createdAt: new Date().toISOString(),
        profileComplete: true,
        role: roleForAccountType(accountType),
        status: 'active',
      };

      db.users.push(user);
      const token = issueSessionToken(db, user.id, schoolId);
      saveDb(db, schoolId);

      return sendJson(res, 200, {
        message: 'Đăng ký tài khoản khách thành công',
        studentId: normalizedStudentId,
        schoolId,
        schoolName: school.name,
        user: toPublicAuthUser(user, schoolId),
        token,
      });
    }

    const existing = db.pendingRegistrations.findIndex((pending) => pending.studentId === normalizedStudentId);
    if (existing !== -1) {
      db.pendingRegistrations.splice(existing, 1);
    }

    db.pendingRegistrations.push({
      studentId: normalizedStudentId,
      schoolId,
      accountType,
      password: hashPassword(password),
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    });

    saveDb(db, schoolId);

    return sendJson(res, 200, {
      message: 'Đăng ký thành công bước 1. Vui lòng điền thông tin cá nhân.',
      studentId: normalizedStudentId,
      schoolId,
      schoolName: school.name,
    });
  };

  routes['POST /api/auth/complete-profile'] = async (req, res) => {
    const body = await readJson(req);
    const { studentId, fullName, dateOfBirth, faculty, phone } = body;
    const schoolId = normalizeSchoolId(body.schoolId);

    if (!studentId || !fullName || !dateOfBirth || !faculty || !phone) {
      return sendJson(res, 400, { error: 'Thiếu thông tin bắt buộc' });
    }

    const db = loadDb(schoolId);
    const idx = db.pendingRegistrations.findIndex(p => p.studentId === studentId.toUpperCase());

    if (idx === -1) {
      return sendJson(res, 400, { error: 'Không tìm thấy đăng ký chờ. Vui lòng đăng ký lại.' });
    }

    const pending = db.pendingRegistrations[idx];
    const accountType = pending.accountType || defaultAccountTypeForSchool(schoolId);
    const user = {
      id: `user-${Date.now()}`,
      studentId: pending.studentId,
      schoolId,
      accountType,
      password: pending.password,
      email: pending.email,
      fullName,
      dateOfBirth,
      faculty,
      phone,
      createdAt: new Date().toISOString(),
      profileComplete: true,
      role: roleForAccountType(accountType),
      status: 'active',
    };

    db.pendingRegistrations.splice(idx, 1);
    db.users.push(user);
    saveDb(db, schoolId);

    const token = generateToken();
    db.resetTokens.push({
      token,
      userId: user.id,
      schoolId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    saveDb(db, schoolId);

    return sendJson(res, 200, {
      message: 'Hoàn tất đăng ký thành công!',
      user: toPublicAuthUser(user, schoolId),
      token,
    });
  };

  routes['POST /api/auth/login'] = async (req, res) => {
    const body = await readJson(req);
    const identifier = String(body.studentId || body.email || '').trim();
    const password = String(body.password || '');
    const schoolId = normalizeSchoolId(body.schoolId);

    if (!identifier || !password) {
      return sendJson(res, 400, { error: 'Thiếu mã sinh viên hoặc mật khẩu' });
    }

    const db = loadDb(schoolId);
    const normalizedIdentifier = identifier.toLowerCase();
    const user = db.users.find((entry) => entry.studentId === identifier.toUpperCase() || entry.email?.toLowerCase() === normalizedIdentifier);

    if (!user) {
      return sendJson(res, 401, { error: 'Email hoặc mã tài khoản không đúng' });
    }

    if (!verifyPassword(password, user.password)) {
      return sendJson(res, 401, { error: 'Email hoặc mã tài khoản không đúng' });
    }

    if (user.status === 'locked') {
      return sendJson(res, 403, { error: 'Tài khoản đã bị khóa' });
    }

    const token = generateToken();
    db.resetTokens.push({
      token,
      userId: user.id,
      schoolId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    saveDb(db, schoolId);

    return sendJson(res, 200, {
      message: 'Đăng nhập thành công',
      user: toPublicAuthUser(user, schoolId),
      token,
    });
  };

  routes['POST /api/auth/forgot-password'] = async (req, res) => {
    const body = await readJson(req);
    const { email } = body;
    const schoolId = normalizeSchoolId(body.schoolId);

    if (!email) {
      return sendJson(res, 400, { error: 'Vui lòng nhập email' });
    }

    const db = loadDb(schoolId);
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return sendJson(res, 404, { error: 'Email không tồn tại trong hệ thống' });
    }

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const existing = db.resetTokens.findIndex(t => t.userId === user.id && t.type === 'reset-code');
    if (existing !== -1) {
      db.resetTokens.splice(existing, 1);
    }

    db.resetTokens.push({
      userId: user.id,
      code,
      type: 'reset-code',
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    saveDb(db, schoolId);

    console.log(`[AUTH] Verification code for ${email}: ${code} (expires at ${expiresAt})`);

    return sendJson(res, 200, {
      message: 'Mã xác minh đã được gửi đến email của bạn',
      email,
      schoolId,
    });
  };

  routes['POST /api/auth/verify-code'] = async (req, res) => {
    const body = await readJson(req);
    const { email, code } = body;
    const schoolId = normalizeSchoolId(body.schoolId);

    if (!email || !code) {
      return sendJson(res, 400, { error: 'Thiếu email hoặc mã xác minh' });
    }

    const db = loadDb(schoolId);
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return sendJson(res, 404, { error: 'Email không tồn tại' });
    }

    const tokenEntry = db.resetTokens.find(
      t => t.userId === user.id &&
      t.type === 'reset-code' &&
      t.code === code &&
      new Date(t.expiresAt) > new Date()
    );

    if (!tokenEntry) {
      return sendJson(res, 400, { error: 'Mã xác minh không đúng hoặc đã hết hạn' });
    }

    const resetToken = generateToken();
    db.resetTokens.push({
      token: resetToken,
      userId: user.id,
      schoolId,
      type: 'password-reset',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
    saveDb(db, schoolId);

    return sendJson(res, 200, {
      message: 'Xác minh thành công',
      resetToken,
    });
  };

  routes['POST /api/auth/reset-password'] = async (req, res) => {
    const body = await readJson(req);
    const { resetToken, newPassword } = body;

    if (!resetToken || !newPassword) {
      return sendJson(res, 400, { error: 'Thiếu thông tin' });
    }

    if (newPassword.length < 6) {
      return sendJson(res, 400, { error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    const tokenMatch = findTokenEntry(resetToken, 'password-reset');
    const db = tokenMatch?.db;
    const tokenEntry = tokenMatch?.tokenEntry;

    if (!tokenEntry) {
      return sendJson(res, 400, { error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const user = db.users.find(u => u.id === tokenEntry.userId);
    if (!user) {
      return sendJson(res, 404, { error: 'Không tìm thấy người dùng' });
    }

    user.password = hashPassword(newPassword);
    saveDb(db, tokenMatch.schoolId);

    return sendJson(res, 200, {
      message: 'Đặt lại mật khẩu thành công',
    });
  };

  routes['GET /api/auth/me'] = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    const token = authHeader.slice(7);
    const tokenMatch = findTokenEntry(token);
    const db = tokenMatch?.db;
    const tokenEntry = tokenMatch?.tokenEntry;

    if (!tokenEntry) {
      return sendJson(res, 401, { error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    const user = db.users.find(u => u.id === tokenEntry.userId);
    if (!user) {
      return sendJson(res, 404, { error: 'Không tìm thấy người dùng' });
    }

    return sendJson(res, 200, {
      user: toPublicAuthUser(user, tokenMatch.schoolId),
    });
  };

  return routes;
}

function findTokenEntry(token, type) {
  for (const schoolId of getAllSchoolIds()) {
    const db = loadDb(schoolId);
    const tokenEntry = db.resetTokens.find(
      t => t.token === token &&
      (!type || t.type === type) &&
      new Date(t.expiresAt) > new Date()
    );
    if (tokenEntry) return { schoolId, db, tokenEntry };
  }
  return null;
}

function toPublicAuthUser(user, schoolId) {
  const accountType = inferAccountType(user, schoolId);
  const role = user.role || roleForAccountType(accountType);

  return {
    id: user.id,
    studentId: user.studentId,
    schoolId,
    schoolName: getSchoolConfig(schoolId).name,
    fullName: user.fullName,
    faculty: user.faculty,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    avatarUrl: user.avatarUrl || null,
    role,
    accountType,
    status: user.status || 'active',
    profile: {
      avatarUrl: user.avatarUrl || null,
      academicInfo: user.academicInfo || null,
      personalInfo: user.personalInfo || null,
      familyInfo: user.familyInfo || null,
    },
  };
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}
