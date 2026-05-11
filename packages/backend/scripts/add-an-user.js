import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const dbPath = './data/schools/sao-do/auth-db.json';
const db = JSON.parse(readFileSync(dbPath, 'utf8'));

// Tạo tài khoản Nguyễn Văn An
const newUser = {
  id: 'demo-an-001',
  studentId: 'SV2024001',
  password: hashPassword('An123456!'),
  email: 'an.nguyen@saodo.edu.vn',
  fullName: 'Nguyễn Văn An',
  dateOfBirth: '2004-05-15',
  faculty: 'Công nghệ thông tin',
  phone: '0912345678',
  createdAt: new Date().toISOString(),
  profileComplete: true,
  schoolId: 'sdu',
  role: 'student',
  status: 'active'
};

db.users.unshift(newUser);
writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('✅ Đã tạo tài khoản Nguyễn Văn An');
console.log('Email: an.nguyen@saodo.edu.vn');
console.log('Mật khẩu: An123456!');
