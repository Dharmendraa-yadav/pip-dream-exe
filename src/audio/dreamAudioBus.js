const MUTE_STORAGE_KEY = "pip-dream-audio-muted";
const MAX_ACTIVE_OSCILLATORS = 32;

let audioContext = null;
let masterGain = null;
let soundEnabled = true;
const activeOscillators = new Set();

export function readDreamAudioEnabled() {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) !== "muted";
  } catch {
    return true;
  }
}

function stopActiveOscillators() {
  for (const oscillator of activeOscillators) {
    try {
      oscillator.stop();
    } catch {
      // An oscillator may already have stopped naturally.
    }
  }
  activeOscillators.clear();
}

/**
 * The only master volume for every Pip sound. A zero gain plus stopping active
 * oscillators makes mute immediate and prevents scheduled notes returning later.
 */
export function setDreamAudioEnabled(enabled) {
  soundEnabled = Boolean(enabled);

  if (audioContext && masterGain && audioContext.state !== "closed") {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(soundEnabled ? 1 : 0, now);
  }

  if (!soundEnabled) stopActiveOscillators();

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, soundEnabled ? "unmuted" : "muted");
  } catch {
    // The preference remains active in memory when storage is unavailable.
  }
}

function getAudioGraph() {
  if (!soundEnabled) return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();
      masterGain = audioContext.createGain();
      masterGain.gain.value = soundEnabled ? 1 : 0;
      masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => {});
    }

    return { context: audioContext, output: masterGain };
  } catch {
    // Audio is an enhancement; unavailable audio must never break the UI.
    return null;
  }
}

/**
 * Expose the app-owned graph to feature engines that must share the global mute.
 * Returns null while muted so callers cannot accidentally create audible nodes.
 */
export function getDreamAudioGraph() {
  return getAudioGraph();
}

function trackOscillator(oscillator) {
  activeOscillators.add(oscillator);
  oscillator.addEventListener("ended", () => activeOscillators.delete(oscillator), { once: true });
  while (activeOscillators.size > MAX_ACTIVE_OSCILLATORS) {
    const oldest = activeOscillators.values().next().value;
    if (!oldest) break;
    try {
      oldest.stop();
    } catch {
      activeOscillators.delete(oldest);
    }
  }
}

export function playDreamUiChime() {
  const graph = getAudioGraph();
  if (!graph) return;

  const { context, output } = graph;
  const startAt = context.currentTime + 0.006;

  try {
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
      gain.connect(output);
      trackOscillator(oscillator);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.15);
    });
  } catch {
    // Ignore browser audio failures without affecting interaction.
  }
}


/** Bounded, state-aware single-note synthesizer used by modular Dream OS features. */
export function playDreamSynthCue({ frequency = 440, oscillator = "sine", delayMs = 60, durationMs = 360 } = {}) {
  const graph = getAudioGraph();
  if (!graph) return false;
  const { context, output } = graph;
  const safeFrequency = Math.min(1600, Math.max(80, Number(frequency) || 440));
  const safeDelay = Math.min(500, Math.max(0, Number(delayMs) || 0)) / 1000;
  const safeDuration = Math.min(1200, Math.max(100, Number(durationMs) || 360)) / 1000;
  const allowedTypes = new Set(["sine", "triangle", "square", "sawtooth"]);
  const type = allowedTypes.has(oscillator) ? oscillator : "sine";
  try {
    const node = context.createOscillator();
    const envelope = context.createGain();
    const startAt = context.currentTime + safeDelay;
    node.type = type;
    node.frequency.setValueAtTime(safeFrequency, startAt);
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(0.12, startAt + 0.025);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + safeDuration);
    node.connect(envelope);
    envelope.connect(output);
    trackOscillator(node);
    node.start(startAt);
    node.stop(startAt + safeDuration + 0.02);
    return true;
  } catch {
    return false;
  }
}

export async function playDreamLullaby() {
  const graph = getAudioGraph();
  if (!graph) return false;

  const { context, output } = graph;
  try {
    if (context.state === "suspended") await context.resume();
    if (!soundEnabled) return false;

    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23];
    const startAt = context.currentTime + 0.02;

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      const noteStart = startAt + index * 0.45;
      const noteEnd = noteStart + 0.4;

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      noteGain.gain.setValueAtTime(0, noteStart);
      noteGain.gain.linearRampToValueAtTime(0.12, noteStart + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, noteEnd);
      oscillator.connect(noteGain);
      noteGain.connect(output);
      trackOscillator(oscillator);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd);
    });

    return true;
  } catch {
    return false;
  }
}
