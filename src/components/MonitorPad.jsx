function SkullBabyAvatar({ expression = "sleepy" }) {
  const isSleepy = expression === "sleepy";
  const isDelighted = expression === "delighted" || expression === "excited";

  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 260 300"
      role="img"
      aria-label="Pip, the skull-faced baby Junior Dream Engineer wearing a dusty-pink bonnet"
    >
      <defs>
        <linearGradient id="pip-bonnet-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f4c4d5" />
          <stop offset="100%" stopColor="#b86f91" />
        </linearGradient>
        <linearGradient id="pip-onesie-gradient" x1="0" x2="0.9" y1="0" y2="1">
          <stop offset="0%" stopColor="#b9a6e8" />
          <stop offset="100%" stopColor="#7b68b3" />
        </linearGradient>
        <filter id="pip-soft-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#05040d" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="132" cy="274" rx="75" ry="12" fill="#080611" opacity="0.35" />
      <g filter="url(#pip-soft-shadow)">
        {/* Tiny engineer body and collar */}
        <path d="M63 240 Q72 206 101 204 L159 204 Q188 210 198 244 L188 270 Q131 291 73 270 Z" fill="url(#pip-onesie-gradient)" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M100 207 L130 229 L160 207" fill="#fff7ef" stroke="#171126" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="130" cy="249" r="5" fill="#f5d98d" />
        <circle cx="130" cy="264" r="4" fill="#f5d98d" />

        {/* Skull-shaped baby head */}
        <path d="M64 128 C64 82 93 55 130 55 C168 55 196 84 196 129 L194 164 C193 187 176 205 154 211 L147 226 L112 226 L105 211 C82 205 66 187 65 165 Z" fill="#fff7ef" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />

        {/* Bonnet and its floppy rim */}
        <path d="M51 119 C40 85 57 43 92 32 C126 17 166 29 185 58 C196 74 201 92 198 118 C173 101 148 94 123 96 C98 97 73 107 51 119 Z" fill="url(#pip-bonnet-gradient)" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M51 117 C79 98 104 91 128 92 C154 92 177 101 198 118 C179 131 162 133 143 128 C111 119 82 124 51 117 Z" fill="#e8b7ca" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M75 56 C91 42 109 38 127 40" fill="none" stroke="#fff7ef" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M168 45 Q193 28 204 46 Q212 63 190 71 L174 67 Q190 58 168 45 Z" fill="#f5d98d" stroke="#171126" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="179" cy="49" r="4" fill="#171126" />

        {/* Eye sockets / expression changes */}
        {isSleepy ? (
          <>
            <path d="M83 145 Q98 134 112 145" fill="none" stroke="#30223b" strokeWidth="7" strokeLinecap="round" />
            <path d="M148 145 Q163 134 177 145" fill="none" stroke="#30223b" strokeWidth="7" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="98" cy="145" rx={isDelighted ? "17" : "15"} ry={isDelighted ? "20" : "18"} fill="#30223b" />
            <ellipse cx="162" cy="145" rx={isDelighted ? "17" : "15"} ry={isDelighted ? "20" : "18"} fill="#30223b" />
            <circle cx="103" cy="139" r="5" fill="#fff7ef" />
            <circle cx="167" cy="139" r="5" fill="#fff7ef" />
          </>
        )}
        <path d="M123 151 L130 163 L137 151 Z" fill="#30223b" />
        <ellipse cx="79" cy="166" rx="10" ry="5" fill="#e8b7ca" opacity="0.85" />
        <ellipse cx="181" cy="166" rx="10" ry="5" fill="#e8b7ca" opacity="0.85" />

        {/* Baby's tiny toothy grin */}
        {isSleepy ? (
          <path d="M108 182 Q130 190 152 182" fill="none" stroke="#30223b" strokeWidth="5" strokeLinecap="round" />
        ) : (
          <>
            <path d="M105 178 Q130 201 155 178 Q153 197 130 198 Q108 196 105 178 Z" fill="#30223b" stroke="#171126" strokeWidth="3" strokeLinejoin="round" />
            <path d="M116 184 L116 191 M127 187 L127 195 M139 186 L139 194" stroke="#fff7ef" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </g>

      <g fill="#f5d98d" stroke="#171126" strokeWidth="2" strokeLinejoin="round">
        <path d="M34 151 L39 162 L51 164 L42 172 L44 184 L34 178 L24 184 L26 172 L17 164 L29 162 Z" />
        <path d="M220 111 L224 120 L234 122 L226 129 L228 139 L220 134 L211 139 L213 129 L206 122 L216 120 Z" />
      </g>
    </svg>
  );
}

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
