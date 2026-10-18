import { useCallback, useEffect, useRef, useState } from "react";

const DREAM_ACTIONS = [
  {
    id: "orbital-milk",
    label: "ORBITAL MILK",
    shortLabel: "Bottle launch",
    description: "Cancel gravity. Send one suspiciously powerful bottle into orbit.",
    announcement: "ORBITAL MILK: gravity has been temporarily cancelled. Pip recommends a burp check.",
    accent: "border-cyan-300/30 bg-cyan-300/[0.07] text-cyan-100",
    button: "bg-cyan-200 text-slate-950 hover:bg-cyan-100",
    glyphs: ["✦", "·", "◌", "✧", "🍼"],
    colors: ["#67e8f9", "#c4b5fd", "#f5d98d", "#ffffff"],
    spread: Math.PI * 0.76,
    centerAngle: -Math.PI / 2,
    minSpeed: 2.5,
    maxSpeed: 7.5,
    gravity: 0.045,
    spin: 0.16,
  },
  {
    id: "nap-engine",
    label: "NAP ENGINE",
    shortLabel: "Sleep protocol",
    description: "Optimize the meeting. Replace the spreadsheet with a cloud pillow.",
    announcement: "NAP ENGINE: meeting time converted into a soft seven-minute microdream. Minutes are imaginary.",
    accent: "border-violet-300/30 bg-violet-300/[0.07] text-violet-100",
    button: "bg-violet-200 text-slate-950 hover:bg-violet-100",
    glyphs: ["z", "✧", "☾", "·", "✦"],
    colors: ["#c4b5fd", "#e9d5ff", "#fbcfe8", "#a7f3d0"],
    spread: Math.PI * 0.42,
    centerAngle: -Math.PI / 2,
    minSpeed: 0.8,
    maxSpeed: 3.6,
    gravity: -0.012,
    spin: 0.06,
  },
  {
    id: "union-skulls",
    label: "UNION SKULLS",
    shortLabel: "Bone committee",
    description: "Summon the tiny skull committee. Snacks, breaks, and moon rights are on the agenda.",
    announcement: "UNION SKULLS: the bone committee has convened. Agenda item one: snack equity.",
    accent: "border-fuchsia-300/30 bg-fuchsia-300/[0.07] text-fuchsia-100",
    button: "bg-fuchsia-200 text-slate-950 hover:bg-fuchsia-100",
    glyphs: ["✦", "✧", "◇", "✺", "☻"],
    colors: ["#f0abfc", "#f9a8d4", "#f5d98d", "#c4b5fd"],
    spread: Math.PI * 2,
    centerAngle: 0,
    minSpeed: 2.3,
    maxSpeed: 8.4,
    gravity: 0.032,
    spin: 0.21,
  },
];

/**
 * Interactive engine sandbox. Uses a single canvas and a bounded particle pool;
 * particles are painted imperatively so React does not re-render every frame.
 *
 * @param {{onAnnouncementChange?: (message: string) => void, onAction?: (action: object) => void, onReboot?: (event: {rebootNumber: number}) => void, disabled?: boolean}} props
 */
export default function InteractionMatrix({
  onAnnouncementChange = () => {},
  onAction = () => {},
  onReboot = () => {},
  disabled = false,
}) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const emitterRef = useRef(null);
  const clearEmitterRef = useRef(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [localAnnouncement, setLocalAnnouncement] = useState("ENGINE READY. Awaiting a questionable instruction.");
  const [rebootCount, setRebootCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return undefined;

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const particles = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let disposed = false;
    const maxParticles = 180;
    const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const resizeCanvas = () => {
      const rect = stage.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const drawParticle = (particle) => {
      context.save();
      context.globalAlpha = Math.max(0, Math.min(1, particle.life));
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = particle.size * 1.7;
      context.font = `${particle.size}px ui-rounded, system-ui, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(particle.glyph, 0, 0);
      context.restore();
    };

    const animate = (time) => {
      animationFrame = 0;
      if (disposed) return;

      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 16.667, 2.5) : 1;
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        particle.vx += particle.drift * 0.003 * delta;
        particle.vy += particle.gravity * delta;
        particle.rotation += particle.spin * delta;
        particle.life -= 0.014 * delta;
        drawParticle(particle);
        if (particle.life <= 0 || particle.y > height + 40 || particle.x < -60 || particle.x > width + 60) {
          particles.splice(index, 1);
        }
      }

      if (particles.length > 0) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        lastFrameTime = 0;
      }
    };

    const startAnimation = () => {
      if (!animationFrame && particles.length > 0) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    emitterRef.current = (actionId, sourceElement) => {
      if (reducedMotionQuery?.matches || !sourceElement) return;
      const action = DREAM_ACTIONS.find((item) => item.id === actionId);
      if (!action) return;

      const stageRect = stage.getBoundingClientRect();
      const sourceRect = sourceElement.getBoundingClientRect();
      const originX = sourceRect.left + sourceRect.width / 2 - stageRect.left;
      const originY = sourceRect.top + sourceRect.height / 2 - stageRect.top;
      const particleCount = actionId === "union-skulls" ? 52 : 42;

      for (let index = 0; index < particleCount; index += 1) {
        const angle = action.centerAngle + (Math.random() - 0.5) * action.spread;
        const speed = action.minSpeed + Math.random() * (action.maxSpeed - action.minSpeed);
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          drift: (Math.random() - 0.5) * 0.9,
          gravity: action.gravity,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * action.spin * 2,
          size: 10 + Math.random() * 17,
          life: 0.8 + Math.random() * 0.2,
          color: action.colors[Math.floor(Math.random() * action.colors.length)],
          glyph: action.glyphs[Math.floor(Math.random() * action.glyphs.length)],
        });
      }

      if (particles.length > maxParticles) particles.splice(0, particles.length - maxParticles);
      startAnimation();
    };

    clearEmitterRef.current = () => {
      particles.length = 0;
      context.clearRect(0, 0, width, height);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameTime = 0;
    };

    resizeCanvas();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeCanvas) : null;
    resizeObserver?.observe(stage);
    window.addEventListener("resize", resizeCanvas, { passive: true });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      emitterRef.current = null;
      clearEmitterRef.current = null;
    };
  }, []);

  const handleAction = useCallback((action, sourceElement) => {
    setActiveActionId(action.id);
    setLocalAnnouncement(action.announcement);
    onAnnouncementChange(action.announcement);
    onAction(action);
    emitterRef.current?.(action.id, sourceElement);
  }, [onAction, onAnnouncementChange]);

  const handleReboot = useCallback(() => {
    clearEmitterRef.current?.();
    setActiveActionId(null);
    setLocalAnnouncement("SYSTEM REBOOT COMPLETE. All three modules are standing by.");
    const nextRebootCount = rebootCount + 1;
    setRebootCount(nextRebootCount);
    onAnnouncementChange("SYSTEM REBOOT COMPLETE. All three modules are standing by.");
    onReboot({ rebootNumber: nextRebootCount });
  }, [onAnnouncementChange, onReboot, rebootCount]);

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/20" aria-labelledby="interaction-matrix-title">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">Core engine / 01</p>
          <h2 id="interaction-matrix-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-100">Interaction matrix</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-400">Three buttons. Three questionable experiments. One very small liability waiver.</p>
        </div>
        <span className="rounded-full border border-amber-200/20 bg-amber-200/[0.07] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-100">Sandbox: armed</span>
      </header>

      <div ref={stageRef} className="relative isolate overflow-hidden p-4 sm:p-5">
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" />
        <div className="relative z-0 grid gap-3 md:grid-cols-3">
          {DREAM_ACTIONS.map((action, index) => {
            const isActive = activeActionId === action.id;
            return (
              <button
                key={action.id}
                type="button"
                disabled={disabled}
                onClick={(event) => handleAction(action, event.currentTarget)}
                aria-pressed={isActive}
                className={`group relative flex min-h-48 flex-col overflow-hidden rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none motion-reduce:transition-none ${action.accent} ${isActive ? "ring-2 ring-white/70 ring-offset-2 ring-offset-slate-950" : ""}`}
              >
                <span className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.18em] opacity-70">
                  <span>Module 0{index + 1}</span>
                  <span>{isActive ? "ACTIVE" : "STANDBY"}</span>
                </span>
                <span aria-hidden="true" className="mt-4 text-4xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 motion-reduce:transform-none">{index === 0 ? "🍼" : index === 1 ? "☾" : "☻"}</span>
                <span className="mt-3 text-base font-semibold tracking-wide">{action.label}</span>
                <span className="mt-1 flex-1 text-xs leading-relaxed text-slate-300">{action.description}</span>
                <span className={`mt-4 inline-flex w-fit items-center rounded-lg px-3 py-2 font-mono text-[10px] font-bold tracking-wider transition ${action.button}`}>RUN MODULE <span aria-hidden="true" className="ml-2">↗</span></span>
              </button>
            );
          })}
        </div>

        <div className="relative z-0 mt-4 rounded-2xl border border-white/10 bg-[#080a12] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">kernel / latest announcement</p>
            <span className="font-mono text-[10px] text-emerald-300">STDOUT</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200" role="status" aria-live="polite" aria-atomic="true">› {localAnnouncement}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="font-mono text-[10px] text-slate-500">REBOOTS IN THIS SESSION: <span className="text-slate-300">{String(rebootCount).padStart(2, "0")}</span></p>
            <button
              type="button"
              onClick={handleReboot}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/[0.08] px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-rose-100 transition hover:border-rose-200/50 hover:bg-rose-300/[0.14] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
            >
              <span aria-hidden="true">⟲</span> Reboot system
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
