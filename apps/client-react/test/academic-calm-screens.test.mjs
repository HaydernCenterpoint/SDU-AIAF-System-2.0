// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const files = [
  'src/components/AuthFrame.tsx',
  'src/components/AppShell.tsx',
  'src/components/AICompanionWidget.tsx',
  'src/components/pages/DashboardPage.tsx',
  'src/components/pages/ChatPage.tsx',
  'src/components/pages/CoursesPage.tsx',
  'src/components/pages/SchedulePage.tsx',
  'src/components/pages/DocumentsPage.tsx',
  'src/components/pages/HealthDashboardPage.tsx',
  'src/app/profile/page.tsx',
];

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('web key screens avoid non-Sao-Do purple AI styling', () => {
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /#7C3AED|from-\[#7C3AED\]|to-\[#7C3AED\]|#8B7CFF|#EDE9FF|#F4F0FF|#4F7CFF|#667BFF|#6AA8FF|#DDE8FF|💜|purple/i, file);
  }
});

test('web key screens avoid legacy hard-coded logo palette values', () => {
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /#ED1C24|#FFD400|#20AEEA|#006BA6|#08113E|#003B5C|rgba\(237,\s*28,\s*36|rgba\(0,\s*107,\s*166|rgba\(0,\s*59,\s*92|rgba\(255,\s*212,\s*0/i, file);
  }
});

test('web key screens use academic calm primitives', () => {
  for (const file of files) {
    const source = read(file);
    assert.match(source, /academic-|text-text|bg-surface|border-border|BrandMark|logo\.png|sao-do-university-logo\.png/, file);
  }
});

test('web key screens avoid decorative emoji in product cards', () => {
  const source = read('src/components/pages/DashboardPage.tsx');
  assert.doesNotMatch(source, /👋|👤|💼|🔔|💧|🚩/, 'DashboardPage should use text hierarchy and real icons, not decorative emoji');
});

test('web auth shell and quick AI keep route-aware accessible controls', () => {
  const authFrame = read('src/components/AuthFrame.tsx');
  const appShell = read('src/components/AppShell.tsx');
  const aiCompanion = read('src/components/AICompanionWidget.tsx');

  assert.match(authFrame, /asideTitle \?\?/);
  assert.match(authFrame, /asideText \?\?/);
  assert.match(appShell, /onOpenNotifications=\{\(\) => handleNav\('notifications'\)\}/);
  assert.match(aiCompanion, /aria-labelledby="ai-companion-title"/);
  assert.match(aiCompanion, /id="ai-companion-title"/);
  assert.match(aiCompanion, /aria-label="Nhập câu hỏi nhanh"/);
  assert.match(aiCompanion, /aria-label=\{isOpen \? 'Đóng AI Companion' : 'Mở AI Companion'\}/);
  assert.match(aiCompanion, /aria-expanded=\{isOpen\}/);
});

test('web dashboard and chat use academic calm layout contracts', () => {
  const dashboard = read('src/components/pages/DashboardPage.tsx');
  const chat = read('src/components/pages/ChatPage.tsx');

  assert.match(dashboard, /function TextBadge\(/);
  for (const token of ['academic-card', 'grid', 'gap-6', 'p-6', 'overflow-hidden']) {
    assert.match(dashboard, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
  }
  assert.doesNotMatch(dashboard, /function IconBadge\(/);
  assert.doesNotMatch(dashboard, /gradient:/);
  assert.match(dashboard, /aria-label=\{`Xem tất cả \$\{title\}`\}/);
  assert.match(dashboard, /aria-label="Xem tất cả bài tập cần làm"/);
  assert.match(dashboard, /aria-label="Xem tất cả nhắc nhở công việc"/);
  for (const token of ['academic-card', 'flex', 'min-h-[calc(100vh-7rem)]', 'flex-1', 'flex-col', 'overflow-hidden']) {
    assert.match(chat, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
  }
  assert.match(chat, /academic-section-eyebrow">Trợ lý AI/);
  assert.match(chat, /BrandMark compact size="sm"/);
  for (const token of ['academic-input', 'items-end', 'gap-2', 'bg-surface-alt', 'p-2']) {
    assert.match(chat, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
  }
  for (const token of ['academic-button-primary', 'h-11', 'px-4', 'text-sm', 'disabled:opacity-45']) {
    assert.match(chat, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
  }
  assert.match(chat, /aria-label="Nhập câu hỏi cho trợ lý Sao Đỏ"/);
});

test('web remaining key screens use academic calm contracts', () => {
  const schedule = read('src/components/pages/SchedulePage.tsx');
  const documents = read('src/components/pages/DocumentsPage.tsx');
  const health = read('src/components/pages/HealthDashboardPage.tsx');
  const profile = read('src/app/profile/page.tsx');

  for (const token of [
    'academic-card relative overflow-hidden bg-white p-5 xl:col-span-5',
    'academic-section-eyebrow">Tiết tiếp theo',
    'border border-border bg-surface-alt p-4',
    'text-text-muted">Thời gian',
    'text-text">{nextClass.time}',
    'academic-card-quiet bg-accent-soft p-5 xl:col-span-7',
  ]) assert.match(schedule, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
  assert.doesNotMatch(schedule, /<label className="flex items-center gap-1">/);
  assert.doesNotMatch(schedule, /text-white\/58/);

  for (const token of [
    "const fieldClass = 'academic-input w-full px-4 py-3 text-sm font-bold placeholder:text-text-muted';",
    'aria-label="Tìm tài liệu"',
    'aria-label="Lọc theo tag"',
    'aria-label={`${label} từ ngày`}',
    'aria-label={`${label} đến ngày`}',
    'aria-label="Tên tài liệu hoặc mã môn"',
    'aria-label="Mô tả tài liệu"',
    'aria-label="Tag tài liệu"',
    'aria-label="Tệp tài liệu"',
    'aria-label="Tên tài liệu chỉnh sửa"',
    'aria-label="Mô tả tài liệu chỉnh sửa"',
    'aria-label="Tag tài liệu chỉnh sửa"',
    'academic-card animate-enter p-5',
    'academic-button-primary px-3 py-2 text-xs',
    'academic-button-secondary px-3 py-2 text-xs',
    'mt-4 academic-button-secondary px-3 py-2 text-xs',
  ]) assert.match(documents, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);

  for (const token of [
    'academic-card p-6 sm:p-8',
    'academic-section-eyebrow">Sức khỏe học đường',
    'academic-card p-5',
    'academic-card-quiet bg-primary-soft p-5',
  ]) assert.match(health, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);

  for (const token of [
    "background: '#F8FCFF'",
    "primaryBlue: '#1784DA'",
    "red: '#E31D1C'",
    "border: '#D8EAF5'",
    "['MS', 'Mã sinh viên'",
    "['TC', 'Tín chỉ tích lũy'",
  ]) assert.match(profile, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), token);
});
