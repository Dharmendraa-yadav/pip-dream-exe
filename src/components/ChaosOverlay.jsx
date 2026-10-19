import { useEffect, useId, useState } from "react";

const DEFAULT_STAR_COUNT = 22;
const MAX_STAR_COUNT = 64;

/**
 * Opt-in 1999-era visual layer.
 *
 * The control supports both controlled use (App owns `enabled`) and standalone
 * use (`defaultEnabled`). Its effect owns every injected style, node and event
 * listener, so disabling or unmounting it restores the base theme cleanly.
 */
export default function ChaosOverlay({
  enabled: controlledEnabled,
  defaultEnabled = false,
  onToggle,
  onChange,
  label = "1999 Chaos Mode",
  enabledLabel = "✦ Calm the chaos",
  disabledLabel = "🌀 Chaos mode",
  className = "",
  starCount = DEFAULT_STAR_COUNT,
  cursorTrail = true,
}) {
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const reactId = useId();
  const scopeToken = reactId.replace(/[^a-zA-Z0-9_-]/g, "") || "pip-chaos";
  const scopeClass = `pip-chaos-enabled-${scopeToken}`;
  const skyClass = `pip-chaos-sky-${scopeToken}`;
  const trailClass = `pip-chaos-trail-${scopeToken}`;
  const isControlled = typeof controlledEnabled === "boolean";
  const enabled = isControlled ? controlledEnabled : internalEnabled;
  const safeStarCount = Math.max(0, Math.min(MAX_STAR_COUNT, Math.floor(Number(starCount) || 0)));

  useEffect(() => {
    onChange?.(enabled);
  }, [enabled, onChange]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const style = document.createElement("style");
    style.dataset.pipChaosOverlay = scopeToken;
    style.textContent = `
      body.${scopeClass} :where(a, button, [role="button"], h1, h2, [data-chaos-text]) {
        text-shadow: 1px 1px 0 #f5a7d2, -1px -1px 0 #8fbaff;
      }
      body.${scopeClass} main {
        filter: hue-rotate(4deg) saturate(1.06);
      }
      body.${scopeClass} img[src$="/favicon.svg"],
      body.${scopeClass} img[src$="/icons.svg"],
      body.${scopeClass} img[src$="/dist/favicon.svg"],
      body.${scopeClass} img[src$="/dist/icons.svg"],
      body.${scopeClass} img[src*="icons.svg#"] {
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
      body.${scopeClass} :where(svg, svg use[href*="icons.svg"]) {
        shape-rendering: crispEdges;
      }
      .${skyClass} {
        position: fixed;
        inset: 0;
        z-index: 9990;
        overflow: hidden;
        pointer-events: none;
        opacity: .62;
      }
      .${skyClass} .pip-chaos-star {
        position: absolute;
        top: -2rem;
        color: #f4d58a;
        font: 700 12px/1 monospace;
        text-shadow: 0 0 8px #f4d58a;
        animation: pip-chaos-fall-${scopeToken} var(--fall-duration, 8s) linear var(--fall-delay, 0s) infinite;
        will-change: transform;
      }
      .${trailClass} {
        position: fixed;
        z-index: 10000;
        pointer-events: none;
        color: #f5a7d2;
        font: 700 12px/1 monospace;
        text-shadow: 0 0 8px #f5a7d2;
        animation: pip-chaos-fade-${scopeToken} 420ms ease-out forwards;
        will-change: transform, opacity;
      }
      @keyframes pip-chaos-fall-${scopeToken} {
        to { transform: translateY(110vh) rotate(360deg); }
      }
      @keyframes pip-chaos-fade-${scopeToken} {
        from { opacity: .9; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -110%) scale(.25) rotate(35deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .${skyClass} .pip-chaos-star { animation: none; top: 8%; opacity: .4; }
        .${trailClass} { animation: none; opacity: .35; }
        body.${scopeClass} main { filter: none; }
      }
    `;

    const sky = document.createElement("div");
    sky.className = skyClass;
    sky.setAttribute("aria-hidden", "true");

    // A strict upper bound keeps the decorative layer lightweight on mobile.
    for (let index = 0; index < safeStarCount; index += 1) {
      const star = document.createElement("span");
      star.className = "pip-chaos-star";
      star.textContent = index % 3 === 0 ? "✦" : "✧";
      star.style.left = `${(index * 37) % 100}%`;
      star.style.setProperty("--fall-duration", `${6 + (index % 7)}s`);
      star.style.setProperty("--fall-delay", `${-((index * 0.71) % 10)}s`);
      sky.appendChild(star);
    }

    document.head.appendChild(style);
    document.body.classList.add(scopeClass);
    document.body.appendChild(sky);

    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    let reducedMotion = Boolean(motionQuery?.matches);
    let lastTrailAt = 0;
    const liveTrails = new Set();

    const removeTrails = () => {
      for (const trail of liveTrails) trail.remove();
      liveTrails.clear();
    };

    const onMotionPreferenceChange = (event) => {
      reducedMotion = event.matches;
      if (reducedMotion) removeTrails();
    };

    motionQuery?.addEventListener?.("change", onMotionPreferenceChange);

    const onPointerMove = (event) => {
      if (!cursorTrail || reducedMotion || event.pointerType === "touch") return;
      if (event.timeStamp - lastTrailAt < 28) return;
      lastTrailAt = event.timeStamp;

      const trail = document.createElement("span");
      trail.className = trailClass;
      trail.textContent = "✧";
      trail.setAttribute("aria-hidden", "true");
      trail.style.left = `${event.clientX}px`;
      trail.style.top = `${event.clientY}px`;
      trail.addEventListener("animationend", () => {
        liveTrails.delete(trail);
        trail.remove();
      }, { once: true });
      liveTrails.add(trail);
      document.body.appendChild(trail);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      motionQuery?.removeEventListener?.("change", onMotionPreferenceChange);
      for (const trail of liveTrails) trail.remove();
      liveTrails.clear();
      sky.remove();
      style.remove();
      document.body.classList.remove(scopeClass);
    };
  }, [enabled, scopeToken, scopeClass, skyClass, trailClass, safeStarCount, cursorTrail]);

  const handleToggle = () => {
    const nextEnabled = !enabled;
    if (!isControlled) setInternalEnabled(nextEnabled);
    onToggle?.(nextEnabled);
  };

  return (
    <button
      type="button"
      className={className || "pip-chaos-toggle"}
      aria-label={`${label}: ${enabled ? "enabled" : "disabled"}`}
      aria-pressed={enabled}
      title="Temporarily add a nostalgic early-web visual layer."
      data-dream-audio-ignore
      onClick={handleToggle}
    >
      <span aria-hidden="true">{enabled ? "✦" : "✧"}</span>
      {enabled ? enabledLabel : disabledLabel}
    </button>
  );
}
