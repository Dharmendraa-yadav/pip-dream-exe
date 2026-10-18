import { createElement, useEffect, useRef, useState } from "react";

const TRAIL_EMOJIS = ["🍼", "💀", "✨", "💤"];
const DEFAULT_MAX_PARTICLES = 22;
const DEFAULT_LIFESPAN_MS = 880;
const DEFAULT_SPAWN_INTERVAL_MS = 58;
const UI_FRAME_INTERVAL_MS = 32;

/**
 * Emits a bounded, pointer-events-none DOM sparkle trail.
 * Render the returned `trailLayer` once near the top of the app tree:
 *   const { trailLayer } = useSparkleTrail({ enabled: started });
 *   return <>{trailLayer}<AppContent /></>;
 */
export function useSparkleTrail({
  enabled = true,
  maxParticles = DEFAULT_MAX_PARTICLES,
  lifespanMs = DEFAULT_LIFESPAN_MS,
  spawnIntervalMs = DEFAULT_SPAWN_INTERVAL_MS,
} = {}) {
  const [pointer, setPointer] = useState({ x: 0, y: 0, visible: false });
  const [particles, setParticles] = useState([]);
  const particleRef = useRef([]);
  const latestPointerRef = useRef({ x: 0, y: 0, visible: false });
  const pointerDirtyRef = useRef(false);
  const particleIdRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return undefined;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const noHover = window.matchMedia?.("(hover: none)");
    if (reducedMotion?.matches || noHover?.matches) return undefined;

    const safeMaxParticles = Number.isFinite(maxParticles)
      ? Math.max(1, Math.min(48, Math.floor(maxParticles)))
      : DEFAULT_MAX_PARTICLES;
    const safeLifespan = Number.isFinite(lifespanMs)
      ? Math.max(240, Math.min(1800, lifespanMs))
      : DEFAULT_LIFESPAN_MS;
    const safeSpawnInterval = Number.isFinite(spawnIntervalMs)
      ? Math.max(28, Math.min(180, spawnIntervalMs))
      : DEFAULT_SPAWN_INTERVAL_MS;

    let animationFrameId = 0;
    let lastSpawnAt = 0;
    let lastPublishedAt = 0;

    const requestFrame = () => {
      if (!animationFrameId) animationFrameId = window.requestAnimationFrame(tick);
    };

    const tick = (now) => {
      animationFrameId = 0;
      const alive = particleRef.current.filter((particle) => now - particle.bornAt < safeLifespan);
      particleRef.current = alive;

      if (now - lastPublishedAt >= UI_FRAME_INTERVAL_MS || alive.length === 0) {
        const rendered = alive.map((particle) => {
          const age = Math.max(0, now - particle.bornAt);
          const progress = Math.min(1, age / safeLifespan);
          const drift = 10 + progress * 22;
          return {
            ...particle,
            opacity: Math.max(0, 1 - progress),
            translateX: Math.cos(particle.angle) * drift,
            translateY: -drift * 0.75,
            scale: 0.62 + (1 - progress) * 0.42,
          };
        });
        setParticles(rendered);
        if (pointerDirtyRef.current) {
          setPointer({ ...latestPointerRef.current });
          pointerDirtyRef.current = false;
        }
        lastPublishedAt = now;
      }

      if (alive.length > 0) animationFrameId = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event) => {
      if (event.pointerType === "touch") return;
      const x = event.clientX;
      const y = event.clientY;
      latestPointerRef.current = { x, y, visible: true };
      pointerDirtyRef.current = true;

      const now = window.performance?.now?.() ?? Date.now();
      if (now - lastSpawnAt >= safeSpawnInterval) {
        const id = particleIdRef.current + 1;
        particleIdRef.current = id;
        particleRef.current = [
          ...particleRef.current,
          {
            id,
            x,
            y,
            bornAt: now,
            emoji: TRAIL_EMOJIS[(id - 1) % TRAIL_EMOJIS.length],
            angle: id * 2.399963229728653,
          },
        ].slice(-safeMaxParticles);
        lastSpawnAt = now;
      }

      requestFrame();
    };

    const handlePointerLeave = () => {
      latestPointerRef.current = { ...latestPointerRef.current, visible: false };
      pointerDirtyRef.current = true;
      requestFrame();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
      particleRef.current = [];
    };
  }, [enabled, lifespanMs, maxParticles, spawnIntervalMs]);

  const trailLayer = createElement(
    "div",
    {
      className: "dream-sparkle-trail-layer pointer-events-none fixed inset-0 overflow-hidden",
      "aria-hidden": true,
      style: {
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 80,
      },
    },
    particles.map((particle) => createElement(
      "span",
      {
        key: particle.id,
        className: "dream-sparkle-particle absolute select-none",
        style: {
          position: "absolute",
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          opacity: particle.opacity,
          transform: `translate(-50%, -50%) translate(${particle.translateX}px, ${particle.translateY}px) scale(${particle.scale})`,
          willChange: "transform, opacity",
        },
      },
      particle.emoji,
    )),
  );

  return { pointer: { ...pointer, visible: enabled && pointer.visible }, particles: enabled ? particles : [], trailLayer };
}

export default useSparkleTrail;
