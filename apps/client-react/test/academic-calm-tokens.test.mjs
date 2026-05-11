// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('web theme exposes academic calm canonical colors', () => {
  const tailwind = read('tailwind.config.ts');
  const globals = read('src/app/globals.css');

  const tailwindExpectations = [
    ["primary: {\n          DEFAULT: '#E31D1C'", 'primary.DEFAULT should use #E31D1C'],
    ["blue: {\n          DEFAULT: '#1784DA'", 'blue.DEFAULT should use #1784DA'],
    ["accent: {\n          DEFAULT: '#F7D428'", 'accent.DEFAULT should use #F7D428'],
    ["text: {\n          DEFAULT: '#112641'", 'text.DEFAULT should use #112641'],
    ["surface: {\n          page: '#F8FCFF'", 'surface.page should use #F8FCFF'],
    ["border: {\n          DEFAULT: '#D8EAF5'", 'border.DEFAULT should use #D8EAF5'],
  ];

  for (const [snippet, message] of tailwindExpectations) {
    assert.ok(tailwind.includes(snippet), message);
  }

  const cssExpectations = [
    ['--sdu-red: #E31D1C', '--sdu-red should use #E31D1C'],
    ['--sdu-blue: #1784DA', '--sdu-blue should use #1784DA'],
    ['--sdu-gold: #F7D428', '--sdu-gold should use #F7D428'],
    ['--sdu-ink: #112641', '--sdu-ink should use #112641'],
    ['--sdu-page: #F8FCFF', '--sdu-page should use #F8FCFF'],
    ['--sdu-border: #D8EAF5', '--sdu-border should use #D8EAF5'],
  ];

  for (const [snippet, message] of cssExpectations) {
    assert.ok(globals.includes(snippet), message);
  }
});

test('web global CSS exposes reusable academic primitives', () => {
  const globals = read('src/app/globals.css');

  for (const className of ['academic-page', 'academic-card', 'academic-button-primary', 'academic-button-secondary', 'academic-input', 'academic-status-pill']) {
    assert.ok(globals.includes(`.${className}`), `${className} class should be defined`);
  }
});
