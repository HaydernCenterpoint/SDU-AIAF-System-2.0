// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const files = [
  'src/screens/main/HomeScreen.tsx',
  'src/screens/main/ChatScreen.tsx',
  'src/screens/main/ScheduleScreen.tsx',
  'src/screens/main/DocumentsScreen.tsx',
  'src/screens/main/HealthScreen.tsx',
  'src/screens/main/ProfileScreen.tsx',
];

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('mobile key screens use shared theme instead of direct hex styling', () => {
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /#[0-9A-Fa-f]{3,4}(?:[0-9A-Fa-f]{3,4})?\b/, file);
    assert.doesNotMatch(source, /rgba\(/, file);
  }
});

test('mobile key screens keep chat and daily student workflows visible', () => {
  const home = read('src/screens/main/HomeScreen.tsx');
  const chat = read('src/screens/main/ChatScreen.tsx');

  assert.match(home, /hôm nay/i, 'Home should prioritize Today copy');
  for (const label of ['AI', 'Lịch', 'Tài liệu']) {
    assert.match(home, new RegExp(label));
  }
  for (const label of ['Trợ lý Sao Đỏ', 'Bạn cần hỗ trợ gì', 'Nhập câu hỏi']) {
    assert.match(chat, new RegExp(label));
  }
});

test('mobile home and chat use academic calm contracts', () => {
  const home = read('src/screens/main/HomeScreen.tsx');
  const chat = read('src/screens/main/ChatScreen.tsx');

  assert.match(home, /title="Hôm nay"/);
  assert.match(home, /subtitle="Lịch học, việc cần làm, tài liệu và gợi ý AI cho ngày học của bạn\."/);

  let lastQuickAction = -1;
  for (const action of [
    "label: 'Lịch học', route: 'Subjects'",
    "label: 'Tài liệu', route: 'Documents'",
    "label: 'Task', route: 'Tasks'",
    "label: 'Nhắc nhở', route: 'ReminderList'",
    "label: 'Tài chính', route: 'FinanceDashboard'",
    "label: 'Cài đặt', route: 'Settings'",
  ]) {
    const index = home.indexOf(action);
    assert.ok(index > lastQuickAction, `${action} should appear in order`);
    lastQuickAction = index;
  }

  assert.match(home, /<Ionicons name=\{action\.icon\} size=\{22\} color=\{Colors\.primary\} \/>/);
  assert.match(home, /quickCard:/);
  assert.match(home, /borderColor: Colors\.border/);
  assert.match(home, /backgroundColor: Colors\.surface/);
  assert.match(home, /\.\.\.Shadow\.card/);

  assert.match(chat, /bubbleUser:/);
  assert.match(chat, /backgroundColor: Colors\.primary/);
  assert.match(chat, /bubbleBot:/);
  assert.match(chat, /backgroundColor: Colors\.surface/);
  assert.match(chat, /borderWidth: 1/);
  assert.match(chat, /borderColor: Colors\.border/);
  assert.match(chat, /sendBtn:/);
  assert.match(chat, /width: 44/);
  assert.match(chat, /height: 44/);
  assert.match(chat, /borderRadius: Radius\.md/);
  assert.match(chat, /convIcon:/);
  assert.match(chat, /backgroundColor: Colors\.primaryBg/);
  assert.match(chat, /<Ionicons name="chatbubble-ellipses" size=\{20\} color=\{Colors\.primary\} \/>/);
  assert.match(chat, /accessibilityRole="button"/);
  assert.match(chat, /accessibilityLabel="Quay lại danh sách cuộc trò chuyện"/);
  assert.match(chat, /accessibilityLabel="Tạo cuộc trò chuyện mới"/);
  assert.match(chat, /accessibilityLabel="Gửi câu hỏi"/);
  assert.doesNotMatch(chat, /#fff/);
});

test('mobile remaining screens use academic calm contracts', () => {
  const schedule = read('src/screens/main/ScheduleScreen.tsx');
  const documents = read('src/screens/main/DocumentsScreen.tsx');
  const health = read('src/screens/main/HealthScreen.tsx');
  const profile = read('src/screens/main/ProfileScreen.tsx');

  assert.match(schedule, /'Lý thuyết': Colors\.blue/);
  assert.match(schedule, /'Thực hành': Colors\.green/);
  assert.match(schedule, /'Bài tập': Colors\.orange/);
  assert.match(schedule, /Thi: Colors\.primary/);
  assert.match(schedule, /dayTabActive:/);
  assert.match(schedule, /backgroundColor: Colors\.primaryBg/);
  assert.match(schedule, /borderWidth: 1/);
  assert.match(schedule, /borderColor: Colors\.primaryBorder/);
  assert.match(schedule, /dayTextActive:/);
  assert.match(schedule, /color: Colors\.primary/);
  assert.doesNotMatch(schedule, /<Pressable key=\{day\}/);
  assert.doesNotMatch(schedule, /styles\.card, pressed/);

  for (const token of ['banner:', 'backgroundColor: Colors.surface', 'borderRadius: Radius.xl', 'borderWidth: 1', 'borderColor: Colors.border', 'padding: Spacing.xl', 'marginBottom: Spacing.lg', '...Shadow.card']) {
    assert.match(documents, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(documents, /eyebrow:/);
  assert.match(documents, /color: Colors\.primary/);
  assert.match(documents, /bannerTitle:/);
  assert.match(documents, /color: Colors\.text/);
  assert.match(documents, /bannerSub:/);
  assert.match(documents, /color: Colors\.textSub/);
  assert.doesNotMatch(documents, /<Pressable style=\{\(\{ pressed \}\) => \[styles\.card/);
  assert.doesNotMatch(documents, /chevron-forward/);

  assert.match(health, /<Ionicons name=\{action\.icon\} size=\{22\} color=\{Colors\.primary\} \/>/);
  for (const token of ['aiPanel:', 'borderRadius: Radius.lg', 'backgroundColor: Colors.primaryBg', 'borderWidth: 1', 'borderColor: Colors.primaryBorder', 'padding: Spacing.lg', 'aiTitle:', 'color: Colors.primary']) {
    assert.match(health, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  assert.match(profile, /const profileTone = \{/);
  for (const token of ['school: Colors.blueBg', 'personal: Colors.primaryBg', 'family: Colors.goldBg', 'neutral: Colors.surfaceAlt']) {
    assert.match(profile, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.doesNotMatch(profile, /#[0-9A-Fa-f]{3,4}(?:[0-9A-Fa-f]{3,4})?\b/);
  assert.doesNotMatch(profile, /rgba\(/);
  for (const value of ['Nguyễn Văn Đạt', 'Nguyễn Văn Thành', 'Đặng Thị Tự', '0936651618', '0904388848', '0936792369', '022204004356', 'Quang Trung', 'Mạo Khê', 'Đông Triều', '2004-07-03', '221SDUOM.00028', '2022-09-23', 'DK13-CNTT1']) {
    assert.doesNotMatch(profile, new RegExp(value), value);
  }
  assert.doesNotMatch(profile, /function MenuRow[\s\S]*?return \(\s*<Pressable/);
  assert.doesNotMatch(profile, /function MenuRow[\s\S]*?chevron-forward/);
  for (const label of ['Đổi ảnh đại diện', 'Đổi thông tin cá nhân', 'Đóng chỉnh sửa hồ sơ', 'Lưu thay đổi hồ sơ', 'Hủy chỉnh sửa hồ sơ', 'Đăng xuất']) {
    assert.match(profile, new RegExp(`accessibilityLabel="${label}"`));
  }
});
