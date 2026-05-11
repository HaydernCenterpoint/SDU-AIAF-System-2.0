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

test('job marketplace cards keep information panels on solid neutral surfaces', () => {
  const source = read('src/components/pages/CoursesPage.tsx');

  assert.match(
    source,
    /<article key=\{job\.id\} className="[^"]*bg-white[^"]*p-5/,
    'job card shell should use a solid white surface',
  );
  assert.doesNotMatch(
    source,
    /<article key=\{job\.id\} className="[^"]*bg-white\/92/,
    'job card shell should not let the page gradient bleed through',
  );
  assert.match(
    source,
    /function Inf[\s\S]*rounded-2xl border border-\[#E6EEFF\] bg-white p-3/,
    'info boxes should render on neutral white panels with a light border',
  );
});
