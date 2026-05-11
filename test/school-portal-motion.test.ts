// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "vitest";
import { SCHOOL_PORTAL_ANIMATION_TIMING, buildDividerBubbleBurst, buildPanelWaveClip, buildPanelWavePoints } from "../apps/client-react/src/lib/schoolPortalMotion.js";
import { THREE_DIVIDER_PANEL_WIDTH_PERCENT, buildThreeDividerClipPath, buildThreeDividerWavePoints, getThreeDividerTargetWidths } from "../apps/client-react/src/lib/schoolPortalThreeDivider.js";

describe("school portal motion helpers", () => {
  it("builds a closed animated wave clip around the divider seam", () => {
    const first = buildPanelWaveClip(0, 50);
    const second = buildPanelWaveClip(1.2, 50);

    expect(first).toMatch(/^polygon\(0 0,/);
    expect(first).toContain("0 100%")
    expect(first).not.toBe(second);
  });

  it("keeps generated wave points near the requested seam", () => {
    const points = buildPanelWavePoints(2.4, 51.2, 6);

    expect(points).toHaveLength(7);
    for (const point of points) {
      expect(point.x).toBeGreaterThan(48);
      expect(point.x).toBeLessThan(55);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it("creates deterministic bubble bursts that ride the divider line", () => {
    const burst = buildDividerBubbleBurst("highschool", 1000, 800, 1234);

    expect(burst).toHaveLength(18);
    expect(burst[0]).toMatchObject({ theme: "highschool" });
    expect(burst.every((bubble) => bubble.x > 450 && bubble.x < 570)).toBe(true);
    expect(burst.every((bubble) => bubble.y >= 0 && bubble.y <= 800)).toBe(true);
    expect(burst.every((bubble) => bubble.radius >= 3 && bubble.radius <= 10)).toBe(true);
  });

  it("builds a Three.js-driven wavy seam clip without drawing a second overlay line", () => {
    const first = buildThreeDividerClipPath(0.4);
    const second = buildThreeDividerClipPath(2.2);
    const points = buildThreeDividerWavePoints(1.1);

    expect(THREE_DIVIDER_PANEL_WIDTH_PERCENT).toBeGreaterThan(50);
    expect(THREE_DIVIDER_PANEL_WIDTH_PERCENT).toBeLessThanOrEqual(54);
    expect(first).toMatch(/^polygon\(0 0,/);
    expect(first).toContain("0 100%");
    expect(first).not.toBe(second);
    expect(points).toHaveLength(45);
    expect(points.every((point) => point.x >= 92 && point.x <= 99.4)).toBe(true);
  });

  it("expands the focused school panel while keeping a small seam overlap", () => {
    expect(getThreeDividerTargetWidths(null)).toEqual({ highschool: 52, university: 52 });
    expect(getThreeDividerTargetWidths("highschool")).toEqual({ highschool: 60, university: 44 });
    expect(getThreeDividerTargetWidths("university")).toEqual({ highschool: 44, university: 60 });

    const focusedClip = buildThreeDividerClipPath(1.2, 44, 60);
    expect(focusedClip).toMatch(/96\./);
  });

  it("keeps portal animations responsive instead of feeling delayed", () => {
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.entrance.panelDurationMs).toBeLessThanOrEqual(560);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.entrance.contentStaggerMs).toBeLessThanOrEqual(50);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.selectToLogin.panelFlipMs).toBeLessThanOrEqual(500);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.selectToLogin.formStaggerMs).toBeLessThanOrEqual(30);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.backToSelection.panelFlipMs).toBeLessThanOrEqual(500);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.animeLoadGraceMs).toBeLessThanOrEqual(260);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.animeInteractionGraceMs).toBeGreaterThanOrEqual(1200);
    expect(SCHOOL_PORTAL_ANIMATION_TIMING.animeInteractionGraceMs).toBeLessThanOrEqual(1800);
  });
});
