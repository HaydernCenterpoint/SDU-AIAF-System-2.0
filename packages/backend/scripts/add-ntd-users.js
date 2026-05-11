import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const dbPath = './data/schools/nguyen-thi-due/auth-db.json';
const db = JSON.parse(readFileSync(dbPath, 'utf8'));

// Tài khoản demo NTD
const demoUsers = [
  { id: 'ntd-demo-001', studentId: 'NTD001', fullName: 'Nguyễn Trần Trúc Mai', email: 'mai.ntd@test.com', faculty: 'Khối 12', role: 'student' },
  { id: 'ntd-demo-002', studentId: 'NTD002', fullName: 'Trần Anh Tuấn', email: 'tuan.ntd@test.com', faculty: 'Khối 11', role: 'student' },
  { id: 'ntd-admin-001', studentId: 'adminntd', fullName: 'Quản trị viên NTD', email: 'admin.ntd@test.com', faculty: 'Ban giám hiệu', role: 'admin' },
];

const password = 'NTD123456';

demoUsers.forEach(user => {
  // Xóa user cũ nếu có
  db.users = db.users.filter(u => u.id !== user.id);

  // Thêm user mới
  db.users.unshift({
    ...user,
    password: hashPassword(password),
    dateOfBirth: '2008-01-01',
    phone: '0912345678',
    createdAt: new Date().toISOString(),
    profileComplete: true,
    schoolId: 'nguyen-thi-due',
    status: 'active',
  });
});

writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('✅ Đã tạo tài khoản demo cho Nguyễn Thị Duệ');
console.log('Mật khẩu chung: ' + password);
console.log('\nTài khoản:');
demoUsers.forEach(u => {
  console.log(`- ${u.studentId} (${u.role}): ${u.email}`);
});
