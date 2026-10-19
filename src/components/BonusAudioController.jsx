import { useEffect, useRef } from "react";
import { playDreamUiChime } from "../audio/dreamAudioBus.js";

const CLICK_TARGET_SELECTOR =
  'button:not([data-dream-audio-ignore]), a[href], select, [role="button"], canvas, [data-dream-sound]';

function isDisabledControl(element) {
  return element.matches(":disabled") || element.getAttribute("aria-disabled") === "true";
}

/**
 * Controlled sound toggle and the one delegated UI-chime listener.
 * All generated notes route through dreamAudioBus's shared master gain.
 */
export default function BonusAudioController({ soundEnabled, onToggle, className = "" }) {
  const enabledRef = useRef(soundEnabled);
  const lastClickAtRef = useRef(0);

  useEffect(() => {
    enabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!enabledRef.current || !(event.target instanceof Element)) return;

      const target = event.target.closest(CLICK_TARGET_SELECTOR);
      if (!target || isDisabledControl(target)) return;
      if (target.closest("[data-dream-audio-ignore]")) return;
      if (target.getAttribute("data-dream-sound") === "off") return;

      const now = window.performance?.now?.() ?? Date.now();
      if (now - lastClickAtRef.current < 38) return;
      lastClickAtRef.current = now;
      playDreamUiChime();
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, []);

  return (
    <button
      type="button"
      className={`dream-bonus-audio-toggle theme-toggle inline-flex items-center ${className}`.trim()}
      onClick={() => onToggle?.(!soundEnabled)}
      aria-pressed={!soundEnabled}
      aria-label={soundEnabled ? "Mute all Pip interface sounds" : "Unmute all Pip interface sounds"}
      title="Mute or unmute all interface chimes and Lullaby Lab audio."
      data-dream-audio-ignore
    >
      <span className="dream-bonus-audio-glyph" aria-hidden="true">{soundEnabled ? "♫" : "🔇"}</span>
      <span className="dream-bonus-audio-label">SOUND SYSTEM</span>
      <span className={`dream-bonus-audio-state ${soundEnabled ? "is-live" : "is-muted"}`}>
        {soundEnabled ? "ON" : "MUTED"}
      </span>
    </button>
  );
}
