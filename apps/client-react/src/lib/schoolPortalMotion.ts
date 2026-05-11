// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type SchoolPortalTheme = 'highschool' | 'university';

export type WavePoint = {
  x: number;
  y: number;
};

export type DividerBubble = {
  id: number;
  theme: SchoolPortalTheme;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  lifeMs: number;
  maxLifeMs: number;
  phase: number;
};

export const SCHOOL_PORTAL_ANIMATION_TIMING = {
  animeLoadGraceMs: 240,
  animeInteractionGraceMs: 1600,
  entrance: {
    panelStaggerMs: 70,
    panelDurationMs: 520,
    contentStaggerMs: 45,
    contentDurationMs: 420,
  },
  hover: {
    contentDurationMs: 200,
    shadeDurationMs: 180,
  },
  selectToLogin: {
    selectedPanelPressMs: 90,
    contentExitMs: 160,
    otherPanelExitMs: 210,
    panelFlipMs: 460,
    cloneContentMs: 360,
    logoFlightMs: 460,
    selectionFadeMs: 180,
    brandPanelRevealMs: 260,
    brandContentRevealMs: 220,
    brandWaveMs: 300,
    cloneFadeMs: 120,
    loginPanelRevealMs: 300,
    loginCardRevealMs: 360,
    formStaggerMs: 28,
    formRevealMs: 220,
  },
  backToSelection: {
    formStaggerMs: 26,
    formExitMs: 160,
    loginCardExitMs: 240,
    loginPanelExitMs: 260,
    brandContentExitMs: 180,
    brandPanelExitMs: 180,
    panelFlipMs: 460,
    logoCenterFlightMs: 220,
    logoPanelFlightMs: 360,
    selectionRevealMs: 240,
    loginScreenFadeMs: 260,
    cloneFadeMs: 140,
  },
} as const;

function seededRandom(seed: number) {
  let value = Math.trunc(seed) || 1;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function buildPanelWavePoints(time: number, centerPercent: number, segments = 28): WavePoint[] {
  const points: WavePoint[] = [];
  const amplitude = 1.45 + Math.sin(time * 0.22) * 0.2;

  for (let index = 0; index <= segments; index += 1) {
    const y = (100 / segments) * index;
    const waveA = Math.sin(time * 0.74 + index * 0.19) * amplitude;
    const waveB = Math.sin(time * 0.41 + index * 0.37) * (amplitude * 0.42);
    const waveC = Math.sin(time * 0.17 + index * 0.08) * 0.32;
    points.push({ x: centerPercent + waveA + waveB + waveC, y });
  }

  return points;
}

export function buildPanelWaveClip(time: number, centerPercent: number, segments = 28) {
  const points = ['0 0'];
  for (const point of buildPanelWavePoints(time, centerPercent, segments)) {
    points.push(`${point.x.toFixed(2)}% ${point.y.toFixed(2)}%`);
  }
  points.push('0 100%');
  return `polygon(${points.join(', ')})`;
}

export function buildDividerBubbleBurst(theme: SchoolPortalTheme, width: number, height: number, seed: number, count = 18): DividerBubble[] {
  const random = seededRandom(seed);
  const wave = buildPanelWavePoints(seed * 0.002, 50, Math.max(8, count));

  return Array.from({ length: count }, (_, index) => {
    const base = wave[Math.min(index, wave.length - 1)];
    const jitterX = (random() - 0.5) * Math.min(46, width * 0.045);
    const jitterY = (random() - 0.5) * Math.min(58, height * 0.08);
    const y = Math.min(height, Math.max(0, (base.y / 100) * height + jitterY));

    return {
      id: seed + index,
      theme,
      x: (base.x / 100) * width + jitterX,
      y,
      vx: (random() - 0.5) * 0.34,
      vy: -0.18 - random() * 0.38,
      radius: 3 + random() * 7,
      alpha: 0.42 + random() * 0.42,
      lifeMs: 0,
      maxLifeMs: 780 + random() * 620,
      phase: random() * Math.PI * 2,
    };
  });
}

export function advanceDividerBubbles(bubbles: DividerBubble[], deltaMs: number) {
  return bubbles
    .map((bubble) => {
      const nextLife = bubble.lifeMs + deltaMs;
      const drift = Math.sin(bubble.phase + nextLife * 0.011) * 0.18;
      return {
        ...bubble,
        lifeMs: nextLife,
        x: bubble.x + (bubble.vx + drift) * deltaMs,
        y: bubble.y + bubble.vy * deltaMs,
      };
    })
    .filter((bubble) => bubble.lifeMs < bubble.maxLifeMs);
}
