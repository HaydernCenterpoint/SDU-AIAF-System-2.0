---
name: "nemoclaw-user-specs"
description: "Documentation-derived skill for nemoclaw user specs."
---

<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Premium School Login Transition Design

# Premium School Login Transition Design

## Step 1: Goal

Replace the current school selection transition with a smoother premium app morph.

The transition should feel like one interface transforming into the next, not like a 2009 presentation slide.

## Step 2: Direction

Use a shared-element style transition.

The selected school panel becomes the brand panel.

The selected logo travels directly into its final logo position.

The login form enters with a short depth-based lift after the brand panel is visually settled.

## Step 3: Motion Sequence

1. On selection, the chosen panel subtly lifts and brightens for touch feedback.
2. The unchosen panel fades and drifts back quickly without a dramatic slide.
3. A transition clone of the chosen panel morphs from its original bounds into the final brand panel bounds.
4. The chosen logo moves from its card position to the final brand logo position in the same timeline.
5. The brand content crossfades in while the clone fades away.
6. The login panel and form rise in with opacity, small scale, and light blur removal.

## Step 4: Timing

Target the full forward transition at about 760ms to 900ms.

Keep the initial click response under 120ms.

Avoid long pauses where the interface waits for decorative content.

## Step 5: Constraints

Keep the implementation local to `SchoolPortalLogin.tsx` and `SchoolPortalLogin.module.css` unless verification shows otherwise.

Continue using Anime.js because the current component already depends on it.

Do not add dependencies.

Respect the existing instant fallback when Anime.js fails to load.

## Step 6: Testing

Build the Next app after changes.

Verify `/login` loads from the dev server.

Manually exercise the school selection path once for each school when practical.

# AI Assistant Prompt Expansion Design

## Step 7: Context

The backend chatbot already supports multiple assistant types through `packages/backend/src/ai/prompt-registry.mjs`.

The `/api/ai/chat` endpoint accepts `assistant_type` and builds a provider prompt with shared safety rules plus the type-specific system prompt.

The user wants to expand the existing comprehensive assistant system, not replace it or add new assistant types.

## Step 8: Goal

Expand the type-specific prompts for the existing `study`, `health`, `career`, and `report` assistants.

The expanded prompts should make each assistant more specialized while preserving the existing shared safety rules.

## Step 9: Non-goals

- Do not change the `/api/ai/chat` API contract.
- Do not add new assistant types.
- Do not replace `COMMON_RULES`.
- Do not add new dependencies.
- Do not change frontend or mobile UI in this task.

## Step 10: Approach

Use the existing prompt registry as the integration point.

Each affected assistant prompt will be expanded with explicit role, tasks, principles, and response format guidance.

The prompt will continue appending `${COMMON_RULES}` so all assistants retain project-wide guardrails.

## Step 11: Assistant prompt requirements

### Study Assistant

The `study` assistant should identify as a learning assistant for Vietnamese students.

It should help with:

- Explaining academic knowledge.
- Guiding homework thinking step by step.
- Summarizing lessons.
- Creating examples.
- Comparing concepts.
- Suggesting effective study methods.
- Creating review questions.
- Helping students understand the nature of a problem.

It should answer in Vietnamese, explain clearly, avoid simply giving answers, and avoid encouraging academic cheating.

When the user asks about an exercise, it should guide the reasoning first.

If the user explicitly asks, it may provide a sample solution while keeping the educational explanation.

Preferred response structure:

- Tóm tắt ngắn vấn đề.
- Giải thích chi tiết.
- Ví dụ minh họa.
- Các bước thực hiện nếu có.
- Lưu ý quan trọng.
- Câu hỏi ôn tập nếu phù hợp.

### Health Assistant

The `health` assistant should identify as a personal health support assistant for students.

It should help with:

- Better sleep habits.
- Drinking water reminders and guidance.
- Balanced eating suggestions.
- Basic exercise suggestions.
- BMI tracking.
- Mood tracking.
- Rest suggestions when studying too much.
- Warnings for unhealthy habit patterns.

It must not replace doctors, diagnose disease, prescribe medication, or provide dangerous medical advice.

If the user shows serious signs, it should advise contacting a doctor, family, school, or mental health professional.

Tone should be gentle, positive, and non-judgmental.

Preferred response structure:

- Nhận xét tình trạng hiện tại.
- Gợi ý cải thiện.
- Kế hoạch nhỏ dễ thực hiện.
- Cảnh báo nếu cần.

### Career Assistant

The `career` assistant should identify as a career orientation assistant for students.

It should help with:

- Analyzing current skills.
- Suggesting suitable career directions.
- Creating career learning roadmaps.
- Suggesting skills to learn.
- Suggesting personal projects.
- Suggesting how to write a CV.
- Suggesting interview preparation.
- Suggesting internship plans.

It should answer in Vietnamese, stay practical for students, prefer step-by-step roadmaps, avoid guaranteeing employment outcomes, encourage real projects, and include both soft and technical skills.

Preferred response structure:

- Mục tiêu nghề nghiệp.
- Kỹ năng cần có.
- Lộ trình học.
- Dự án nên làm.
- CV nên có gì.
- Kế hoạch 1 tháng / 3 tháng / 6 tháng.

### Report Assistant

The `report` assistant should identify as an academic report writing assistant for students.

It should help with:

- Creating report outlines.
- Writing introductions.
- Writing theoretical background sections.
- Writing system analysis and design sections.
- Writing detailed system design sections.
- Writing conclusions.
- Suggesting reference material categories.
- Suggesting use case, activity, sequence, class, and ERD diagrams.
- Normalizing academic writing style.

It should answer in Vietnamese with serious academic tone, avoid rambling, and use clear structure.

If the user asks for bullet points, it should use `-` for sub-points.

It may use this structure when suitable:

- MỞ ĐẦU.
- CHƯƠNG 1. CƠ SỞ LÝ THUYẾT.
- CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG.
- CHƯƠNG 3. THIẾT KẾ CHI TIẾT HỆ THỐNG.
- KẾT LUẬN.
- TÀI LIỆU THAM KHẢO.

It must not invent specific references when sources are not provided.

If diagrams are needed, it should describe the flow and may output PlantUML or Mermaid.

Content should fit Vietnamese student academic reports.

## Step 12: Testing

Update backend AI chatbot tests to verify the expanded prompt registry.

The tests should assert that:

- `study` includes learning-task guidance, step-by-step reasoning, review questions, and anti-cheating framing.
- `health` includes sleep, hydration, BMI, mood tracking, medical safety limits, and the expected response format.
- `career` includes skill analysis, career roadmap, CV, interview, internship, real projects, and employment-outcome caution.
- `report` includes academic report sections, diagram suggestions, Mermaid or PlantUML guidance, and no fabricated references.

Existing endpoint and guardrail tests should continue passing.

## Step 13: Acceptance criteria

- `packages/backend/src/ai/prompt-registry.mjs` contains expanded prompts for `study`, `health`, `career`, and `report`.
- `COMMON_RULES` remains applied to every assistant prompt.
- `ASSISTANT_TYPES` is unchanged.
- `/api/ai/chat` response shape is unchanged.
- Backend tests pass with `npm --prefix packages/backend test`.

---

# Sao Do Mobile Foundation Design

## Step 14: Decision

Build on the existing Expo app in `apps/mobile` instead of creating a second mobile project.

The first implementation phase is foundation-first.

This phase makes the mobile app structurally ready for the full student assistant product without scaffolding every requested screen at once.

## Step 15: Goals

- Keep the current React Native Expo app and upgrade it into a production-ready foundation.
- Provide a clear app shell with auth stack, main bottom tabs, and stack routes for future modules.
- Add a shared theme with light and dark mode tokens.
- Add an API client with token attachment and 401 handling.
- Add an `AuthContext` that stores access tokens and exposes login, register, forgot password, logout, and initialization state.
- Implement polished Login, Register, and Home dashboard screens for the first usable mobile slice.
- Add reusable UI primitives for later screens.

## Step 16: Non-goals for this phase

- Do not fully implement every Study, Work, Finance, Reminder, and Profile detail screen.
- Do not replace the existing backend contract.
- Do not introduce a second mobile framework or duplicate app directory.
- Do not add complex offline sync, biometric auth, or production push infrastructure beyond notification permission and local scheduling scaffolding.

## Step 17: Product structure

### Auth stack

The unauthenticated flow contains:

- Splash screen.
- Onboarding screen.
- Login screen.
- Register screen.
- Forgot password screen.

Splash decides where to route after `AuthContext` checks stored tokens.

Onboarding is shown before login when the app has not seen onboarding completion in local storage.

### Main tabs

The authenticated app uses five bottom tabs:

- Home.
- AI Chat.
- Calendar.
- Health.
- Profile.

These five tabs keep daily actions within thumb reach.

Study, Work, Finance, Reminder, and deeper Profile screens are stack routes launched from Home quick cards, Profile settings, or module entry cards.

### Stack routes prepared for later modules

The first phase should define route names and stack navigation entries for:

- Subjects.
- SubjectDetail.
- Assignments.
- AssignmentDetail.
- StudyPlan.
- Documents.
- Flashcards.
- Tasks.
- TaskDetail.
- CV.
- CareerPath.
- InterviewPractice.
- FinanceDashboard.
- Income.
- Expense.
- Budget.
- FinanceStatistics.
- ReminderList.
- AddReminder.
- ReminderDetail.
- EditProfile.
- Settings.
- ChangePassword.
- NotificationSettings.
- PrivacySettings.

Only routes needed by the foundation UI need polished content in this phase.

## Step 18: UX direction

The mobile app should feel like a real Sao Do student companion, not a generic dashboard template.

Use a soft, student-friendly visual language:

- Rounded cards.
- High-contrast icons.
- Sao Do red for primary actions.
- Sao Do blue for academic and AI context.
- Gold accents for important highlights.
- Large touch targets.
- Thumb-zone primary actions.
- Calm loading, error, and empty states.

## Step 19: Home dashboard requirements

The Home tab should show:

- Greeting with student name.
- Today's deadline card.
- Task card.
- Today's class schedule card.
- Quick health status card.
- AI suggestion card.
- Quick access cards for Study, Work, Finance, Reminders, Documents, and Settings.

The first visible screen should prioritize two or three high-value cards instead of cramming every module above the fold.

## Step 20: AI Chat requirements

The existing chat screen remains the starting point.

The foundation phase should preserve:

- Conversation list.
- Message list.
- Input bar.
- Quick prompts.
- Loading or typing state.
- Conversation history backed by API store.

Simple markdown rendering can be added later if it requires an extra dependency.

## Step 21: Technical architecture

### API client

Create a dedicated API layer under `apps/mobile/src/services/`.

The client should:

- Use Axios.
- Read `EXPO_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:9191/api`.
- Attach the access token to each request.
- Clear auth state and route back to auth on 401.
- Normalize common API errors into Vietnamese user-facing messages.

### Token storage

Use AsyncStorage for this phase because the app already depends on it.

SecureStore can be introduced later if native-only secure token storage becomes a requirement.

Store:

- `saodo_token`.
- `saodo_refresh_token` when backend returns one.
- `saodo_onboarding_complete`.
- Theme preference.

### Auth provider

Create `AuthContext` under `apps/mobile/src/contexts/AuthContext.tsx`.

The provider owns:

- `user`.
- `token`.
- `isAuthenticated`.
- `isInitializing`.
- `isLoading`.
- `error`.
- `login`.
- `register`.
- `forgotPassword`.
- `logout`.
- `refreshMe`.

The provider can internally reuse existing Zustand state only if that keeps the diff small.

The public API for screens should be `useAuth()`.

### Theme provider

Extend current design tokens into a theme system with:

- Light colors.
- Dark colors.
- Spacing.
- Radius.
- Font sizes.
- Shadows.

Expose a hook such as `useAppTheme()` for components.

Dark mode should support system preference and a manual setting later.

### Notifications

Add Expo Notifications setup in a service module.

The first phase should:

- Request permission safely.
- Store notification permission state.
- Provide a function to schedule a local reminder notification.

Remote push token registration can be added after backend support is defined.

## Step 22: Reusable components

Create reusable components under `apps/mobile/src/components/ui/`:

- `AppButton`.
- `AppInput`.
- `AppCard`.
- `LoadingView`.
- `EmptyView`.
- `ErrorView`.
- `Header`.
- `StatisticCard`.
- `ReminderCard`.
- `AssignmentCard`.
- `HealthCard`.

These components should accept simple props and avoid coupling to a single screen.

## Step 23: Data and state

The foundation should keep API reads light.

Use custom hooks under `apps/mobile/src/hooks/` for screen data:

- `useBootstrapData` for Home and shared app data.
- `useReminders` for reminder cards.
- `useChat` for chat send and history operations if it improves clarity.

Hooks should return loading, error, data, empty, and refetch state.

## Step 24: Testing and verification

Because the mobile app currently has no test script, the first implementation step should add a lightweight static foundation test with Node's test runner.

The test should verify:

- API client exists and uses Axios.
- AuthContext exists and exports `useAuth`.
- Navigation has auth stack and five requested tabs.
- Theme exports light and dark tokens.
- Reusable UI components exist.

Build or type verification should run with:

```bash
npm --prefix apps/mobile exec tsc -- --noEmit
```

If Expo type dependencies make this command noisy, fix the real type issues in touched files and report unrelated blockers separately.

## Step 25: Implementation order

1. Add a failing mobile foundation test.
2. Add dependencies: Axios and Expo Notifications.
3. Add API and token storage services.
4. Add AuthContext and update App auth flow.
5. Add theme tokens and theme hook.
6. Add reusable UI components.
7. Update navigation to auth stack plus five main tabs.
8. Update Login and Register to use AuthContext and reusable inputs/buttons.
9. Add Splash, Onboarding, Forgot Password, and Home dashboard.
10. Run focused mobile test and TypeScript verification.

## Step 26: Open risks

- Backend auth payloads currently vary between web and mobile code paths.
- The mobile app uses AsyncStorage rather than SecureStore in this phase.
- Remote push notifications require backend device-token registration that is not defined yet.
- Full Study, Work, Health, Finance, Reminder, and Profile modules remain follow-up implementation phases.
