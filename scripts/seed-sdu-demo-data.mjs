// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../packages/backend/src/auth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outputDir = join(rootDir, 'packages', 'backend', 'data', 'sdu');
const now = new Date().toISOString();
const password = '123'; // Default password

const students = [
  { id: 'demo-sdu-001', studentId: 'SV2024001', email: 'an.nguyen@saodo.edu.vn', fullName: 'Nguyễn Văn An', dateOfBirth: '2004-05-15', faculty: 'Công nghệ thông tin', phone: '0912345678', major: 'Kỹ thuật phần mềm' },
  { id: 'demo-sdu-002', studentId: 'SV2024002', email: 'binh.tran@saodo.edu.vn', fullName: 'Trần Thị Bình', dateOfBirth: '2004-08-20', faculty: 'Kế toán', phone: '0987654321', major: 'Kế toán doanh nghiệp' },
  { id: 'demo-sdu-003', studentId: 'SV2024003', email: 'cuong.le@saodo.edu.vn', fullName: 'Lê Minh Cường', dateOfBirth: '2003-11-02', faculty: 'Cơ khí', phone: '0901122334', major: 'Công nghệ kỹ thuật cơ khí' },
  { id: 'demo-sdu-004', studentId: 'SV2024004', email: 'dung.pham@saodo.edu.vn', fullName: 'Phạm Đức Dũng', dateOfBirth: '2004-01-10', faculty: 'Điện - Điện tử', phone: '0911223344', major: 'Tự động hóa' },
  { id: 'demo-sdu-005', studentId: 'SV2024005', email: 'hoa.bui@saodo.edu.vn', fullName: 'Bùi Thanh Hoa', dateOfBirth: '2005-02-28', faculty: 'Kinh tế', phone: '0922334455', major: 'Quản trị kinh doanh' },
  { id: 'demo-sdu-006', studentId: 'SV2024006', email: 'khoa.dang@saodo.edu.vn', fullName: 'Đặng Anh Khoa', dateOfBirth: '2003-09-15', faculty: 'Công nghệ thông tin', phone: '0933445566', major: 'Mạng máy tính' },
  { id: 'demo-sdu-007', studentId: 'SV2024007', email: 'ngoc.vu@saodo.edu.vn', fullName: 'Vũ Minh Ngọc', dateOfBirth: '2004-12-05', faculty: 'Du lịch', phone: '0944556677', major: 'Quản trị khách sạn' },
  { id: 'demo-sdu-008', studentId: 'SV2024008', email: 'hieu.do@saodo.edu.vn', fullName: 'Đỗ Trung Hiếu', dateOfBirth: '2005-07-14', faculty: 'Cơ khí', phone: '0955667788', major: 'Công nghệ kỹ thuật ô tô' },
  { id: 'demo-sdu-009', studentId: 'SV2024009', email: 'trang.hoang@saodo.edu.vn', fullName: 'Hoàng Thu Trang', dateOfBirth: '2004-04-30', faculty: 'Ngoại ngữ', phone: '0966778899', major: 'Ngôn ngữ Anh' },
  { id: 'demo-sdu-010', studentId: 'SV2024010', email: 'thang.ngo@saodo.edu.vn', fullName: 'Ngô Đức Thắng', dateOfBirth: '2003-02-20', faculty: 'Điện - Điện tử', phone: '0977889900', major: 'Hệ thống điện' },
];

const getScheduleForFaculty = (faculty) => {
  if (faculty === 'Công nghệ thông tin') {
    return [
      { id: 'sch-it-1', title: 'Trí tuệ nhân tạo', time: '08:00 - 09:30', room: 'Phòng A205', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-it-2', title: 'Lập trình Flutter', time: '10:00 - 11:30', room: 'Lab B103', type: 'Thực hành', day: 'Thứ 2' },
      { id: 'sch-it-3', title: 'Hệ quản trị cơ sở dữ liệu', time: '13:30 - 15:00', room: 'Phòng A302', type: 'Bài tập', day: 'Thứ 3' },
    ];
  } else if (faculty === 'Kế toán' || faculty === 'Kinh tế') {
    return [
      { id: 'sch-acc-1', title: 'Nguyên lý kế toán', time: '07:30 - 09:00', room: 'Phòng C101', type: 'Lý thuyết', day: 'Thứ 2' },
      { id: 'sch-acc-2', title: 'Excel ứng dụng', time: '09:30 - 11:00', room: 'Lab C204', type: 'Thực hành', day: 'Thứ 4' },
      { id: 'sch-acc-3', title: 'Phân tích tài chính', time: '13:00 - 14:30', room: 'Phòng C305', type: 'Bài tập', day: 'Thứ 5' },
    ];
  } else {
    return [
      { id: 'sch-me-1', title: 'Hình họa kỹ thuật', time: '08:00 - 09:30', room: 'Phòng B201', type: 'Lý thuyết', day: 'Thứ 3' },
      { id: 'sch-me-2', title: 'Thực hành CAD', time: '10:00 - 11:30', room: 'Xưởng M102', type: 'Thực hành', day: 'Thứ 4' },
      { id: 'sch-me-3', title: 'Vật liệu kỹ thuật', time: '14:00 - 15:30', room: 'Phòng B303', type: 'Lý thuyết', day: 'Thứ 6' },
    ];
  }
};

const getDocsForFaculty = (faculty) => {
  if (faculty === 'Công nghệ thông tin') {
    return [
      { id: 'doc-it-1', title: 'Đề cương học phần Trí tuệ nhân tạo', meta: 'PDF - 1.2 MB', note: 'Mới cập nhật' },
      { id: 'doc-it-2', title: 'Slide Flutter căn bản', meta: 'PPT - 8.1 MB', note: 'Bộ môn CNTT' },
    ];
  } else if (faculty === 'Kế toán' || faculty === 'Kinh tế') {
    return [
      { id: 'doc-acc-1', title: 'Mẫu sổ nhật ký chung', meta: 'XLSX - 580 KB', note: 'Thực hành' },
      { id: 'doc-acc-2', title: 'Bài giảng phân tích tài chính', meta: 'PDF - 2.4 MB', note: 'Tuần này' },
    ];
  } else {
    return [
      { id: 'doc-me-1', title: 'Bản vẽ chi tiết máy mẫu', meta: 'PDF - 3.2 MB', note: 'Xưởng cơ khí' },
      { id: 'doc-me-2', title: 'Hướng dẫn CAD/CAM cơ bản', meta: 'PPT - 6.8 MB', note: 'Thực hành' },
    ];
  }
};

const getRemindersForFaculty = (faculty) => {
  if (faculty === 'Công nghệ thông tin') {
    return [
      { id: 'rem-it-1', title: 'Nộp bài tập CSDL trước 21:00', dueDate: '2026-04-30', done: false },
      { id: 'rem-it-2', title: 'Đọc slide AI chương 2', dueDate: '2026-04-28', done: true },
    ];
  } else if (faculty === 'Kế toán' || faculty === 'Kinh tế') {
    return [
      { id: 'rem-acc-1', title: 'Hoàn thành bảng cân đối thử', dueDate: '2026-04-29', done: false },
    ];
  } else {
    return [
      { id: 'rem-me-1', title: 'Mang bản vẽ CAD khi lên xưởng', dueDate: '2026-04-29', done: false },
    ];
  }
};

const getCoursesForFaculty = (faculty) => {
  if (faculty === 'Công nghệ thông tin') {
    return [
      { id: 'course-it-1', code: 'CS301', title: 'Trí tuệ nhân tạo', credits: 3, teacher: 'TS. Nguyễn Văn Bình' },
      { id: 'course-it-2', code: 'CS302', title: 'Lập trình Flutter', credits: 3, teacher: 'ThS. Trần Thị Chi' },
    ];
  } else if (faculty === 'Kế toán' || faculty === 'Kinh tế') {
    return [
      { id: 'course-acc-1', code: 'AC201', title: 'Nguyên lý kế toán', credits: 3, teacher: 'ThS. Phạm Thị Hoa' },
      { id: 'course-acc-2', code: 'AC222', title: 'Phân tích báo cáo tài chính', credits: 3, teacher: 'TS. Hoàng Minh Đức' },
    ];
  } else {
    return [
      { id: 'course-me-1', code: 'ME210', title: 'Hình họa kỹ thuật', credits: 3, teacher: 'TS. Vũ Mạnh Hùng' },
      { id: 'course-me-2', code: 'ME240', title: 'CAD cơ bản', credits: 3, teacher: 'ThS. Đỗ Văn Sơn' },
    ];
  }
};

const getGradesForStudent = (student) => {
  const scores = [Math.floor(Math.random() * 3) + 7, Math.floor(Math.random() * 4) + 6];
  return [
    { id: `grade-${student.id}-1`, title: 'Điểm chuyên cần', score: scores[0] + 0.5, weight: '10%' },
    { id: `grade-${student.id}-2`, title: 'Điểm giữa kỳ', score: scores[1] + 0.5, weight: '30%' },
  ];
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
      schoolId: 'sdu'
    })),
    // SDU Admin
    {
      id: 'admin-sdu-001',
      studentId: 'adminsdu',
      password: hashPassword('123456'),
      email: 'admin@saodo.edu.vn',
      fullName: 'Quản trị viên Sao Đỏ',
      role: 'admin',
      faculty: 'Ban giám hiệu',
      createdAt: now,
      schoolId: 'sdu'
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
      schedule: getScheduleForFaculty(student.faculty),
      documents: getDocsForFaculty(student.faculty),
      reminders: getRemindersForFaculty(student.faculty),
      courses: getCoursesForFaculty(student.faculty),
      grades: getGradesForStudent(student),
    },
  ])
);

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, 'auth-db.json'), `${JSON.stringify(authDb, null, 2)}\n`);
writeFileSync(join(outputDir, 'user-data.json'), `${JSON.stringify(userData, null, 2)}\n`);

console.log(`Seeded demo data in ${outputDir}`);
console.log('Demo accounts SDU:');
for (const student of students) {
  console.log(`- ${student.studentId} / ${password} / ${student.fullName} (${student.faculty})`);
}
console.log(`- adminsdu / 123456 / Admin Sao Đỏ`);
