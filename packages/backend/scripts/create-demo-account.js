/**
 * Script tạo tài khoản demo đầy đủ cho dự án SDU-AIAF
 * 
 * Tài khoản: demo@sdu
 * Mật khẩu: Demo@2026
 * 
 * Chạy: node packages/backend/scripts/create-demo-account.js
 */

import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Config ───
const DEMO_ID = 'demo-full-001';
const STUDENT_ID = 'SV2026001';
const EMAIL = 'demo@sdu';
const PASSWORD = 'Demo@2026';
const FULL_NAME = 'Trần Minh Demo';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const now = new Date().toISOString();

// ─── 1. Auth user object ───
const authUser = {
  id: DEMO_ID,
  studentId: STUDENT_ID,
  password: hashPassword(PASSWORD),
  email: EMAIL,
  fullName: FULL_NAME,
  dateOfBirth: '2004-06-15',
  faculty: 'Công nghệ thông tin',
  phone: '0969123456',
  createdAt: now,
  profileComplete: true,
  schoolId: 'sdu',
  role: 'student',
  status: 'active',
};

// ─── 2. User data (schedule, courses, documents, grades, reminders, conversations, jobs, health) ───
const userData = {
  conversations: [
    {
      id: 'conv-main',
      title: 'Trợ lý học tập Sao Đỏ',
      updatedAt: now,
      messages: [
        {
          id: 'welcome-msg-001',
          role: 'assistant',
          content:
            'Xin chào Minh Demo! 👋 Mình là trợ lý học tập Sao Đỏ. Bạn có thể hỏi lịch học, tìm tài liệu, tóm tắt bài giảng hoặc nhắc nhở công việc học tập hằng ngày.',
          createdAt: now,
          sources: [],
        },
      ],
    },
  ],
  schedule: [
    { id: 'sch-d1', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Lý thuyết', day: 'Thứ 2' },
    { id: 'sch-d2', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 2' },
    { id: 'sch-d3', title: 'Hệ quản trị cơ sở dữ liệu', time: '13:30 - 15:00', room: 'Phòng A302', type: 'Lý thuyết', day: 'Thứ 3' },
    { id: 'sch-d4', title: 'Mạng máy tính', time: '08:00 - 09:30', room: 'Phòng A108', type: 'Lý thuyết', day: 'Thứ 4' },
    { id: 'sch-d5', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Bài tập', day: 'Thứ 4' },
    { id: 'sch-d6', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 5' },
    { id: 'sch-d7', title: 'Tiếng Anh chuyên ngành', time: '13:30 - 15:00', room: 'Phòng C201', type: 'Lý thuyết', day: 'Thứ 6' },
  ],
  documents: [
    { id: 'doc-d1', title: 'Đề cương học phần - CS301 Trí tuệ nhân tạo', meta: 'PDF - 1.2 MB', note: 'Mới cập nhật HK2' },
    { id: 'doc-d2', title: 'Slide bài giảng Flutter căn bản', meta: 'PPT - 8.1 MB', note: 'Bộ môn CNTT' },
    { id: 'doc-d3', title: 'Tài liệu Hệ quản trị CSDL', meta: 'PDF - 2.6 MB', note: 'Dành cho học kỳ này' },
    { id: 'doc-d4', title: 'Giáo trình Mạng máy tính', meta: 'PDF - 4.3 MB', note: 'Phiên bản 2026' },
    { id: 'doc-d5', title: 'Bài tập thực hành SQL nâng cao', meta: 'PDF - 0.8 MB', note: 'Có đáp án' },
  ],
  reminders: [
    {
      id: 'rem-d1',
      user_id: DEMO_ID,
      title: 'Nộp bài tập Trí tuệ nhân tạo',
      content: 'Nộp bài tập chương 5 - Thuật toán tìm kiếm',
      type: 'task',
      remind_at: '2026-05-15T00:00:00.000Z',
      repeat_type: 'none',
      status: 'active',
      is_sent: false,
      created_at: now,
      updated_at: now,
      done: false,
      dueDate: '2026-05-15',
    },
    {
      id: 'rem-d2',
      user_id: DEMO_ID,
      title: 'Ôn thi giữa kỳ CSDL',
      content: 'Ôn các chương 1-4, tập trung SQL và normalization',
      type: 'task',
      remind_at: '2026-05-20T00:00:00.000Z',
      repeat_type: 'none',
      status: 'active',
      is_sent: false,
      created_at: now,
      updated_at: now,
      done: false,
      dueDate: '2026-05-20',
    },
    {
      id: 'rem-d3',
      user_id: DEMO_ID,
      title: 'Họp nhóm đồ án Flutter',
      content: 'Họp nhóm tại thư viện lúc 14:00',
      type: 'custom',
      remind_at: '2026-05-14T07:00:00.000Z',
      repeat_type: 'weekly',
      status: 'active',
      is_sent: false,
      created_at: now,
      updated_at: now,
      done: false,
      dueDate: '2026-05-14T14:00',
    },
  ],
  courses: [
    { id: 'course-d1', code: 'CS301', title: 'Trí tuệ nhân tạo', credits: 3, teacher: 'TS. Nguyễn Văn Bình' },
    { id: 'course-d2', code: 'CS302', title: 'Lập trình Flutter', credits: 3, teacher: 'ThS. Trần Thị Cúc' },
    { id: 'course-d3', code: 'CS303', title: 'Hệ quản trị CSDL', credits: 3, teacher: 'PGS. Lê Văn Đạt' },
    { id: 'course-d4', code: 'CS304', title: 'Mạng máy tính', credits: 2, teacher: 'TS. Phạm Hồng Sơn' },
    { id: 'course-d5', code: 'EN201', title: 'Tiếng Anh chuyên ngành', credits: 2, teacher: 'ThS. Nguyễn Thị Lan' },
  ],
  grades: [
    { courseCode: 'CS201', courseName: 'Lập trình hướng đối tượng', credits: 3, midterm: 8.0, final: 7.5, total: 7.7, grade: 'B+', semester: 'HK1 2025-2026' },
    { courseCode: 'CS202', courseName: 'Cấu trúc dữ liệu và giải thuật', credits: 3, midterm: 9.0, final: 8.5, total: 8.7, grade: 'A', semester: 'HK1 2025-2026' },
    { courseCode: 'MA101', courseName: 'Toán cao cấp 2', credits: 3, midterm: 7.0, final: 6.5, total: 6.7, grade: 'B', semester: 'HK1 2025-2026' },
    { courseCode: 'CS101', courseName: 'Nhập môn lập trình', credits: 3, midterm: 9.5, final: 9.0, total: 9.2, grade: 'A+', semester: 'HK2 2024-2025' },
    { courseCode: 'MA100', courseName: 'Toán cao cấp 1', credits: 3, midterm: 8.0, final: 7.0, total: 7.4, grade: 'B+', semester: 'HK2 2024-2025' },
    { courseCode: 'PH101', courseName: 'Vật lý đại cương', credits: 2, midterm: 7.5, final: 8.0, total: 7.8, grade: 'B+', semester: 'HK2 2024-2025' },
  ],
  health: {
    profile: {
      heightCm: 170,
      birthYear: 2004,
      gender: 'male',
      activityLevel: 'moderate',
      waterGoalMl: 2000,
      calorieGoal: 2200,
    },
    weightLogs: [
      { date: '2026-05-01', weightKg: 65 },
      { date: '2026-05-05', weightKg: 64.8 },
      { date: '2026-05-10', weightKg: 64.5 },
    ],
    sleepLogs: [
      { date: '2026-05-11', hoursSlept: 7, quality: 'good' },
      { date: '2026-05-10', hoursSlept: 6.5, quality: 'fair' },
      { date: '2026-05-09', hoursSlept: 8, quality: 'great' },
    ],
    mealLogs: [],
    workoutPlans: [],
    workoutLogs: [],
    moodLogs: [
      { date: '2026-05-11', mood: 'happy', note: 'Hoàn thành bài tập CSDL' },
      { date: '2026-05-10', mood: 'neutral', note: '' },
    ],
    waterLogs: [],
  },
  notifications: [],
  pushTokens: [],
  jobs: [
    {
      id: 'job-student-1',
      title: 'Gia sư Tin học cơ bản cho học sinh THCS',
      employer: 'Sinh viên CNTT K15',
      description: 'Cần tìm gia sư dạy Tin học cơ bản (Word, Excel, PowerPoint) cho 2 học sinh lớp 8 tại nhà.',
      pay: '80.000đ/giờ',
      region: 'Chí Linh, Hải Dương',
      schedule: 'Tối T3, T5 (19:00 - 21:00)',
      sourceType: 'student',
      sourceLabel: 'Sinh viên đăng',
      tags: ['part-time', 'gia sư', 'gần trường'],
      postedAt: '2026-05-01T12:00:00.000Z',
      expiresAt: '2026-06-01T12:00:00.000Z',
      contact: {
        name: 'Trần Minh Đức',
        phone: '0387.654.321',
        email: 'duc.tran.k15@saodo.edu.vn',
      },
    },
    {
      id: 'job-employer-1',
      title: 'Nhân viên phục vụ ca tối',
      employer: 'Quán cà phê Sao Đỏ',
      description: 'Tuyển 2 nhân viên phục vụ bàn ca tối. Được đào tạo từ đầu.',
      pay: '22.000đ/giờ + phụ cấp',
      region: 'Phường Sao Đỏ, Chí Linh',
      schedule: '18:00 - 22:00 hàng ngày',
      sourceType: 'employer',
      sourceLabel: 'Nhà tuyển dụng',
      tags: ['ca tối', 'dịch vụ'],
      postedAt: '2026-05-02T12:00:00.000Z',
      expiresAt: '2026-05-17T12:00:00.000Z',
      contact: {
        name: 'Chị Hương (Quản lý)',
        phone: '0912.345.678',
      },
    },
  ],
};

// ─── Write to JSON files ───

// 1. School-specific auth-db.json
const schoolAuthPath = resolve(__dirname, '..', 'data', 'schools', 'sao-do', 'auth-db.json');
if (existsSync(schoolAuthPath)) {
  const db = JSON.parse(readFileSync(schoolAuthPath, 'utf8'));
  // Remove old entry if exists
  db.users = db.users.filter((u) => u.id !== DEMO_ID);
  db.users.unshift(authUser);
  writeFileSync(schoolAuthPath, JSON.stringify(db, null, 2));
  console.log(`✅ Đã thêm vào: ${schoolAuthPath}`);
} else {
  console.log(`⚠️  Không tìm thấy: ${schoolAuthPath}`);
}

// 2. Main backend auth-db.json
const mainAuthPath = resolve(__dirname, '..', 'data', 'auth-db.json');
if (existsSync(mainAuthPath)) {
  const db = JSON.parse(readFileSync(mainAuthPath, 'utf8'));
  db.users = db.users.filter((u) => u.id !== DEMO_ID);
  db.users.unshift(authUser);
  writeFileSync(mainAuthPath, JSON.stringify(db, null, 2));
  console.log(`✅ Đã thêm vào: ${mainAuthPath}`);
} else {
  console.log(`⚠️  Không tìm thấy: ${mainAuthPath}`);
}

// 3. School user-data.json
const userDataPath = resolve(__dirname, '..', 'data', 'schools', 'sao-do', 'user-data.json');
if (existsSync(userDataPath)) {
  const db = JSON.parse(readFileSync(userDataPath, 'utf8'));
  db[DEMO_ID] = userData;
  writeFileSync(userDataPath, JSON.stringify(db, null, 2));
  console.log(`✅ Đã thêm user-data vào: ${userDataPath}`);
} else {
  console.log(`⚠️  Không tìm thấy: ${userDataPath}`);
}

// 4. Also update client-react public data-demo if exists
const clientAuthPath = resolve(__dirname, '..', '..', 'client-react', 'public', 'data-demo', 'auth-db.json');
if (existsSync(clientAuthPath)) {
  const db = JSON.parse(readFileSync(clientAuthPath, 'utf8'));
  db.users = db.users.filter((u) => u.id !== DEMO_ID);
  db.users.unshift(authUser);
  writeFileSync(clientAuthPath, JSON.stringify(db, null, 2));
  console.log(`✅ Đã thêm vào: ${clientAuthPath}`);
} else {
  console.log(`ℹ️  Bỏ qua (không tìm thấy): ${clientAuthPath}`);
}

console.log('\n══════════════════════════════════════════');
console.log('🎉 TÀI KHOẢN DEMO ĐÃ TẠO THÀNH CÔNG!');
console.log('══════════════════════════════════════════');
console.log(`  Mã sinh viên : ${STUDENT_ID}`);
console.log(`  Email        : ${EMAIL}`);
console.log(`  Mật khẩu     : ${PASSWORD}`);
console.log(`  Họ tên       : ${FULL_NAME}`);
console.log(`  Khoa         : Công nghệ thông tin`);
console.log(`  Trường       : Đại học Sao Đỏ (SDU)`);
console.log('══════════════════════════════════════════');
console.log('📌 Đăng nhập bằng email hoặc mã sinh viên + mật khẩu');
console.log('');
