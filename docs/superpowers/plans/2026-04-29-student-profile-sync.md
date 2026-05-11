<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Student Profile Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backend-synced student profile details and avatar editing to the Sao Do web and mobile profile screens.

**Architecture:** Extend the current JSON-backed `packages/backend/src/app.mjs` profile route with read/update/avatar handlers. Keep frontend state local to the existing auth stores and update them from returned backend user data. Use data URLs for selected avatars to avoid adding a storage subsystem.

**Tech Stack:** Node HTTP backend (`.mjs`), Next.js/React/Tailwind web client, Expo React Native mobile client, node:test backend tests.

---

## File Structure

- Modify: `packages/backend/test/app.test.mjs` — add failing coverage for profile read/update/avatar APIs.
- Modify: `packages/backend/src/app.mjs` — add profile helpers, read route, avatar route, richer update response.
- Modify: `packages/backend/src/auth.mjs` — include avatar and profile objects in auth responses.
- Modify: `apps/client-react/src/types/index.ts` — extend `AuthUser` and define synced profile types.
- Modify: `apps/client-react/src/app/profile/page.tsx` — add richer cards, edit fields, and avatar picker.
- Modify: `apps/mobile/package.json` — add `expo-image-picker` for device gallery selection.
- Modify: `apps/mobile/src/types/index.ts` — extend auth/profile types.
- Modify: `apps/mobile/src/store/useAuthStore.ts` — normalize backend auth/profile responses.
- Modify: `apps/mobile/src/screens/main/ProfileScreen.tsx` — add profile cards, modal editing, and avatar picker.

## Tasks

### Task 1: Backend tests

- [ ] Add node tests that create a user, call `GET /api/profile`, `PUT /api/profile`, and `PUT /api/profile/avatar`.
- [ ] Run `npm test -- app.test.mjs` from `packages/backend` and confirm the new tests fail before implementation.

### Task 2: Backend implementation

- [ ] Add profile fallback builders in `packages/backend/src/app.mjs`.
- [ ] Add `GET /api/profile` before the existing `PUT /api/profile` block.
- [ ] Extend `PUT /api/profile` to update editable personal fields and return the full profile.
- [ ] Add `PUT /api/profile/avatar` with URL/data URL validation and size checks.
- [ ] Include avatar/profile details in `auth.mjs` login, complete-profile, and me responses.
- [ ] Re-run backend tests and confirm they pass.

### Task 3: Web profile UI

- [ ] Extend shared web types with `StudentProfileDetails`, `AcademicInfo`, `PersonalInfo`, and `FamilyInfo`.
- [ ] Fetch `/api/profile` on profile page load and merge returned data into the auth store.
- [ ] Update the hero card to render saved avatar image and upload from file picker.
- [ ] Add personal edit inputs for editable personal fields.
- [ ] Add academic, personal, and family detail cards using existing bento styling.
- [ ] Run the web build.

### Task 4: Mobile profile UI

- [ ] Add `expo-image-picker` dependency.
- [ ] Extend mobile types and auth store response normalization.
- [ ] Load `/profile` details in `ProfileScreen`.
- [ ] Add avatar picker using `ImagePicker.launchImageLibraryAsync` with base64 data URL persistence.
- [ ] Add modal editing for personal fields.
- [ ] Render academic, personal, and family cards.
- [ ] Run mobile TypeScript check or build-equivalent validation.

### Task 5: Final verification

- [ ] Run targeted backend tests.
- [ ] Run web build/type validation.
- [ ] Run mobile type validation.
- [ ] Review git diff for unrelated changes and known risks.
