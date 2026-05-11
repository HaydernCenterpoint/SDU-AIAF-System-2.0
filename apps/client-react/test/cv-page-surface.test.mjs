// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(join(rootDir, relativePath), 'utf8');
}

test('cv surface exposes dedicated routes, profile menu entry, and AI coaching UI', () => {
  const appShell = read('src/components/AppShell.tsx');
  const schoolSite = read('src/lib/school-site.ts');
  const cvPage = read('src/app/cv/CvPageClient.tsx');
  const cvApi = read('src/lib/cv-api.ts');
  const dashboard = read('src/components/pages/DashboardPage.tsx');

  for (const text of [
    'CV của bạn',
    'getSchoolCvPath',
    "cvPath: '/sdu/cv'",
    "cvPath: '/ntd/cv'",
    'CV được dựng tự động từ hồ sơ học tập hiện tại',
    'Hỏi AI về CV này',
    'submitCvQuestion(item)',
    'Chọn một bubble để gửi ngay',
    'Hỏi về một bullet, dự án hay kỹ năng cụ thể...',
    'Enter để gửi ngay · Shift+Enter để xuống dòng',
    'handleComposerKeyDown',
    'Kỹ năng cốt lõi',
    'Dự án nổi bật',
    'Hoạt động',
    'Mục tiêu nghề nghiệp',
    "assistant_type: 'career'",
    'Mở CV của bạn',
  ]) {
    const source = text.startsWith('cvPath')
      ? schoolSite
      : text === 'assistant_type: \'career\''
        ? cvApi
        : text === 'Mở CV của bạn'
          ? dashboard
          : `${appShell}\n${cvPage}\n${dashboard}`;
    assert.match(source, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(cvPage, /Tổng quan nhanh/, 'quick-summary card should be removed from the CV sidebar');
  assert.doesNotMatch(
    cvPage,
    /AI sẽ đọc đúng bản CV đang hiển thị để góp ý/,
    'old descriptive block above the CV chat should be removed',
  );
});
