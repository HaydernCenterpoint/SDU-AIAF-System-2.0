// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../packages/backend/src/auth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'packages', 'backend', 'data', 'ntd');
const now = new Date().toISOString();
const password = '123'; // Default easy password for demo students

const students = [
  { id: 'demo-ntd-001', studentId: 'HS2024001', email: 'mai.nguyen@ntd.edu.vn', fullName: 'Nguyễn Trần Trúc Mai', dateOfBirth: '2008-05-12', faculty: 'Khối 10', phone: '0912345678', major: 'Lớp 10A1' },
  { id: 'demo-ntd-002', studentId: 'HS2024002', email: 'tuan.tran@ntd.edu.vn', fullName: 'Trần Anh Tuấn', dateOfBirth: '2007-08-20', faculty: 'Khối 11', phone: '0987654321', major: 'Lớp 11A2' },
  { id: 'demo-ntd-003', studentId: 'HS2024003', email: 'lan.le@ntd.edu.vn', fullName: 'Lê Phương Lan', dateOfBirth: '2006-11-02', faculty: 'Khối 12', phone: '0901122334', major: 'Lớp 12A1' },
  { id: 'demo-ntd-004', studentId: 'HS2024004', email: 'dung.pham@ntd.edu.vn', fullName: 'Phạm Trí Dũng', dateOfBirth: '2008-01-15', faculty: 'Khối 10', phone: '0911223344', major: 'Lớp 10A2' },
  { id: 'demo-ntd-005', studentId: 'HS2024005', email: 'hoa.bui@ntd.edu.vn', fullName: 'Bùi Thị Thanh Hoa', dateOfBirth: '2007-03-25', faculty: 'Khối 11', phone: '0922334455', major: 'Lớp 11A1' },
  { id: 'demo-ntd-006', studentId: 'HS2024006', email: 'khoa.dang@ntd.edu.vn', fullName: 'Đặng Minh Khoa', dateOfBirth: '2006-09-10', faculty: 'Khối 12', phone: '0933445566', major: 'Lớp 12A2' },
  { id: 'demo-ntd-007', studentId: 'HS2024007', email: 'ngoc.vu@ntd.edu.vn', fullName: 'Vũ Bích Ngọc', dateOfBirth: '2008-12-05', faculty: 'Khối 10', phone: '0944556677', major: 'Lớp 10A3' },
  { id: 'demo-ntd-008', studentId: 'HS2024008', email: 'hieu.do@ntd.edu.vn', fullName: 'Đỗ Trung Hiếu', dateOfBirth: '2007-07-14', faculty: 'Khối 11', phone: '0955667788', major: 'Lớp 11A3' },
  { id: 'demo-ntd-009', studentId: 'HS2024009', email: 'trang.hoang@ntd.edu.vn', fullName: 'Hoàng Thu Trang', dateOfBirth: '2006-04-30', faculty: 'Khối 12', phone: '0966778899', major: 'Lớp 12A3' },
  { id: 'demo-ntd-010', studentId: 'HS2024010', email: 'thang.ngo@ntd.edu.vn', fullName: 'Ngô Đức Thắng', dateOfBirth: '2008-02-28', faculty: 'Khối 10', phone: '0977889900', major: 'Lớp 10A4' },
];

// Helper to generate schedules
const getScheduleForClass = (major) => {
  if (major.startsWith('Lớp 10')) {
    return [
      { id: 'sch-10-1', title: 'Toán Đại Số', time: '07:30 - 08:15', room: 'Phòng 101', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-10-2', title: 'Ngữ Văn', time: '08:20 - 09:05', room: 'Phòng 101', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-10-3', title: 'Vật Lý', time: '09:20 - 10:05', room: 'Phòng 101', type: 'Bài tập', day: 'Thứ 2' },
      { id: 'sch-10-4', title: 'Thể Dục', time: '14:00 - 14:45', room: 'Sân Trường', type: 'Thực hành', day: 'Thứ 3' },
    ];
  } else if (major.startsWith('Lớp 11')) {
    return [
      { id: 'sch-11-1', title: 'Hóa Học', time: '07:30 - 08:15', room: 'Phòng 202', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-11-2', title: 'Toán Hình Học', time: '08:20 - 09:05', room: 'Phòng 202', type: 'Lý thuyết', day: 'Thứ 4' },
      { id: 'sch-11-3', title: 'Tiếng Anh', time: '09:20 - 10:05', room: 'Phòng 202', type: 'Lý thuyết', day: 'Thứ 5' },
    ];
  } else {
    return [
      { id: 'sch-12-1', title: 'Toán Giải Tích', time: '07:30 - 08:15', room: 'Phòng 301', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-12-2', title: 'Luyện thi Đại học Toán', time: '14:00 - 15:30', room: 'Phòng 301', type: 'Ngoại khóa', day: 'Thứ 3' },
      { id: 'sch-12-3', title: 'Luyện thi Đại học Lý', time: '14:00 - 15:30', room: 'Phòng 301', type: 'Ngoại khóa', day: 'Thứ 5' },
    ];
  }
};

const getDocsForClass = (major) => {
  if (major.startsWith('Lớp 10')) {
    return [
      { id: 'doc-10-1', title: 'Đề cương ôn tập Toán Giữa Kỳ 1', meta: 'PDF - 1.2 MB', note: 'Thầy Hùng' },
      { id: 'doc-10-2', title: 'Bài giảng Văn Học Dân Gian', meta: 'PPT - 3.1 MB', note: 'Cô Hà' },
    ];
  } else if (major.startsWith('Lớp 11')) {
    return [
      { id: 'doc-11-1', title: 'Tài liệu Ôn Tập Hóa Vô Cơ', meta: 'PDF - 2.4 MB', note: 'Tự luyện' },
      { id: 'doc-11-2', title: 'Đề cương tiếng Anh Unit 3', meta: 'DOCX - 420 KB', note: 'Cô Linh' },
    ];
  } else {
    return [
      { id: 'doc-12-1', title: 'Bộ 50 đề thi thử THPT QG Môn Toán', meta: 'PDF - 15.2 MB', note: 'Rất quan trọng' },
      { id: 'doc-12-2', title: 'Tóm tắt lý thuyết Sinh Học 12', meta: 'PDF - 5.8 MB', note: 'Thầy Dũng' },
    ];
  }
};

const getRemindersForClass = (major) => {
  if (major.startsWith('Lớp 10')) {
    return [
      { id: 'rem-10-1', title: 'Kiểm tra 15p môn Sinh', dueDate: '2026-10-15', done: false },
      { id: 'rem-10-2', title: 'Nộp bài tập Ngữ Văn', dueDate: '2026-10-12', done: true },
    ];
  } else if (major.startsWith('Lớp 11')) {
    return [
      { id: 'rem-11-1', title: 'Học thuộc công thức Hóa học', dueDate: '2026-10-18', done: false },
    ];
  } else {
    return [
      { id: 'rem-12-1', title: 'Thi thử THPT Quốc Gia lần 1', dueDate: '2026-11-20', done: false },
      { id: 'rem-12-2', title: 'Nộp hồ sơ xét tuyển ĐH', dueDate: '2026-12-01', done: false },
    ];
  }
};

const getCoursesForClass = (major) => {
  if (major.startsWith('Lớp 10')) {
    return [
      { id: 'course-10-1', code: 'MATH10', title: 'Toán học 10', credits: 2, teacher: 'Thầy Nguyễn Hùng' },
      { id: 'course-10-2', code: 'LIT10', title: 'Ngữ văn 10', credits: 2, teacher: 'Cô Trần Thu Hà' },
    ];
  } else if (major.startsWith('Lớp 11')) {
    return [
      { id: 'course-11-1', code: 'CHEM11', title: 'Hóa học 11', credits: 2, teacher: 'Thầy Lê Hải' },
      { id: 'course-11-2', code: 'ENG11', title: 'Tiếng Anh 11', credits: 2, teacher: 'Cô Phạm Phương Linh' },
    ];
  } else {
    return [
      { id: 'course-12-1', code: 'MATH12', title: 'Toán học 12', credits: 2, teacher: 'Thầy Hoàng Văn Lực' },
      { id: 'course-12-2', code: 'PHYS12', title: 'Vật lý 12', credits: 2, teacher: 'Thầy Bùi Minh' },
    ];
  }
};

const getGradesForStudent = (student) => {
  const scores = [Math.floor(Math.random() * 3) + 7, Math.floor(Math.random() * 4) + 6]; // Random 7-9 and 6-9
  return [
    { id: `grade-${student.id}-1`, title: 'Kiểm tra 15 phút', score: scores[0] + 0.5, weight: '10%' },
    { id: `grade-${student.id}-2`, title: 'Kiểm tra 1 tiết', score: scores[1] + 0.5, weight: '30%' },
  ];
};

function conversationFor(student) {
  return [
    {
      id: `conv-${student.id}`,
      title: 'Trợ lí học tập Nguyễn Thị Duệ',
      updatedAt: now,
      messages: [
        {
          id: `msg-${student.id}-hello`,
          role: 'assistant',
          content: `Xin chào ${student.fullName}. Mình là Trợ lý học tập của trường THPT Nguyễn Thị Duệ. Mình có thể giúp bạn xem TKB, tài liệu ôn thi, nhắc lịch kiểm tra.`,
          createdAt: now,
          sources: [],
        },
      ],
    },
  ];
}

const authDb = {
  users: [
    ...students.map((student) => ({
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
      schoolId: 'ntd'
    })),
    // Also include the admin account here
    {
      id: 'admin-ntd-001',
      studentId: 'adminntd',
      password: hashPassword('123456'),
      email: 'admin@ntd.edu.vn',
      fullName: 'Quản trị viên Nguyễn Thị Duệ',
      role: 'admin',
      faculty: 'Ban giám hiệu',
      createdAt: now,
      schoolId: 'ntd'
    }
  ],
  pendingRegistrations: [],
  resetTokens: [],
};

const userData = Object.fromEntries(
  students.map((student) => [
    student.id,
    {
      conversations: conversationFor(student),
      schedule: getScheduleForClass(student.major),
      documents: getDocsForClass(student.major),
      reminders: getRemindersForClass(student.major),
      courses: getCoursesForClass(student.major),
      grades: getGradesForStudent(student),
    },
  ])
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'auth-db.json'), `${JSON.stringify(authDb, null, 2)}\n`);
writeFileSync(join(outputDir, 'user-data.json'), `${JSON.stringify(userData, null, 2)}\n`);

console.log(`Seeded demo data in ${outputDir}`);
console.log('Demo accounts NTD:');
for (const student of students) {
  console.log(`- ${student.studentId} / ${password} / ${student.fullName} (${student.major})`);
}
console.log(`- adminntd / 123456 / Admin Nguyễn Thị Duệ`);
