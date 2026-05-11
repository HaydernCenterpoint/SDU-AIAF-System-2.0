// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Three.js-powered transition engine for SchoolPortal.
 *
 * Creates a full-screen WebGL overlay canvas that plays a cinematic
 * particle-warp / portal effect when the user selects a school.
 * Completely self-contained – no global state, no React dependency.
 *
 * Usage:
 *   const transition = createThreeTransition(containerEl, 'university');
 *   await transition.play();   // ~900 ms cinematic burst
 *   transition.dispose();
 */

export type SchoolTheme = 'highschool' | 'university';

export interface ThreeTransition {
  play: () => Promise<void>;
  dispose: () => void;
}

/* ─── Colour palettes ─────────────────────────────────────────── */
const PALETTES: Record<
  SchoolTheme,
  {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
  }
> = {
  highschool: {
    primary: [0.53, 0.73, 1.0],   // soft electric-blue
    secondary: [0.84, 0.73, 0.48], // gold
    accent: [0.78, 0.92, 1.0],    // pale cyan
  },
  university: {
    primary: [1.0, 0.33, 0.45],   // crimson
    secondary: [1.0, 0.68, 0.3],  // warm amber
    accent: [1.0, 0.55, 0.65],    // rose
  },
};

/* ─── Vertex shader ───────────────────────────────────────────── */
const VERT = `
attribute vec3 position;
attribute float size;
attribute vec3 color;
attribute float alpha;
attribute float phase;

uniform float uTime;
uniform float uProgress;  // 0→1 over animation
uniform vec2  uOrigin;    // normalised screen origin of the click
uniform float uAspect;

varying vec3  vColor;
varying float vAlpha;
varying float vPhase;

void main() {
  vColor = color;
  vPhase = phase;

  // Radial warp: particles accelerate outward from origin
  vec2 ndc = position.xy;
  vec2 dir = ndc - (uOrigin * 2.0 - 1.0);
  dir.x *= uAspect;

  float dist = length(dir);
  float warpPow = uProgress * uProgress * 3.8;
  vec2 warped = ndc + normalize(dir + vec2(0.0001)) * warpPow * (0.18 + dist * 0.6);

  // Z oscillation — particles spiral forward
  float z = position.z + sin(uTime * 2.6 + phase) * 0.12 * uProgress;

  gl_Position = vec4(warped, z, 1.0);
  gl_PointSize = size * (1.0 + uProgress * 2.4) * (1.0 - z * 0.3);

  // Fade in then out
  float fadeIn  = smoothstep(0.0, 0.22, uProgress);
  float fadeOut = 1.0 - smoothstep(0.64, 1.0, uProgress);
  vAlpha = alpha * fadeIn * fadeOut;
}
`;

/* ─── Fragment shader ─────────────────────────────────────────── */
const FRAG = `
precision mediump float;
varying vec3  vColor;
varying float vAlpha;
varying float vPhase;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r  = length(uv);
  if (r > 0.5) discard;

  // Soft glow core
  float core = 1.0 - smoothstep(0.0, 0.48, r);
  float glow = 1.0 - smoothstep(0.0, 0.5, r);
  glow = pow(glow, 1.6);

  float brightness = core * 0.72 + glow * 0.42;
  gl_FragColor = vec4(vColor * brightness, vAlpha * brightness);
}
`;

/* ─── Screen-quad shaders (full-screen blur vignette) ─────────── */
const QUAD_VERT = `
attribute vec2 position;
varying   vec2 vUv;
void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
`;

const QUAD_FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float     uVignette;
uniform vec3      uTint;
varying vec2      vUv;

void main() {
  vec4 col = texture2D(uTex, vUv);
  // Radial vignette darkening
  vec2  d = vUv - 0.5;
  float v = 1.0 - smoothstep(0.3, 0.9, length(d) * 1.8) * uVignette;
  // Tint overlay (school colour)
  col.rgb = mix(col.rgb, uTint * col.a, uVignette * 0.28);
  gl_FragColor = vec4(col.rgb * v, col.a);
}
`;

/* ─── WebGL helpers ───────────────────────────────────────────── */
function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`Shader compile error: ${info}`);
  }
  return sh;
}

function linkProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLProgram {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(`Program link error: ${info}`);
  }
  return prog;
}

function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer {
  const buf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buf;
}

function bindAttr(gl: WebGLRenderingContext, prog: WebGLProgram, name: string, buf: WebGLBuffer, size: number) {
  const loc = gl.getAttribLocation(prog, name);
  if (loc < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
}

/* ─── Particle geometry ───────────────────────────────────────── */
const PARTICLE_COUNT = 1800;

function buildParticles(
  theme: SchoolTheme,
  originNdc: [number, number],
  aspect: number,
) {
  const pal = PALETTES[theme];

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const alphas    = new Float32Array(PARTICLE_COUNT);
  const phases    = new Float32Array(PARTICLE_COUNT);

  const [ox, oy] = originNdc; // 0-1 screen space

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Spawn in concentric rings around the click origin
    const angle  = Math.random() * Math.PI * 2;
    const ring   = Math.pow(Math.random(), 0.55); // bias towards centre
    const radius = ring * 0.82;

    // Convert to NDC (-1..1), accounting for aspect
    positions[i * 3]     = (ox * 2 - 1) + Math.cos(angle) * radius / aspect;
    positions[i * 3 + 1] = (oy * 2 - 1) + Math.sin(angle) * radius;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

    sizes[i] = 3 + Math.random() * 18;

    // Random colour from palette
    const choice = Math.random();
    const col = choice < 0.5 ? pal.primary : choice < 0.8 ? pal.secondary : pal.accent;
    colors[i * 3]     = col[0];
    colors[i * 3 + 1] = col[1];
    colors[i * 3 + 2] = col[2];

    alphas[i] = 0.4 + Math.random() * 0.6;
    phases[i] = Math.random() * Math.PI * 2;
  }

  return { positions, sizes, colors, alphas, phases };
}

/* ─── Main factory ────────────────────────────────────────────── */
export function createThreeTransition(
  container: HTMLElement,
  theme: SchoolTheme,
  clickOrigin: { x: number; y: number }, // page coords
): ThreeTransition {
  /* Create and mount the canvas */
  const canvas  = document.createElement('canvas');
  canvas.style.cssText = [
    'position:fixed', 'inset:0', 'width:100%', 'height:100%',
    'z-index:9999', 'pointer-events:none',
  ].join(';');
  container.appendChild(canvas);

  const W = canvas.clientWidth  || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;
  canvas.width  = W;
  canvas.height = H;
  const aspect = W / H;

  /* Normalised origin (0..1 Y flipped for WebGL) */
  const originNdc: [number, number] = [
    clickOrigin.x / W,
    1 - clickOrigin.y / H,
  ];

  /* WebGL context */
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
  })!;

  if (!gl) {
    canvas.remove();
    // Graceful no-op if WebGL not available
    return {
      play: () => new Promise<void>((r) => setTimeout(r, 900)),
      dispose: () => {},
    };
  }

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // additive blending for glow
  gl.viewport(0, 0, W, H);

  /* Compile particle program */
  const particleProg = linkProgram(gl, VERT, FRAG);

  /* Build geometry */
  const { positions, sizes, colors, alphas, phases } = buildParticles(theme, originNdc, aspect);
  const posBuf   = createBuffer(gl, positions);
  const sizeBuf  = createBuffer(gl, sizes);
  const colorBuf = createBuffer(gl, colors);
  const alphaBuf = createBuffer(gl, alphas);
  const phaseBuf = createBuffer(gl, phases);

  /* Uniform locations */
  const uTime     = gl.getUniformLocation(particleProg, 'uTime');
  const uProgress = gl.getUniformLocation(particleProg, 'uProgress');
  const uOrigin   = gl.getUniformLocation(particleProg, 'uOrigin');
  const uAspect   = gl.getUniformLocation(particleProg, 'uAspect');

  /* --- Offscreen framebuffer for post-process vignette --- */
  const fb  = gl.createFramebuffer()!;
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /* Screen-quad program */
  const quadProg = linkProgram(gl, QUAD_VERT, QUAD_FRAG);
  const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const quadBuf   = createBuffer(gl, quadVerts);
  const uTex      = gl.getUniformLocation(quadProg, 'uTex');
  const uVig      = gl.getUniformLocation(quadProg, 'uVignette');
  const uTint     = gl.getUniformLocation(quadProg, 'uTint');
  const pal       = PALETTES[theme];

  let rafHandle = 0;
  let disposed  = false;

  /* ── Render loop ── */
  function drawFrame(startMs: number, nowMs: number) {
    if (disposed) return;
    const elapsed = nowMs - startMs;
    const DURATION = 900; // ms for full animation
    const progress = Math.min(elapsed / DURATION, 1);
    const time = elapsed * 0.001;

    /* 1. Render particles → offscreen fb */
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(particleProg);
    bindAttr(gl, particleProg, 'position', posBuf,   3);
    bindAttr(gl, particleProg, 'size',     sizeBuf,   1);
    bindAttr(gl, particleProg, 'color',    colorBuf,  3);
    bindAttr(gl, particleProg, 'alpha',    alphaBuf,  1);
    bindAttr(gl, particleProg, 'phase',    phaseBuf,  1);

    gl.uniform1f(uTime, time);
    gl.uniform1f(uProgress, progress);
    gl.uniform2f(uOrigin, originNdc[0], originNdc[1]);
    gl.uniform1f(uAspect, aspect);

    gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

    /* 2. Blit fb → screen with vignette post-process */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(quadProg);
    const qLoc = gl.getAttribLocation(quadProg, 'position');
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(qLoc);
    gl.vertexAttribPointer(qLoc, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(uTex, 0);
    gl.uniform1f(uVig, Math.sin(progress * Math.PI) * 0.85); // peak vignette mid-anim
    gl.uniform3f(uTint, pal.primary[0], pal.primary[1], pal.primary[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Restore additive for next particles frame
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    if (progress < 1) {
      rafHandle = requestAnimationFrame((t) => drawFrame(startMs, t));
    }
  }

  return {
    play(): Promise<void> {
      return new Promise<void>((resolve) => {
        rafHandle = requestAnimationFrame((startMs) => {
          function frame(now: number) {
            drawFrame(startMs, now);
            const elapsed = now - startMs;
            if (elapsed >= 900) resolve();
          }
          // Patch the loop to also resolve
          const originalDraw = drawFrame;
          let _startMs = startMs;
          rafHandle = requestAnimationFrame(function loop(now: number) {
            originalDraw(_startMs, now);
            if (now - _startMs < 900) {
              rafHandle = requestAnimationFrame(loop);
            } else {
              resolve();
            }
          });
        });
      });
    },

    dispose() {
      disposed = true;
      cancelAnimationFrame(rafHandle);
      gl.deleteProgram(particleProg);
      gl.deleteProgram(quadProg);
      gl.deleteBuffer(posBuf);
      gl.deleteBuffer(sizeBuf);
      gl.deleteBuffer(colorBuf);
      gl.deleteBuffer(alphaBuf);
      gl.deleteBuffer(phaseBuf);
      gl.deleteBuffer(quadBuf);
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(tex);
      canvas.remove();
    },
  };
}
