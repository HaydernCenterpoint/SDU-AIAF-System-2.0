// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('mobile theme uses canonical academic calm colors', () => {
  const theme = read('src/constants/theme.ts');
  const colorTokens = [
    ['primary', "'#E31D1C'"],
    ['blue', "'#1784DA'"],
    ['brandGold', "'#F7D428'"],
    ['navy', "'#112641'"],
    ['bg', "'#F8FCFF'"],
    ['border', "'#D8EAF5'"],
  ];

  for (const [name, value] of colorTokens) {
    assert.match(
      theme,
      new RegExp(`${escapeRegex(name)}\\s*:\\s*${escapeRegex(value)}`),
      `expected ${name} to be ${value}`,
    );
  }
});

test('mobile core UI primitives expose calm variants', () => {
  const button = read('src/components/ui/AppButton.tsx');
  const card = read('src/components/ui/AppCard.tsx');
  const input = read('src/components/ui/AppInput.tsx');

  assert.match(
    button,
    /export type AppButtonVariant[\s\S]*['"]blue['"][\s\S]*['"]danger['"][\s\S]*;/,
    'expected AppButtonVariant to expose blue and danger variants',
  );
  assert.match(button, /blue:\s*{/, 'expected AppButton styles to include blue variant');
  assert.match(button, /danger:\s*{/, 'expected AppButton styles to include danger variant');
  assert.match(button, /dangerTitle:\s*{/, 'expected AppButton styles to include danger title style');

  assert.match(card, /compact\?: boolean;/, 'expected AppCard props to expose compact flag');
  assert.match(card, /compact && styles\.compact/, 'expected AppCard to apply compact style');
  assert.match(card, /compact:\s*{/, 'expected AppCard styles to include compact variant');

  assert.match(input, /errorInput:\s*{/, 'expected AppInput styles to include error input state');
});

test('mobile tabs and auth use academic calm foundation', () => {
  const tabs = read('src/navigation/MainTabs.tsx');
  const login = read('src/screens/auth/LoginScreen.tsx');

  assert.match(tabs, /color={focused \? Colors\.primary : Colors\.textMuted}/);
  assert.match(tabs, /iconWrapFocused:\s*{[\s\S]*backgroundColor:\s*Colors\.primaryBg,[\s\S]*borderColor:\s*Colors\.primaryBorder,/);
  assert.match(tabs, /tabLabelFocused:\s*{[\s\S]*color:\s*Colors\.primary,/);
  assert.match(tabs, /function HeaderTitle\(\)/);
  assert.match(tabs, /headerTitle:\s*\(\) => <HeaderTitle \/>/);

  assert.doesNotMatch(login, /AuthGalaxyBackground/);
  assert.match(login, /container:\s*{/);
  assert.match(login, /backgroundColor:\s*Colors\.bg/);
  assert.match(login, /scroll:\s*{/);
  assert.match(login, /justifyContent:\s*'center'/);
  assert.match(login, /padding:\s*Spacing\.xl/);
  assert.match(login, /school:\s*{[\s\S]*color:\s*Colors\.text/);
  assert.match(login, /tagline:\s*{[\s\S]*color:\s*Colors\.textSub/);
  assert.match(login, /card:\s*{[\s\S]*backgroundColor:\s*Colors\.surface/);
  assert.match(login, /card:\s*{[\s\S]*borderRadius:\s*Radius\.xl/);
  assert.match(login, /card:\s*{[\s\S]*padding:\s*Spacing\.xxl/);
  assert.match(login, /card:\s*{[\s\S]*borderColor:\s*Colors\.border/);
  assert.match(login, /card:\s*{[\s\S]*\.\.\.Shadow\.card/);
});
