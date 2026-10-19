import { useState } from "react";

const WORKSHOP_MANIFEST = [
  {
    id: "milk-orbit",
    code: "WRK-001",
    name: "Infinite Milk Bottle Flight Simulator",
    category: "Orbital logistics",
    summary: "Tests whether a bottle can reach low orbit without spilling a single drop.",
    status: "NOMINAL",
    statusTone: "emerald",
    icon: "🍼",
    accent: "from-cyan-300/10 to-transparent",
    specs: [
      { label: "Propulsion", value: "Burp-assisted liquid rocket" },
      { label: "Payload", value: "900 mL moon dairy" },
      { label: "Safety rating", value: "Pending adult supervision" },
    ],
    statusHistory: [
      { id: "m1", time: "T-00:04", state: "CALIBRATED", detail: "Bottle gyroscope passed its wiggle test.", tone: "emerald" },
      { id: "m2", time: "T-00:02", state: "FLIGHT CHECK", detail: "One burp detected in the ignition chamber.", tone: "violet" },
      { id: "m3", time: "T-00:00", state: "NOMINAL", detail: "Orbit stable. Crumbs remain unexplained.", tone: "emerald" },
    ],
  },
  {
    id: "nap-engine",
    code: "WRK-002",
    name: "Corporate Nap-Time Optimization Engine",
    category: "Rest infrastructure",
    summary: "Converts unproductive meetings into carefully scheduled microdreams.",
    status: "IN OPTIMIZATION",
    statusTone: "amber",
    icon: "☾",
    accent: "from-violet-300/10 to-transparent",
    specs: [
      { label: "Cycle duration", value: "Seven imaginary minutes" },
      { label: "Output", value: "One rested tiny engineer" },
      { label: "KPI alignment", value: "Aligned with pillows" },
    ],
    statusHistory: [
      { id: "n1", time: "T-00:08", state: "BACKLOGGED", detail: "Meeting agenda replaced by a cloud sketch.", tone: "amber" },
      { id: "n2", time: "T-00:03", state: "TESTING", detail: "Pip fell asleep during the performance review.", tone: "violet" },
      { id: "n3", time: "T-00:00", state: "IN OPTIMIZATION", detail: "Wake-up alarm moved to next Tuesday.", tone: "amber" },
    ],
  },
  {
    id: "dream-compiler",
    code: "WRK-003",
    name: "Crayon-to-Cosmos Dream Compiler",
    category: "Imagination systems",
    summary: "Compiles crayon drawings into tiny, interstellar bedtime adventures.",
    status: "EXPERIMENTAL",
    statusTone: "fuchsia",
    icon: "✧",
    accent: "from-fuchsia-300/10 to-transparent",
    specs: [
      { label: "Input format", value: "Crayon, doodle, or daydream" },
      { label: "Error handling", value: "Blame the friendly dinosaur" },
      { label: "Output", value: "One newly rendered possibility" },
    ],
    statusHistory: [
      { id: "d1", time: "T-00:09", state: "PARSING", detail: "A blue scribble identified as a very large sea.", tone: "violet" },
      { id: "d2", time: "T-00:05", state: "COMPILING", detail: "Added one moon, two stars, and a polite dragon.", tone: "fuchsia" },
      { id: "d3", time: "T-00:00", state: "EXPERIMENTAL", detail: "Build succeeded. Gravity remains optional.", tone: "amber" },
    ],
  },
];

function toneClasses(tone) {
  switch (tone) {
    case "emerald": return "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200";
    case "amber": return "border-amber-300/20 bg-amber-300/[0.08] text-amber-100";
    case "fuchsia": return "border-fuchsia-300/20 bg-fuchsia-300/[0.08] text-fuchsia-200";
    default: return "border-violet-300/20 bg-violet-300/[0.08] text-violet-200";
  }
}

function safeId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
}

/**
 * Accessible accordion manifest for Pip's three engineered workshops.
 * `projects` can be replaced with project data from a parent component.
 *
 * @param {{projects?: Array<object>, expandedProjectId?: string|null, setExpandedProjectId?: (id: string|null) => void, onAnnouncementChange?: (message: string) => void}} props
 */
export default function ProjectManifest({
  projects = WORKSHOP_MANIFEST,
  expandedProjectId,
  setExpandedProjectId,
  onAnnouncementChange = () => {},
}) {
  const [internalExpandedId, setInternalExpandedId] = useState(null);
  const isControlled = typeof setExpandedProjectId === "function" && expandedProjectId !== undefined;
  const activeId = isControlled ? expandedProjectId : internalExpandedId;

  const toggleProject = (project) => {
    const nextId = activeId === project.id ? null : project.id;
    if (!isControlled) setInternalExpandedId(nextId);
    setExpandedProjectId?.(nextId);
    onAnnouncementChange(nextId ? `${project.name} blueprints ${nextId === null ? "closed" : "opened"}.` : `${project.name} blueprints closed.`);
  };

  return (
    <section className="min-w-0 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/20 sm:p-5" aria-labelledby="project-manifest-title" aria-label="Engineered workshops project manifest">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">Archive / 02</p>
          <h2 id="project-manifest-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-100">Engineered workshops</h2>
          <p className="mt-1 text-sm text-slate-400">Three builds. Several questionable safety reviews.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-300">Manifest: {String(projects.length).padStart(2, "0")}</span>
      </header>

      <div className="mt-4 space-y-3">
        {projects.map((project, index) => {
          const isExpanded = activeId === project.id;
          const panelId = `manifest-panel-${safeId(project.id)}`;
          const buttonId = `manifest-trigger-${safeId(project.id)}`;

          return (
            <article key={project.id} className={`overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${project.accent || "from-violet-300/[0.08] to-transparent"} transition-colors duration-200 motion-reduce:transition-none`}>
              <button
                id={buttonId}
                type="button"
                aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${project.name}`}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                onClick={() => toggleProject(project)}
                className="flex min-h-24 w-full items-center gap-3 p-4 text-left hover:bg-white/[0.035] focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200 focus-visible:ring-inset sm:gap-4"
              >
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/50 text-2xl">{project.icon || "✧"}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"><span>{project.code || `WRK-${String(index + 1).padStart(3, "0")}`}</span><span aria-hidden="true">/</span><span>{project.category || "Workshop"}</span></span>
                  <span className="mt-1 block text-sm font-semibold leading-relaxed text-slate-100 sm:text-base">{project.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-400">{project.summary}</span>
                </span>
                <span className={`hidden shrink-0 rounded-full border px-2 py-1 font-mono text-[9px] uppercase tracking-wider sm:inline-flex ${toneClasses(project.statusTone)}`}>{project.status}</span>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-slate-300 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? "rotate-45 bg-white/[0.08]" : ""}`} aria-hidden="true">＋</span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-label={`${project.name} technical specifications and operational history`}
                aria-hidden={!isExpanded}
                inert={!isExpanded}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="grid gap-4 border-t border-white/10 bg-slate-950/35 p-4 md:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Technical specifications</p>
                      <dl className="mt-3 space-y-2">
                        {(Array.isArray(project.specs) ? project.specs : []).map((spec, specIndex) => {
                          const item = typeof spec === "string" ? { label: `Specification ${specIndex + 1}`, value: spec } : spec;
                          return (
                            <div key={`${project.id}-spec-${item.label}-${specIndex}`} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                              <dt className="text-xs text-slate-500">{item.label}</dt>
                              <dd className="break-words text-right text-xs font-medium leading-relaxed text-slate-200">{item.value}</dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">Operational history</p>
                      <ol className="mt-3 space-y-3">
                        {(Array.isArray(project.statusHistory) ? project.statusHistory : []).map((event, eventIndex) => (
                          <li key={event.id || `${project.id}-event-${eventIndex}`} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_9px_rgba(196,181,253,0.55)]" aria-hidden="true" />
                            <div className="min-w-0 border-b border-white/[0.07] pb-3 last:border-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <time className="font-mono text-[10px] text-slate-500">{event.time || "LOG"}</time>
                                <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] tracking-wider ${toneClasses(event.tone)}`}>{event.state || "NOTE"}</span>
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-slate-300">{event.detail}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500" aria-live="polite">Select a manifest row to inspect its specification sheet and operational history.</p>
    </section>
  );
}
