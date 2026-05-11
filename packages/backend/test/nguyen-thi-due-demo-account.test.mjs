import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { verifyPassword } from '../src/auth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authDbPath = join(__dirname, '..', 'data', 'schools', 'nguyen-thi-due', 'auth-db.json');

test('Nguyen Thi Due demo account can log in with the displayed fallback student code', () => {
  const authDb = JSON.parse(readFileSync(authDbPath, 'utf8'));
  const demoUser = authDb.users.find((user) => user.studentId === '2025324AK02');

  assert.ok(demoUser, 'Nguyen Thi Due demo account should exist');
  assert.equal(demoUser.schoolId, 'nguyen-thi-due');
  assert.equal(demoUser.fullName, 'Học sinh 2025324AK02');
  assert.equal(demoUser.status, 'active');
  assert.equal(verifyPassword('secret123', demoUser.password), true);
});
