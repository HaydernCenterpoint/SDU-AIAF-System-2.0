# School Site Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the current shared portal into a gateway plus separate SDU and NTD site namespaces with school-aware auth/session handling.

**Architecture:** Add shared school/session helpers, route all user-facing pages through school namespaces, make the shell school-aware, and align backend runtime auth/profile/bootstrap behavior with the active school context.

**Tech Stack:** Next.js App Router, Zustand, React Hook Form, Node HTTP runtime, Vitest, Node test runner

---

### Task 1: Add school/session primitives

**Files:**
- Create: `apps/client-react/src/lib/school-site.ts`
- Create: `apps/client-react/src/lib/school-session.ts`
- Test: `test/school-site-routing.test.ts`

- [ ] Define school slug, backend school id, labels, and route helpers.
- [ ] Define school-scoped localStorage keys and current-path school resolution helpers.
- [ ] Add utility tests for route and storage resolution.

### Task 2: Split frontend routing

**Files:**
- Modify: `apps/client-react/src/app/page.tsx`
- Create: `apps/client-react/src/app/sdu/login/page.tsx`
- Create: `apps/client-react/src/app/ntd/login/page.tsx`
- Create: `apps/client-react/src/app/sdu/dashboard/page.tsx`
- Create: `apps/client-react/src/app/ntd/dashboard/page.tsx`
- Create: `apps/client-react/src/app/sdu/profile/page.tsx`
- Create: `apps/client-react/src/app/ntd/profile/page.tsx`
- Modify: `apps/client-react/src/app/login/page.tsx`
- Modify: `apps/client-react/src/components/SchoolPortalLoginPage.tsx`
- Modify: `apps/client-react/src/components/SchoolPortalLogin.tsx`

- [ ] Turn `/` into the shared selector entry.
- [ ] Make `/login` redirect to `/sdu/login` for compatibility.
- [ ] Add school-specific login pages.
- [ ] Add school-specific dashboard/profile pages.
- [ ] Update the selector/login component to either navigate to a school login page or render a school-specific login form.

### Task 3: Make auth/session and shell school-aware

**Files:**
- Modify: `apps/client-react/src/contexts/AuthContext.tsx`
- Modify: `apps/client-react/src/hooks/useAuthStore.ts`
- Modify: `apps/client-react/src/hooks/useAppStore.ts`
- Modify: `apps/client-react/src/lib/api-client.ts`
- Modify: `apps/client-react/src/components/guards/ProtectedRoute.tsx`
- Modify: `apps/client-react/src/components/AppShell.tsx`
- Modify: `apps/client-react/src/components/AuthFrame.tsx`

- [ ] Store tokens/display names per school instead of globally.
- [ ] Redirect after login/logout to the matching school namespace.
- [ ] Make route protection validate the active school.
- [ ] Make the shell dynamic for SDU vs NTD and remove `Công việc` from NTD.

### Task 4: Add NTD role support and backend alignment

**Files:**
- Modify: `apps/client-react/src/lib/account-types.ts`
- Modify: `apps/client-react/src/app/register/page.tsx`
- Modify: `packages/backend/src/account-types.js`
- Modify: `packages/backend/src/auth.mjs`
- Modify: `packages/backend/src/admin.mjs`
- Modify: `packages/backend/src/app.mjs`
- Test: `packages/backend/test/nguyen-thi-due-demo-account.test.mjs`
- Test: `packages/backend/test/auth-school-context.test.mjs`

- [ ] Add THPT media student and school leadership account types.
- [ ] Map school leadership to full-access behavior.
- [ ] Expose `/api/auth/me` from the active school runtime so school-specific guards can resolve sessions.
- [ ] Preserve school-scoped reads and writes for bootstrap/profile/admin data.

### Task 5: Verify the migration path

**Files:**
- Test: `test/school-site-routing.test.ts`
- Test: `packages/backend/test/auth-school-context.test.mjs`

- [ ] Run targeted frontend and backend tests for route separation and school-aware auth.
- [ ] Run client lint/build.
- [ ] Run backend tests for auth/runtime behavior.
