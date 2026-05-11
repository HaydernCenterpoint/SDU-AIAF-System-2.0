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

test('reminder composer uses Vietnamese dropdown labels for reminder and repeat types', () => {
  const source = read('src/components/pages/RemindersPage.tsx');

  for (const text of [
    'Hạn nộp bài',
    'Giờ tự học',
    'Lịch kiểm tra',
    'Việc cần làm',
    'Giờ đi ngủ',
    'Uống nước',
    'Tập luyện',
    'Bữa ăn',
    'Tùy chọn khác',
    'Không lặp',
    'Hằng ngày',
    'Hằng tuần',
    'Hằng tháng',
    'typeOption.label',
    'repeatOption.label',
  ]) {
    assert.match(source, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
