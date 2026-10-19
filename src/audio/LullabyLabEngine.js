import { playDreamSynthCue } from "./dreamAudioBus.js";

/**
 * Converts text and semantic tags into a short synthesized cue. The shared audio bus
 * remains the single master output, so the application's mute toggle still wins.
 */
export function playLullabyLabCue({ text = "", keywords = [], soundEnabled = true, moodConfig = null } = {}) {
  if (!soundEnabled) return false;
  const normalizedText = String(text);
  const tags = new Set((Array.isArray(keywords) ? keywords : [keywords]).map((tag) => String(tag).toLowerCase()));
  const isEnergetic = ["brave", "adventure", "rocket", "chaos", "wonder"].some((tag) => tags.has(tag));
  const isSoft = ["rest", "quiet", "gentle", "moon", "sleep"].some((tag) => tags.has(tag));
  const frequency = Number.isFinite(moodConfig?.frequencyHz)
    ? moodConfig.frequencyHz
    : isEnergetic ? 587.33 : isSoft ? 349.23 : 440;
  const oscillator = moodConfig?.oscillator === "triangle" || isEnergetic ? "triangle" : "sine";
  const delayMs = Math.min(220, 55 + (normalizedText.length % 6) * 18 + (isSoft ? 35 : 0));
  return playDreamSynthCue({ frequency, oscillator, delayMs, durationMs: 280 + Math.min(normalizedText.length, 80) * 2 });
}
