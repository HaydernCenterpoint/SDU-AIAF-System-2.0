# Semester Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hard-coded semester progress in the student profile with a deterministic calculation from the first class day to the final exam day.

**Architecture:** Keep the first iteration local to `apps/client-react/src/app/profile/page.tsx` to avoid adding backend schema before semester/exam data exists. Add a small pure function for date math and render its derived percent, date labels, remaining-day message, and progress-bar width in `AcademicSnapshotCard`.

**Tech Stack:** Next.js React client component, TypeScript, Node test runner static regression tests.

---

### Task 1: Semester Progress Calculation

**Files:**
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`
- Modify: `apps/client-react/src/app/profile/page.tsx`

- [ ] **Step 1: Write the failing test**

Add assertions that `profile/page.tsx` contains `calculateSemesterProgress`, `semesterStartDate`, `lastExamDate`, `daysRemaining`, `style={{ width: `${semesterProgress.percent}%` }}`, and Vietnamese labels for first class day and final exam day.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/frontend-foundation.test.mjs` from `apps/client-react`.
Expected: FAIL because the profile still uses hard-coded `72%` progress.

- [ ] **Step 3: Write minimal implementation**

In `profile/page.tsx`, add a local `calculateSemesterProgress(startDate, endDate, today = new Date())` function that clamps progress to `0..100`, computes `daysRemaining`, and formats `dd/mm/yyyy` dates for the card.

- [ ] **Step 4: Wire UI**

Update `AcademicSnapshotCard` to use computed `semesterProgress.percent`, dynamic progress-bar width, and labels `Ngày đầu tiên đi học` / `Ngày thi cuối cùng`.

- [ ] **Step 5: Verify**

Run:
- `npm test -- test/frontend-foundation.test.mjs`
- `npx tsc --noEmit --pretty false`
- `npm run build`

Expected: all pass, with the known Next workspace-root warning acceptable.
