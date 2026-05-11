<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Student Menu Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Hồ sơ and Sức khỏe navigation into a dropdown under the student identity block in the top-right topbar.

**Architecture:** Keep navigation ownership in `AppShell.tsx`. Filter the sidebar/mobile nav item lists for primary destinations, and add a focused `StudentMenu` helper inside `AppShell.tsx` that delegates navigation through existing `handleNav`.

**Tech Stack:** Next.js 15, React 19 client components, TypeScript, Tailwind CSS.

---

## File Structure

- Modify: `apps/client-react/src/components/AppShell.tsx`
  - Add `useState` import.
  - Add sidebar and mobile nav filters.
  - Add `StudentMenu` helper for the top-right dropdown.
  - Pass `onNavigate` from `AppShell` into `Topbar`.
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`
  - Update shell/navigation assertions for the student dropdown and filtered sidebar/mobile nav.

## Task 1: Add Topbar Dropdown

**Files:**
- Modify: `apps/client-react/src/components/AppShell.tsx`

- [ ] **Step 1: Add React state import**

Change:

```tsx
import type { ReactNode } from 'react';
```

to:

```tsx
import { useState, type ReactNode } from 'react';
```

- [ ] **Step 2: Pass navigation into topbar**

Change the `Topbar` render to include:

```tsx
<Topbar
  studentName={user?.fullName || 'Minh Anh'}
  onAskAI={() => setCurrentTab('chat')}
  onOpenNotifications={() => setCurrentTab('notifications')}
  onNavigate={handleNav}
/>
```

- [ ] **Step 3: Update Topbar signature**

Use:

```tsx
function Topbar({ studentName, onAskAI, onOpenNotifications, onNavigate }: { studentName: string; onAskAI: () => void; onOpenNotifications: () => void; onNavigate: (id: NavItem['id']) => void }) {
```

- [ ] **Step 4: Replace the static student identity block**

Replace the existing hidden student identity `<div className="hidden items-center gap-3 pl-3 sm:flex">...</div>` with:

```tsx
<StudentMenu studentName={studentName} onNavigate={onNavigate} />
```

- [ ] **Step 5: Add StudentMenu helper below Topbar**

Add:

```tsx
function StudentMenu({ studentName, onNavigate }: { studentName: string; onNavigate: (id: NavItem['id']) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const choose = (id: NavItem['id']) => {
    setIsOpen(false);
    onNavigate(id);
  };

  return (
    <div className="relative hidden pl-3 sm:block">
      <button onClick={() => setIsOpen((value) => !value)} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-left transition hover:bg-white/70" aria-expanded={isOpen} aria-haspopup="menu">
        <div className="h-11 w-11 rounded-full bg-[radial-gradient(circle_at_50%_28%,#F8D2BF_0_24%,#111827_25%_46%,#DBEAFE_47%)] shadow-sm" />
        <div>
          <p className="text-sm font-black text-[#08113E]">{studentName}</p>
          <p className="text-xs font-semibold text-[#64748B]">Sinh viên</p>
        </div>
        <span className={`text-[#08113E] transition ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-3xl border border-[#D8E3FF] bg-white p-2 shadow-[0_18px_48px_rgba(37,99,235,0.18)]" role="menu">
          <button onClick={() => choose('profile')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#334155] transition hover:bg-[#E9F9FF] hover:text-[#006BA6]" role="menuitem">
            <Icon path="M20 21a8 8 0 1 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
            Hồ sơ
          </button>
          <button onClick={() => choose('health')} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-extrabold text-[#334155] transition hover:bg-[#E9F9FF] hover:text-[#006BA6]" role="menuitem">
            <Icon path="M12 21s-7-4.35-9.2-8.27C.75 9.07 2.75 5 6.7 5c2.08 0 3.33 1.18 5.3 3.18C13.97 6.18 15.22 5 17.3 5c3.95 0 5.95 4.07 3.9 7.73C19 16.65 12 21 12 21z" />
            Sức khỏe
          </button>
        </div>
      )}
    </div>
  );
}
```

## Task 2: Filter Sidebar and Mobile Navigation

**Files:**
- Modify: `apps/client-react/src/components/AppShell.tsx`

- [ ] **Step 1: Filter desktop sidebar items**

Inside `Sidebar`, add:

```tsx
const sidebarItems = navItems.filter((item) => !['profile', 'health'].includes(item.id));
```

Change the nav map from `navItems.filter((item) => item.group === group)` to:

```tsx
sidebarItems.filter((item) => item.group === group)
```

- [ ] **Step 2: Update mobile nav items**

Change:

```tsx
const mobileItems = navItems.filter((item) => ['dashboard', 'schedule', 'documents', 'health', 'profile'].includes(item.id));
```

to:

```tsx
const mobileItems = navItems.filter((item) => ['dashboard', 'schedule', 'documents', 'reminders', 'notifications'].includes(item.id));
```

## Task 3: Update Tests

**Files:**
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Add dropdown markers to shell tests**

Update existing Student OS shell assertions to include `StudentMenu`, `aria-haspopup="menu"`, `role="menu"`, `Hồ sơ`, and `Sức khỏe`.

- [ ] **Step 2: Assert sidebar filters personal items**

Add string assertions that `AppShell.tsx` contains `!['profile', 'health'].includes(item.id)` and the mobile item list contains `reminders` and `notifications` instead of `health` and `profile`.

## Task 4: Verification

**Files:**
- Verify: `apps/client-react/src/components/AppShell.tsx`
- Verify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Run tests**

Run: `npm test` from `apps/client-react`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build` from `apps/client-react`

Expected: build completes successfully.
