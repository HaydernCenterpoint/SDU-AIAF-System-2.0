<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Documents Layout Rebalance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the large community documents banner, move filters into the left column, and move the upload form to the right side above document details.

**Architecture:** Keep all document behavior inside `DocumentsPage.tsx`; only rearrange JSX. Update the existing foundation test to check the new layout markers and the removed hero text.

**Tech Stack:** Next.js 15, React 19 client components, TypeScript, Tailwind CSS.

---

## File Structure

- Modify: `apps/client-react/src/components/pages/DocumentsPage.tsx`
  - Remove the top hero header.
  - Move the filter card to the left column.
  - Move the upload form to the right column above `DetailPanel`.
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`
  - Update documents workflow assertions for the new layout.

## Task 1: Rebalance Documents Layout

**Files:**
- Modify: `apps/client-react/src/components/pages/DocumentsPage.tsx`

- [ ] **Step 1: Remove top hero header**

Delete the `<header>` block that contains `Kho học liệu cộng đồng`, `Tài liệu cộng đồng`, and the `Metric` cards.

- [ ] **Step 2: Replace page grid**

Use a page body shaped like:

```tsx
<div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
  <aside className="space-y-4">
    <FilterCard />
  </aside>
  <div className="space-y-4">
    {status ? <div>...</div> : null}
    <DocumentList />
  </div>
  <aside className="space-y-4">
    <UploadForm />
    <DetailPanel />
  </aside>
</div>
```

Do not create new components unless it makes the move clearer; preserving inline JSX is acceptable.

- [ ] **Step 3: Remove unused `Metric` helper if no longer referenced**

Delete the `Metric` function from the file after the hero is removed.

## Task 2: Update Documents Test

**Files:**
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Replace old hero expectation**

In `documents page exposes the community document library workflow`, remove `Kho học liệu cộng đồng` from required markers.

- [ ] **Step 2: Add new layout expectations**

Assert the page still contains:

```js
'Bộ lọc',
'Đăng tài liệu mới',
'Chọn một tài liệu để xem chi tiết.',
'xl:grid-cols-[360px_minmax(0,1fr)_360px]',
```

Assert the page no longer contains `Kho học liệu cộng đồng`.

## Task 3: Verification

**Files:**
- Verify: `apps/client-react/src/components/pages/DocumentsPage.tsx`
- Verify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Run tests**

Run: `npm test` from `apps/client-react`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build` from `apps/client-react`

Expected: build completes successfully.
