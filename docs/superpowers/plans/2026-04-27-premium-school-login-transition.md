# Premium School Login Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the school selection to login transition feel like a premium shared-element app morph instead of a slide presentation.

**Architecture:** Keep the existing `SchoolPortalLogin` component and Anime.js timeline. Simplify the forward transition so the selected panel morphs directly into the final brand panel, the selected logo travels once to its destination, and the form reveals after the destination layout is established.

**Tech Stack:** Next.js 15, React 19, CSS Modules, Anime.js loaded by the existing component.

---

## File Structure

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

## Self-Review

- Spec coverage: The plan covers shared panel morph, logo travel, form lift, local files, no dependencies, fallback preservation, build verification, and manual interaction checks.
- Placeholder scan: No TBD or TODO placeholders remain.
- Type consistency: The plan uses existing local names from `SchoolPortalLogin.tsx`, including `selectedPanel`, `otherPanel`, `brandPanel`, `loginPanel`, `loginCard`, `brandContent`, `logoClone`, `logoStartRect`, `logoTargetRect`, and `formRevealTargets`.
