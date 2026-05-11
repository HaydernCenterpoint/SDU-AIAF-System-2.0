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

test('health dashboard exposes detailed charts, daily history, and wellness recommendations', () => {
  const source = read('src/components/pages/HealthDashboardPage.tsx');

  for (const text of [
    'Bảng điều phối sức khỏe học tập',
    'Bản đồ sức khỏe 7 ngày',
    'Lịch sử từng ngày',
    'Nhịp học hôm nay',
    'Giấc ngủ 7 ngày',
    'Nước uống & vận động',
    'Tâm trạng & áp lực',
    'Khuyến nghị cho hôm nay',
    'AI Coach sức khỏe',
    'Hỏi AI về sức khỏe tuần này',
    'AI sẽ đọc đúng dữ liệu giấc ngủ, nước uống, vận động và căng thẳng đang hiển thị',
    'Khuyến nghị AI',
    "assistant_type: 'health'",
    'Thứ 2',
    'Thứ 7',
    'polyline',
    'linearGradient',
  ]) {
    assert.match(source, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
