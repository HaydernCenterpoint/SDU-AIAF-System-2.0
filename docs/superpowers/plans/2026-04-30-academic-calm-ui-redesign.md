<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Academic Calm UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved C · Academic Calm Interface direction to the Sao Do student assistant web and mobile key screens.

**Architecture:** Start by locking the design contract with static tests, then update shared tokens and primitives before touching screens. Web and mobile remain separate implementations, but they share the same canonical Sao Do color, spacing, radius, shadow, and interaction grammar.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS, Node test runner, Expo 54, React Native 0.81, TypeScript.

---

## Scope note

This plan covers two UI surfaces, `apps/client-react` and `apps/mobile`, because the approved spec requires one visual grammar across both. The work is split into independently reviewable tasks: each task either adds a guard test, updates shared design infrastructure, or upgrades one screen family.

## File structure map

- Create `apps/client-react/test/academic-calm-tokens.test.mjs`: static guard for web canonical tokens and global primitives.
- Create `apps/client-react/test/academic-calm-screens.test.mjs`: static guard for web key screens avoiding purple gradients, decorative emoji, and legacy hard-coded brand colors.
- Modify `apps/client-react/tailwind.config.ts`: canonical Sao Do colors, calmer radii, and lighter shadows.
- Modify `apps/client-react/src/app/globals.css`: CSS variables and reusable academic UI utility classes.
- Modify `apps/client-react/src/components/AuthFrame.tsx`: formal university auth frame without galaxy effects.
- Modify `apps/client-react/src/components/SchoolPortalLogin.tsx`: align login content with the auth frame if it carries visual styling.
- Modify `apps/client-react/src/components/AppShell.tsx`: calmer sidebar, topbar, and mobile navigation.
- Modify `apps/client-react/src/components/AICompanionWidget.tsx`: remove purple AI styling and use Sao Do calm chat grammar.
- Modify `apps/client-react/src/components/pages/DashboardPage.tsx`: reduce decorative hero art and convert to a student command desk.
- Modify `apps/client-react/src/components/pages/ChatPage.tsx`: first-class chat surface with readable bubbles and calm controls.
- Modify `apps/client-react/src/components/pages/SchedulePage.tsx`: academic schedule cards and weekly table without strong gradient treatment.
- Modify `apps/client-react/src/components/pages/DocumentsPage.tsx`: calm document library, upload, filters, and details.
- Modify `apps/client-react/src/components/pages/HealthDashboardPage.tsx`: restrained wellbeing dashboard with medical-safety copy.
- Modify `apps/client-react/src/app/profile/page.tsx`: academic dossier profile theme using canonical tokens.
- Create `apps/mobile/test/academic-calm-theme.test.mjs`: static guard for mobile tokens and core UI primitives.
- Create `apps/mobile/test/academic-calm-screens.test.mjs`: static guard for mobile auth, home, chat, schedule, documents, health, and profile screens.
- Modify `apps/mobile/src/constants/theme.ts`: canonical Sao Do theme constants.
- Modify `apps/mobile/src/components/ui/AppCard.tsx`: calm card primitive.
- Modify `apps/mobile/src/components/ui/AppButton.tsx`: red, blue, ghost, and danger button variants.
- Modify `apps/mobile/src/components/ui/AppInput.tsx`: consistent label, helper, error, and focus states.
- Modify `apps/mobile/src/components/ui/Header.tsx`: compact university header rhythm.
- Modify `apps/mobile/src/components/ui/EmptyView.tsx`, `ErrorView.tsx`, `LoadingView.tsx`: matching calm state components.
- Modify `apps/mobile/src/navigation/MainTabs.tsx`: calmer bottom tabs and header.
- Modify `apps/mobile/src/screens/auth/LoginScreen.tsx`: formal login without galaxy background.
- Modify `apps/mobile/src/screens/main/HomeScreen.tsx`: Today-first command desk.
- Modify `apps/mobile/src/screens/main/ChatScreen.tsx`: readable mobile chat.
- Modify `apps/mobile/src/screens/main/ScheduleScreen.tsx`, `DocumentsScreen.tsx`, `HealthScreen.tsx`, `ProfileScreen.tsx`: key screen upgrades.

## Canonical design contract

Use these exact tokens in both platforms:

```ts
const AcademicCalm = {
  red: '#E31D1C',
  redDark: '#B71918',
  redSoft: '#FFF1F1',
  blue: '#1784DA',
  blueDark: '#005B96',
  blueSoft: '#EEF7FF',
  gold: '#F7D428',
  goldSoft: '#FFFBE5',
  navy: '#112641',
  slate: '#475569',
  muted: '#6B7280',
  page: '#F8FCFF',
  card: '#FFFFFF',
  tint: '#F3F8FC',
  border: '#D8EAF5',
  borderStrong: '#B8DFF2',
};
```

Avoid these visual patterns in key product files:

```text
from-[#7C3AED]
to-[#7C3AED]
#7C3AED
emoji-only action icons in core cards
red-blue-gold gradients used as default card backgrounds
CSS-drawn people or robots replacing real logo assets
```

---

### Task 1: Add web design-token guard test

**Files:**
- Create: `apps/client-react/test/academic-calm-tokens.test.mjs`
- Test command from `apps/client-react`: `npm test -- test/academic-calm-tokens.test.mjs`

- [ ] **Step 1: Create the failing web token test**

```js
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
```

- [ ] **Step 2: Run the test and verify it fails**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-tokens.test.mjs
```

Expected: FAIL because `tailwind.config.ts` still contains legacy values such as `#E60012`, and `globals.css` does not define the `--sdu-*` variables or academic utility classes.

- [ ] **Step 3: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/test/academic-calm-tokens.test.mjs
git commit -m "test(ui): lock web academic calm tokens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the staged-file list in the handoff instead.

---

### Task 2: Implement web tokens and academic primitives

**Files:**
- Modify: `apps/client-react/tailwind.config.ts`
- Modify: `apps/client-react/src/app/globals.css`
- Test: `apps/client-react/test/academic-calm-tokens.test.mjs`

- [ ] **Step 1: Update Tailwind canonical colors**

Replace the `colors` object inside `theme.extend` in `apps/client-react/tailwind.config.ts` with this object:

```ts
colors: {
  primary: {
    DEFAULT: '#E31D1C',
    light: '#F45B58',
    dark: '#B71918',
    soft: '#FFF1F1',
    bg: '#FFF7F7',
    alt: '#FFE7E7',
    border: '#FFD1D1',
    fg: '#FFFFFF',
  },
  blue: {
    DEFAULT: '#1784DA',
    light: '#4FB3EC',
    dark: '#005B96',
    soft: '#EEF7FF',
    border: '#C7E8FA',
  },
  accent: {
    DEFAULT: '#F7D428',
    soft: '#FFFBE5',
    border: '#F5E58A',
    text: '#705E00',
    fg: '#112641',
    red: '#E31D1C',
    gold: '#F7D428',
    goldSoft: '#FFFBE5',
  },
  surface: {
    page: '#F8FCFF',
    card: '#FFFFFF',
    alt: '#F3F8FC',
    tint: '#EEF7FF',
    inset: '#E8F4FB',
    navy: '#112641',
  },
  text: {
    DEFAULT: '#112641',
    sub: '#475569',
    muted: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  border: {
    DEFAULT: '#D8EAF5',
    soft: '#E8F2F8',
    strong: '#B8DFF2',
    dark: '#005B96',
  },
  state: {
    info: '#1784DA',
    infoBg: '#EEF7FF',
    success: '#10B981',
    successBg: '#ECFDF5',
    successText: '#065F46',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningText: '#92400E',
    error: '#E31D1C',
    errorBg: '#FFF1F1',
    errorText: '#9F1239',
    selected: '#1784DA',
    selectedBg: '#EEF7FF',
    selectedText: '#112641',
  },
  semantic: {
    nav: '#112641',
    tabInactive: '#6B7280',
    divider: '#D8EAF5',
    panel: '#F3F8FC',
  },
},
```

- [ ] **Step 2: Update Tailwind radii and shadows**

In the same `theme.extend` block, replace `borderRadius` and `boxShadow` with:

```ts
borderRadius: {
  none: '0',
  sm: '8px',
  DEFAULT: '14px',
  md: '14px',
  lg: '18px',
  xl: '22px',
  '2xl': '28px',
  full: '9999px',
},
boxShadow: {
  soft: '0 16px 42px rgba(17, 38, 65, 0.10)',
  card: '0 10px 28px rgba(17, 38, 65, 0.08)',
  lift: '0 18px 46px rgba(17, 38, 65, 0.12)',
},
```

- [ ] **Step 3: Add CSS variables and academic primitives**

Add this block after the Tailwind directives in `apps/client-react/src/app/globals.css`:

```css
:root {
  --sdu-red: #E31D1C;
  --sdu-red-dark: #B71918;
  --sdu-red-soft: #FFF1F1;
  --sdu-blue: #1784DA;
  --sdu-blue-dark: #005B96;
  --sdu-blue-soft: #EEF7FF;
  --sdu-gold: #F7D428;
  --sdu-gold-soft: #FFFBE5;
  --sdu-ink: #112641;
  --sdu-muted: #6B7280;
  --sdu-page: #F8FCFF;
  --sdu-card: #FFFFFF;
  --sdu-tint: #F3F8FC;
  --sdu-border: #D8EAF5;
  --sdu-border-strong: #B8DFF2;
  --sdu-shadow-card: 0 10px 28px rgba(17, 38, 65, 0.08);
  --sdu-shadow-soft: 0 16px 42px rgba(17, 38, 65, 0.10);
}

.academic-page {
  background: var(--sdu-page);
  color: var(--sdu-ink);
}

.academic-card {
  background: var(--sdu-card);
  border: 1px solid var(--sdu-border);
  border-radius: 22px;
  box-shadow: var(--sdu-shadow-card);
}

.academic-card-quiet {
  background: var(--sdu-card);
  border: 1px solid var(--sdu-border);
  border-radius: 18px;
}

.academic-section-eyebrow {
  color: var(--sdu-red);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.academic-button-primary {
  background: var(--sdu-red);
  color: white;
  border-radius: 14px;
  font-weight: 900;
  transition: background-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.academic-button-primary:hover {
  background: var(--sdu-red-dark);
}

.academic-button-secondary {
  background: var(--sdu-blue-soft);
  color: var(--sdu-blue-dark);
  border: 1px solid var(--sdu-border-strong);
  border-radius: 14px;
  font-weight: 900;
  transition: background-color 180ms ease, transform 180ms ease, border-color 180ms ease;
}

.academic-input {
  background: var(--sdu-card);
  border: 1px solid var(--sdu-border);
  border-radius: 14px;
  color: var(--sdu-ink);
  outline: none;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.academic-input:focus,
.academic-input:focus-within {
  border-color: var(--sdu-blue);
  box-shadow: 0 0 0 4px rgba(23, 132, 218, 0.12);
}

.academic-status-pill {
  border-radius: 9999px;
  border: 1px solid var(--sdu-border);
  background: var(--sdu-tint);
  color: var(--sdu-blue-dark);
  font-size: 0.75rem;
  font-weight: 900;
}
```

- [ ] **Step 4: Calm existing gradient utility classes instead of deleting them**

In `globals.css`, replace the existing `.brand-gradient-red`, `.brand-gradient-blue`, and `.brand-gradient-page` definitions with:

```css
.brand-gradient-red {
  background: var(--sdu-red);
}

.brand-gradient-blue {
  background: var(--sdu-blue-dark);
}

.brand-gradient-page {
  background: var(--sdu-page);
}
```

This preserves existing class names while removing default spectacle.

- [ ] **Step 5: Run the web token test**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-tokens.test.mjs
```

Expected: PASS for both token and primitive tests.

- [ ] **Step 6: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/tailwind.config.ts apps/client-react/src/app/globals.css apps/client-react/test/academic-calm-tokens.test.mjs
git commit -m "feat(ui): establish web academic calm tokens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 3: Add web key-screen guard test

**Files:**
- Create: `apps/client-react/test/academic-calm-screens.test.mjs`
- Test command from `apps/client-react`: `npm test -- test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Create the failing screen test**

```js
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
  'src/components/pages/SchedulePage.tsx',
  'src/components/pages/DocumentsPage.tsx',
  'src/components/pages/HealthDashboardPage.tsx',
  'src/app/profile/page.tsx',
];

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('web key screens avoid non-Sao-Do purple AI styling', () => {
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /#7C3AED|from-\[#7C3AED\]|to-\[#7C3AED\]|purple/i, file);
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
```

- [ ] **Step 2: Run the screen test and verify it fails**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: FAIL because `AICompanionWidget.tsx` contains `#7C3AED`, `DashboardPage.tsx` contains decorative emoji, and several key files still lack academic primitives.

- [ ] **Step 3: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/test/academic-calm-screens.test.mjs
git commit -m "test(ui): guard web academic calm screens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed file in the handoff instead.

---

### Task 4: Upgrade web auth, shell, and quick AI widget

**Files:**
- Modify: `apps/client-react/src/components/AuthFrame.tsx`
- Modify: `apps/client-react/src/components/AppShell.tsx`
- Modify: `apps/client-react/src/components/AICompanionWidget.tsx`
- Test: `apps/client-react/test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Replace auth galaxy copy and layout treatment**

In `AuthFrame.tsx`, replace the `assistantSlogans` array with:

```ts
const assistantSlogans = [
  'Một không gian học tập gọn gàng cho lịch học, tài liệu, bài tập và câu hỏi với trợ lí AI Sao Đỏ.',
  'Đăng nhập để tiếp tục học tập, xem lịch hôm nay và hỏi nhanh những điều bạn cần chuẩn bị.',
  'Trợ lí Sao Đỏ giúp bạn tổ chức ngày học rõ ràng hơn mà không làm mất sự tập trung.',
  'Tài khoản sinh viên của bạn kết nối lịch học, tài liệu và hội thoại AI trong một nơi tin cậy.',
];
```

- [ ] **Step 2: Replace the auth frame JSX shell**

In `AuthFrame.tsx`, replace the returned `<main>...</main>` with:

```tsx
return (
  <main className="academic-page grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(420px,1.1fr)]">
    <section className="hidden border-r border-border bg-white px-10 py-12 lg:flex lg:flex-col lg:justify-between">
      <BrandMark size="md" />

      <div className="max-w-xl">
        <p className="academic-section-eyebrow">Trường Đại học Sao Đỏ</p>
        <h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-[-0.055em] text-text">Xin chào, {displayName}</h1>
        <p className="mt-5 max-w-lg text-lg font-semibold leading-8 text-text-sub">{slogan}</p>
      </div>

      <address className="academic-card-quiet p-4 text-sm font-semibold not-italic leading-6 text-text-sub">
        Cơ sở 1: Số 76, Nguyễn Thị Duệ, phường Chu Văn An, thành phố Hải Phòng.
      </address>
    </section>

    <section className="flex items-center justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 flex justify-center lg:hidden">
          <BrandMark size="lg" />
        </div>
        <div className="academic-card p-6 sm:p-8">
          <div className="mb-6">
            <p className="academic-section-eyebrow">Tài khoản sinh viên</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-text">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-text-sub">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </section>
  </main>
);
```

- [ ] **Step 3: Calm the app sidebar navigation**

In `AppShell.tsx`, replace active nav item classes so the active state is flat red and inactive state is quiet:

```tsx
className={`student-os-hover flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-extrabold transition ${
  active
    ? 'bg-primary text-white shadow-card'
    : 'text-text-sub hover:bg-blue-soft hover:text-blue-dark'
}`}
```

Replace the sidebar `<aside>` class with:

```tsx
className="hidden w-[280px] shrink-0 border-r border-border bg-white px-4 py-5 shadow-card lg:flex lg:flex-col"
```

Remove the two static sidebar cards containing `Mục tiêu tuần này` and the motivational quote. Replace them with this single data-aware card:

```tsx
<div className="mt-5 academic-card-quiet p-4 text-left">
  <p className="academic-section-eyebrow">Hôm nay</p>
  <p className="mt-2 text-sm font-bold leading-6 text-text-sub">Mở Dashboard để xem lịch học, tài liệu và gợi ý AI mới nhất.</p>
</div>
```

- [ ] **Step 4: Calm the topbar and mobile nav**

In `AppShell.tsx`, replace the topbar `<header>` class with:

```tsx
className="sticky top-0 z-20 border-b border-border bg-white/95 px-4 py-3 shadow-card backdrop-blur sm:px-6 lg:px-8"
```

Replace the mobile nav `<nav>` class with:

```tsx
className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white px-2 pb-2 pt-2 shadow-card lg:hidden"
```

Replace active mobile button classes with:

```tsx
active ? 'bg-primary text-white shadow-card' : 'text-text-muted hover:bg-blue-soft hover:text-blue-dark'
```

- [ ] **Step 5: Remove purple AI widget styling**

In `AICompanionWidget.tsx`, replace the quick widget header, message, and launcher color classes:

```tsx
<header className="flex items-center justify-between gap-3 bg-blue-dark px-4 py-3 text-white">
```

```tsx
message.role === 'user' ? 'bg-primary text-white' : 'border border-border bg-white text-text'
```

```tsx
<span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-soft text-xl font-black text-blue-dark">AI</span>
```

```tsx
<button onClick={() => handleSend()} disabled={!input.trim() || !token} className="h-10 rounded-2xl bg-primary px-4 text-sm font-black text-white shadow-sm disabled:opacity-45">
```

```tsx
<button onClick={() => setIsOpen((value) => !value)} className="student-os-orb-pulse flex h-16 w-16 items-center justify-center rounded-full bg-blue-dark text-lg font-black text-white shadow-card ring-8 ring-white/70 transition hover:scale-105" aria-label="Mở AI Companion">
  AI
</button>
```

- [ ] **Step 6: Run the web screen test**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: still FAIL until dashboard and other key screens are updated, but the failure output should no longer mention `AuthFrame.tsx`, `AppShell.tsx`, or `AICompanionWidget.tsx` for purple styling.

- [ ] **Step 7: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/src/components/AuthFrame.tsx apps/client-react/src/components/AppShell.tsx apps/client-react/src/components/AICompanionWidget.tsx
git commit -m "feat(ui): calm web auth shell and quick AI"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 5: Upgrade web dashboard and chat

**Files:**
- Modify: `apps/client-react/src/components/pages/DashboardPage.tsx`
- Modify: `apps/client-react/src/components/pages/ChatPage.tsx`
- Test: `apps/client-react/test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Replace decorative dashboard icons with labels**

In `DashboardPage.tsx`, replace `IconBadge` with:

```tsx
function TextBadge({ children, tone = 'bg-blue-soft text-blue-dark' }: { children: string; tone?: string }) {
  return <span className={`inline-flex min-w-10 items-center justify-center rounded-full px-3 py-1.5 text-xs font-black ${tone}`}>{children}</span>;
}
```

Then replace `IconBadge` usages with these text values:

```tsx
<TextBadge>Lịch</TextBadge>
<TextBadge tone="bg-primary-soft text-primary">Task</TextBadge>
<TextBadge>Tiến độ</TextBadge>
<TextBadge>AI</TextBadge>
<TextBadge>CV</TextBadge>
<TextBadge>Việc</TextBadge>
<TextBadge>Dự án</TextBadge>
<TextBadge>Nhắc</TextBadge>
<TextBadge>Ngủ</TextBadge>
<TextBadge>Năng lượng</TextBadge>
<TextBadge>Nước</TextBadge>
<TextBadge>Nghỉ</TextBadge>
```

- [ ] **Step 2: Replace the dashboard hero with a command-desk hero**

In `HeroStudent`, replace the entire `<section>` with:

```tsx
<section className="academic-card grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-8">
  <div>
    <p className="academic-section-eyebrow">Trợ lí học tập Sao Đỏ</p>
    <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.055em] text-text sm:text-5xl">
      Ngày học rõ ràng hơn, {displayName}.
    </h1>
    <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-text-sub">
      Theo dõi lịch học, việc cần làm, tài liệu và câu hỏi AI trong một không gian gọn gàng.
    </p>
    <SuggestionCard onAskAI={onAskAI} />
  </div>
  <aside className="academic-card-quiet bg-surface-alt p-5">
    <p className="text-sm font-black text-text">Ưu tiên hôm nay</p>
    <div className="mt-4 space-y-3 text-sm font-semibold text-text-sub">
      <p>1. Xem tiết học tiếp theo và phòng học.</p>
      <p>2. Mở tài liệu AI liên quan đến môn đang học.</p>
      <p>3. Hỏi trợ lí để chuẩn bị bài trước giờ lên lớp.</p>
    </div>
  </aside>
</section>
```

- [ ] **Step 3: Calm dashboard panels and cards**

In `SectionPanel`, replace the wrapper and header classes with:

```tsx
<section className="academic-card overflow-hidden">
  <div className="flex items-center justify-between border-b border-border bg-white px-5 py-4">
    <div>
      <p className="academic-section-eyebrow">{title}</p>
      <h2 className="mt-1 text-xl font-black text-text">{subtitle}</h2>
    </div>
    <button onClick={action} className="academic-button-secondary px-4 py-2 text-xs">Xem tất cả →</button>
  </div>
  <div className="bg-surface-alt p-3">{children}</div>
</section>
```

Remove the unused `gradient` prop from the `SectionPanel` type and calls.

- [ ] **Step 4: Replace chat header and bubbles**

In `ChatPage.tsx`, replace the root section class with:

```tsx
className="academic-card flex min-h-[calc(100vh-7rem)] flex-1 flex-col overflow-hidden"
```

Replace the header with:

```tsx
<header className="flex items-center justify-between border-b border-border bg-white px-4 py-4 sm:px-5">
  <div>
    <p className="academic-section-eyebrow">Trợ lý AI</p>
    <h1 className="mt-1 text-lg font-black text-text">{detail?.title || 'Hỏi đáp học tập'}</h1>
    <div className="academic-status-pill mt-2 inline-flex items-center gap-2 px-3 py-1">
      <span className={`h-2 w-2 rounded-full ${assistantStatus?.configured ? 'bg-blue' : 'bg-text-muted'}`} />
      {connectionLabel}
    </div>
  </div>
  <div className="hidden sm:block">
    <BrandMark compact size="sm" />
  </div>
</header>
```

Replace user and assistant bubble classes with:

```tsx
msg.role === 'user'
  ? 'bg-primary text-white'
  : 'border border-border bg-white text-text'
```

Replace the input wrapper class with:

```tsx
className="academic-input flex items-end gap-2 bg-surface-alt p-2"
```

Replace the send button class with:

```tsx
className="academic-button-primary h-11 px-4 text-sm disabled:opacity-45"
```

- [ ] **Step 5: Run the web screen test**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: still FAIL until Schedule, Documents, Health, and Profile are updated, but Dashboard decorative emoji failures should be gone.

- [ ] **Step 6: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/src/components/pages/DashboardPage.tsx apps/client-react/src/components/pages/ChatPage.tsx
git commit -m "feat(ui): make web dashboard and chat academic calm"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 6: Upgrade remaining web key screens

**Files:**
- Modify: `apps/client-react/src/components/pages/SchedulePage.tsx`
- Modify: `apps/client-react/src/components/pages/DocumentsPage.tsx`
- Modify: `apps/client-react/src/components/pages/HealthDashboardPage.tsx`
- Modify: `apps/client-react/src/app/profile/page.tsx`
- Test: `apps/client-react/test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Calm the schedule hero and preparation card**

In `SchedulePage.tsx`, replace `NextClassHeroCard` wrapper class with:

```tsx
className="academic-card relative overflow-hidden bg-white p-5 xl:col-span-5"
```

Replace its inner heading colors with text classes:

```tsx
<p className="academic-section-eyebrow">Tiết tiếp theo</p>
<h1 className="mt-3 max-w-[18rem] text-2xl font-black leading-tight tracking-[-0.03em] text-text">{nextClass.title}</h1>
```

Replace the time/location panel with:

```tsx
<div className="grid gap-3 rounded-[18px] border border-border bg-surface-alt p-4 sm:grid-cols-2">
```

Replace `PreparationCard` wrapper with:

```tsx
className="academic-card-quiet bg-accent-soft p-5 xl:col-span-7"
```

- [ ] **Step 2: Calm the documents screen field and card classes**

In `DocumentsPage.tsx`, replace `fieldClass` with:

```ts
const fieldClass = 'academic-input w-full px-4 py-3 text-sm font-bold placeholder:text-text-muted';
```

Replace document cards with:

```tsx
className="academic-card animate-enter p-5"
```

Replace primary detail/upload buttons with `academic-button-primary` and secondary controls with `academic-button-secondary`:

```tsx
className="academic-button-primary px-3 py-2 text-xs"
```

```tsx
className="academic-button-secondary px-3 py-2 text-xs"
```

- [ ] **Step 3: Calm the health dashboard**

In `HealthDashboardPage.tsx`, replace the hero block with:

```tsx
<div className="academic-card p-6 sm:p-8">
  <p className="academic-section-eyebrow">Sức khỏe học đường</p>
  <h1 className="mt-3 text-3xl font-black tracking-tight text-text sm:text-4xl">Theo dõi thói quen học tập bền vững</h1>
  <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-text-sub">
    Ghi nhận cân nặng, giấc ngủ, bữa ăn, tập luyện và tâm trạng trong một giao diện gọn gàng cho sinh viên Sao Đỏ.
  </p>
</div>
```

Replace metric cards with:

```tsx
className="academic-card p-5"
```

Replace the AI health suggestion wrapper with:

```tsx
className="academic-card-quiet bg-primary-soft p-5"
```

- [ ] **Step 4: Replace profile purple theme constants**

In `src/app/profile/page.tsx`, replace `profileBentoTheme` with:

```ts
const profileBentoTheme = {
  background: '#F8FCFF',
  card: '#FFFFFF',
  primaryBlue: '#1784DA',
  secondaryBlue: '#4FB3EC',
  softBlue: '#EEF7FF',
  red: '#E31D1C',
  redSoft: '#FFF1F1',
  green: '#10B981',
  softGreen: '#ECFDF5',
  yellow: '#F7D428',
  textMain: '#112641',
  textSecondary: '#475569',
  border: '#D8EAF5',
};
```

Replace `studyInfo` emoji labels with text initials:

```ts
const studyInfo = [
  ['MS', 'Mã sinh viên', '2200286', '#EEF7FF'],
  ['HT', 'Thông tin học tập', 'Công nghệ thông tin', '#ECFDF5'],
  ['LH', 'Lớp sinh hoạt', academicDefaults.className, '#FFF1F1'],
  ['KH', 'Khóa học', academicDefaults.cohort, '#FFFBE5'],
  ['CV', 'Cố vấn học tập', academicDefaults.advisor, '#EEF7FF'],
  ['TC', 'Tín chỉ tích lũy', academicDefaults.creditProgress, '#F3F8FC'],
];
```

- [ ] **Step 5: Run the web screen test**

Run from `apps/client-react`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run web build verification**

Run from `apps/client-react`:

```bash
npm run build
```

Expected: Next.js build exits 0.

- [ ] **Step 7: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/client-react/src/components/pages/SchedulePage.tsx apps/client-react/src/components/pages/DocumentsPage.tsx apps/client-react/src/components/pages/HealthDashboardPage.tsx apps/client-react/src/app/profile/page.tsx apps/client-react/test/academic-calm-screens.test.mjs
git commit -m "feat(ui): apply academic calm to web key screens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 7: Add mobile theme guard test

**Files:**
- Create: `apps/mobile/test/academic-calm-theme.test.mjs`
- Test command from `apps/mobile`: `npm test -- test/academic-calm-theme.test.mjs`

- [ ] **Step 1: Create the failing mobile theme test**

```js
// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('mobile theme uses canonical academic calm colors', () => {
  const theme = read('src/constants/theme.ts');
  for (const token of ['#E31D1C', '#1784DA', '#F7D428', '#112641', '#F8FCFF', '#D8EAF5']) {
    assert.match(theme, new RegExp(token.replace('#', '#')));
  }
});

test('mobile core UI primitives expose calm variants', () => {
  const button = read('src/components/ui/AppButton.tsx');
  const card = read('src/components/ui/AppCard.tsx');
  const input = read('src/components/ui/AppInput.tsx');

  assert.match(button, /danger/);
  assert.match(button, /secondary/);
  assert.match(card, /compact/);
  assert.match(input, /errorInput/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run from `apps/mobile`:

```bash
npm test -- test/academic-calm-theme.test.mjs
```

Expected: FAIL because `theme.ts` still uses legacy values and `AppButton` does not expose `danger` yet.

- [ ] **Step 3: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/mobile/test/academic-calm-theme.test.mjs
git commit -m "test(ui): lock mobile academic calm theme"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed file in the handoff instead.

---

### Task 8: Implement mobile theme, primitives, tabs, and auth

**Files:**
- Modify: `apps/mobile/src/constants/theme.ts`
- Modify: `apps/mobile/src/components/ui/AppCard.tsx`
- Modify: `apps/mobile/src/components/ui/AppButton.tsx`
- Modify: `apps/mobile/src/components/ui/AppInput.tsx`
- Modify: `apps/mobile/src/components/ui/Header.tsx`
- Modify: `apps/mobile/src/navigation/MainTabs.tsx`
- Modify: `apps/mobile/src/screens/auth/LoginScreen.tsx`
- Test: `apps/mobile/test/academic-calm-theme.test.mjs`

- [ ] **Step 1: Replace mobile theme colors**

In `theme.ts`, replace the `Colors` object with:

```ts
export const Colors = {
  primary: '#E31D1C',
  primaryLight: '#F45B58',
  primaryDark: '#B71918',
  primaryBg: '#FFF1F1',
  primaryBorder: '#FFD1D1',

  blue: '#1784DA',
  blueLight: '#4FB3EC',
  blueDark: '#005B96',
  blueBg: '#EEF7FF',
  blueBorder: '#C7E8FA',

  brandRed: '#E31D1C',
  brandGold: '#F7D428',
  goldBg: '#FFFBE5',

  bg: '#F8FCFF',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F8FC',
  navy: '#112641',

  text: '#112641',
  textSub: '#475569',
  textMuted: '#6B7280',

  red: '#E31D1C',
  green: '#10B981',
  orange: '#F59E0B',
  yellow: '#F7D428',

  border: '#D8EAF5',
  borderSoft: '#E8F2F8',
  shadow: 'rgba(17, 38, 65, 0.10)',
};
```

Update `DarkColors` to keep accessible contrast:

```ts
export const DarkColors = {
  ...Colors,
  bg: '#0B1728',
  surface: '#102033',
  surfaceAlt: '#162B43',
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#24415F',
  borderSoft: '#1B344F',
  shadow: 'rgba(0, 0, 0, 0.32)',
};
```

- [ ] **Step 2: Add compact card support**

In `AppCard.tsx`, update props and styles:

```tsx
export type AppCardProps = {
  children: React.ReactNode;
  tone?: AppCardTone;
  compact?: boolean;
};

export function AppCard({ children, tone = 'default', compact = false }: AppCardProps) {
  return <View style={[styles.card, compact && styles.compact, toneStyles[tone]]}>{children}</View>;
}
```

```tsx
compact: {
  padding: Spacing.md,
  borderRadius: Radius.md,
},
```

- [ ] **Step 3: Add button variants**

In `AppButton.tsx`, replace `AppButtonVariant` with:

```ts
export type AppButtonVariant = 'primary' | 'secondary' | 'blue' | 'ghost' | 'danger';
```

Add styles:

```tsx
blue: {
  backgroundColor: Colors.blueBg,
  borderWidth: 1,
  borderColor: Colors.blueBorder,
},
danger: {
  backgroundColor: Colors.primaryBg,
  borderWidth: 1,
  borderColor: Colors.primaryBorder,
},
```

Replace title color expression with:

```tsx
const titleStyle = variant === 'primary' ? styles.primaryTitle : variant === 'danger' ? styles.dangerTitle : styles.secondaryTitle;
```

Use it:

```tsx
<Text style={[styles.title, titleStyle]}>{title}</Text>
```

Add:

```tsx
dangerTitle: {
  color: Colors.primary,
},
```

- [ ] **Step 4: Calm mobile tabs**

In `MainTabs.tsx`, change focused icon color from `Colors.blueDark` to `Colors.primary`, change `iconWrapFocused` background to `Colors.primaryBg`, and use `Colors.primaryBorder` for the focused border.

Use this focused style:

```tsx
iconWrapFocused: {
  backgroundColor: Colors.primaryBg,
  borderWidth: 1,
  borderColor: Colors.primaryBorder,
},
tabLabelFocused: {
  color: Colors.primary,
},
```

- [ ] **Step 5: Remove mobile galaxy auth treatment**

In `LoginScreen.tsx`, remove the `AuthGalaxyBackground` import and remove `<AuthGalaxyBackground />` from the JSX.

Replace these styles:

```tsx
container: { flex: 1, backgroundColor: Colors.bg },
scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
school: { fontSize: FontSize.xxl, fontWeight: '900', color: Colors.text, textAlign: 'center' },
tagline: { marginTop: 4, fontSize: FontSize.md, fontWeight: '800', color: Colors.textSub },
card: {
  backgroundColor: Colors.surface,
  borderRadius: Radius.xl,
  padding: Spacing.xxl,
  borderWidth: 1,
  borderColor: Colors.border,
  ...Shadow.card,
},
```

- [ ] **Step 6: Run the mobile theme test**

Run from `apps/mobile`:

```bash
npm test -- test/academic-calm-theme.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/mobile/src/constants/theme.ts apps/mobile/src/components/ui/AppCard.tsx apps/mobile/src/components/ui/AppButton.tsx apps/mobile/src/components/ui/AppInput.tsx apps/mobile/src/components/ui/Header.tsx apps/mobile/src/navigation/MainTabs.tsx apps/mobile/src/screens/auth/LoginScreen.tsx apps/mobile/test/academic-calm-theme.test.mjs
git commit -m "feat(ui): establish mobile academic calm foundation"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 9: Add mobile key-screen guard test

**Files:**
- Create: `apps/mobile/test/academic-calm-screens.test.mjs`
- Test command from `apps/mobile`: `npm test -- test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Create the failing mobile screen test**

```js
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
    assert.doesNotMatch(source, /#[0-9A-Fa-f]{6}/, file);
  }
});

test('mobile key screens keep chat and daily student workflows visible', () => {
  const home = read('src/screens/main/HomeScreen.tsx');
  const chat = read('src/screens/main/ChatScreen.tsx');

  for (const label of ['Hôm nay', 'AI', 'Lịch', 'Tài liệu']) {
    assert.match(home, new RegExp(label));
  }
  assert.match(chat, /Trợ lý Sao Đỏ|Bạn cần hỗ trợ gì|Nhập câu hỏi/);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run from `apps/mobile`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: FAIL if any key screen contains direct hex styling or if Home does not prioritize Today/AI/Schedule/Documents copy.

- [ ] **Step 3: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/mobile/test/academic-calm-screens.test.mjs
git commit -m "test(ui): guard mobile academic calm screens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed file in the handoff instead.

---

### Task 10: Upgrade mobile Home and Chat

**Files:**
- Modify: `apps/mobile/src/screens/main/HomeScreen.tsx`
- Modify: `apps/mobile/src/screens/main/ChatScreen.tsx`
- Test: `apps/mobile/test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Reorder Home around Today and AI**

In `HomeScreen.tsx`, replace the first `Header` call with:

```tsx
<Header title="Hôm nay" subtitle="Lịch học, việc cần làm, tài liệu và gợi ý AI cho ngày học của bạn." />
```

Replace `quickActions` with this ordered list:

```ts
const quickActions: QuickAction[] = [
  { label: 'Lịch học', route: 'Subjects', icon: 'calendar-outline' },
  { label: 'Tài liệu', route: 'Documents', icon: 'folder-open-outline' },
  { label: 'Task', route: 'Tasks', icon: 'checkbox-outline' },
  { label: 'Nhắc nhở', route: 'ReminderList', icon: 'alarm-outline' },
  { label: 'Tài chính', route: 'FinanceDashboard', icon: 'wallet-outline' },
  { label: 'Cài đặt', route: 'Settings', icon: 'settings-outline' },
];
```

Keep one-tap access to Chat through the existing bottom tab `AIChat`. In the Home screen content, keep an AI suggestion section titled `Gợi ý từ AI` so the screen still communicates AI support without adding an invalid nested-tab route.

- [ ] **Step 2: Calm Home card styling**

In `HomeScreen.tsx`, change `quickCard` border color to `Colors.border`, icon color to `Colors.primary`, and card shadow to the lighter `Shadow.card` from the updated theme.

Use this quick card style:

```tsx
quickCard: {
  width: '31.5%',
  minHeight: 86,
  alignItems: 'center',
  justifyContent: 'center',
  gap: Spacing.sm,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.border,
  backgroundColor: Colors.surface,
  padding: Spacing.md,
  ...Shadow.card,
},
```

- [ ] **Step 3: Calm mobile Chat list and bubble styling**

In `ChatScreen.tsx`, replace user bubble style with primary red and assistant bubble style with white bordered surface:

```tsx
bubbleUser: {
  backgroundColor: Colors.primary,
},
bubbleBot: {
  backgroundColor: Colors.surface,
  borderWidth: 1,
  borderColor: Colors.border,
},
```

Replace send button styling with:

```tsx
sendBtn: {
  width: 44,
  height: 44,
  borderRadius: Radius.md,
  backgroundColor: Colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
},
```

Replace `convIcon` color usage with `Colors.primaryBg` and `Colors.primary`.

- [ ] **Step 4: Run mobile screen test**

Run from `apps/mobile`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: may still FAIL until Schedule, Documents, Health, and Profile are updated.

- [ ] **Step 5: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/mobile/src/screens/main/HomeScreen.tsx apps/mobile/src/screens/main/ChatScreen.tsx
git commit -m "feat(ui): make mobile home and chat academic calm"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 11: Upgrade remaining mobile key screens

**Files:**
- Modify: `apps/mobile/src/screens/main/ScheduleScreen.tsx`
- Modify: `apps/mobile/src/screens/main/DocumentsScreen.tsx`
- Modify: `apps/mobile/src/screens/main/HealthScreen.tsx`
- Modify: `apps/mobile/src/screens/main/ProfileScreen.tsx`
- Test: `apps/mobile/test/academic-calm-screens.test.mjs`

- [ ] **Step 1: Calm Schedule screen**

In `ScheduleScreen.tsx`, keep `TYPE_COLORS` as theme values only:

```ts
const TYPE_COLORS: Record<string, string> = {
  'Lý thuyết': Colors.blue,
  'Thực hành': Colors.green,
  'Bài tập': Colors.orange,
  Thi: Colors.primary,
};
```

Change `dayTabActive` to:

```tsx
dayTabActive: { backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder },
dayTextActive: { color: Colors.primary },
```

- [ ] **Step 2: Calm Documents screen**

In `DocumentsScreen.tsx`, replace banner background with a white bordered surface:

```tsx
banner: {
  backgroundColor: Colors.surface,
  borderRadius: Radius.xl,
  borderWidth: 1,
  borderColor: Colors.border,
  padding: Spacing.xl,
  marginBottom: Spacing.lg,
  ...Shadow.card,
},
eyebrow: { color: Colors.primary, fontSize: FontSize.xs, fontWeight: '900', textTransform: 'uppercase' },
bannerTitle: { color: Colors.text, fontSize: FontSize.xxl, fontWeight: '900', marginTop: 4 },
bannerSub: { color: Colors.textSub, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 20, marginTop: 6 },
```

- [ ] **Step 3: Calm Health screen**

In `HealthScreen.tsx`, change quick action icon color to `Colors.primary`, keep `aiPanel` but ensure it uses theme tokens only:

```tsx
aiPanel: { borderRadius: Radius.lg, backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primaryBorder, padding: Spacing.lg },
aiTitle: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '900' },
```

- [ ] **Step 4: Remove direct hex from Profile styles**

In `ProfileScreen.tsx`, replace direct hex values in styles with `Colors.*`. For the most common mappings, use:

```tsx
backgroundColor: Colors.surface
borderColor: Colors.border
color: Colors.text
color: Colors.textSub
color: Colors.primary
backgroundColor: Colors.primaryBg
backgroundColor: Colors.blueBg
```

For profile default soft backgrounds, replace direct values with these theme-backed values:

```tsx
const profileTone = {
  school: Colors.blueBg,
  personal: Colors.primaryBg,
  family: Colors.goldBg,
  neutral: Colors.surfaceAlt,
};
```

- [ ] **Step 5: Run mobile screen test**

Run from `apps/mobile`:

```bash
npm test -- test/academic-calm-screens.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run mobile TypeScript verification**

Run from `apps/mobile`:

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 7: Commit checkpoint if explicit commit permission is active**

```bash
git add apps/mobile/src/screens/main/ScheduleScreen.tsx apps/mobile/src/screens/main/DocumentsScreen.tsx apps/mobile/src/screens/main/HealthScreen.tsx apps/mobile/src/screens/main/ProfileScreen.tsx apps/mobile/test/academic-calm-screens.test.mjs
git commit -m "feat(ui): apply academic calm to mobile key screens"
```

If the user has not explicitly requested commits in the active session, skip this command and record the changed files in the handoff instead.

---

### Task 12: Final cross-platform verification

**Files:**
- Verify: all files changed by Tasks 1-11

- [ ] **Step 1: Run web tests**

Run from `apps/client-react`:

```bash
npm test
```

Expected: all Node tests pass, including `academic-calm-tokens.test.mjs` and `academic-calm-screens.test.mjs`.

- [ ] **Step 2: Run web build**

Run from `apps/client-react`:

```bash
npm run build
```

Expected: Next.js build exits 0.

- [ ] **Step 3: Run mobile tests**

Run from `apps/mobile`:

```bash
npm test
```

Expected: all Node tests pass, including `academic-calm-theme.test.mjs` and `academic-calm-screens.test.mjs`.

- [ ] **Step 4: Run mobile TypeScript check**

Run from `apps/mobile`:

```bash
npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 5: Manual web smoke inspection**

Run from `apps/client-react`:

```bash
npm run dev
```

Open these routes and inspect the listed claims:

```text
/login       -> formal auth layout, real logo, no galaxy treatment
/dashboard   -> calm sidebar/topbar, dashboard, chat access, bottom nav on narrow viewport
/profile     -> academic dossier, no purple theme, no decorative emoji labels
```

- [ ] **Step 6: Manual mobile smoke inspection**

Run from `apps/mobile`:

```bash
npm run web
```

Inspect Login, Home, Chat, Schedule, Documents, Health, and Profile. Confirm that the app uses the same red/blue/gold/navy grammar and that chat remains reachable from bottom navigation.

- [ ] **Step 7: Review diff for accidental scope expansion**

Run from repo root:

```bash
git diff --stat
git diff --check
```

Expected: only planned UI/test/doc files changed, and `git diff --check` exits 0.

- [ ] **Step 8: Final commit if explicit commit permission is active**

```bash
git add apps/client-react apps/mobile docs/superpowers/specs/2026-04-30-academic-calm-ui-redesign-design.md docs/superpowers/plans/2026-04-30-academic-calm-ui-redesign.md
git commit -m "feat(ui): unify Sao Do assistant academic calm interface"
```

If the user has not explicitly requested commits in the active session, skip this command and report the changed files plus verification evidence.

## Self-review checklist

- Spec coverage: Tasks 1-2 cover shared web tokens; Tasks 3-6 cover web auth, shell, dashboard, chat, schedule, documents, health, and profile; Tasks 7-11 cover mobile tokens, primitives, nav, auth, home, chat, schedule, documents, health, and profile; Task 12 covers verification.
- No backend/API changes are planned.
- No new dependencies are planned.
- Tests are defined before implementation for both web and mobile.
- Commit steps are explicitly gated on user commit permission to respect repository instructions.
