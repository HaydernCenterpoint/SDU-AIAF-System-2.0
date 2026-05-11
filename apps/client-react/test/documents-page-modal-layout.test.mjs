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

test('documents page uses centered modals instead of a fixed right sidebar', () => {
  const page = read('src/components/pages/DocumentsPage.tsx');

  for (const text of [
    'Đăng tài liệu',
    'Chi tiết tài liệu',
    'Chỉnh sửa tài liệu',
    'Đóng',
    'aria-modal={true}',
    'role="dialog"',
    'setIsUploadOpen(true)',
    'setActiveDetailId(doc.id)',
  ]) {
    assert.match(page, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.doesNotMatch(page, /gridTemplateColumns:\s*'1fr 300px'/);
  assert.doesNotMatch(page, /RIGHT: Upload \+ Detail/);
  assert.doesNotMatch(page, /📤 Đăng tài liệu mới/);
});
