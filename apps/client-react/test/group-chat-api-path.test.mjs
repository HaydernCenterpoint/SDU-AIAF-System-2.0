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

test('group chat API routes are normalized and UI surfaces errors without console spam', () => {
  const apiClient = read('src/lib/api-client.ts');
  const groupChat = read('src/components/pages/GroupChatInterface.tsx');

  assert.match(apiClient, /function normalizeApiPath\(url: string\)/);
  assert.match(apiClient, /replace\(\s*\/\^\\\/\?api\(\?=\\\/\|\$\)\/\s*,\s*''\s*\)/);
  assert.match(apiClient, /apiClient\.get\(normalizeApiPath\(url\)/);
  assert.match(apiClient, /apiClient\.post\(normalizeApiPath\(url\)/);

  assert.match(groupChat, /const \[errorMessage, setErrorMessage\] = useState/);
  assert.doesNotMatch(groupChat, /console\.error\(/);
  assert.match(groupChat, /setErrorMessage\(/);
});
