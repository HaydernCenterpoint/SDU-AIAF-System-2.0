<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# AI Companion Floating Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the large dashboard AI strip with a bottom-right floating popup that supports quick chat and links to the full Chat tab.

**Architecture:** Add a focused `AICompanionWidget` component rendered by `AppShell`, reusing `useAppStore` and `useAuthStore` chat behavior. Remove the dashboard-only `AICompanionBar` and preserve the existing full `ChatPage` as the canonical long-form chat screen.

**Tech Stack:** Next.js 15, React 19 client components, TypeScript, Tailwind CSS, Zustand stores.

---

## File Structure

- Create: `apps/client-react/src/components/AICompanionWidget.tsx`
  - Owns floating button state, popup UI, quick input, suggestion buttons, and delegates full-chat handoff to `AppShell`.
- Modify: `apps/client-react/src/components/AppShell.tsx`
  - Imports and renders the widget for authenticated app pages.
- Modify: `apps/client-react/src/components/pages/DashboardPage.tsx`
  - Removes `AICompanionBar` usage and unused component code.

## Task 1: Add Floating AI Companion Widget

**Files:**
- Create: `apps/client-react/src/components/AICompanionWidget.tsx`

- [ ] **Step 1: Create the widget component**

Add this complete component:

```tsx
'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { useAuthStore } from '@/hooks/useAuthStore';

const fallbackSuggestions = [
  'Hôm nay học môn gì?',
  'Tóm tắt bài giảng CSDL',
  'Tìm tài liệu Trí tuệ nhân tạo',
];

export function AICompanionWidget({ onOpenFullChat }: { onOpenFullChat: () => void }) {
  const { activeConversationId, conversationDetails, suggestions, sendMessage, setActiveConversation } = useAppStore();
  const { token } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');

  const conversationId = activeConversationId && activeConversationId !== 'new' ? activeConversationId : null;
  const messages = conversationId ? conversationDetails[conversationId]?.messages ?? [] : [];
  const quickSuggestions = useMemo(() => (suggestions.length > 0 ? suggestions.slice(0, 3) : fallbackSuggestions), [suggestions]);

  const handleSend = (preset?: string) => {
    const content = (preset ?? input).trim();
    if (!content || !token) return;
    const nextConversationId = conversationId ?? `c_${Date.now()}`;
    if (!conversationId) setActiveConversation(nextConversationId);
    setInput('');
    sendMessage(token, nextConversationId, content);
  };

  const openFullChat = () => {
    setIsOpen(false);
    onOpenFullChat();
  };

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section className="mb-4 flex h-[min(520px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] animate-enter flex-col overflow-hidden rounded-[28px] border border-[#D8E3FF] bg-white shadow-[0_28px_80px_rgba(37,99,235,0.22)]">
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/72">Chat nhanh</p>
              <h2 className="truncate text-base font-black">AI Companion</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openFullChat} className="rounded-full bg-white/18 px-3 py-2 text-xs font-black text-white transition hover:bg-white/28" aria-label="Mở Chat tổng">
                ↗
              </button>
              <button onClick={() => setIsOpen(false)} className="rounded-full bg-white/18 px-3 py-2 text-xs font-black text-white transition hover:bg-white/28" aria-label="Thu nhỏ AI Companion">
                −
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FBFF] px-4 py-4">
            {messages.length > 0 ? messages.slice(-6).map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-3 py-2 text-sm font-semibold leading-6 shadow-sm ${message.role === 'user' ? 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white' : 'border border-[#E0E7FF] bg-white text-[#0F172A]'}`}>
                  {message.content}
                </div>
              </div>
            )) : (
              <div className="rounded-3xl border border-[#E0E7FF] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-xl font-black text-white">✦</span>
                  <div>
                    <p className="text-sm font-black text-[#0F172A]">Mình có thể giúp gì?</p>
                    <p className="text-xs font-semibold text-[#64748B]">Hỏi nhanh về lịch học, tài liệu, bài tập.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion) => (
                    <button key={suggestion} onClick={() => handleSend(suggestion)} className="rounded-full border border-[#D8E3FF] px-3 py-2 text-left text-xs font-bold text-[#53607D] transition hover:border-[#7C3AED] hover:text-[#2563EB]">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#E0E7FF] bg-white p-3">
            {!token && <p className="mb-2 text-xs font-bold text-[#ED1C24]">Bạn cần đăng nhập để gửi tin nhắn.</p>}
            <div className="flex items-end gap-2 rounded-2xl border border-[#D8E3FF] bg-[#F8FBFF] p-2 focus-within:border-[#7C3AED] focus-within:ring-4 focus-within:ring-[#7C3AED]/10">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập câu hỏi nhanh..."
                rows={1}
                className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm font-semibold text-[#0F172A] outline-none placeholder:text-[#A0AEC5]"
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || !token} className="h-10 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-4 text-sm font-black text-white shadow-sm disabled:opacity-45">
                Gửi
              </button>
            </div>
          </div>
        </section>
      )}

      <button onClick={() => setIsOpen((value) => !value)} className="student-os-orb-pulse flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-3xl font-black text-white shadow-[0_18px_44px_rgba(37,99,235,0.34)] ring-8 ring-white/60 transition hover:scale-105" aria-label="Mở AI Companion">
        ✦
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check for the new file context**

Run: `npm run build` from `apps/client-react`

Expected: build either passes or reports real TypeScript/UI integration issues to fix in the next task.

## Task 2: Render Widget from AppShell

**Files:**
- Modify: `apps/client-react/src/components/AppShell.tsx`

- [ ] **Step 1: Import widget**

Add near other component imports:

```tsx
import { AICompanionWidget } from '@/components/AICompanionWidget';
```

- [ ] **Step 2: Render widget once in shell**

Inside the top-level shell `<div>`, after the `<main>` element and before closing `</div>`, render:

```tsx
<AICompanionWidget onOpenFullChat={() => handleNav('chat')} />
```

- [ ] **Step 3: Build check**

Run: `npm run build` from `apps/client-react`

Expected: build passes or identifies integration issues.

## Task 3: Remove Dashboard AI Strip

**Files:**
- Modify: `apps/client-react/src/components/pages/DashboardPage.tsx`

- [ ] **Step 1: Remove AI companion strip layout**

Replace this block:

```tsx
<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
  <AICompanionBar prompts={suggestions} onAsk={() => setCurrentTab('chat')} />
  <MotivationCard />
</div>
```

with:

```tsx
<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)]">
  <MotivationCard />
</div>
```

- [ ] **Step 2: Remove unused suggestions destructuring**

Change:

```tsx
const { user, stats, schedule, suggestions, setCurrentTab } = useAppStore();
```

to:

```tsx
const { user, stats, schedule, setCurrentTab } = useAppStore();
```

- [ ] **Step 3: Delete unused `AICompanionBar` component**

Remove the `AICompanionBar` function from `DashboardPage.tsx`.

- [ ] **Step 4: Build check**

Run: `npm run build` from `apps/client-react`

Expected: build passes with no unused symbol/type errors.

## Task 4: Final Verification

**Files:**
- Verify: `apps/client-react/src/components/AICompanionWidget.tsx`
- Verify: `apps/client-react/src/components/AppShell.tsx`
- Verify: `apps/client-react/src/components/pages/DashboardPage.tsx`

- [ ] **Step 1: Run production build**

Run: `npm run build` from `apps/client-react`

Expected: Next.js build completes successfully.

- [ ] **Step 2: Inspect git diff**

Run: `git diff -- apps/client-react/src/components/AICompanionWidget.tsx apps/client-react/src/components/AppShell.tsx apps/client-react/src/components/pages/DashboardPage.tsx`

Expected: diff only includes the widget addition, shell render, and dashboard strip removal.

- [ ] **Step 3: Manual UI verification if dev server is available**

Run: `npm run dev` from `apps/client-react`, open `/dashboard`, and verify:

- Dashboard no longer shows the wide AI Companion strip.
- Floating AI button appears at bottom-right.
- Button opens and closes the popup.
- Quick suggestions send messages when logged in.
- Header ↗ button switches to full Chat tab.
