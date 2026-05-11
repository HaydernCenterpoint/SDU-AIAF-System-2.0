---
name: "nemoclaw-user-plans"
description: "Documentation-derived skill for nemoclaw user plans."
---

<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# NemoClaw User Plans

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the school selection to login transition feel like a premium shared-element app morph instead of a slide presentation.

**Architecture:** Keep the existing `SchoolPortalLogin` component and Anime.js timeline. Simplify the forward transition so the selected panel morphs directly into the final brand panel, the selected logo travels once to its destination, and the form reveals after the destination layout is established.

**Tech Stack:** Next.js 15, React 19, CSS Modules, Anime.js loaded by the existing component.

---

## Step 1: File Structure

- Modify `apps/client-react/src/components/SchoolPortalLogin.tsx`: adjust the `showLoginScreen` timeline only, preserving the instant fallback and back-to-selection path.
- Modify `apps/client-react/src/components/SchoolPortalLogin.module.css`: add subtle blur/depth support to transition clone, logo flight, brand panel, and login form elements if needed.
- No new runtime dependencies.
- No automated test files because this app does not currently have a browser animation test stack and adding one would be larger than the requested visual polish.

### Task 1: Tighten Forward Transition Timeline

**Files:**
- Modify: `apps/client-react/src/components/SchoolPortalLogin.tsx:311-352`

- [ ] **Step 1: Establish baseline verification**

Run: `npm --prefix apps/client-react run build`

Expected: build completes successfully before animation edits.

- [ ] **Step 2: Replace the multi-stage forward timeline**

In `showLoginScreen`, keep the DOM setup and clone creation, then replace the chained timeline after `const targetRect = brandPanel.getBoundingClientRect();` with a shorter shared-element sequence:

```ts
    anime
      .timeline({ easing: 'easeOutCubic' })
      .add({ targets: selectedPanel, scale: 1.018, filter: 'brightness(1.08)', duration: 120, easing: 'easeOutQuad' })
      .add({ targets: [selectedContent, otherContent].filter(Boolean), opacity: 0, translateY: 10, duration: 220, easing: 'easeInOutCubic' }, '-=60')
      .add({ targets: otherPanel, opacity: 0, translateX: otherPanel === highschoolRef.current ? '-8%' : '8%', scale: 0.985, filter: 'blur(8px)', duration: 280, easing: 'easeInOutCubic' }, '-=220')
      .add(buildFlipAnimation(clone, cloneStartRect, targetRect, 620, 'easeInOutCubic'), '-=200')
      .add(logoClone && logoStartRect && logoTargetRect ? buildFlipAnimation(logoClone, logoStartRect, logoTargetRect, 620, 'easeInOutCubic') : { targets: [], duration: 0 }, '-=620')
      .add({ targets: selection, opacity: 0, duration: 260, easing: 'easeOutQuad' }, '-=420')
      .add({ targets: brandPanel, opacity: [0, 1], translateX: [schoolId === 'university' ? -14 : 14, 0], filter: ['blur(10px)', 'blur(0px)'], duration: 360, easing: 'easeOutCubic' }, '-=300')
      .add({ targets: [brandContent].filter(Boolean), opacity: [0, 1], translateY: [12, 0], duration: 320, easing: 'easeOutCubic' }, '-=260')
      .add({ targets: brandWaveRef.current, d: brandWavePaths.active, duration: 430, easing: 'easeInOutCubic' }, '-=300')
      .add({ targets: [clone, logoClone].filter(Boolean), opacity: 0, duration: 180, easing: 'easeOutQuad' }, '-=180')
      .add({ targets: loginPanel, opacity: [0, 1], translateX: [24, 0], filter: ['blur(10px)', 'blur(0px)'], duration: 360, easing: 'easeOutCubic' }, '-=100')
      .add({ targets: loginCard, opacity: [0, 1], translateX: [22, 0], translateY: [18, 0], scale: [0.97, 1], filter: ['blur(8px)', 'blur(0px)'], duration: 420, easing: 'easeOutCubic' }, '-=280')
      .add({ targets: formRevealTargets, opacity: [0, 1], translateY: [12, 0], delay: anime.stagger(42), duration: 300, easing: 'easeOutCubic' }, '-=300')
```

- [ ] **Step 3: Preserve completion cleanup**

Keep the existing `.finished.then(...)` block so clone removal, aria state, pointer events, and `resetSelectionImmediate()` behavior remain unchanged.

- [ ] **Step 4: Verify build after timeline edit**

Run: `npm --prefix apps/client-react run build`

Expected: build completes successfully.

### Task 2: Add CSS Rendering Support For Premium Depth

**Files:**
- Modify: `apps/client-react/src/components/SchoolPortalLogin.module.css:905-943`

- [ ] **Step 1: Add compositor-friendly rendering hints**

Update `.transitionClone` and `.logoFlight` to include stable 3D transform hints:

```css
  transform: translate3d(0, 0, 0);
  transform-origin: 0 0;
```

- [ ] **Step 2: Keep effects subtle**

Do not add large shadows, extra particles, or new decorative layers. The premium feel should come from coordinated timing, not more visual noise.

- [ ] **Step 3: Verify CSS compiles**

Run: `npm --prefix apps/client-react run build`

Expected: build completes successfully.

### Task 3: Manual Interaction Verification

**Files:**
- No code changes expected.

- [ ] **Step 1: Ensure dev server is running**

Run: `npm --prefix apps/client-react run dev`

Expected: Next dev server serves `http://localhost:3000`.

- [ ] **Step 2: Verify login page route**

Run: `Invoke-WebRequest -Uri "http://localhost:3000/login" -UseBasicParsing -TimeoutSec 20`

Expected: HTTP 200.

- [ ] **Step 3: Exercise both school choices manually**

Open `http://localhost:3000/login`.

Click `Trường THPT Nguyễn Thị Duệ` once and confirm the panel morphs into the brand side without a mid-screen title pause.

Use the back control and click `Trường Đại học Sao Đỏ` once and confirm the logo flies directly to the final brand logo position.

- [ ] **Step 4: Confirm no obvious console/runtime error**

Expected: the page remains interactive after the transition and the login form receives pointer events.

## Step 2: Self-Review

- Spec coverage: The plan covers shared panel morph, logo travel, form lift, local files, no dependencies, fallback preservation, build verification, and manual interaction checks.
- Placeholder scan: No TBD or TODO placeholders remain.
- Type consistency: The plan uses existing local names from `SchoolPortalLogin.tsx`, including `selectedPanel`, `otherPanel`, `brandPanel`, `loginPanel`, `loginCard`, `brandContent`, `logoClone`, `logoStartRect`, `logoTargetRect`, and `formRevealTargets`.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the existing backend AI chatbot prompts for `study`, `health`, `career`, and `report` without changing the API or assistant type list.

**Architecture:** The existing prompt registry remains the single integration point for assistant-specific system prompts. Tests lock the new prompt requirements before editing prompt text, then backend tests verify the endpoint and guardrails still work.

**Tech Stack:** Node.js ESM, built-in `node:test`, backend files under `packages/backend/src/ai/`.

---

## Step 3: File structure

- Modify: `packages/backend/test/ai-chat.test.mjs`
  - Add prompt-registry assertions for the expanded `study`, `health`, `career`, and `report` prompts.
  - Keep existing endpoint, guardrail, summarizer, and rate-limit tests unchanged.
- Modify: `packages/backend/src/ai/prompt-registry.mjs`
  - Expand only the prompt strings for `study`, `health`, `career`, and `report`.
  - Keep `ASSISTANT_TYPES`, `COMMON_RULES`, `isAssistantType()`, and `getAssistantSystemPrompt()` unchanged.

---

### Task 1: Add failing tests for expanded assistant prompts

**Files:**

- Modify: `packages/backend/test/ai-chat.test.mjs:18-41`

- [ ] **Step 1: Replace the prompt-registry test with stricter assertions**

Replace the existing test named `prompt registry exposes Vietnamese system prompts for all assistant types` with this code:

```js
test('prompt registry exposes expanded Vietnamese system prompts for all assistant types', () => {
  assert.deepEqual(ASSISTANT_TYPES, [
    'study',
    'document',
    'report',
    'coding',
    'career',
    'interview',
    'health',
    'finance',
    'productivity',
  ]);

  for (const assistantType of ASSISTANT_TYPES) {
    const prompt = getAssistantSystemPrompt(assistantType);
    assert.match(prompt, /tiếng Việt/i);
    assert.match(prompt, /Không bịa|không bịa/i);
    assert.match(prompt, /API key|dữ liệu hệ thống|system prompt/i);
  }

  const studyPrompt = getAssistantSystemPrompt('study');
  assert.match(studyPrompt, /Study Assistant|Trợ lý học tập/i);
  assert.match(studyPrompt, /Hướng dẫn làm bài tập|từng bước|tư duy/i);
  assert.match(studyPrompt, /Tóm tắt ngắn vấn đề/i);
  assert.match(studyPrompt, /Giải thích chi tiết/i);
  assert.match(studyPrompt, /Câu hỏi ôn tập/i);
  assert.match(studyPrompt, /gian lận học tập|Không làm bài nộp thay/i);

  const healthPrompt = getAssistantSystemPrompt('health');
  assert.match(healthPrompt, /Health Assistant|Trợ lý sức khỏe/i);
  assert.match(healthPrompt, /ngủ|uống nước|ăn uống|tập luyện/i);
  assert.match(healthPrompt, /BMI|tâm trạng/i);
  assert.match(healthPrompt, /Không thay thế bác sĩ/i);
  assert.match(healthPrompt, /Không chẩn đoán bệnh/i);
  assert.match(healthPrompt, /Không kê đơn thuốc/i);
  assert.match(healthPrompt, /Nhận xét tình trạng hiện tại/i);
  assert.match(healthPrompt, /Kế hoạch nhỏ dễ thực hiện/i);

  const careerPrompt = getAssistantSystemPrompt('career');
  assert.match(careerPrompt, /Career Assistant|Trợ lý nghề nghiệp/i);
  assert.match(careerPrompt, /Phân tích kỹ năng hiện tại/i);
  assert.match(careerPrompt, /lộ trình học tập nghề nghiệp|Lộ trình học/i);
  assert.match(careerPrompt, /CV|phỏng vấn|thực tập/i);
  assert.match(careerPrompt, /dự án cá nhân|dự án thực tế/i);
  assert.match(careerPrompt, /Không hứa hẹn chắc chắn có việc|Không cam kết chắc chắn/i);
  assert.match(careerPrompt, /Kế hoạch 1 tháng \/ 3 tháng \/ 6 tháng/i);

  const reportPrompt = getAssistantSystemPrompt('report');
  assert.match(reportPrompt, /Report Assistant|Trợ lý viết báo cáo/i);
  assert.match(reportPrompt, /MỞ ĐẦU/i);
  assert.match(reportPrompt, /CHƯƠNG 1\. CƠ SỞ LÝ THUYẾT/i);
  assert.match(reportPrompt, /CHƯƠNG 2\. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG/i);
  assert.match(reportPrompt, /CHƯƠNG 3\. THIẾT KẾ CHI TIẾT HỆ THỐNG/i);
  assert.match(reportPrompt, /use case|activity|sequence|class|ERD/i);
  assert.match(reportPrompt, /PlantUML|Mermaid/i);
  assert.match(reportPrompt, /Không bịa tài liệu tham khảo|Không tạo nguồn giả/i);
});
```

- [ ] **Step 2: Run the focused backend test and verify it fails**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none test/ai-chat.test.mjs
```

Expected result: the prompt-registry test fails because the current prompt strings do not yet contain the expanded Study, Health, Career, and Report guidance.

---

### Task 2: Expand the four assistant prompts

**Files:**

- Modify: `packages/backend/src/ai/prompt-registry.mjs:24-68`

- [ ] **Step 1: Replace only the `study`, `report`, `career`, and `health` prompt values**

In `PROMPTS`, replace the existing values for `study`, `report`, `career`, and `health` with the following strings.

Keep the other prompt values unchanged.

```js
  study: `Bạn là Study Assistant, một trợ lý AI học tập dành cho sinh viên Việt Nam.

Nhiệm vụ:
- Giải thích kiến thức học tập.
- Hướng dẫn làm bài tập theo từng bước, ưu tiên gợi mở tư duy trước khi đưa lời giải mẫu.
- Tóm tắt bài học.
- Tạo ví dụ minh họa.
- So sánh các khái niệm.
- Gợi ý cách học hiệu quả.
- Tạo câu hỏi ôn tập.
- Hỗ trợ sinh viên hiểu bản chất vấn đề.

Nguyên tắc riêng:
- Trả lời bằng tiếng Việt.
- Giải thích rõ ràng, dễ hiểu, có cấu trúc.
- Không chỉ đưa đáp án mà cần giải thích cách làm.
- Không khuyến khích gian lận học tập và không làm bài nộp thay sinh viên.
- Nếu câu hỏi là bài tập, hãy hướng dẫn tư duy trước.
- Nếu sinh viên yêu cầu, có thể đưa lời giải mẫu kèm giải thích để học.
- Dùng ví dụ thực tế nếu phù hợp.
- Nếu không chắc chắn, hãy nói rõ.

Định dạng trả lời nên dùng khi phù hợp:
- Tóm tắt ngắn vấn đề.
- Giải thích chi tiết.
- Ví dụ minh họa.
- Các bước thực hiện nếu có.
- Lưu ý quan trọng.
- Câu hỏi ôn tập nếu phù hợp.

${COMMON_RULES}`,

  report: `Bạn là Report Assistant, trợ lý AI hỗ trợ sinh viên viết báo cáo học thuật.

Nhiệm vụ:
- Lập đề cương báo cáo.
- Viết phần mở đầu.
- Viết cơ sở lý thuyết.
- Viết phân tích thiết kế hệ thống.
- Viết thiết kế chi tiết.
- Viết kết luận.
- Gợi ý tài liệu tham khảo theo nhóm nguồn cần tìm.
- Gợi ý sơ đồ use case, activity, sequence, class, ERD.
- Chuẩn hóa văn phong học thuật.

Yêu cầu riêng:
- Trả lời bằng tiếng Việt.
- Văn phong nghiêm túc, học thuật.
- Không viết lan man.
- Dùng cấu trúc rõ ràng.
- Luôn sử dụng dấu “-” cho các ý nhỏ nếu người dùng yêu cầu.
- Nội dung cần phù hợp báo cáo sinh viên Việt Nam.

Cấu trúc báo cáo có thể dùng khi phù hợp:
- MỞ ĐẦU.
- CHƯƠNG 1. CƠ SỞ LÝ THUYẾT.
- CHƯƠNG 2. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG.
- CHƯƠNG 3. THIẾT KẾ CHI TIẾT HỆ THỐNG.
- KẾT LUẬN.
- TÀI LIỆU THAM KHẢO.

Nguyên tắc riêng:
- Không viết nguyên bài để sinh viên nộp như sản phẩm cuối nếu yêu cầu có dấu hiệu gian lận.
- Không bịa tài liệu tham khảo cụ thể nếu không có nguồn.
- Không tạo nguồn giả.
- Nếu cần sơ đồ, hãy mô tả luồng và có thể xuất PlantUML hoặc Mermaid.
- Nhắc sinh viên kiểm tra trích dẫn và yêu cầu giảng viên khi cần.

${COMMON_RULES}`,

  career: `Bạn là Career Assistant, trợ lý AI hỗ trợ sinh viên định hướng nghề nghiệp.

Nhiệm vụ:
- Phân tích kỹ năng hiện tại.
- Gợi ý nghề nghiệp phù hợp.
- Tạo lộ trình học tập nghề nghiệp.
- Gợi ý kỹ năng cần học.
- Gợi ý dự án cá nhân và dự án thực tế.
- Gợi ý cách viết CV.
- Gợi ý cách chuẩn bị phỏng vấn.
- Gợi ý kế hoạch thực tập.

Nguyên tắc riêng:
- Trả lời bằng tiếng Việt.
- Gợi ý thực tế, phù hợp sinh viên.
- Ưu tiên lộ trình từng bước.
- Không hứa hẹn chắc chắn có việc, mức lương hoặc kết quả tuyển dụng.
- Không bịa kinh nghiệm cho sinh viên.
- Khuyến khích làm dự án thực tế.
- Gợi ý cả kỹ năng mềm và kỹ năng chuyên môn.

Định dạng trả lời nên dùng khi phù hợp:
- Mục tiêu nghề nghiệp.
- Kỹ năng cần có.
- Lộ trình học.
- Dự án nên làm.
- CV nên có gì.
- Kế hoạch 1 tháng / 3 tháng / 6 tháng.

${COMMON_RULES}`,

  health: `Bạn là Health Assistant, trợ lý AI hỗ trợ sinh viên theo dõi sức khỏe cá nhân.

Nhiệm vụ:
- Gợi ý thói quen ngủ tốt hơn.
- Gợi ý uống nước.
- Gợi ý ăn uống cân bằng.
- Gợi ý tập luyện cơ bản.
- Theo dõi BMI.
- Theo dõi tâm trạng.
- Gợi ý nghỉ ngơi khi học quá nhiều.
- Cảnh báo khi có dấu hiệu thói quen không lành mạnh.

Nguyên tắc an toàn riêng:
- Không thay thế bác sĩ.
- Không chẩn đoán bệnh.
- Không kê đơn thuốc.
- Không đưa lời khuyên y tế nguy hiểm.
- Nếu người dùng có dấu hiệu nghiêm trọng, hãy khuyên họ liên hệ bác sĩ, gia đình, nhà trường hoặc chuyên gia tâm lý.
- Trả lời nhẹ nhàng, tích cực, không phán xét.

Định dạng trả lời nên dùng khi phù hợp:
- Nhận xét tình trạng hiện tại.
- Gợi ý cải thiện.
- Kế hoạch nhỏ dễ thực hiện.
- Cảnh báo nếu cần.

${COMMON_RULES}`,
```

- [ ] **Step 2: Run the focused backend test and verify it passes**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none test/ai-chat.test.mjs
```

Expected result: all tests in `test/ai-chat.test.mjs` pass.

---

### Task 3: Run full backend verification

**Files:**

- No code files changed in this task.

- [ ] **Step 1: Run the backend test suite**

Run:

```bash
npm --prefix packages/backend test -- --test-isolation=none
```

Expected result: backend tests pass with zero failures.

- [ ] **Step 2: Inspect the diff for scope control**

Run:

```bash
git diff -- packages/backend/src/ai/prompt-registry.mjs packages/backend/test/ai-chat.test.mjs docs/superpowers/specs/2026-04-28-ai-assistant-prompts-design.md docs/superpowers/plans/2026-04-28-ai-assistant-prompts.md
```

Expected result: the diff only contains the approved design doc, this plan doc, prompt expansion, and prompt-registry tests.

---

## Step 4: Self-review checklist

- Spec coverage: The plan covers all approved `study`, `health`, `career`, and `report` requirements.
- Placeholder scan: No TBD, TODO, or open-ended implementation steps remain.
- Type consistency: Existing `assistant_type` values and exported function names remain unchanged.
- Scope control: No frontend, mobile, API shape, dependency, or assistant type list changes are planned.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing Expo app in `apps/mobile` into a production-ready mobile foundation with auth stack, main tabs, theme, API client, token storage, reusable UI, Login/Register, Home dashboard, and notification scaffolding.

**Architecture:** Keep the current Expo app and replace ad-hoc root auth switching with a React Navigation root stack plus an `AuthContext`. Put API, token, and notification logic in `src/services/`, reusable components in `src/components/ui/`, and mobile screens in focused `src/screens/*` files. Preserve existing backend contracts and existing chat/schedule/profile work while routing through the new foundation.

**Tech Stack:** React Native Expo 54, React 19, TypeScript, React Navigation native stack and bottom tabs, Axios, AsyncStorage, Expo Notifications, Ionicons, Node test runner for static foundation tests.

---

## Step 5: File map

**Create**

- `apps/mobile/test/mobile-foundation.test.mjs`: static regression test for the foundation.
- `apps/mobile/src/services/token-storage.ts`: AsyncStorage wrapper for auth, onboarding, and theme keys.
- `apps/mobile/src/services/api-client.ts`: Axios instance with token attachment and 401 callback.
- `apps/mobile/src/services/notifications.ts`: Expo Notifications permission and local reminder helpers.
- `apps/mobile/src/contexts/AuthContext.tsx`: mobile auth provider and `useAuth` hook.
- `apps/mobile/src/contexts/ThemeContext.tsx`: light/dark theme provider and `useAppTheme` hook.
- `apps/mobile/src/hooks/useBootstrapData.ts`: loads bootstrap data and exposes loading/error/empty state.
- `apps/mobile/src/navigation/RootNavigator.tsx`: auth stack plus authenticated app stack.
- `apps/mobile/src/navigation/types.ts`: route param lists.
- `apps/mobile/src/components/ui/AppButton.tsx`: shared button.
- `apps/mobile/src/components/ui/AppInput.tsx`: shared text input.
- `apps/mobile/src/components/ui/AppCard.tsx`: shared card container.
- `apps/mobile/src/components/ui/LoadingView.tsx`: shared loading state.
- `apps/mobile/src/components/ui/EmptyView.tsx`: shared empty state.
- `apps/mobile/src/components/ui/ErrorView.tsx`: shared error state.
- `apps/mobile/src/components/ui/Header.tsx`: shared screen header.
- `apps/mobile/src/components/ui/StatisticCard.tsx`: dashboard statistic card.
- `apps/mobile/src/components/ui/ReminderCard.tsx`: reminder summary card.
- `apps/mobile/src/components/ui/AssignmentCard.tsx`: assignment summary card.
- `apps/mobile/src/components/ui/HealthCard.tsx`: health summary card.
- `apps/mobile/src/components/ui/index.ts`: UI exports.
- `apps/mobile/src/screens/auth/SplashScreen.tsx`: initialization splash screen.
- `apps/mobile/src/screens/auth/OnboardingScreen.tsx`: first-run onboarding.
- `apps/mobile/src/screens/auth/ForgotPasswordScreen.tsx`: forgot password form.
- `apps/mobile/src/screens/main/HomeScreen.tsx`: foundation Home dashboard.
- `apps/mobile/src/screens/main/HealthScreen.tsx`: health tab foundation screen.
- `apps/mobile/src/screens/module/ModuleScreen.tsx`: generic stack destination for later module entry points.

**Modify**

- `apps/mobile/package.json`: add `test` script and dependencies.
- `apps/mobile/app.json`: switch `userInterfaceStyle` to `automatic` and add notifications plugin config if needed by Expo.
- `apps/mobile/App.tsx`: wrap app in `SafeAreaProvider`, `ThemeProvider`, `AuthProvider`, and `RootNavigator`.
- `apps/mobile/src/constants/theme.ts`: export light/dark tokens while preserving existing token names.
- `apps/mobile/src/navigation/MainTabs.tsx`: five requested tabs: Home, AI Chat, Calendar, Health, Profile.
- `apps/mobile/src/screens/auth/LoginScreen.tsx`: use `useAuth`, shared inputs/buttons, and context errors.
- `apps/mobile/src/screens/auth/RegisterScreen.tsx`: use `useAuth`, shared inputs/buttons, full name field, and context errors.
- `apps/mobile/src/screens/main/ChatScreen.tsx`: use `useAuth` token source if touched by TypeScript errors.
- `apps/mobile/src/store/useAppStore.ts`: optionally replace direct `fetch` calls with API client only when it reduces duplication without widening scope.

## Step 6: Task 1: Add failing mobile foundation test

**Files:**

- Create: `apps/mobile/test/mobile-foundation.test.mjs`
- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Add the test script to `apps/mobile/package.json`**

Change the `scripts` block to include `test`:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `apps/mobile/test/mobile-foundation.test.mjs` with this content:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

test('mobile foundation has service, context, navigation, theme, and UI layers', () => {
  const expectedFiles = [
    'src/services/api-client.ts',
    'src/services/token-storage.ts',
    'src/services/notifications.ts',
    'src/contexts/AuthContext.tsx',
    'src/contexts/ThemeContext.tsx',
    'src/navigation/RootNavigator.tsx',
    'src/navigation/types.ts',
    'src/hooks/useBootstrapData.ts',
    'src/components/ui/AppButton.tsx',
    'src/components/ui/AppInput.tsx',
    'src/components/ui/AppCard.tsx',
    'src/components/ui/LoadingView.tsx',
    'src/components/ui/EmptyView.tsx',
    'src/components/ui/ErrorView.tsx',
    'src/components/ui/Header.tsx',
    'src/components/ui/StatisticCard.tsx',
    'src/components/ui/ReminderCard.tsx',
    'src/components/ui/AssignmentCard.tsx',
    'src/components/ui/HealthCard.tsx',
    'src/screens/auth/SplashScreen.tsx',
    'src/screens/auth/OnboardingScreen.tsx',
    'src/screens/auth/ForgotPasswordScreen.tsx',
    'src/screens/main/HomeScreen.tsx',
    'src/screens/main/HealthScreen.tsx',
  ];

  for (const file of expectedFiles) {
    assert.equal(existsSync(join(root, file)), true, `${file} should exist`);
  }

  const apiClient = read('src/services/api-client.ts');
  assert.match(apiClient, /axios\.create/);
  assert.match(apiClient, /Authorization/);
  assert.match(apiClient, /onUnauthorized/);

  const authContext = read('src/contexts/AuthContext.tsx');
  assert.match(authContext, /createContext/);
  assert.match(authContext, /useAuth/);
  assert.match(authContext, /AsyncStorage|tokenStorage/);

  const themeContext = read('src/contexts/ThemeContext.tsx');
  assert.match(themeContext, /dark/);
  assert.match(themeContext, /light/);
  assert.match(themeContext, /useAppTheme/);

  const tabs = read('src/navigation/MainTabs.tsx');
  for (const tab of ['Home', 'AIChat', 'Calendar', 'Health', 'Profile']) {
    assert.match(tabs, new RegExp(tab));
  }

  const rootNavigator = read('src/navigation/RootNavigator.tsx');
  for (const screen of ['Splash', 'Onboarding', 'Login', 'Register', 'ForgotPassword', 'Main']) {
    assert.match(rootNavigator, new RegExp(screen));
  }
});

test('auth and home screens use the shared foundation', () => {
  const login = read('src/screens/auth/LoginScreen.tsx');
  assert.match(login, /useAuth/);
  assert.match(login, /AppInput/);
  assert.match(login, /AppButton/);

  const register = read('src/screens/auth/RegisterScreen.tsx');
  assert.match(register, /useAuth/);
  assert.match(register, /fullName/);
  assert.match(register, /AppInput/);
  assert.match(register, /AppButton/);

  const home = read('src/screens/main/HomeScreen.tsx');
  for (const text of ['Deadline', 'Task', 'Lịch học', 'Sức khỏe', 'Gợi ý từ AI']) {
    assert.match(home, new RegExp(text));
  }
});
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: FAIL because `src/services/api-client.ts` and other foundation files do not exist yet.

## Step 7: Task 2: Add dependencies

**Files:**

- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/package-lock.json`

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm --prefix apps/mobile install axios expo-notifications
```

Expected: `apps/mobile/package.json` includes `axios` and `expo-notifications`.

- [ ] **Step 2: Verify package metadata**

Run:

```bash
npm --prefix apps/mobile pkg get dependencies.axios dependencies.expo-notifications
```

Expected: two version strings are printed.

## Step 8: Task 3: Add token storage and API service

**Files:**

- Create: `apps/mobile/src/services/token-storage.ts`
- Create: `apps/mobile/src/services/api-client.ts`

- [ ] **Step 1: Create `token-storage.ts`**

Use these exports and exact storage keys:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'saodo_token';
const REFRESH_TOKEN_KEY = 'saodo_refresh_token';
const ONBOARDING_KEY = 'saodo_onboarding_complete';
const THEME_KEY = 'saodo_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

export const tokenStorage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async setAccessToken(token: string) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  async getRefreshToken() {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  async clearAuth() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
  async hasCompletedOnboarding() {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  },
  async setOnboardingComplete() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  },
  async getThemePreference(): Promise<ThemePreference> {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  },
  async setThemePreference(preference: ThemePreference) {
    await AsyncStorage.setItem(THEME_KEY, preference);
  },
};
```

- [ ] **Step 2: Create `api-client.ts`**

Use an Axios instance with a configurable unauthorized callback:

```ts
import axios, { AxiosError } from 'axios';
import { tokenStorage } from './token-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:9191/api';

let onUnauthorized: (() => void) | null = null;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      await tokenStorage.clearAuth();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function getApiErrorMessage(error: unknown, fallback = 'Không thể kết nối máy chủ') {
  if (axios.isAxiosError<{ error?: string; message?: string }>(error)) {
    return error.response?.data?.error || error.response?.data?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because contexts, navigation, UI, and screens are not implemented yet.

## Step 9: Task 4: Add theme system

**Files:**

- Modify: `apps/mobile/src/constants/theme.ts`
- Create: `apps/mobile/src/contexts/ThemeContext.tsx`

- [ ] **Step 1: Extend `theme.ts` without removing existing exports**

Keep `Colors`, `Spacing`, `Radius`, `FontSize`, and `Shadow` available for existing screens.

Add these exports below existing constants:

```ts
export const LightColors = Colors;

export const DarkColors = {
  ...Colors,
  bg: '#081525',
  surface: '#102033',
  surfaceAlt: '#162B43',
  text: '#F8FAFC',
  textSub: '#CBD5E1',
  textMuted: '#94A3B8',
  border: '#24415F',
  borderSoft: '#1B344F',
  shadow: 'rgba(0, 0, 0, 0.32)',
};

export const AppThemes = {
  light: { colors: LightColors, spacing: Spacing, radius: Radius, fontSize: FontSize, shadow: Shadow },
  dark: { colors: DarkColors, spacing: Spacing, radius: Radius, fontSize: FontSize, shadow: Shadow },
};

export type AppThemeName = keyof typeof AppThemes;
export type AppTheme = typeof AppThemes.light;
```

- [ ] **Step 2: Create `ThemeContext.tsx`**

Use system color scheme plus stored preference:

```tsx
import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { AppThemes, type AppTheme, type AppThemeName } from '../constants/theme';
import { tokenStorage, type ThemePreference } from '../services/token-storage';

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: AppThemeName;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    tokenStorage.getThemePreference().then(setPreferenceState).catch(() => setPreferenceState('system'));
  }, []);

  const colorScheme: AppThemeName = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(() => ({
    theme: AppThemes[colorScheme],
    colorScheme,
    preference,
    async setPreference(nextPreference) {
      await tokenStorage.setThemePreference(nextPreference);
      setPreferenceState(nextPreference);
    },
  }), [colorScheme, preference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used inside ThemeProvider');
  return context;
}
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because auth context, UI, navigation, and screens are missing.

## Step 10: Task 5: Add AuthContext

**Files:**

- Create: `apps/mobile/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Create `AuthContext.tsx`**

Implement context on top of the new API service:

```tsx
import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { apiClient, getApiErrorMessage, setUnauthorizedHandler } from '../services/api-client';
import { tokenStorage } from '../services/token-storage';

type LoginInput = { identifier: string; password: string };
type RegisterInput = { fullName: string; studentId: string; email: string; password: string };
type AuthPayload = { user?: AuthUser; token?: string; accessToken?: string; refreshToken?: string; studentId?: string };

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string; studentId?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async () => {
    await tokenStorage.clearAuth();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const persistAuth = async (payload: AuthPayload) => {
    const nextToken = payload.accessToken || payload.token;
    if (!nextToken) return false;
    await tokenStorage.setAccessToken(nextToken);
    if (payload.refreshToken) await tokenStorage.setRefreshToken(payload.refreshToken);
    setToken(nextToken);
    if (payload.user) setUser(payload.user);
    return true;
  };

  const refreshMe = async () => {
    const storedToken = await tokenStorage.getAccessToken();
    if (!storedToken) return;
    setToken(storedToken);
    try {
      const response = await apiClient.get<{ user: AuthUser }>('/auth/me');
      setUser(response.data.user);
    } catch {
      await logout();
    }
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
    refreshMe().finally(() => setIsInitializing(false));
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isInitializing,
    isLoading,
    error,
    async login(input) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<AuthPayload>('/auth/login', {
          email: input.identifier,
          studentId: input.identifier,
          password: input.password,
        });
        await persistAuth(response.data);
        return { success: true };
      } catch (loginError) {
        const message = getApiErrorMessage(loginError, 'Đăng nhập thất bại');
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    async register(input) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<AuthPayload>('/auth/register', {
          fullName: input.fullName,
          studentId: input.studentId,
          studentCode: input.studentId,
          email: input.email,
          password: input.password,
        });
        await persistAuth(response.data);
        return { success: true, studentId: response.data.studentId || input.studentId };
      } catch (registerError) {
        const message = getApiErrorMessage(registerError, 'Đăng ký thất bại');
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    async forgotPassword(email) {
      setIsLoading(true);
      setError(null);
      try {
        await apiClient.post('/auth/forgot-password', { email });
        return { success: true };
      } catch (forgotError) {
        const message = getApiErrorMessage(forgotError, 'Không thể gửi yêu cầu cấp lại mật khẩu');
        setError(message);
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    refreshMe,
    logout,
    clearError() {
      setError(null);
    },
  }), [user, token, isInitializing, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
```

- [ ] **Step 2: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because navigation, UI, and screens are missing.

## Step 11: Task 6: Add notification service

**Files:**

- Create: `apps/mobile/src/services/notifications.ts`
- Modify: `apps/mobile/app.json`

- [ ] **Step 1: Create `notifications.ts`**

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function scheduleLocalReminder(title: string, body: string, date: Date) {
  const granted = await requestNotificationPermission();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: date,
  });
}
```

- [ ] **Step 2: Update `app.json`**

Change `userInterfaceStyle` from `light` to `automatic`.

Add this `plugins` array inside the `expo` object:

```json
"plugins": [
  "expo-notifications"
]
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because UI components, navigation, and screens are missing.

## Step 12: Task 7: Add reusable UI components

**Files:**

- Create all files under `apps/mobile/src/components/ui/` listed in the file map.

- [ ] **Step 1: Implement shared components**

Each component should import `Colors`, `FontSize`, `Radius`, `Shadow`, and `Spacing` from `../../constants/theme` and use the existing Sao Do visual language.

Minimum public props:

```ts
// AppButton.tsx
type AppButtonProps = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; variant?: 'primary' | 'secondary' | 'ghost' };

// AppInput.tsx
type AppInputProps = { label: string; value: string; onChangeText: (value: string) => void; hint?: string; secureTextEntry?: boolean; keyboardType?: 'default' | 'email-address'; error?: string };

// AppCard.tsx
type AppCardProps = { children: React.ReactNode; tone?: 'default' | 'blue' | 'red' | 'gold' };

// LoadingView.tsx
type LoadingViewProps = { text?: string };

// EmptyView.tsx
type EmptyViewProps = { title: string; text: string; icon?: React.ComponentProps<typeof Ionicons>['name'] };

// ErrorView.tsx
type ErrorViewProps = { title?: string; text: string; onRetry?: () => void };

// Header.tsx
type HeaderProps = { title: string; subtitle?: string; right?: React.ReactNode };

// StatisticCard.tsx
type StatisticCardProps = { label: string; value: string | number; icon: React.ComponentProps<typeof Ionicons>['name']; color?: string };

// ReminderCard.tsx
type ReminderCardProps = { title: string; dueText?: string; done?: boolean; onPress?: () => void };

// AssignmentCard.tsx
type AssignmentCardProps = { title: string; subject: string; dueText: string; status?: string; onPress?: () => void };

// HealthCard.tsx
type HealthCardProps = { title: string; value: string; helper?: string; icon: React.ComponentProps<typeof Ionicons>['name']; color?: string };
```

Use `Pressable` for tappable cards and buttons, `ActivityIndicator` for loading, and `Ionicons` for icons.

- [ ] **Step 2: Export components from `index.ts`**

```ts
export { AppButton } from './AppButton';
export { AppInput } from './AppInput';
export { AppCard } from './AppCard';
export { LoadingView } from './LoadingView';
export { EmptyView } from './EmptyView';
export { ErrorView } from './ErrorView';
export { Header } from './Header';
export { StatisticCard } from './StatisticCard';
export { ReminderCard } from './ReminderCard';
export { AssignmentCard } from './AssignmentCard';
export { HealthCard } from './HealthCard';
```

- [ ] **Step 3: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because navigation and screens are missing.

## Step 13: Task 8: Add navigation types and root navigator

**Files:**

- Create: `apps/mobile/src/navigation/types.ts`
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Modify: `apps/mobile/src/navigation/MainTabs.tsx`
- Modify: `apps/mobile/App.tsx`

- [ ] **Step 1: Create route types**

```ts
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  AIChat: undefined;
  Calendar: undefined;
  Health: undefined;
  Profile: undefined;
};

export type RootStackParamList = AuthStackParamList & {
  Main: undefined;
  Subjects: undefined;
  SubjectDetail: { id: string };
  Assignments: undefined;
  AssignmentDetail: { id: string };
  StudyPlan: undefined;
  Documents: undefined;
  Flashcards: undefined;
  Tasks: undefined;
  TaskDetail: { id: string };
  CV: undefined;
  CareerPath: undefined;
  InterviewPractice: undefined;
  FinanceDashboard: undefined;
  Income: undefined;
  Expense: undefined;
  Budget: undefined;
  FinanceStatistics: undefined;
  ReminderList: undefined;
  AddReminder: undefined;
  ReminderDetail: { id: string };
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
};
```

- [ ] **Step 2: Update `MainTabs.tsx` to five tabs**

Map tabs to these route names and components:

```ts
Home -> HomeScreen
AIChat -> ChatScreen
Calendar -> ScheduleScreen
Health -> HealthScreen
Profile -> ProfileScreen
```

Labels should be Vietnamese:

```ts
Trang chủ, AI Chat, Lịch, Sức khỏe, Cá nhân
```

- [ ] **Step 3: Create `RootNavigator.tsx`**

Use `useAuth()` and `tokenStorage.hasCompletedOnboarding()` to choose initial auth route.

Authenticated users should see `Main` plus stack module routes.

Unauthenticated users should see Splash, Onboarding, Login, Register, and ForgotPassword.

- [ ] **Step 4: Update `App.tsx`**

The root should become provider composition:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/theme';

function AppFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return <View style={styles.webStage}><View style={styles.webFrame}>{children}</View></View>;
}

export default function App() {
  return (
    <AppFrame>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </AppFrame>
  );
}

const styles = StyleSheet.create({
  webStage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg, paddingHorizontal: 18, paddingVertical: 18 },
  webFrame: { flex: 1, width: '100%', maxWidth: 430, overflow: 'hidden', backgroundColor: Colors.bg, borderRadius: 30, borderWidth: 1, borderColor: Colors.border },
});
```

- [ ] **Step 5: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because Splash, Onboarding, ForgotPassword, Home, and Health screens are missing.

## Step 14: Task 9: Add auth screens and update Login/Register

**Files:**

- Create: `apps/mobile/src/screens/auth/SplashScreen.tsx`
- Create: `apps/mobile/src/screens/auth/OnboardingScreen.tsx`
- Create: `apps/mobile/src/screens/auth/ForgotPasswordScreen.tsx`
- Modify: `apps/mobile/src/screens/auth/LoginScreen.tsx`
- Modify: `apps/mobile/src/screens/auth/RegisterScreen.tsx`

- [ ] **Step 1: Add Splash screen**

Splash should show the logo, `LoadingView`, and call no API directly.

It can read `useAuth().isInitializing` for text only.

- [ ] **Step 2: Add Onboarding screen**

Onboarding should show three benefits:

- Hỏi AI về lịch học, tài liệu, bài tập.
- Theo dõi deadline, task, lịch học.
- Ghi lại sức khỏe, tài chính, nhắc nhở.

The primary action calls `tokenStorage.setOnboardingComplete()` and navigates to `Login`.

- [ ] **Step 3: Add Forgot Password screen**

Forgot Password should use `AppInput`, `AppButton`, and `useAuth().forgotPassword(email)`.

On success, show a simple success card and a button back to Login.

- [ ] **Step 4: Update Login screen**

Replace direct Zustand auth usage with:

```ts
const { login, isLoading, error, clearError } = useAuth();
```

Use `AppInput` for identifier and password.

Use `AppButton` for submit.

Submit payload:

```ts
await login({ identifier: studentId.trim(), password });
```

- [ ] **Step 5: Update Register screen**

Replace direct Zustand auth usage with:

```ts
const { register, isLoading, error, clearError } = useAuth();
```

Add `fullName` state and input.

Submit payload:

```ts
await register({ fullName: fullName.trim(), studentId: studentId.trim(), email: email.trim(), password });
```

- [ ] **Step 6: Run the focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: still FAIL because Home and Health screens or Home text requirements are not complete.

## Step 15: Task 10: Add Home and Health screens plus bootstrap hook

**Files:**

- Create: `apps/mobile/src/hooks/useBootstrapData.ts`
- Create: `apps/mobile/src/screens/main/HomeScreen.tsx`
- Create: `apps/mobile/src/screens/main/HealthScreen.tsx`

- [ ] **Step 1: Create `useBootstrapData.ts`**

Use `apiClient.get('/app/bootstrap')` and return:

```ts
type BootstrapState = {
  data: null | {
    stats?: { classesToday?: number; reminders?: number; documents?: number };
    schedule?: { id: string; title: string; time: string; room: string; type: string }[];
    suggestions?: string[];
  };
  loading: boolean;
  error: string | null;
  empty: boolean;
  refetch: () => Promise<void>;
};
```

Use `getApiErrorMessage(error, 'Không thể tải dữ liệu dashboard')` for errors.

- [ ] **Step 2: Create `HomeScreen.tsx`**

Home must include these exact Vietnamese labels so the test proves coverage:

```tsx
<Text>Deadline hôm nay</Text>
<Text>Task cần làm</Text>
<Text>Lịch học hôm nay</Text>
<Text>Sức khỏe nhanh</Text>
<Text>Gợi ý từ AI</Text>
```

Use `StatisticCard`, `ReminderCard`, `AssignmentCard`, `HealthCard`, `EmptyView`, and `ErrorView` where appropriate.

Quick cards should navigate to `Subjects`, `Tasks`, `FinanceDashboard`, `ReminderList`, `Documents`, and `Settings`.

- [ ] **Step 3: Create `HealthScreen.tsx`**

Health tab should show four `HealthCard` entries:

- Cân nặng.
- Giấc ngủ.
- Bữa ăn.
- Tâm trạng.

It should include an empty state message for missing health logs.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: PASS with 2 tests and 0 failures.

## Step 16: Task 11: Typecheck and fix integration issues

**Files:**

- Modify touched files only.

- [ ] **Step 1: Run TypeScript check**

Run:

```bash
npm --prefix apps/mobile exec tsc -- --noEmit
```

Expected: exit 0.

- [ ] **Step 2: Fix real type errors in touched files**

If errors mention changed files, fix them directly.

If errors mention generated folders, logs, `.expo`, or unrelated old files, do not edit those files; report them as pre-existing blockers.

- [ ] **Step 3: Re-run focused test after type fixes**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: PASS with 2 tests and 0 failures.

## Step 17: Task 12: Final verification and handoff

**Files:**

- No new files unless verification reveals a required code fix.

- [ ] **Step 1: Run final focused test**

Run:

```bash
npm --prefix apps/mobile test -- test/mobile-foundation.test.mjs
```

Expected: PASS with 2 tests and 0 failures.

- [ ] **Step 2: Run final typecheck**

Run:

```bash
npm --prefix apps/mobile exec tsc -- --noEmit
```

Expected: exit 0, or a concise blocker report if unrelated pre-existing issues remain.

- [ ] **Step 3: Inspect changed files**

Run:

```bash
git status --short -- apps/mobile docs/superpowers/specs/2026-04-28-mobile-foundation-design.md docs/superpowers/plans/2026-04-28-mobile-foundation.md
```

Expected: only files related to this mobile foundation work are listed.

- [ ] **Step 4: Report results**

Final response must include:

- Changed files grouped by service, context, navigation, UI, and screens.
- Focused test command and result.
- Typecheck command and result.
- Remaining risks: AsyncStorage instead of SecureStore, remote push token backend not defined, deep module screens deferred.

## Step 18: Self-review checklist

- Spec coverage: Tasks cover API client, AuthContext, token storage, notifications, theme, navigation, Login/Register, Home, bottom tabs, loading/error/empty components, and verification.
- Scope control: Full Study, Work, Finance, Reminder, and Profile detail modules remain out of phase one.
- Type consistency: `useAuth`, `useAppTheme`, `apiClient`, `tokenStorage`, route names, and component names match across tasks.
- Commit safety: This plan does not instruct commits because repository instructions require explicit user approval before committing.
