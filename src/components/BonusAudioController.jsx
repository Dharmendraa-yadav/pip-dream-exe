import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_STORAGE_KEY = "pip-dream-audio-muted";
const CLICK_TARGET_SELECTOR =
  'button:not([data-dream-audio-ignore]), a[href], select, [role="button"], canvas, [data-dream-sound]';

function readMutePreference() {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "muted";
  } catch {
    return false;
  }
}

function isDisabledControl(element) {
  return element.matches(":disabled") || element.getAttribute("aria-disabled") === "true";
}

/**
 * Retro click/chime controller for a whole React page.
 * Mount it once in the top header. It uses event delegation, so buttons added
 * later are covered too. Pass `muted` and `onMutedChange` to synchronize an
 * existing app-wide sound state (for example, a Web Audio lullaby).
 */
export default function BonusAudioController({
  muted: controlledMuted,
  onMutedChange,
  className = "",
}) {
  const [internalMuted, setInternalMuted] = useState(readMutePreference);
  const isControlled = typeof controlledMuted === "boolean";
  const muted = isControlled ? controlledMuted : internalMuted;
  const mutedRef = useRef(muted);
  const audioContextRef = useRef(null);
  const lastClickAtRef = useRef(0);

  const handleToggle = useCallback(() => {
    const nextMuted = !muted;
    if (!isControlled) setInternalMuted(nextMuted);
    onMutedChange?.(nextMuted);
  }, [isControlled, muted, onMutedChange]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? "muted" : "unmuted");
    } catch {
      // Audio still works for this session when storage is unavailable.
    }
  }, [muted]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (mutedRef.current || !(event.target instanceof Element)) return;

      const target = event.target.closest(CLICK_TARGET_SELECTOR);
      if (!target || isDisabledControl(target)) return;
      if (target.closest("[data-dream-audio-ignore]")) return;
      if (target.getAttribute("data-dream-sound") === "off") return;

      // A tiny rate limit prevents rapid repeated clicks from becoming a buzz.
      const now = window.performance?.now?.() ?? Date.now();
      if (now - lastClickAtRef.current < 38) return;
      lastClickAtRef.current = now;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      try {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
          audioContextRef.current = new AudioContextClass();
        }

        const context = audioContextRef.current;
        if (context.state === "suspended") void context.resume().catch(() => {});

        // Two quiet, short notes make a soft retro terminal chime.
        const startAt = context.currentTime + 0.006;
        [660, 880].forEach((frequency, index) => {
          const noteStart = startAt + index * 0.045;
          const oscillator = context.createOscillator();
          const gain = context.createGain();

          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, noteStart);
          gain.gain.setValueAtTime(0.0001, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.026, noteStart + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.14);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(noteStart);
          oscillator.stop(noteStart + 0.15);
        });
      } catch {
        // Audio is an enhancement; unsupported/blocked audio must not break UI.
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        void context.close().catch(() => {});
      }
    };
  }, []);

  return (
    <button
      type="button"
      className={`dream-bonus-audio-toggle theme-toggle inline-flex items-center ${className}`.trim()}
      onClick={handleToggle}
      aria-pressed={muted}
      aria-label={muted ? "Audio is muted. Activate to unmute system sounds." : "System audio is on. Activate to mute system sounds."}
      title="Mute or unmute all interface chimes and Lullaby Lab audio."
      data-dream-audio-ignore
    >
      <span className="dream-bonus-audio-glyph" aria-hidden="true">{muted ? "🔇" : "♫"}</span>
      <span className="dream-bonus-audio-label">MUTE SYSTEM</span>
      <span className={`dream-bonus-audio-state ${muted ? "is-muted" : "is-live"}`}>
        {muted ? "MUTED" : "ON"}
      </span>
    </button>
  );
}
