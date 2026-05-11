// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('register page uses the login-matched visual shell', async () => {
  const pageSource = await readFile(join(rootDir, 'src/app/register/page.tsx'), 'utf8');

  assert.match(pageSource, /RegisterPage\.module\.css/);
  assert.match(pageSource, /BrandMark/);
  assert.doesNotMatch(pageSource, /AuthFrame/);

  for (const token of [
    'styles.page',
    'styles.brandPanel',
    'styles.formPanel',
    'styles.card',
    'styles.primaryButton',
    'Kết nối được bảo vệ',
    'PUBLIC_GUEST_ACCOUNT_TYPE',
  ]) {
    assert.match(pageSource, new RegExp(escapeRegExp(token)));
  }
});

test('register CSS mirrors the Sao Do login visual language', async () => {
  const cssSource = await readFile(join(rootDir, 'src/app/register/RegisterPage.module.css'), 'utf8');

  assert.match(cssSource, /bg-sao-do/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(380px,\s*49vw\)\s*1fr/);
  assert.match(cssSource, /font-family:\s*Georgia/);
  assert.match(cssSource, /\.brandHeader\s+:global\(img\)/);
  assert.match(cssSource, /\.mobileLogo\s+:global\(img\)/);
  assert.match(cssSource, /linear-gradient\(135deg,\s*var\(--register-red-main\),\s*var\(--register-red-deep\)\)/);
  assert.match(cssSource, /@media \(max-width: 1080px\)/);
  assert.match(cssSource, /grid-template-rows:\s*minmax\(300px,\s*42vh\)\s*1fr/);
  assert.doesNotMatch(cssSource, /\.brandPanel\s*\{\s*display:\s*none/);
});

test('register page is a public guest signup flow that lands directly in the portal', async () => {
  const pageSource = await readFile(join(rootDir, 'src/app/register/page.tsx'), 'utf8');

  assert.match(pageSource, /PUBLIC_GUEST_ACCOUNT_TYPE/);
  assert.match(pageSource, /Tạo tài khoản khách/);
  assert.match(pageSource, /dùng AI/i);
  assert.match(pageSource, /cộng đồng/i);
  assert.match(pageSource, /router\.push\(getSchoolDashboardPath\(school\)\)/);
  assert.doesNotMatch(pageSource, /profile-setup\?/);
  assert.doesNotMatch(pageSource, /Loại tài khoản/);
  assert.doesNotMatch(pageSource, /register\('accountType'\)/);
});

test('login page advertises public guest access with neutral credentials wording', async () => {
  const loginSource = await readFile(join(rootDir, 'src/components/SchoolPortalLogin.tsx'), 'utf8');

  assert.match(loginSource, /Email hoặc mã tài khoản/);
  assert.match(loginSource, /Nhập email hoặc mã khách \/ mã sinh viên/);
  assert.match(loginSource, /Tạo tài khoản khách/);
  assert.match(loginSource, /Tài khoản khách cho phép dùng AI và đọc cộng đồng của trường/);
});
