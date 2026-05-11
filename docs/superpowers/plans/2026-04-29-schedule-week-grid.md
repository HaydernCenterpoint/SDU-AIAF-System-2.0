<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Schedule Week Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move preparation notes beside the next-class card and replace the week overview/timeline with a weekly timetable grid inspired by the supplied school portal screenshot.

**Architecture:** Keep the schedule page self-contained in `SchedulePage.tsx`. Preserve `NextClassHeroCard` and `PreparationCard`, remove `WeekStrip` and timeline components, and add a `WeeklyScheduleGrid` with day columns, Sáng/Chiều/Tối rows, toolbar controls, and a legend.

**Tech Stack:** Next.js 15, React 19 client components, TypeScript, Tailwind CSS, Node test runner.

---

## File Structure

- Modify: `apps/client-react/src/components/pages/SchedulePage.tsx`
  - Render `NextClassHeroCard` and `PreparationCard` in the top row.
  - Remove weekly summary and timeline components.
  - Add `WeeklyScheduleGrid` and `ScheduleLegend` helpers.
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`
  - Update the schedule layout regression assertions.

## Task 1: Write the Failing Layout Test

**Files:**
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Replace the old schedule regression markers**

Assert `SchedulePage.tsx` contains `WeeklyScheduleGrid`, `ScheduleLegend`, `schedule-week-grid`, `schedule-week-toolbar`, `Lịch học, lịch thi theo tuần`, `Sáng`, `Chiều`, `Tối`, and `Chuẩn bị trước giờ học`.

- [ ] **Step 2: Assert removed sections are gone**

Assert `SchedulePage.tsx` no longer contains `WeekStrip`, `TimelineSchedule`, `ScheduleTimelineItem`, `Tuần học Sao Đỏ`, `Lịch học hôm nay`, or `Timeline theo buổi`.

- [ ] **Step 3: Verify RED**

Run: `npm test -- --test-name-pattern="schedule page uses a weekly timetable grid"` from `apps/client-react`.

Expected: the test fails because `WeeklyScheduleGrid` and the new timetable markers do not exist yet.

## Task 2: Implement the Weekly Timetable

**Files:**
- Modify: `apps/client-react/src/components/pages/SchedulePage.tsx`

- [ ] **Step 1: Update page composition**

Render `NextClassHeroCard`, `PreparationCard`, and `WeeklyScheduleGrid` in that order inside `schedule-workspace-grid`.

- [ ] **Step 2: Add timetable constants and helpers**

Add static `weekDays`, `sessionRows`, and `scheduleLegendItems` constants. Add `getSessionForTime` to place classes into Sáng/Chiều/Tối.

- [ ] **Step 3: Add grid components**

Create `WeeklyScheduleGrid`, `ScheduleGridCell`, and `ScheduleLegend` in the same file.

## Task 3: Verification

**Files:**
- Verify: `apps/client-react/src/components/pages/SchedulePage.tsx`
- Verify: `apps/client-react/test/frontend-foundation.test.mjs`

- [ ] **Step 1: Run targeted test**

Run: `npm test -- --test-name-pattern="schedule page uses a weekly timetable grid"` from `apps/client-react`.

Expected: targeted test passes.

- [ ] **Step 2: Run app test suite**

Run: `npm test` from `apps/client-react`.

Expected: all tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build` from `apps/client-react`.

Expected: build completes successfully.
