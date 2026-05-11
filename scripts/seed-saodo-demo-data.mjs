// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../packages/backend/src/auth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = process.env.SAODO_DEMO_DATA_DIR || join(rootDir, 'data-demo');
const now = new Date().toISOString();
const password = 'Demo@123';

const students = [
  {
    id: 'demo-user-001',
    studentId: 'SV2024001',
    email: 'an.nguyen@saodo.edu.vn',
    fullName: 'Nguyễn Văn An',
    dateOfBirth: '2004-05-15',
    faculty: 'Công nghệ thông tin',
    phone: '0912345678',
    major: 'Kỹ thuật phần mềm',
  },
  {
    id: 'demo-user-002',
    studentId: 'SV2024002',
    email: 'binh.tran@saodo.edu.vn',
    fullName: 'Trần Thị Bình',
    dateOfBirth: '2004-08-20',
    faculty: 'Kế toán',
    phone: '0987654321',
    major: 'Kế toán doanh nghiệp',
  },
  {
    id: 'demo-user-003',
    studentId: 'SV2024003',
    email: 'cuong.le@saodo.edu.vn',
    fullName: 'Lê Minh Cường',
    dateOfBirth: '2003-11-02',
    faculty: 'Cơ khí',
    phone: '0901122334',
    major: 'Công nghệ kỹ thuật cơ khí',
  },
];

const schedules = {
  'demo-user-001': [
    { id: 'sch-it-1', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Lý thuyết', day: 'Thứ 2' },
    { id: 'sch-it-2', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 2' },
    { id: 'sch-it-3', title: 'Hệ quản trị cơ sở dữ liệu', time: '13:30 - 15:00', room: 'Phòng A302', type: 'Bài tập', day: 'Thứ 3' },
  ],
  'demo-user-002': [
    { id: 'sch-acc-1', title: 'Nguyên lý kế toán', time: '07:30 - 09:00', room: 'Phòng C101', type: 'Lý thuyết', day: 'Thứ 2' },
    { id: 'sch-acc-2', title: 'Excel ứng dụng trong kế toán', time: '09:30 - 11:00', room: 'Lab C204', type: 'Thực hành', day: 'Thứ 4' },
    { id: 'sch-acc-3', title: 'Phân tích báo cáo tài chính', time: '13:00 - 14:30', room: 'Phòng C305', type: 'Bài tập', day: 'Thứ 5' },
  ],
  'demo-user-003': [
    { id: 'sch-me-1', title: 'Chi tiết máy', time: '08:00 - 09:30', room: 'Phòng B201', type: 'Lý thuyết', day: 'Thứ 3' },
    { id: 'sch-me-2', title: 'CAD/CAM cơ bản', time: '10:00 - 11:30', room: 'Xưởng M102', type: 'Thực hành', day: 'Thứ 4' },
    { id: 'sch-me-3', title: 'Vật liệu cơ khí', time: '14:00 - 15:30', room: 'Phòng B303', type: 'Lý thuyết', day: 'Thứ 6' },
  ],
};

const documents = {
  'demo-user-001': [
    { id: 'doc-it-1', title: 'Đề cương học phần Trí tuệ nhân tạo', meta: 'PDF - 1.2 MB', note: 'Mới cập nhật' },
    { id: 'doc-it-2', title: 'Slide Flutter căn bản', meta: 'PPT - 8.1 MB', note: 'Bộ môn CNTT' },
    { id: 'doc-it-3', title: 'Bài tập lớn CSDL tuần 4', meta: 'DOC - 420 KB', note: 'Cần nộp' },
  ],
  'demo-user-002': [
    { id: 'doc-acc-1', title: 'Mẫu sổ nhật ký chung', meta: 'XLSX - 580 KB', note: 'Thực hành' },
    { id: 'doc-acc-2', title: 'Bài giảng phân tích tài chính', meta: 'PDF - 2.4 MB', note: 'Tuần này' },
    { id: 'doc-acc-3', title: 'Bộ câu hỏi ôn tập nguyên lý kế toán', meta: 'PDF - 960 KB', note: 'Ôn thi' },
  ],
  'demo-user-003': [
    { id: 'doc-me-1', title: 'Bản vẽ chi tiết máy mẫu', meta: 'PDF - 3.2 MB', note: 'Xưởng cơ khí' },
    { id: 'doc-me-2', title: 'Hướng dẫn CAD/CAM cơ bản', meta: 'PPT - 6.8 MB', note: 'Thực hành' },
    { id: 'doc-me-3', title: 'Tài liệu vật liệu cơ khí', meta: 'PDF - 1.9 MB', note: 'Bài đọc' },
  ],
};

const reminders = {
  'demo-user-001': [
    { id: 'rem-it-1', title: 'Nộp bài tập CSDL trước 21:00', dueDate: '2026-04-30', done: false },
    { id: 'rem-it-2', title: 'Chuẩn bị demo Flutter', dueDate: '2026-05-02', done: false },
    { id: 'rem-it-3', title: 'Đọc slide AI chương 2', dueDate: '2026-04-28', done: true },
  ],
  'demo-user-002': [
    { id: 'rem-acc-1', title: 'Hoàn thành bảng cân đối thử', dueDate: '2026-04-29', done: false },
    { id: 'rem-acc-2', title: 'Ôn công thức phân tích tài chính', dueDate: '2026-05-03', done: false },
  ],
  'demo-user-003': [
    { id: 'rem-me-1', title: 'Mang bản vẽ CAD khi lên xưởng', dueDate: '2026-04-29', done: false },
    { id: 'rem-me-2', title: 'Chuẩn bị báo cáo vật liệu cơ khí', dueDate: '2026-05-04', done: false },
  ],
};

const courses = {
  'demo-user-001': [
    { id: 'course-it-1', code: 'CS301', title: 'Trí tuệ nhân tạo', credits: 3, teacher: 'TS. Nguyễn Văn Bình' },
    { id: 'course-it-2', code: 'CS302', title: 'Lập trình Flutter', credits: 3, teacher: 'ThS. Trần Thị Chi' },
    { id: 'course-it-3', code: 'CS303', title: 'Hệ quản trị cơ sở dữ liệu', credits: 3, teacher: 'PGS. Lê Văn Dũng' },
  ],
  'demo-user-002': [
    { id: 'course-acc-1', code: 'AC201', title: 'Nguyên lý kế toán', credits: 3, teacher: 'ThS. Phạm Thị Hoa' },
    { id: 'course-acc-2', code: 'AC222', title: 'Phân tích báo cáo tài chính', credits: 3, teacher: 'TS. Hoàng Minh Đức' },
  ],
  'demo-user-003': [
    { id: 'course-me-1', code: 'ME210', title: 'Chi tiết máy', credits: 3, teacher: 'TS. Vũ Mạnh Hùng' },
    { id: 'course-me-2', code: 'ME240', title: 'CAD/CAM cơ bản', credits: 3, teacher: 'ThS. Đỗ Văn Sơn' },
  ],
};

function conversationFor(student) {
  return [
    {
      id: `conv-${student.id}`,
      title: 'Trợ lí học tập Sao Đỏ',
      updatedAt: now,
      messages: [
        {
          id: `msg-${student.id}-hello`,
          role: 'assistant',
          content: `Xin chào ${student.fullName}. Mình có thể giúp bạn xem lịch học, tìm tài liệu, nhắc việc và tóm tắt nội dung học tập.`,
          createdAt: now,
          sources: [],
        },
        {
          id: `msg-${student.id}-ask`,
          role: 'user',
          content: 'Hôm nay mình cần chuẩn bị gì?',
          createdAt: now,
          sources: [],
        },
        {
          id: `msg-${student.id}-reply`,
          role: 'assistant',
          content: 'Bạn nên kiểm tra lịch học gần nhất, mở tài liệu mới cập nhật và hoàn thành các nhắc nhở chưa xong.',
          createdAt: now,
          sources: [{ title: 'Lịch học hôm nay', type: 'schedule' }],
        },
      ],
    },
  ];
}

const authDb = {
  users: students.map((student) => ({
    id: student.id,
    studentId: student.studentId,
    password: hashPassword(password),
    email: student.email,
    fullName: student.fullName,
    dateOfBirth: student.dateOfBirth,
    faculty: student.faculty,
    phone: student.phone,
    createdAt: now,
    profileComplete: true,
  })),
  pendingRegistrations: [],
  resetTokens: [],
};

const userData = Object.fromEntries(
  students.map((student) => [
    student.id,
    {
      conversations: conversationFor(student),
      schedule: schedules[student.id],
      documents: documents[student.id],
      reminders: reminders[student.id],
      courses: courses[student.id],
      grades: [
        { id: `grade-${student.id}-1`, title: 'Điểm chuyên cần', score: 9.0, weight: '10%' },
        { id: `grade-${student.id}-2`, title: 'Điểm giữa kỳ', score: 8.2, weight: '30%' },
      ],
    },
  ])
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'auth-db.json'), `${JSON.stringify(authDb, null, 2)}\n`);
writeFileSync(join(outputDir, 'user-data.json'), `${JSON.stringify(userData, null, 2)}\n`);

console.log(`Seeded demo data in ${outputDir}`);
console.log('Demo accounts:');
for (const student of students) {
  console.log(`- ${student.studentId} / ${password} / ${student.fullName}`);
}
