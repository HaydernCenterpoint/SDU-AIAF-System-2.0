// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MathUtils, Vector2 } from 'three';

export type ThreeDividerPoint = {
  x: number;
  y: number;
};

export type ThreeDividerFocus = 'highschool' | 'university' | null;

export const THREE_DIVIDER_PANEL_WIDTH_PERCENT = 52;
export const THREE_DIVIDER_FOCUSED_PANEL_WIDTH_PERCENT = 63;   // hover: focused side takes 63% of 106 total
export const THREE_DIVIDER_TOTAL_OVERLAP_PERCENT = 106;        // slight extra overlap for clip-path seam

function getSeamCenterPercent(panelWidthPercent: number) {
  const visibleSeamPercent = panelWidthPercent - 2;
  return (visibleSeamPercent / panelWidthPercent) * 100;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function getThreeDividerTargetWidths(focus: ThreeDividerFocus) {
  const highschool = focus === 'highschool'
    ? THREE_DIVIDER_FOCUSED_PANEL_WIDTH_PERCENT
    : focus === 'university'
      ? THREE_DIVIDER_TOTAL_OVERLAP_PERCENT - THREE_DIVIDER_FOCUSED_PANEL_WIDTH_PERCENT
      : THREE_DIVIDER_PANEL_WIDTH_PERCENT;

  return {
    highschool,
    university: THREE_DIVIDER_TOTAL_OVERLAP_PERCENT - highschool,
  };
}

export function buildThreeDividerWavePoints(time: number, segments = 44, panelWidthPercent = THREE_DIVIDER_PANEL_WIDTH_PERCENT): ThreeDividerPoint[] {
  const seamCenterPercent = getSeamCenterPercent(panelWidthPercent);

  return Array.from({ length: segments + 1 }, (_, index) => {
    const y = (100 / segments) * index;
    const yRatio = y / 100;
    const lowWave = Math.sin(time * 1.14 + yRatio * Math.PI * 2.2) * 1.24;
    const highWave = Math.sin(time * 2.05 + yRatio * Math.PI * 6.1) * 0.48;
    const breathingWave = Math.sin(time * 0.58 + yRatio * Math.PI) * 0.34;
    const point = new Vector2(seamCenterPercent + lowWave + highWave + breathingWave, y);

    return {
      x: MathUtils.clamp(point.x, 92, 99.35),
      y: point.y,
    };
  });
}

export function buildThreeDividerClipPath(time: number, segments = 44, panelWidthPercent = THREE_DIVIDER_PANEL_WIDTH_PERCENT) {
  const points = buildThreeDividerWavePoints(time, segments, panelWidthPercent).map((point) => `${formatPercent(point.x)} ${formatPercent(point.y)}`);
  return `polygon(0 0, ${points.join(', ')}, 0 100%)`;
}
