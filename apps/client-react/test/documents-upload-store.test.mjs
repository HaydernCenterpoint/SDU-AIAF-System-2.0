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

test('document upload store surfaces backend error text and normalizes the newly uploaded document before prepending it', () => {
  const store = read('src/hooks/useAppStore.ts');

  assert.match(store, /payload\.message\s*\|\|\s*payload\.error\s*\|\|\s*'Kh/);
  assert.match(store, /normalizeDocuments\(\[payload\.data\]\)\[0\]/);
  assert.match(store, /documents:\s*\[\s*uploadedDocument,\s*\.\.\.state\.documents/);
});
