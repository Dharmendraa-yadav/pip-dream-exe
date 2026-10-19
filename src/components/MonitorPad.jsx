import SkullBabyAvatar from "./SkullBabyAvatar.jsx";

/**
 * Left rail for the Dream Operating System dashboard.
 *
 * @param {{pipExpression?: string, onPipActivate?: () => void, modulesReady?: number, modulesTotal?: number, announcement?: string, announcementHistory?: Array<{id: string, timestamp?: string, level?: string, message: string}>, visitCount?: number, focusTrackerActive?: boolean}} props
 */
export default function MonitorPad({
  pipExpression = "sleepy",
  onPipActivate = () => {},
  modulesReady = 3,
  modulesTotal = 3,
  announcement = "dream-kernel is standing by. Waiting for a tiny idea.",
  announcementHistory = [],
  visitCount = 0,
  focusTrackerActive = true,
}) {
  const safeHistory = Array.isArray(announcementHistory)
    ? announcementHistory.filter((entry) => entry && typeof entry.message === "string").slice(-4)
    : [];

  const feed = safeHistory.length > 0
    ? safeHistory
    : [{ id: "live-announcement", timestamp: "NOW", level: "LIVE", message: announcement }];

  return (
    <aside className="flex min-w-0 flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/20 sm:p-5" aria-label="Pip system monitor">
      <header className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">Monitor pad / 00</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-100">Pip core monitor</h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7]" aria-hidden="true" />
          Online
        </span>
      </header>

      <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-3 rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-950/80 to-slate-950 p-3 sm:p-4">
        <button
          type="button"
          className={`pip-character relative aspect-[4/5] w-full overflow-hidden rounded-2xl border bg-slate-950/70 p-2 transition duration-200 hover:-translate-y-0.5 hover:border-fuchsia-200/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950 ${focusTrackerActive ? "border-fuchsia-200/60 ring-2 ring-fuchsia-300/30 ring-offset-2 ring-offset-slate-950" : "border-white/10"}`}
          onClick={onPipActivate}
          aria-label="Interact with Pip, the Junior Dream Engineer"
          aria-describedby="pip-expression-label"
          title="Click Pip to activate the focus tracker"
        >
          <span className="absolute left-2 top-2 h-2 w-2 border-l-2 border-t-2 border-fuchsia-200" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 border-r-2 border-t-2 border-fuchsia-200" aria-hidden="true" />
          <span className="absolute bottom-2 left-2 h-2 w-2 border-b-2 border-l-2 border-fuchsia-200" aria-hidden="true" />
          <span className="absolute bottom-2 right-2 h-2 w-2 border-b-2 border-r-2 border-fuchsia-200" aria-hidden="true" />
          <SkullBabyAvatar expression={pipExpression} />
        </button>

        <div className="min-w-0 space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Character process</p>
            <h3 className="mt-1 break-words font-mono text-base font-bold text-fuchsia-100 sm:text-lg">sleepy.exe</h3>
            <p id="pip-expression-label" className="mt-1 text-xs leading-relaxed text-slate-400">Expression: <span className="text-slate-200">{pipExpression}</span></p>
          </div>
          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-emerald-200/80">Modules ready</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-emerald-200">{String(modulesReady).padStart(2, "0")}/{String(modulesTotal).padStart(2, "0")}</p>
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {Array.from({ length: Math.max(0, Math.min(modulesTotal, 8)) }, (_, index) => (
                <span key={`module-led-${index}`} className={`h-1.5 flex-1 rounded-full ${index < modulesReady ? "bg-emerald-300" : "bg-slate-700"}`} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Local session</p>
            <p className="mt-1 text-sm font-medium text-slate-200"><span className="text-violet-300">{visitCount.toLocaleString()}</span> dream visits</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Counter stored in this browser only.</p>
          </div>
        </div>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080a12]" aria-labelledby="monitor-terminal-title">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
          <h3 id="monitor-terminal-title" className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-300">terminal / diagnostics.log</h3>
          <span className="font-mono text-[10px] text-emerald-300">LIVE FEED</span>
        </div>
        <div className="space-y-2 p-3 font-mono text-[11px] leading-relaxed sm:text-xs" aria-live="polite" aria-relevant="additions text">
          {feed.map((entry) => (
            <p key={entry.id} className="grid grid-cols-[auto_auto_minmax(0,1fr)] gap-x-2">
              <span className="text-slate-600">[{entry.timestamp || "NOW"}]</span>
              <span className={entry.level === "ERROR" ? "text-rose-300" : entry.level === "WARN" ? "text-amber-200" : "text-emerald-300"}>{entry.level || "INFO"}</span>
              <span className="break-words text-slate-300">{entry.message}</span>
            </p>
          ))}
          <p className="flex items-center gap-2 pt-1 text-violet-300"><span aria-hidden="true">›</span><span className="h-3 w-1.5 animate-pulse bg-violet-300 motion-reduce:animate-none" aria-hidden="true" /><span className="sr-only">Terminal is waiting for the next announcement.</span></p>
        </div>
      </section>
    </aside>
  );
}
