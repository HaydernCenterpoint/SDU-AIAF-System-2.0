# Jobs Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current “Công việc” tab with a student job marketplace for Chí Linh/Hải Dương that supports community-created jobs, employer/admin jobs, and compliant public-source crawler feeds with source/risk labels.

**Architecture:** Keep the MVP self-contained: frontend renders a marketplace from static seed data, while backend exposes explicit job/crawler endpoints and source policy markers for future live ingestion. Crawling is limited to allowed public/official/community sources and records provenance/risk metadata; no login-bypass or protected-platform scraping is implemented.

**Tech Stack:** Next.js/React/Tailwind in `apps/client-react`, Node HTTP backend in `packages/backend`, Node test runner static tests.

---

### Task 1: Lock marketplace expectations with tests

**Files:**
- Modify: `apps/client-react/test/frontend-foundation.test.mjs`
- Modify: `packages/backend/test/backend-foundation.test.mjs` if present; otherwise use existing backend test file discovered during inspection.

- [ ] Add frontend assertions that `CoursesPage.tsx` contains `JobMarketplacePage`, `localJobSources`, `communityJobPosts`, `crawlerJobFeeds`, `riskBadges`, “Việc làm quanh Chí Linh”, “Đăng việc nhanh”, “Nguồn đang quét”, “Báo cáo”.
- [ ] Add backend assertions that job API/crawler markers exist: `jobs`, `job-sources`, `crawl/public-sources`, `sourceType`, `riskLevel`, `moderationStatus`.
- [ ] Run frontend test: `npm test -- test/frontend-foundation.test.mjs` in `apps/client-react`; expect failure on missing marketplace markers.
- [ ] Run backend tests; expect failure on missing job API markers.

### Task 2: Add backend jobs module markers and safe crawler contract

**Files:**
- Create or modify: `packages/backend/src/jobs.mjs`
- Modify: `packages/backend/src/app.mjs`

- [ ] Define in-memory seed jobs with `sourceType: 'student' | 'employer' | 'admin' | 'crawler'`, `region`, `riskLevel`, `moderationStatus: 'visible_immediately'`, and `sourceUrl`.
- [ ] Expose `GET /api/jobs`, `POST /api/jobs`, `GET /api/job-sources`, and `POST /api/jobs/crawl/public-sources`.
- [ ] Implement crawler endpoint as a compliant ingestion stub: accepts allowed public/official/community source metadata, rejects protected-login/private sources, returns queued/ingested seed jobs with provenance.
- [ ] Do not add external scraping dependencies.

### Task 3: Redesign the Công việc tab

**Files:**
- Modify: `apps/client-react/src/components/pages/CoursesPage.tsx`

- [ ] Replace subject-semester content with `JobMarketplacePage` composition.
- [ ] Add hero “Việc làm quanh Chí Linh – Hải Dương”.
- [ ] Add filter/search chips for khu vực, ca làm, lương, nguồn, độ tin cậy.
- [ ] Add job cards for student/employer/admin/crawler sources with save/contact/report actions.
- [ ] Add side panels “Đăng việc nhanh”, “Nguồn đang quét”, and “Cảnh báo an toàn”.
- [ ] Preserve Vietnamese copy and Sao Đỏ palette.

### Task 4: Verify

**Commands:**
- `npm test -- test/frontend-foundation.test.mjs` in `apps/client-react` → pass.
- Backend test command discovered during inspection → pass.
- `npm run build` in `apps/client-react` → pass.
- `npx tsc --noEmit --pretty false` in `apps/client-react` → pass.

### Self-review

- Scope is intentionally MVP: real crawler contract and allowed-source API surface are present, but no protected-network scraping or external dependencies are introduced.
- Frontend and backend can be verified independently.
- The plan avoids hidden moderation despite “hiển thị ngay” by using risk/source labels and report action.
