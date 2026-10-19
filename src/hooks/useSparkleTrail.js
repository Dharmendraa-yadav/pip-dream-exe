import { useEffect, useRef } from "react";

const DEFAULT_MAX_PARTICLES = 48;
const DEFAULT_LIFESPAN_MS = 760;
const DEFAULT_SPAWN_INTERVAL_MS = 28;
const DEFAULT_BURST_PARTICLES = 9;
const MAX_PARTICLE_LIMIT = 96;
const MAX_BURST_PARTICLES = 18;
const MAX_DEVICE_PIXEL_RATIO = 2;
const CHIME_COOLDOWN_MS = 72;
const STAR_COLORS = ["#d9a6c7", "#d5bd78", "#cbbaf2", "#f6e8f1"];

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function drawStar(context, radius, innerRadius, points = 4) {
  context.beginPath();
  for (let index = 0; index < points * 2; index += 1) {
    const angle = (index * Math.PI) / points - Math.PI / 2;
    const pointRadius = index % 2 === 0 ? radius : innerRadius;
    const x = Math.cos(angle) * pointRadius;
    const y = Math.sin(angle) * pointRadius;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

/**
 * Canvas-based sparkle trail with bounded particle memory and on-demand RAF.
 *
 * Audio is intentionally delegated to the caller. Pass the `playSparkleChime`
 * method from the shared LullabyLabEngine; this hook never creates an
 * AudioContext or bypasses the application's master mute.
 *
 * Usage:
 * const { canvasRef } = useSparkleTrail({
 *   enabled: started,
 *   soundEnabled,
 *   onChime: ({ frequency }) => engineRef.current?.playSparkleChime({ frequency }),
 * });
 * return <><canvas ref={canvasRef} aria-hidden="true" /><AppContent /></>;
 */
export function useSparkleTrail({
  enabled = true,
  soundEnabled = true,
  onChime,
  maxParticles = DEFAULT_MAX_PARTICLES,
  lifespanMs = DEFAULT_LIFESPAN_MS,
  spawnIntervalMs = DEFAULT_SPAWN_INTERVAL_MS,
  burstParticles = DEFAULT_BURST_PARTICLES,
} = {}) {
  const canvasRef = useRef(null);
  const onChimeRef = useRef(onChime);
  const soundEnabledRef = useRef(soundEnabled);

  // Keep callback changes fresh without reinstalling pointer handlers.
  useEffect(() => {
    onChimeRef.current = onChime;
    soundEnabledRef.current = soundEnabled;
  }, [onChime, soundEnabled]);

  const safeMaxParticles = Math.round(clampNumber(
    maxParticles,
    1,
    MAX_PARTICLE_LIMIT,
    DEFAULT_MAX_PARTICLES,
  ));
  const safeLifespanMs = clampNumber(lifespanMs, 220, 1800, DEFAULT_LIFESPAN_MS);
  const safeSpawnIntervalMs = clampNumber(
    spawnIntervalMs,
    16,
    180,
    DEFAULT_SPAWN_INTERVAL_MS,
  );
  const safeBurstParticles = Math.round(clampNumber(
    burstParticles,
    2,
    MAX_BURST_PARTICLES,
    DEFAULT_BURST_PARTICLES,
  ));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas || typeof window === "undefined") return undefined;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reducedMotion = Boolean(reducedMotionQuery?.matches);
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrameId = 0;
    let lastFrameAt = 0;
    let lastSpawnAt = -Infinity;
    let lastChimeAt = -Infinity;
    let nextParticleId = 0;
    const particles = [];

    const resizeCanvas = () => {
      const viewportWidth = Math.max(1, window.innerWidth);
      const viewportHeight = Math.max(1, window.innerHeight);
      pixelRatio = Math.min(MAX_DEVICE_PIXEL_RATIO, Math.max(1, window.devicePixelRatio || 1));
      width = viewportWidth;
      height = viewportHeight;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    const requestFrame = () => {
      if (!animationFrameId) animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    const emitChime = (source) => {
      const now = window.performance?.now?.() ?? Date.now();
      if (!soundEnabledRef.current || now - lastChimeAt < CHIME_COOLDOWN_MS) return;
      const callback = onChimeRef.current;
      if (typeof callback !== "function") return;

      lastChimeAt = now;
      // Keep sound generation outside the render loop and fail silently if the
      // audio engine is currently unavailable or its browser context is locked.
      const frequency = Math.round(600 + Math.random() * 600);
      try {
        Promise.resolve(callback({ frequency, source })).catch(() => {});
      } catch {
        // Decorative audio must never interrupt the pointer interaction.
      }
    };

    const addParticle = (x, y, now, options = {}) => {
      const angle = options.angle ?? Math.random() * Math.PI * 2;
      const speed = options.speed ?? 12 + Math.random() * 28;
      const isBurst = Boolean(options.isBurst);
      nextParticleId += 1;
      particles.push({
        id: nextParticleId,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isBurst ? 10 : 16),
        gravity: isBurst ? 42 : 18,
        bornAt: now,
        lastAt: now,
        lifespan: safeLifespanMs * (isBurst ? 0.84 + Math.random() * 0.3 : 0.7 + Math.random() * 0.5),
        size: isBurst ? 3.5 + Math.random() * 4.5 : 2.5 + Math.random() * 3,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * (isBurst ? 5 : 2.5),
        isBurst,
      });

      if (particles.length > safeMaxParticles) {
        particles.splice(0, particles.length - safeMaxParticles);
      }
    };

    const explodeAt = (x, y, now) => {
      if (!reducedMotion) {
        for (let index = 0; index < safeBurstParticles; index += 1) {
          const angle = (Math.PI * 2 * index) / safeBurstParticles + Math.random() * 0.22;
          addParticle(x, y, now, {
            angle,
            speed: 48 + Math.random() * 92,
            isBurst: true,
          });
        }
        requestFrame();
      }
      // A single throttled harmonic cue accompanies each visual burst/click.
      emitChime("cursor-burst");
    };

    const drawFrame = (now) => {
      animationFrameId = 0;
      const deltaSeconds = lastFrameAt > 0
        ? Math.min(0.034, Math.max(0, now - lastFrameAt) / 1000)
        : 1 / 60;
      lastFrameAt = now;
      context.clearRect(0, 0, width, height);

      let writeIndex = 0;
      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        const age = now - particle.bornAt;
        if (age >= particle.lifespan) continue;

        const step = deltaSeconds * (particle.isBurst ? 1 : 0.8);
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;
        particle.vy += particle.gravity * step;
        particle.rotation += particle.spin * step;
        particle.lastAt = now;

        const progress = Math.max(0, Math.min(1, age / particle.lifespan));
        const fade = 1 - progress;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.globalAlpha = fade * (particle.isBurst ? 0.92 : 0.72);
        context.fillStyle = particle.color;
        context.shadowColor = particle.color;
        context.shadowBlur = particle.isBurst ? 7 : 3;
        drawStar(context, particle.size * (0.55 + fade * 0.45), particle.size * 0.2);
        context.restore();

        particles[writeIndex] = particle;
        writeIndex += 1;
      }
      particles.length = writeIndex;

      // Render only while particles remain. Pointer events restart RAF on demand,
      // avoiding a permanent animation loop while the visitor is idle.
      if (particles.length > 0) requestFrame();
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      if (reducedMotion) return;

      const now = window.performance?.now?.() ?? Date.now();
      if (now - lastSpawnAt < safeSpawnIntervalMs) return;
      lastSpawnAt = now;
      addParticle(event.clientX, event.clientY, now);
      requestFrame();
    };

    const handlePointerDown = (event) => {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const now = window.performance?.now?.() ?? Date.now();
      explodeAt(event.clientX, event.clientY, now);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        particles.length = 0;
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
        context.clearRect(0, 0, width, height);
      }
    };

    const handleMotionPreferenceChange = (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        particles.length = 0;
        if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
        context.clearRect(0, 0, width, height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionQuery?.addEventListener?.("change", handleMotionPreferenceChange);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionQuery?.removeEventListener?.("change", handleMotionPreferenceChange);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      particles.length = 0;
      context.clearRect(0, 0, width, height);
    };
  }, [enabled, safeBurstParticles, safeLifespanMs, safeMaxParticles, safeSpawnIntervalMs]);

  return { canvasRef, isEnabled: enabled };
}

export default useSparkleTrail;
