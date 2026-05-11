'use client';

// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { advanceDividerBubbles, buildDividerBubbleBurst } from '@/lib/schoolPortalMotion';
import type { DividerBubble } from '@/lib/schoolPortalMotion';
import { readSchoolDisplayName } from '@/lib/school-session';
import { resolveSchoolSlugFromBackendId } from '@/lib/school-site';
import {
  THREE_DIVIDER_PANEL_WIDTH_PERCENT,
  buildThreeDividerClipPath,
  getThreeDividerTargetWidths,
} from '@/lib/schoolPortalThreeDivider';
import styles from './SchoolPortalLogin.module.css';

type SchoolId = 'highschool' | 'university';
type BackendSchoolId = 'nguyen-thi-due' | 'sao-do';
type PortalMode = 'gateway' | 'login';

type School = {
  id: SchoolId;
  name: string;
  logo: string;
  desc: string;
  kicker: string;
  edge: string;
  classLine: string;
  facultyLine?: string;
  fallbackDisplayName: string;
  theme: 'blue' | 'red';
};

const schools: Record<SchoolId, School> = {
  highschool: {
    id: 'highschool',
    name: 'Trường THPT Nguyễn Thị Duệ',
    logo: '/assets/images/logo-nguyen-thi-due.png',
    desc: 'Cổng truy cập học tập, quản lý lớp học và dịch vụ số dành cho nhà trường',
    kicker: 'Đơn vị giáo dục phổ thông',
    edge: 'Nguyễn Thị Duệ',
    classLine: '12A1',
    fallbackDisplayName: 'Học sinh 2025324AK02',
    theme: 'blue',
  },
  university: {
    id: 'university',
    name: 'Trường Đại học Sao Đỏ',
    logo: '/assets/images/logo-sao-do.png',
    desc: 'Cổng đăng nhập tập trung cho đào tạo, quản lý sinh viên và các tiện ích học thuật',
    kicker: 'Đơn vị giáo dục đại học',
    edge: 'Sao Đỏ University',
    classLine: 'DK13-CNTT1',
    facultyLine: 'Khoa Công nghệ thông tin',
    fallbackDisplayName: 'Sinh viên 2200286',
    theme: 'red',
  },
};

const backendSchoolIds: Record<SchoolId, BackendSchoolId> = {
  highschool: 'nguyen-thi-due',
  university: 'sao-do',
};

const panelSchoolIds: Record<BackendSchoolId, SchoolId> = {
  'nguyen-thi-due': 'highschool',
  'sao-do': 'university',
};

const SCHOOL_PORTAL_PRELOAD_ASSETS = [
  '/assets/images/logo-nguyen-thi-due.png',
  '/assets/images/logo-sao-do.png',
  '/assets/images/bg-nguyen-thi-due.png',
  '/assets/images/bg-nguyen-thi-due.webp',
  '/assets/images/bg-sao-do.png',
  '/assets/images/bg-sao-do.webp',
] as const;

const LOGIN_SCREEN_TRANSITION_MS = 420;

function getDisplayName(school: School, stored: string) {
  const name = stored.trim();
  if (!name) return school.fallbackDisplayName;
  if (school.id === 'highschool' && /^Sinh viên\b/i.test(name)) return school.fallbackDisplayName;
  if (school.id === 'university' && /^Học sinh\b/i.test(name)) return school.fallbackDisplayName;
  return name;
}

function isSmallScreen() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches;
}

function supportsWebP() {
  try {
    return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
  } catch {
    return false;
  }
}

function preloadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
    };

    image.decoding = 'async';
    image.onload = () => {
      cleanup();
      resolve(image);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error(`Failed to preload school portal asset: ${src}`));
    };
    image.src = src;

    if (image.complete) {
      cleanup();
      resolve(image);
    }
  });
}

type Props = {
  mode?: PortalMode;
  presetSchool?: BackendSchoolId;
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSchoolSelected?: (schoolId: BackendSchoolId) => void;
  onNavigateToSchool?: (schoolId: BackendSchoolId) => void;
  onBackToSelection?: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function SchoolPortalLogin({
  mode = 'login',
  presetSchool = 'sao-do',
  username,
  password,
  isLoading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSchoolSelected,
  onNavigateToSchool,
  onBackToSelection,
  onSubmit,
}: Props) {
  const initialSelectedSchool = mode === 'login' ? panelSchoolIds[presetSchool] : null;
  const [selectedSchool, setSelectedSchool] = useState<SchoolId | null>(initialSelectedSchool);
  const [assetsReady, setAssetsReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLeavingLogin, setIsLeavingLogin] = useState(false);
  const [storedDisplayName, setStoredDisplayName] = useState('');
  const isAnimatingRef = useRef(false);
  const loginVisibleRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadedAssetsRef = useRef<HTMLImageElement[]>([]);

  const highschoolRef = useRef<HTMLElement | null>(null);
  const universityRef = useRef<HTMLElement | null>(null);
  const particleRefs = useRef<HTMLCanvasElement[]>([]);
  const dividerFxRef = useRef<HTMLCanvasElement | null>(null);
  const dividerBubblesRef = useRef<DividerBubble[]>([]);
  const dividerMotion = useRef({
    seed: Math.random() * 100,
    panelWidth: THREE_DIVIDER_PANEL_WIDTH_PERCENT,
  });
  const hoveredPanelRef = useRef<SchoolId | null>(null);

  const activeSchoolId = selectedSchool ?? initialSelectedSchool ?? 'university';
  const activeSchool = schools[activeSchoolId];
  const activeSchoolSlug = resolveSchoolSlugFromBackendId(backendSchoolIds[activeSchoolId]);
  const brandSideClass = selectedSchool === 'highschool' ? styles.brandRight : styles.brandLeft;
  const brandThemeClass = activeSchool.theme === 'blue' ? styles.themeBlue : styles.themeRed;
  const cardThemeClass = activeSchool.theme === 'blue' ? styles.themeBlueCard : styles.themeRedCard;
  const hasStoredProfile = storedDisplayName.trim().length > 0;
  const greetingName = getDisplayName(activeSchool, storedDisplayName);
  const shouldShowLogin = mode === 'login' || selectedSchool !== null;
  const isLoginMode = shouldShowLogin && !isLeavingLogin;
  const isPanelSelectionEnabled = mode !== 'login' && assetsReady && !isAnimating && selectedSchool === null;

  useEffect(() => {
    if (mode === 'login') {
      setSelectedSchool(panelSchoolIds[presetSchool]);
    }
  }, [mode, presetSchool]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    loginVisibleRef.current = isLoginMode;
  }, [isLoginMode]);

  useEffect(() => {
    let cancelled = false;

    const resolvedAssets = SCHOOL_PORTAL_PRELOAD_ASSETS.filter((src) => {
      if (src.endsWith('.webp')) return supportsWebP();
      if (src.endsWith('.png') && src.includes('/bg-')) return !supportsWebP();
      return true;
    });

    void Promise.all(resolvedAssets.map((src) => preloadImage(src)))
      .then((images) => {
        if (cancelled) return;
        preloadedAssetsRef.current = images;
        setAssetsReady(true);
      })
      .catch((preloadError) => {
        console.error(preloadError);
      });

    const cleanupParticles = initParticleLayers();
    const stopDivider = startOrganicDivider();
    const cleanupDividerFx = initDividerFxLayer();

    return () => {
      cancelled = true;
      preloadedAssetsRef.current = [];
      cleanupParticles();
      stopDivider();
      cleanupDividerFx();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setStoredDisplayName(readSchoolDisplayName(backendSchoolIds[activeSchoolId]));
  }, [activeSchoolId]);

  function selectSchool(schoolId: SchoolId) {
    if (!assetsReady || isAnimatingRef.current || selectedSchool !== null) return;

    if (schoolId === 'highschool') {
      return;
    }
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setIsLeavingLogin(false);
    hoveredPanelRef.current = null;
    spawnDividerBubbles(schoolId);
    setSelectedSchool(schoolId);
    transitionTimerRef.current = setTimeout(() => {
      if (mode === 'gateway') {
        onNavigateToSchool?.(backendSchoolIds[schoolId]);
      } else {
        onSchoolSelected?.(backendSchoolIds[schoolId]);
      }
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, LOGIN_SCREEN_TRANSITION_MS);
  }

  function backToSelection() {
    if ((mode !== 'login' && selectedSchool === null) || isAnimatingRef.current) return;
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setIsLeavingLogin(true);
    hoveredPanelRef.current = null;
    transitionTimerRef.current = setTimeout(() => {
      if (mode === 'login') {
        onBackToSelection?.();
      } else {
        setSelectedSchool(null);
        setIsLeavingLogin(false);
      }
      isAnimatingRef.current = false;
      setIsAnimating(false);
    }, LOGIN_SCREEN_TRANSITION_MS);
  }

  function startOrganicDivider() {
    let frame = 0;
    let lastDraw = -Infinity;
    const frameMs = 1000 / 30;

    const apply = (now = performance.now()) => {
      const hs = highschoolRef.current;
      const uni = universityRef.current;
      if (!hs || !uni) return;

      if (!isSmallScreen()) {
        const target = getThreeDividerTargetWidths(hoveredPanelRef.current);
        const delta = target.highschool - dividerMotion.current.panelWidth;
        const lerp = hoveredPanelRef.current ? 0.55 : 0.35;
        dividerMotion.current.panelWidth += Math.abs(delta) < 0.05 ? delta : delta * lerp;
        const hw = dividerMotion.current.panelWidth;
        const uw = target.highschool + target.university - hw;
        hs.style.width = `${hw}%`;
        uni.style.width = `${uw + 8}%`;
        hs.style.clipPath = buildThreeDividerClipPath(
          dividerMotion.current.seed + now * 0.0014,
          44,
          hw,
        );
      } else {
        dividerMotion.current.panelWidth = THREE_DIVIDER_PANEL_WIDTH_PERCENT;
        hs.style.width = '100%';
        uni.style.width = '100%';
        hs.style.clipPath = 'none';
      }
    };

    const loop = (now = performance.now()) => {
      if (now - lastDraw >= frameMs) {
        lastDraw = now;
        apply(now);
      }
      frame = requestAnimationFrame(loop);
    };

    const handleResize = () => apply();
    apply();
    window.addEventListener('resize', handleResize);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
    };
  }

  function spawnDividerBubbles(schoolId: SchoolId) {
    const canvas = dividerFxRef.current;
    if (!canvas || isSmallScreen()) return;
    const seed = Math.round(performance.now() * 10) + (schoolId === 'highschool' ? 101 : 503);
    dividerBubblesRef.current = [
      ...dividerBubblesRef.current,
      ...buildDividerBubbleBurst(schoolId, canvas.clientWidth, canvas.clientHeight, seed),
    ].slice(-48);
  }

  function initDividerFxLayer() {
    const canvas = dividerFxRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return () => undefined;

    let frame = 0;
    let cw = 1;
    let ch = 1;
    let lastDraw = performance.now();
    const pr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      cw = Math.max(1, r.width);
      ch = Math.max(1, r.height);
      canvas.width = Math.max(1, Math.floor(cw * pr));
      canvas.height = Math.max(1, Math.floor(ch * pr));
      ctx.setTransform(pr, 0, 0, pr, 0, 0);
    };

    const draw = (now = performance.now()) => {
      const delta = Math.min(42, now - lastDraw);
      lastDraw = now;
      ctx.clearRect(0, 0, cw, ch);

      if (!isSmallScreen() && !loginVisibleRef.current) {
        dividerBubblesRef.current = advanceDividerBubbles(dividerBubblesRef.current, delta);
        for (const b of dividerBubblesRef.current) {
          const rgb = b.theme === 'highschool' ? '215, 186, 122' : '225, 74, 95';
          const prog = b.lifeMs / b.maxLifeMs;
          const alpha = b.alpha * Math.max(0, 1 - prog);
          const radius = b.radius * (1 + prog * 0.48);
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.28})`;
          ctx.fill();
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(255,253,248,${alpha * 0.6})`;
          ctx.shadowBlur = 18;
          ctx.shadowColor = `rgba(${rgb},${alpha})`;
          ctx.stroke();
          ctx.restore();
        }
      } else {
        dividerBubblesRef.current = [];
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }

  function initParticleLayers() {
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const cleanups = particleRefs.current.map((canvas) => {
      const ctx = canvas.getContext('2d');
      const panel = canvas.closest(`.${styles.schoolPanel}`) as HTMLElement | null;
      if (!ctx || !panel) return () => undefined;

      const totalCount = isSmallScreen() ? 40 : 120;
      const dots = Array.from({ length: totalCount }, (_, index) => {
        const tier = index < totalCount * 0.6 ? 0 : index < totalCount * 0.88 ? 1 : 2;
        const baseRadius = [0.6, 1.2, 2.0][tier];
        const baseOpacity = [0.3, 0.6, 0.9][tier];
        const parallaxStrength = [8, 20, 38][tier];
        return {
          x: Math.random(),
          y: Math.random(),
          tier,
          driftPhaseX: Math.random() * Math.PI * 2,
          driftPhaseY: Math.random() * Math.PI * 2,
          driftFreqX: 0.15 + Math.random() * 0.35,
          driftFreqY: 0.12 + Math.random() * 0.25,
          radius: baseRadius * (0.7 + Math.random() * 0.6),
          maxOpacity: baseOpacity * (0.65 + Math.random() * 0.35),
          pulsePhase: Math.random() * Math.PI * 2,
          pulseFreq: 0.3 + Math.random() * 0.9,
          parallax: parallaxStrength,
        };
      });

      let frame = 0;
      let cw = 1;
      let ch = 1;
      let last = -Infinity;
      let elapsed = 0;
      const frameMs = 1000 / 40;

      const resize = () => {
        const r = panel.getBoundingClientRect();
        const pr = Math.min(window.devicePixelRatio || 1, 1.5);
        cw = Math.max(1, r.width);
        ch = Math.max(1, r.height);
        canvas.width = Math.max(1, Math.floor(r.width * pr));
        canvas.height = Math.max(1, Math.floor(r.height * pr));
        canvas.style.width = `${r.width}px`;
        canvas.style.height = `${r.height}px`;
        ctx.setTransform(pr, 0, 0, pr, 0, 0);
      };

      const draw = (now = 0) => {
        const dt = Math.min(now - last, 60);
        if (dt < frameMs) {
          frame = requestAnimationFrame(draw);
          return;
        }
        elapsed += dt;
        last = now;
        const t = elapsed * 0.001;

        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        ctx.clearRect(0, 0, cw, ch);

        for (const d of dots) {
          const driftX = Math.cos(t * d.driftFreqX + d.driftPhaseX) * 0.00008;
          const driftY = Math.sin(t * d.driftFreqY + d.driftPhaseY) * 0.00006;
          d.x += driftX;
          d.y += driftY;

          if (d.x < -0.03) d.x = 1.03;
          if (d.x > 1.03) d.x = -0.03;
          if (d.y < -0.03) d.y = 1.03;
          if (d.y > 1.03) d.y = -0.03;

          const pulse = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * d.pulseFreq + d.pulsePhase));
          const alpha = d.maxOpacity * pulse;
          const px = d.x * cw + mouse.x * d.parallax;
          const py = d.y * ch + mouse.y * d.parallax;
          const radius = d.radius;

          const glowRadius = radius * (d.tier === 2 ? 6 : d.tier === 1 ? 4.5 : 3);
          const glow = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
          glow.addColorStop(0, `rgba(255,255,255,${(alpha * 0.5).toFixed(3)})`);
          glow.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.12).toFixed(3)})`);
          glow.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          const core = ctx.createRadialGradient(px, py, 0, px, py, radius);
          core.addColorStop(0, `rgba(255,255,255,${Math.min(1, alpha * 1.4).toFixed(3)})`);
          core.addColorStop(0.6, `rgba(255,255,255,${(alpha * 0.7).toFixed(3)})`);
          core.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fillStyle = core;
          ctx.fill();
        }

        frame = requestAnimationFrame(draw);
      };

      resize();
      window.addEventListener('resize', resize);
      draw();
      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frame);
      };
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cleanups.forEach((cleanup) => cleanup());
    };
  }

  return (
    <main className={styles.portal}>
      <section
        className={[
          styles.selection,
          !assetsReady ? styles.selectionLoading : '',
          isAnimating ? styles.selectionAnimating : '',
        ].filter(Boolean).join(' ')}
        aria-label="Chọn đơn vị đăng nhập"
        aria-hidden={isLoginMode}
      >
        <div className={`${styles.selectionBackdrop} ${styles.selectionBackdropHighschool}`} aria-hidden="true">
          <div className={`${styles.scene} ${styles.nightBeach}`} />
          <div className={styles.panelGlow} />
          <div className={styles.panelLight} />
          <div className={styles.panelShade} />
          <div className={styles.panelNoise} />
        </div>
        <div className={`${styles.selectionBackdrop} ${styles.selectionBackdropUniversity}`} aria-hidden="true">
          <div className={`${styles.scene} ${styles.nightCity}`} />
          <div className={styles.panelGlow} />
          <div className={styles.panelLight} />
          <div className={styles.panelShade} />
          <div className={styles.panelNoise} />
        </div>

        <article
          ref={highschoolRef}
          className={`${styles.schoolPanel} ${styles.highschool} ${!isPanelSelectionEnabled ? styles.panelLocked : ''}`}
          data-school="highschool"
          tabIndex={isPanelSelectionEnabled ? 0 : -1}
          role="button"
          aria-disabled={!isPanelSelectionEnabled}
          aria-label="Chọn Trường THPT Nguyễn Thị Duệ"
          onMouseEnter={() => {
            if (!isPanelSelectionEnabled) return;
            hoveredPanelRef.current = 'highschool';
          }}
          onMouseLeave={() => {
            hoveredPanelRef.current = null;
          }}
          onClick={() => {
            selectSchool('highschool');
          }}
          onKeyDown={(e) => {
            if (!isPanelSelectionEnabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectSchool('highschool');
            }
          }}
        >
          <div className={`${styles.scene} ${styles.nightBeach}`} />
          <div className={styles.panelGlow} />
          <div className={styles.panelLight} />
          <div className={styles.panelShade} />
          <div className={styles.panelNoise} />
          <canvas
            ref={(node) => {
              if (node) particleRefs.current[0] = node;
            }}
            className={styles.particleLayer}
            data-particle-color="77,151,255"
          />
          <span className={styles.edgeMark}>{schools.highschool.edge}</span>
          <div className={styles.panelContent}>
            <div className={styles.logoWrap}>
              <span className={styles.logoOrbit} />
              <img className={styles.logo} src={schools.highschool.logo} alt="Logo Nguyễn Thị Duệ" />
            </div>
            <p className={styles.kicker}>{schools.highschool.kicker}</p>
            <h1 className={styles.title}>{schools.highschool.name}</h1>
            <p className={styles.desc}>{schools.highschool.desc}</p>
          </div>
        </article>

        <article
          ref={universityRef}
          className={`${styles.schoolPanel} ${styles.university} ${!isPanelSelectionEnabled ? styles.panelLocked : ''}`}
          data-school="university"
          tabIndex={isPanelSelectionEnabled ? 0 : -1}
          role="button"
          aria-disabled={!isPanelSelectionEnabled}
          aria-label="Chọn Trường Đại học Sao Đỏ"
          onMouseEnter={() => {
            if (!isPanelSelectionEnabled) return;
            hoveredPanelRef.current = 'university';
          }}
          onMouseLeave={() => {
            hoveredPanelRef.current = null;
          }}
          onClick={() => {
            selectSchool('university');
          }}
          onKeyDown={(e) => {
            if (!isPanelSelectionEnabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectSchool('university');
            }
          }}
        >
          <div className={`${styles.scene} ${styles.nightCity}`} />
          <div className={styles.panelGlow} />
          <div className={styles.panelLight} />
          <div className={styles.panelShade} />
          <div className={styles.panelNoise} />
          <canvas
            ref={(node) => {
              if (node) particleRefs.current[1] = node;
            }}
            className={styles.particleLayer}
            data-particle-color="225,74,95"
          />
          <span className={styles.edgeMark}>{schools.university.edge}</span>
          <div className={styles.panelContent}>
            <div className={styles.logoWrap}>
              <span className={styles.logoOrbit} />
              <img className={styles.logo} src={schools.university.logo} alt="Logo Sao Đỏ" />
            </div>
            <p className={styles.kicker}>{schools.university.kicker}</p>
            <h1 className={styles.title}>
              Trường Đại&nbsp;học
              <br />
              Sao Đỏ
            </h1>
            <p className={styles.desc}>{schools.university.desc}</p>
          </div>
        </article>

        <canvas ref={dividerFxRef} className={styles.dividerFxLayer} aria-hidden="true" />
      </section>

      <section
        className={[
          styles.loginScreen,
          brandSideClass,
          shouldShowLogin ? styles.loginScreenVisible : '',
          isLeavingLogin ? styles.loginScreenLeaving : '',
        ].filter(Boolean).join(' ')}
        aria-hidden={!shouldShowLogin}
      >
        <aside className={`${styles.brandPanel} ${brandThemeClass}`}>
          <div className={`${styles.scene} ${activeSchool.id === 'highschool' ? styles.nightBeach : styles.nightCity}`} />
          <div className={styles.panelGlow} />
          <div className={styles.panelLight} />
          <div className={styles.panelShade} />
          <div className={styles.panelNoise} />
          <span className={`${styles.brandShape} ${styles.brandShapeOne}`} />
          <span className={`${styles.brandShape} ${styles.brandShapeTwo}`} />
          <div className={styles.brandContent}>
            <div className={styles.brandHeader}>
              <div className={styles.brandLogoWrap}>
                <span className={styles.logoOrbit} />
                <img className={styles.brandLogo} src={activeSchool.logo} alt={`Logo ${activeSchool.name}`} />
              </div>
              <p className={styles.brandSchoolName}>{activeSchool.name}</p>
            </div>

            <div className={styles.brandGreeting}>
              <p className={styles.brandHello}>Xin chào,</p>
              <p className={styles.studentName}>
                {hasStoredProfile ? greetingName : activeSchool.fallbackDisplayName}
              </p>
              <div className={styles.studentInfo}>
                <span>{activeSchool.classLine}</span>
                <span>{activeSchool.facultyLine ?? 'Cổng dịch vụ số'}</span>
              </div>
            </div>
          </div>

          <svg className={styles.brandWave} viewBox="0 0 92 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 C34 16 52 32 34 50 C18 66 36 83 0 100 L92 100 L92 0 Z" />
          </svg>
        </aside>

        <section className={styles.loginPanel}>
          <form className={`${styles.loginCard} ${cardThemeClass}`} onSubmit={onSubmit}>
            <p className={styles.loginEyebrow}>{activeSchool.kicker}</p>
            <h2 className={styles.loginTitle}>Đăng nhập</h2>
            <p className={styles.loginSubtitle}>
              <strong>{activeSchool.name}</strong>
              {hasStoredProfile
                ? ` · ${greetingName}`
                : ' · Tiếp tục với đúng đơn vị đã chọn để vào hệ thống.'}
            </p>

            {error && <div className={styles.errorBox}>{error}</div>}

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="username">Email hoặc mã tài khoản</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  autoComplete="username"
                  placeholder="Nhập email hoặc mã khách / mã sinh viên"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">Mật khẩu</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  required
                />
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" name="remember" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <Link className={styles.forgotLink} href={`/forgot-password?school=${activeSchoolSlug}`}>
                Quên mật khẩu?
              </Link>
            </div>

            <div className={styles.actionStack}>
              <button
                className={styles.primaryBtn}
                type="submit"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
              <button className={styles.secondaryBtn} type="button" onClick={backToSelection}>
                Quay lại chọn đơn vị
              </button>
            </div>

            <p className={styles.registerNote}>
              Chưa có tài khoản?{' '}
              <Link className={styles.registerLink} href={`/register?school=${activeSchoolSlug}`}>
                Tạo tài khoản khách
              </Link>
            </p>
            <p className={styles.securityNote}>
              Kết nối được bảo vệ. Tài khoản khách cho phép dùng AI và đọc cộng đồng của trường.
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}
