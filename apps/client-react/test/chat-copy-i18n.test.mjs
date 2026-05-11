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

test('chat surface copy uses readable Vietnamese UTF-8 labels', () => {
  const chatPage = read('src/components/pages/ChatPage.tsx');
  const brandMark = read('src/components/BrandMark.tsx');
  const widget = read('src/components/AICompanionWidget.tsx');

  for (const text of [
    'Trợ lý AI Nguyễn Thị Duệ',
    'Trợ lý AI Sao Đỏ',
    'Nhập câu hỏi cho trợ lý THPT...',
    'Nhập câu hỏi cho trợ lý Sao Đỏ...',
    'Đang kết nối...',
    'Demo nội bộ',
    'Hôm nay học môn gì?',
    'Cuộc hội thoại mới',
    'Lịch sử',
    'Chưa có hội thoại nào',
    'Hỏi đáp mới',
    'Bắt đầu cuộc trò chuyện',
    'Mở/đóng lịch sử hội thoại',
    'Mở lịch sử hội thoại',
    'Bạn cần hỗ trợ gì hôm nay?',
    'Hỏi về lịch học, tài liệu, điểm số',
    'Mới',
    'Xóa tệp',
    'Tải ảnh lên',
    'Tải tài liệu lên',
    'Nhập câu hỏi cho trợ lý',
    'Gửi tin nhắn',
    'Hỗ trợ ảnh PNG/JPG/WebP',
  ]) {
    assert.match(chatPage, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const text of [
    'Trợ lý AI của bạn',
    'Cổng nội bộ THPT',
  ]) {
    assert.match(brandMark, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const text of [
    'Hôm nay học môn gì?',
    'Mình có thể giúp gì?',
    'Nhập câu hỏi nhanh...',
    'Bạn cần đăng nhập để gửi tin nhắn.',
    'Mở chat tổng',
    'Thu nhỏ AI Companion',
    'Mở AI Companion',
    'Đóng AI Companion',
  ]) {
    assert.match(widget, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }

  for (const source of [chatPage, brandMark, widget]) {
    assert.doesNotMatch(source, /HÃ|TÃ|Cuá»|Lá»‹ch sÃ|Báº|Nháº|Gá»|Ã‚Â·|Ã„Â|Tro ly|Nhap cau hoi|cua ban|Cong noi bo/);
  }
});
