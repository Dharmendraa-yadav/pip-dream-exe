import { useEffect, useRef, useState } from "react";

const DESTINATIONS = [
  {
    id: "moon-garden",
    name: "Moon Garden",
    subtitle: "A wish among the flowers",
    icon: "☾",
    x: 633,
    y: 58,
    path: "M 80 224 C 176 206 204 53 337 100 S 528 48 633 58",
    arrival: "Moonflowers opened just in time to keep your wish warm.",
  },
  {
    id: "cloud-harbor",
    name: "Cloud Harbor",
    subtitle: "A soft landing in the sky",
    icon: "☁",
    x: 651,
    y: 143,
    path: "M 80 224 C 174 224 249 275 367 176 S 535 134 651 143",
    arrival: "A sleepy cloud caught your wish and tucked it into a silver blanket.",
  },
  {
    id: "star-library",
    name: "Star Library",
    subtitle: "A quiet shelf between stars",
    icon: "✧",
    x: 630,
    y: 224,
    path: "M 80 224 C 188 258 278 163 383 205 S 527 230 630 224",
    arrival: "Your wish is resting safely between two very bright pages.",
  },
];

const FLIGHT_STEPS = [
  { id: "selected", label: "ROUTE SELECTED", detail: "Destination coordinates locked." },
  { id: "preparing", label: "PACKAGE PREPARED", detail: "Pip has packed the tiny wish." },
  { id: "in-flight", label: "IN FLIGHT", detail: "Rocket following the dream path." },
  { id: "delivered", label: "DELIVERED", detail: "Destination confirmed. No dream left behind." },
];

const DESTINATION_FALLBACK = DESTINATIONS[0];

/**
 * SVG route simulator for Pip's dream deliveries.
 * Can be controlled by a parent (`status`, `destination`, `receipt`) or run
 * standalone with its internal simulation state.
 *
 * @param {{destination?: string, onDestinationChange?: (destination: string) => void, status?: "idle"|"preparing"|"in-flight"|"delivered", receipt?: {title?: string, destination?: string, arrivalNote?: string, serial?: string}|null, onSend?: (payload: {destination: string}) => void, onReplay?: (payload: {destination: string}) => void, onReset?: () => void}} props
 */
export default function DreamCourier({
  destination,
  onDestinationChange,
  status: statusProp,
  receipt: receiptProp,
  onSend,
  onReplay,
  onReset,
}) {
  const isDestinationControlled = destination !== undefined;
  const [internalDestination, setInternalDestination] = useState("Cloud Harbor");
  const selectedDestinationName = isDestinationControlled ? destination : internalDestination;
  const selectedDestination = DESTINATIONS.find((item) => item.name === selectedDestinationName) || DESTINATION_FALLBACK;

  const isStatusControlled = statusProp !== undefined;
  const [internalStatus, setInternalStatus] = useState("idle");
  const status = isStatusControlled ? statusProp : internalStatus;
  const [internalReceipt, setInternalReceipt] = useState(null);
  const receipt = receiptProp !== undefined ? receiptProp : internalReceipt;
  const [launchSequence, setLaunchSequence] = useState(0);
  const timersRef = useRef([]);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const isBusy = status === "preparing" || status === "in-flight";
  const statusIndex = status === "idle" ? 0 : Math.max(0, FLIGHT_STEPS.findIndex((step) => step.id === status));

  const updateDestination = (nextDestination) => {
    if (!isDestinationControlled) setInternalDestination(nextDestination);
    onDestinationChange?.(nextDestination);
  };

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const makeLocalReceipt = () => ({
    title: `A Little Wish for ${selectedDestination.name}`,
    destination: selectedDestination.name,
    arrivalNote: selectedDestination.arrival,
    serial: `PIP-${String(Date.now()).slice(-6)}`,
  });

  const startLocalFlight = () => {
    clearTimers();
    setInternalReceipt(null);
    setInternalStatus("preparing");
    setLaunchSequence((current) => current + 1);
    const prepareTimer = window.setTimeout(() => {
      setInternalStatus("in-flight");
      const arrivalTimer = window.setTimeout(() => {
        setInternalReceipt(makeLocalReceipt());
        setInternalStatus("delivered");
      }, 1600);
      timersRef.current.push(arrivalTimer);
    }, 440);
    timersRef.current.push(prepareTimer);
  };

  const handleLaunch = () => {
    if (isBusy) return;
    if (isStatusControlled) {
      setLaunchSequence((current) => current + 1);
      onSend?.({ destination: selectedDestination.name });
      return;
    }
    onSend?.({ destination: selectedDestination.name });
    startLocalFlight();
  };

  const handleReplay = () => {
    if (isBusy) return;
    if (typeof onReplay === "function") {
      if (isStatusControlled) setLaunchSequence((current) => current + 1);
      onReplay({ destination: selectedDestination.name });
      if (!isStatusControlled) startLocalFlight();
      return;
    }
    startLocalFlight();
  };

  const handleReset = () => {
    clearTimers();
    if (!isStatusControlled) setInternalStatus("idle");
    if (receiptProp === undefined) setInternalReceipt(null);
    onReset?.();
  };

  const shownReceipt = receipt || (status === "delivered"
    ? { destination: selectedDestination.name, arrivalNote: selectedDestination.arrival }
    : null);

  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/20" aria-labelledby="dream-courier-title">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">Flight systems / 03</p>
          <h2 id="dream-courier-title" className="mt-1 text-lg font-semibold tracking-tight text-slate-100">Dream Courier flight path</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">Pick a place. Pip will handle the tiny cosmic logistics.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${status === "delivered" ? "border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200" : status === "in-flight" ? "border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-100" : "border-white/10 bg-white/[0.04] text-slate-300"}`}>{status.replaceAll("-", " ")}</span>
      </header>

      <div className="p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="Choose a dream delivery destination">
          {DESTINATIONS.map((place) => {
            const isSelected = selectedDestination.name === place.name;
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => updateDestination(place.name)}
                disabled={isBusy}
                aria-pressed={isSelected}
                className={`flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${isSelected ? "border-fuchsia-200/50 bg-fuchsia-200/[0.09]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-950/50 text-xl" aria-hidden="true">{place.icon}</span>
                <span className="min-w-0"><span className="block text-xs font-semibold text-slate-100">{place.name}</span><span className="mt-1 block text-[10px] leading-relaxed text-slate-500">{place.subtitle}</span></span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-violet-300/15 bg-[#090916] p-2 sm:p-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(139,92,246,0.13),transparent_60%)]" aria-hidden="true" />
          <svg className="relative block h-auto w-full" viewBox="0 0 760 280" role="img" aria-labelledby="courier-map-title courier-map-description">
            <title id="courier-map-title">Dream Courier route map</title>
            <desc id="courier-map-description">A rocket travels from Pip's nursery dock on a curved path to {selectedDestination.name}. Choose another destination to change the highlighted route.</desc>
            <defs>
              <linearGradient id="courier-route-gradient" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f0abfc" stopOpacity="0.95" />
              </linearGradient>
              <filter id="courier-star-glow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {Array.from({ length: 30 }, (_, index) => {
              const x = (index * 137 + 37) % 740 + 10;
              const y = (index * 71 + 19) % 250 + 12;
              const radius = index % 5 === 0 ? 1.8 : 0.9;
              return <circle key={`map-star-${index}`} cx={x} cy={y} r={radius} fill="#d8b4fe" opacity={index % 3 === 0 ? 0.8 : 0.35} />;
            })}

            {DESTINATIONS.map((place) => (
              <path
                key={`route-${place.id}`}
                d={place.path}
                fill="none"
                stroke={place.id === selectedDestination.id ? "url(#courier-route-gradient)" : "#6d5b8d"}
                strokeWidth={place.id === selectedDestination.id ? 3.5 : 1.4}
                strokeDasharray={place.id === selectedDestination.id ? "0" : "4 9"}
                strokeLinecap="round"
                opacity={place.id === selectedDestination.id ? 1 : 0.38}
              />
            ))}

            <circle cx="80" cy="224" r="22" fill="#8b5cf6" opacity="0.13" />
            <circle cx="80" cy="224" r="13" fill="#171126" stroke="#c4b5fd" strokeWidth="2" />
            <text x="80" y="229" textAnchor="middle" fontSize="15" fill="#f5d98d">P</text>
            <text x="80" y="258" textAnchor="middle" fontSize="10" fill="#a99aba">NURSERY DOCK</text>

            {DESTINATIONS.map((place) => {
              const isSelected = selectedDestination.id === place.id;
              return (
                <g key={`destination-${place.id}`}>
                  {isSelected && <circle cx={place.x} cy={place.y} r="19" fill="#f0abfc" opacity="0.12" filter="url(#courier-star-glow)" />}
                  <circle cx={place.x} cy={place.y} r={isSelected ? 8 : 6} fill={isSelected ? "#f0abfc" : "#8b7aa5"} stroke={isSelected ? "#f5d98d" : "#c4b5fd"} strokeWidth="2" />
                  <text x={place.x} y={place.y - 17} textAnchor="middle" fontSize="10" fill={isSelected ? "#f5d98d" : "#a99aba"}>{place.name.toUpperCase()}</text>
                </g>
              );
            })}

            {status === "in-flight" && (
              <g key={`${selectedDestination.id}-${launchSequence}`}>
                <text x="0" y="0" fontSize="28" textAnchor="middle" dominantBaseline="middle" filter="url(#courier-star-glow)">🚀
                  <animateMotion key={`${selectedDestination.id}-${launchSequence}`} path={selectedDestination.path} dur="1.55s" rotate="auto" fill="freeze" />
                </text>
              </g>
            )}

            {status === "delivered" && (
              <text x={selectedDestination.x} y={selectedDestination.y + 4} fontSize="25" textAnchor="middle" dominantBaseline="middle" aria-label="Rocket delivered">🚀</text>
            )}
          </svg>
        </div>

        <ol className="mt-4 grid gap-2 sm:grid-cols-4" aria-label="Courier delivery timeline">
          {FLIGHT_STEPS.map((step, index) => {
            const isDone = status === "delivered" || index < statusIndex || (status === "in-flight" && index < 2) || (status === "preparing" && index < 1);
            const isCurrent = status === step.id || (status === "idle" && index === 0);
            return (
              <li key={step.id} className={`rounded-xl border p-3 ${isCurrent ? "border-fuchsia-200/35 bg-fuchsia-200/[0.07]" : isDone ? "border-emerald-300/20 bg-emerald-300/[0.04]" : "border-white/[0.07] bg-white/[0.015]"}`}>
                <div className="flex items-center gap-2">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${isDone || isCurrent ? "border-emerald-300/40 text-emerald-200" : "border-white/15 text-slate-500"}`}>{isDone ? "✓" : String(index + 1).padStart(2, "0")}</span>
                  <span className="font-mono text-[9px] font-semibold tracking-wider text-slate-200">{step.label}</span>
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{step.detail}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4" aria-live="polite" aria-atomic="true" role="status">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">Delivery report</p>
            <p className="mt-1 text-sm font-medium text-slate-200">{status === "delivered" ? (shownReceipt?.arrivalNote || selectedDestination.arrival) : status === "in-flight" ? `Rocket is tracking toward ${selectedDestination.name}.` : status === "preparing" ? "Pip is wrapping your wish in moon-safe paper…" : `Awaiting route confirmation for ${selectedDestination.name}.`}</p>
            {status === "delivered" && shownReceipt?.serial && <p className="mt-1 font-mono text-[10px] text-emerald-200">RECEIPT {shownReceipt.serial}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {status === "delivered" ? (
              <button type="button" onClick={handleReplay} className="min-h-10 rounded-xl bg-fuchsia-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 transition hover:bg-fuchsia-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none">Replay delivery ↻</button>
            ) : (
              <button type="button" onClick={handleLaunch} disabled={isBusy} className="min-h-10 rounded-xl bg-fuchsia-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-950 transition hover:bg-fuchsia-100 disabled:cursor-wait disabled:opacity-55 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none">{status === "preparing" ? "Preparing…" : status === "in-flight" ? "In flight…" : "Send dream ↗"}</button>
            )}
            <button type="button" onClick={handleReset} disabled={isBusy} className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 motion-reduce:transition-none">Reset path</button>
          </div>
        </div>
      </div>
    </section>
  );
}
