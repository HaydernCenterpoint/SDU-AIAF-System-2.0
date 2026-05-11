# School Database Isolation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Physically isolate Nguyễn Thị Duệ and Sao Đỏ data so the same student/teacher code can exist in both schools without auth or user-data conflicts.

**Architecture:** Introduce a stable `schoolId` scope (`nguyen-thi-due`, `sao-do`) and route auth/user-data JSON files to `data/schools/<schoolId>/`. Auth tokens carry `schoolId`, and authenticated app routes resolve user-data from the token school scope.

**Tech Stack:** Node HTTP backend JSON storage, Next.js/React frontend, Node test runner static/API tests.

---

### Task 1: Backend red tests

**Files:**
- Modify: `packages/backend/test/app.test.mjs`

- [ ] Add a test registering `DUP001` in `sao-do` and `nguyen-thi-due`.
- [ ] Assert both registrations complete successfully.
- [ ] Assert login with each `schoolId` returns the correct `schoolId` and distinct user names.
- [ ] Assert `/api/app/bootstrap` for each token returns its own school name.
- [ ] Run `npm test -- test/app.test.mjs`; expected fail before implementation.

### Task 2: School scope module

**Files:**
- Create: `packages/backend/src/schools.mjs`

- [ ] Export `DEFAULT_SCHOOL_ID = 'sao-do'`.
- [ ] Export school registry for `sao-do` and `nguyen-thi-due`.
- [ ] Export `normalizeSchoolId(value)` and `getSchoolConfig(value)`.
- [ ] Export `getSchoolScopedPath(basePath, schoolId, fileName)` producing sibling school files under `<baseDir>/schools/<schoolId>/<fileName>`.

### Task 3: School-scoped auth DB

**Files:**
- Modify: `packages/backend/src/auth.mjs`

- [ ] Accept `schoolId` in register/login/complete-profile/forgot-password.
- [ ] Load/save DB using `schoolId` scope.
- [ ] Store `schoolId` on users and tokens.
- [ ] Make `getUserFromToken(token)` locate token across school DBs and return a user with `schoolId`.
- [ ] Return `schoolId` and `schoolName` in auth responses.
- [ ] Default missing `schoolId` to `sao-do` for backward compatibility.

### Task 4: School-scoped app user-data

**Files:**
- Modify: `packages/backend/src/app.mjs`

- [ ] Route `USER_DATA_PATH` through `getSchoolScopedPath(..., schoolId, 'user-data.json')`.
- [ ] Use `user.schoolId` in `getUserData` and `saveUserDataForUser`.
- [ ] Use school name in `createCatalog`, bootstrap response, and AI catalog.
- [ ] Keep Sao Đỏ defaults for current student dashboard content unless school-specific content exists.

### Task 5: Frontend schoolId propagation

**Files:**
- Modify: `apps/client-react/src/components/SchoolPortalLogin.tsx`
- Modify: `apps/client-react/src/app/login/page.tsx`
- Modify: `apps/client-react/src/contexts/AuthContext.tsx`
- Modify: `apps/client-react/src/app/register/page.tsx`

- [ ] Add `schoolId` to the login callback payload.
- [ ] Persist selected school when a user clicks a school panel.
- [ ] Include `schoolId` in login/register payloads.
- [ ] Default register `schoolId` from account type or local selected school.

### Task 6: Verification

**Commands:**
- `npm test -- test/app.test.mjs` in `packages/backend`.
- `npm test` in `packages/backend`.
- `npm test -- test/frontend-foundation.test.mjs` in `apps/client-react`.
- `npm run build` in `apps/client-react`.
- `npx tsc --noEmit --pretty false` in `apps/client-react` after build completes.

### Self-review

- Physical DB split is implemented by file path, not only a `schoolId` column.
- Missing `schoolId` remains compatible with existing Sao Đỏ demo.
- Token school scope drives user-data lookup, preventing cross-school reads after login.
