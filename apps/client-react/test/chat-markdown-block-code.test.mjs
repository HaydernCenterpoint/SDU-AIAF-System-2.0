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

test('chat markdown renders block code with a dedicated pre renderer', () => {
  const chatPage = read('src/components/pages/ChatPage.tsx');

  assert.match(chatPage, /pre:\s*\(\{node,\s*className,\s*\.\.\.props\}/);
  assert.match(chatPage, /overflow-x-auto rounded-xl bg-black\/8 p-3/);
  assert.match(chatPage, /code:\s*\(\{node,\s*inline,\s*className,\s*\.\.\.props\}:\s*any\)/);
  assert.doesNotMatch(chatPage, /code:[\s\S]*?<pre className=/);
});
