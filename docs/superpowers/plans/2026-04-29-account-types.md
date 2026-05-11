<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Account Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four self-registered education account types across registration, login payloads, and dashboard/profile wording.

**Architecture:** Add `accountType` as the education-context field and keep `role` as the authorization field. Backend validation derives `role` from `accountType`; frontend sends the selected type and uses one shared metadata map to adapt labels.

**Tech Stack:** Node.js ESM backend, Express, Zod, Prisma, Next.js React client, React Hook Form, TypeScript.

---

## File Structure

- Create: `packages/backend/src/account-types.js` — backend account-type constants, labels, defaults, and role mapping.
- Modify: `packages/backend/src/validators/auth.validator.js` — require valid `accountType` during registration.
- Modify: `packages/backend/src/services/auth.service.js` — derive `role` and persist `accountType`.
- Modify: `packages/backend/src/models/user.model.js` — include `accountType` in public user responses with legacy fallback.
- Modify: `packages/backend/src/repositories/prisma-auth.repository.js` — persist `accountType` to Prisma users.
- Modify: `packages/backend/prisma/schema.prisma` — add `accountType` mapped to `account_type`.
- Modify: `packages/backend/test/helpers/memory-auth-repository.js` — store `accountType` in test users.
- Modify: `packages/backend/test/auth-express.test.js` — cover all account types, role derivation, validation, and legacy fallback.
- Create: `apps/client-react/src/lib/account-types.ts` — frontend account-type metadata and helper functions.
- Modify: `apps/client-react/src/types/index.ts` — add `AccountType` and `accountType` to `AuthUser`.
- Modify: `apps/client-react/src/contexts/AuthContext.tsx` — include `accountType` in registration input and payload.
- Modify: `apps/client-react/src/app/register/page.tsx` — add account-type selector and dynamic labels/placeholders.
- Modify: `apps/client-react/src/app/profile/page.tsx` — adapt profile labels from `accountType`.

---

### Task 1: Backend Account-Type Contract

**Files:**
- Create: `packages/backend/src/account-types.js`
- Modify: `packages/backend/src/validators/auth.validator.js`
- Modify: `packages/backend/src/models/user.model.js`
- Test: `packages/backend/test/auth-express.test.js`

- [ ] **Step 1: Write failing backend contract tests**

Add these tests after the first registration test in `packages/backend/test/auth-express.test.js`:

```js
test('POST /api/auth/register stores accountType and derives role for each account type', async () => {
  const cases = [
    ['university_teacher', 'teacher'],
    ['highschool_teacher', 'teacher'],
    ['highschool_student', 'student'],
    ['university_student', 'student'],
  ];

  for (const [accountType, expectedRole] of cases) {
    const response = await withExpressApp((baseUrl) =>
      fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${accountType}@example.com`,
          password: 'Password123!',
          fullName: 'Nguyễn Văn A',
          studentCode: `CODE-${accountType}`,
          phone: '0987654321',
          major: 'Công nghệ thông tin',
          accountType,
        }),
      }),
    );

    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.data.user.accountType, accountType);
    assert.equal(payload.data.user.role, expectedRole);
  }
});

test('POST /api/auth/register rejects an unsupported accountType', async () => {
  const response = await withExpressApp((baseUrl) =>
    fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bad-type@example.com',
        password: 'Password123!',
        fullName: 'Nguyễn Văn A',
        studentCode: 'SV-BAD',
        accountType: 'parent',
      }),
    }),
  );

  const payload = await response.json();

  assert.equal(response.status, 422);
  assert.equal(payload.success, false);
  assert.ok(payload.errors.some((error) => error.field === 'accountType'));
});

test('public user response falls back to university_student for legacy users', () => {
  const legacyUser = {
    id: 'legacy-user',
    email: 'legacy@example.com',
    fullName: 'Legacy Student',
    role: 'student',
    status: 'active',
    createdAt: '2026-04-29T00:00:00.000Z',
    updatedAt: '2026-04-29T00:00:00.000Z',
  };

  assert.equal(toPublicUser(legacyUser).accountType, 'university_student');
});
```

Also add this import at the top of the same test file:

```js
import { toPublicUser } from '../src/models/user.model.js';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test --prefix packages/backend`

Expected: FAIL because `accountType` is not validated/stored and `toPublicUser(...).accountType` is missing.

- [ ] **Step 3: Add backend account-type constants**

Create `packages/backend/src/account-types.js`:

```js
export const ACCOUNT_TYPES = Object.freeze({
  UNIVERSITY_TEACHER: 'university_teacher',
  HIGHSCHOOL_TEACHER: 'highschool_teacher',
  HIGHSCHOOL_STUDENT: 'highschool_student',
  UNIVERSITY_STUDENT: 'university_student',
});

export const DEFAULT_ACCOUNT_TYPE = ACCOUNT_TYPES.UNIVERSITY_STUDENT;

export const ACCOUNT_TYPE_VALUES = Object.freeze(Object.values(ACCOUNT_TYPES));

export function roleForAccountType(accountType) {
  if (accountType === ACCOUNT_TYPES.UNIVERSITY_TEACHER || accountType === ACCOUNT_TYPES.HIGHSCHOOL_TEACHER) {
    return 'teacher';
  }

  return 'student';
}
```

- [ ] **Step 4: Require accountType during registration**

Modify `packages/backend/src/validators/auth.validator.js`:

```js
import { z } from 'zod';
import { ACCOUNT_TYPE_VALUES } from '../account-types.js';

const passwordSchema = z
  .string({ message: 'Mật khẩu là bắt buộc' })
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có chữ cái')
  .regex(/[0-9]/, 'Mật khẩu phải có số');

export const registerSchema = z.object({
  email: z.string({ message: 'Email là bắt buộc' }).email('Email không đúng định dạng'),
  password: passwordSchema,
  fullName: z.string({ message: 'Họ tên là bắt buộc' }).min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  studentCode: z.string({ message: 'Mã định danh là bắt buộc' }).min(2, 'Mã định danh không hợp lệ'),
  accountType: z.enum(ACCOUNT_TYPE_VALUES, { message: 'Loại tài khoản không hợp lệ' }),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ').optional(),
  major: z.string().min(2, 'Thông tin khoa/lớp không hợp lệ').optional(),
});
```

Keep the existing `loginSchema`, `logoutSchema`, `refreshTokenSchema`, `forgotPasswordSchema`, `resetPasswordSchema`, and `changePasswordSchema` unchanged below this block.

- [ ] **Step 5: Add accountType to public user responses**

Modify `packages/backend/src/models/user.model.js`:

```js
import { DEFAULT_ACCOUNT_TYPE } from '../account-types.js';

export function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    accountType: user.accountType || DEFAULT_ACCOUNT_TYPE,
    status: user.status,
    profile: user.profile || user.studentProfile || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
```

- [ ] **Step 6: Run backend tests**

Run: `npm test --prefix packages/backend`

Expected: Some failures remain because persistence/service code has not been updated yet.

---

### Task 2: Backend Persistence and Role Derivation

**Files:**
- Modify: `packages/backend/src/services/auth.service.js`
- Modify: `packages/backend/src/repositories/prisma-auth.repository.js`
- Modify: `packages/backend/test/helpers/memory-auth-repository.js`
- Modify: `packages/backend/prisma/schema.prisma`
- Test: `packages/backend/test/auth-express.test.js`

- [ ] **Step 1: Update auth service to derive role**

Modify the imports and `register` user creation in `packages/backend/src/services/auth.service.js`:

```js
import bcrypt from 'bcrypt';
import { DEFAULT_ACCOUNT_TYPE, roleForAccountType } from '../account-types.js';
import { AppError } from '../utils/app-error.js';
import { createAccessToken, createRefreshToken, createResetToken, hashToken } from '../utils/token.js';
import { toPublicUser } from '../models/user.model.js';
```

Replace the `authRepository.createUser({ ... })` call inside `register(input)` with:

```js
      const accountType = input.accountType || DEFAULT_ACCOUNT_TYPE;
      const user = await authRepository.createUser({
        email,
        passwordHash,
        fullName: input.fullName,
        studentCode: input.studentCode,
        phone: input.phone,
        major: input.major,
        accountType,
        role: roleForAccountType(accountType),
      });
```

- [ ] **Step 2: Update memory repository**

Modify `createUser` in `packages/backend/test/helpers/memory-auth-repository.js`:

```js
    async createUser({ email, passwordHash, fullName, studentCode, phone, major, accountType = 'university_student', role = 'student' }) {
      const id = `user-${users.size + 1}`;
      const now = new Date().toISOString();
      const user = {
        id,
        email,
        passwordHash,
        fullName,
        avatarUrl: null,
        role,
        accountType,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        profile: {
          studentCode,
          phone: phone || null,
          major: major || null,
        },
      };
```

- [ ] **Step 3: Update Prisma schema**

Modify the `User` model in `packages/backend/prisma/schema.prisma` by adding `accountType` after `role`:

```prisma
  role          String    @default("student") @db.VarChar(20)
  accountType   String    @default("university_student") @map("account_type") @db.VarChar(40)
  status        String    @default("active") @db.VarChar(20)
```

- [ ] **Step 4: Update Prisma auth repository**

Modify `createUser` in `packages/backend/src/repositories/prisma-auth.repository.js`:

```js
    async createUser({ email, passwordHash, fullName, studentCode, phone, major, accountType = 'university_student', role = 'student' }) {
      return prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          accountType,
          status: 'active',
          studentProfile: studentCode
            ? {
                create: {
                  studentCode,
                  phone: phone || null,
                  major: major || null,
                },
              }
            : undefined,
        },
        include: { studentProfile: true },
      });
    },
```

- [ ] **Step 5: Update default registration test payloads**

In `packages/backend/test/auth-express.test.js`, add `accountType: 'university_student'` to the existing registration payloads in:

```js
test('POST /api/auth/register creates a student account with unified response', async () => {
```

and:

```js
async function registerStudent(baseUrl) {
```

Then add this assertion to the first registration test:

```js
  assert.equal(payload.data.user.accountType, 'university_student');
```

- [ ] **Step 6: Run backend tests to verify pass**

Run: `npm test --prefix packages/backend`

Expected: PASS for all backend tests.

---

### Task 3: Frontend Account-Type Metadata and Registration Payload

**Files:**
- Create: `apps/client-react/src/lib/account-types.ts`
- Modify: `apps/client-react/src/types/index.ts`
- Modify: `apps/client-react/src/contexts/AuthContext.tsx`
- Modify: `apps/client-react/src/app/register/page.tsx`

- [ ] **Step 1: Add frontend account-type metadata**

Create `apps/client-react/src/lib/account-types.ts`:

```ts
export type AccountType = 'university_teacher' | 'highschool_teacher' | 'highschool_student' | 'university_student';

export type AccountTypeCopy = {
  label: string;
  codeLabel: string;
  codePlaceholder: string;
  majorLabel: string;
  majorPlaceholder: string;
  registerSubtitle: string;
};

export const DEFAULT_ACCOUNT_TYPE: AccountType = 'university_student';

export const ACCOUNT_TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = [
  { value: 'university_teacher', label: 'Giáo viên Đại học' },
  { value: 'highschool_teacher', label: 'Giáo viên THPT' },
  { value: 'highschool_student', label: 'Học sinh THPT' },
  { value: 'university_student', label: 'Sinh viên Đại học' },
];

export const ACCOUNT_TYPE_COPY: Record<AccountType, AccountTypeCopy> = {
  university_teacher: {
    label: 'Giáo viên Đại học',
    codeLabel: 'Mã giảng viên',
    codePlaceholder: 'VD: GV001',
    majorLabel: 'Khoa / bộ môn',
    majorPlaceholder: 'VD: Khoa Công nghệ thông tin',
    registerSubtitle: 'Đăng ký tài khoản giảng viên để quản lý lớp học và hỗ trợ sinh viên.',
  },
  highschool_teacher: {
    label: 'Giáo viên THPT',
    codeLabel: 'Mã giáo viên',
    codePlaceholder: 'VD: GVTHPT001',
    majorLabel: 'Tổ bộ môn / trường THPT',
    majorPlaceholder: 'VD: Tổ Toán - THPT Nguyễn Thị Duệ',
    registerSubtitle: 'Đăng ký tài khoản giáo viên THPT để theo dõi lớp học và học sinh.',
  },
  highschool_student: {
    label: 'Học sinh THPT',
    codeLabel: 'Mã học sinh',
    codePlaceholder: 'VD: HS001',
    majorLabel: 'Lớp / trường THPT',
    majorPlaceholder: 'VD: 12A1 - THPT Nguyễn Thị Duệ',
    registerSubtitle: 'Đăng ký tài khoản học sinh để nhận lịch học, tài liệu và nhắc việc.',
  },
  university_student: {
    label: 'Sinh viên Đại học',
    codeLabel: 'Mã sinh viên',
    codePlaceholder: 'VD: 2024001',
    majorLabel: 'Khoa / ngành',
    majorPlaceholder: 'VD: Công nghệ thông tin',
    registerSubtitle: 'Đăng ký bằng thông tin sinh viên để bắt đầu sử dụng trợ lý.',
  },
};

export function normalizeAccountType(accountType?: string | null): AccountType {
  return accountType && accountType in ACCOUNT_TYPE_COPY ? (accountType as AccountType) : DEFAULT_ACCOUNT_TYPE;
}

export function getAccountTypeCopy(accountType?: string | null): AccountTypeCopy {
  return ACCOUNT_TYPE_COPY[normalizeAccountType(accountType)];
}
```

- [ ] **Step 2: Add accountType to shared types**

Modify `apps/client-react/src/types/index.ts`:

```ts
import type { AccountType } from '@/lib/account-types';

export interface StudentProfile {
  id: string;
  name: string;
  school: string;
  major: string;
}

export interface AuthUser {
  id: string;
  studentId: string;
  fullName: string;
  faculty: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  role?: string;
  accountType?: AccountType;
  status?: string;
}
```

Leave the rest of the file unchanged.

- [ ] **Step 3: Send accountType from AuthContext**

Modify `apps/client-react/src/contexts/AuthContext.tsx`:

```ts
import type { AccountType } from '@/lib/account-types';
```

Add `accountType` to `RegisterInput`:

```ts
type RegisterInput = {
  fullName: string;
  email: string;
  studentCode: string;
  password: string;
  accountType: AccountType;
  phone?: string;
  major?: string;
};
```

Add `accountType` to the `/auth/register` payload:

```ts
          accountType: input.accountType,
```

- [ ] **Step 4: Update registration schema and defaults**

Modify imports in `apps/client-react/src/app/register/page.tsx`:

```ts
import { ACCOUNT_TYPE_OPTIONS, DEFAULT_ACCOUNT_TYPE, getAccountTypeCopy } from '@/lib/account-types';
```

Add `accountType` to `registerSchema`:

```ts
    accountType: z.enum(['university_teacher', 'highschool_teacher', 'highschool_student', 'university_student']),
```

Add `accountType` to `defaultValues`:

```ts
      accountType: DEFAULT_ACCOUNT_TYPE,
```

Add `watch` to the `useForm` destructuring:

```ts
    watch,
```

After `useForm`, add:

```ts
  const selectedAccountType = watch('accountType');
  const accountTypeCopy = getAccountTypeCopy(selectedAccountType);
```

- [ ] **Step 5: Update registration UI**

Change `AuthFrame` subtitle in `apps/client-react/src/app/register/page.tsx`:

```tsx
      subtitle={accountTypeCopy.registerSubtitle}
```

Add this account-type selector as the first child inside `<form>`:

```tsx
        <div>
          <label className="mb-2 block text-sm font-bold text-text">Loại tài khoản</label>
          <select
            {...registerField('accountType')}
            className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/10"
          >
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
```

Change the code label and placeholder:

```tsx
          <label className="mb-2 block text-sm font-bold text-text">{accountTypeCopy.codeLabel}</label>
```

```tsx
            placeholder={accountTypeCopy.codePlaceholder}
```

Add a major field after the code field:

```tsx
        <div>
          <label className="mb-2 block text-sm font-bold text-text">{accountTypeCopy.majorLabel}</label>
          <input
            type="text"
            {...registerField('major')}
            placeholder={accountTypeCopy.majorPlaceholder}
            className="w-full rounded-2xl border border-border bg-surface-alt px-4 py-3 text-sm font-semibold outline-none transition focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/10"
            autoComplete="organization-title"
          />
          {errors.major?.message && <p className="mt-1 text-xs font-bold text-primary">{errors.major.message}</p>}
        </div>
```

Add `major` to `registerSchema` and defaults:

```ts
    major: z.string().trim().min(2, 'Vui lòng nhập thông tin khoa/lớp.'),
```

```ts
      major: '',
```

- [ ] **Step 6: Run frontend type/build check**

Run: `npm run build --prefix apps/client-react`

Expected: Build succeeds, or reports unrelated pre-existing failures. Fix any failures caused by these changes before continuing.

---

### Task 4: Dashboard/Profile Wording

**Files:**
- Modify: `apps/client-react/src/app/profile/page.tsx`
- Reuse: `apps/client-react/src/lib/account-types.ts`

- [ ] **Step 1: Add profile copy helpers**

At the top of `apps/client-react/src/app/profile/page.tsx`, add:

```ts
import { getAccountTypeCopy } from '@/lib/account-types';
```

Inside the component that renders profile details, after `const M = ...`, add:

```ts
  const accountTypeCopy = getAccountTypeCopy(t?.accountType);
```

- [ ] **Step 2: Replace hard-coded student labels**

In the profile info rows, replace hard-coded labels:

```ts
['🎓', accountTypeCopy.codeLabel, L, '#EEF2FF'],
['🏛️', accountTypeCopy.majorLabel, M, '#EAFBF1'],
```

Replace fallback display name:

```ts
  const A = t?.fullName || `${accountTypeCopy.label} 2200286`;
```

Replace email fallback if present:

```ts
`Email: ${t?.email || 'nguoidung@saodo.edu.vn'}`
```

- [ ] **Step 3: Run frontend build**

Run: `npm run build --prefix apps/client-react`

Expected: Build succeeds, or reports unrelated pre-existing failures. Fix failures caused by account-type typing or imports.

---

### Task 5: Final Verification

**Files:**
- All files changed in Tasks 1-4

- [ ] **Step 1: Run backend tests**

Run: `npm test --prefix packages/backend`

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run: `npm run build --prefix apps/client-react`

Expected: PASS, or document exact pre-existing blocker if unrelated to these changes.

- [ ] **Step 3: Run repository status check**

Run: `git status --short`

Expected: Only account-type implementation files, spec, and plan are modified or added.

- [ ] **Step 4: Manual smoke checklist**

Start backend and frontend using the repo's normal dev commands, then verify:

```text
1. Open /register.
2. Select each of the four account types.
3. Confirm labels and placeholders change.
4. Register one account for each type with a unique email and code.
5. Confirm teacher accounts return role=teacher and student accounts return role=student.
6. Login with one created account.
7. Confirm profile/dashboard wording matches the selected account type.
```

- [ ] **Step 5: Commit only if explicitly requested**

Project hooks require conventional commits. If the user asks to commit, use a message like:

```text
feat(auth): add education account types

Add a dedicated accountType contract so education context stays separate from authorization roles.

Confidence: high
Scope-risk: moderate
Tested: npm test --prefix packages/backend; npm run build --prefix apps/client-react
Not-tested: Production database migration execution
```

Do not commit without an explicit user request.

---

## Self-Review Notes

- Spec coverage: registration, login payload shape, role derivation, public user response, legacy fallback, and dashboard/profile wording are covered.
- Scope control: admin approval, separate dashboards, and fine-grained permissions remain out of scope.
- Type consistency: `accountType`, `AccountType`, `DEFAULT_ACCOUNT_TYPE`, and `getAccountTypeCopy` names are consistent across tasks.
