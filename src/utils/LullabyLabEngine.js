const VALID_OSCILLATORS = new Set(["sine", "triangle"]);
const DEFAULT_NOTE_RATIOS = [1, 1.25, 1.5, 1.25, 1.875];
const MAX_FREQUENCY_HZ = 1800;
const MAX_DURATION_MS = 900;
const MAX_ACTIVE_VOICES = 16;

const LOAD_STATE_VOLUME = Object.freeze({
  idle: 0.28,
  loading: 0.42,
  ready: 1,
  busy: 0.72,
  error: 0.22,
});

function clamp(value, min, max) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : min;
}

function safeFrequency(value, fallback = 440) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return clamp(numeric, 80, MAX_FREQUENCY_HZ);
}

function normalizeKeywords(keywords) {
  const entries = Array.isArray(keywords) ? keywords : [keywords];
  return new Set(entries.map((entry) => String(entry ?? "").trim().toLowerCase()).filter(Boolean));
}

function safelyReadEnabled(getEnabled) {
  try {
    return getEnabled() !== false;
  } catch {
    // A faulty external state provider must fail closed rather than play unexpectedly.
    return false;
  }
}

/**
 * Create a dependency-free Web Audio arpeggio engine.
 *
 * This module deliberately does not create an AudioContext or master gain.
 * The caller must pass getAudioGraph() returning { context, output }; that graph
 * belongs to the application-wide audio bus, preserving one authoritative mute.
 */
export function createLullabyLabEngine({
  getAudioGraph = null,
  isSoundEnabled = () => true,
  maxActiveVoices = MAX_ACTIVE_VOICES,
} = {}) {
  let locallyEnabled = true;
  let disposed = false;
  const activeVoices = new Set();
  const voiceLimit = Math.floor(clamp(maxActiveVoices, 1, MAX_ACTIVE_VOICES));

  function stopVoice(voice) {
    try {
      voice.oscillator.stop();
    } catch {
      // A note may have already reached its scheduled stop time.
    }
    try {
      voice.oscillator.disconnect();
      voice.gain.disconnect();
    } catch {
      // Disconnect is best-effort during mute/dispose races.
    }
    activeVoices.delete(voice);
  }

  function stopAll() {
    for (const voice of [...activeVoices]) stopVoice(voice);
  }

  function resolveGraph() {
    if (disposed || typeof getAudioGraph !== "function") return null;

    try {
      const graph = getAudioGraph();
      if (graph?.context && graph?.output && graph.context.state !== "closed") {
        return { context: graph.context, output: graph.output };
      }
      return null;
    } catch {
      return null;
    }
  }

  function setEnabled(enabled) {
    locallyEnabled = Boolean(enabled);
    if (!locallyEnabled) stopAll();
    // The shared bus owns the master gain. App toggles it at the same time.
  }

  /**
   * Schedule a tiny two-tone sparkle chime through the shared master output.
   * The base tone is constrained to 600-1200 Hz and the quieter overtone to
   * at most 1800 Hz. No AudioContext or destination is created by this engine.
   */
  async function playSparkleChime({
    frequency = 600 + Math.random() * 600,
    soundEnabled = true,
    durationMs = 105,
    volume = 0.022,
  } = {}) {
    if (disposed || !locallyEnabled || soundEnabled === false || !safelyReadEnabled(isSoundEnabled)) {
      return false;
    }

    const graph = resolveGraph();
    if (!graph) return false;
    const { context, output } = graph;

    try {
      if (context.state === "suspended") await context.resume();
    } catch {
      return false;
    }

    // Recheck after resume; the user may have muted audio while it was pending.
    if (disposed || !locallyEnabled || soundEnabled === false || !safelyReadEnabled(isSoundEnabled)) {
      return false;
    }

    const baseFrequency = clamp(frequency, 600, 1200);
    const safeDurationMs = clamp(durationMs, 55, 190);
    const baseVolume = clamp(volume, 0.001, 0.035);
    const startAt = context.currentTime + 0.004;
    const tones = [
      { frequency: baseFrequency, type: "sine", gain: baseVolume },
      { frequency: Math.min(1800, baseFrequency * 1.5), type: "triangle", gain: baseVolume * 0.32 },
    ];

    try {
      for (const tone of tones) {
        while (activeVoices.size >= voiceLimit) {
          const oldestVoice = activeVoices.values().next().value;
          if (!oldestVoice) break;
          stopVoice(oldestVoice);
        }

        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        const toneStart = startAt;
        const toneEnd = toneStart + safeDurationMs / 1000;
        oscillator.type = tone.type;
        oscillator.frequency.setValueAtTime(tone.frequency, toneStart);
        envelope.gain.setValueAtTime(0.0001, toneStart);
        envelope.gain.exponentialRampToValueAtTime(tone.gain, toneStart + 0.009);
        envelope.gain.exponentialRampToValueAtTime(0.0001, toneEnd);
        oscillator.connect(envelope);
        envelope.connect(output);

        const voice = { oscillator, gain: envelope };
        activeVoices.add(voice);
        oscillator.addEventListener("ended", () => {
          activeVoices.delete(voice);
          try {
            oscillator.disconnect();
            envelope.disconnect();
          } catch {
            // Mute or teardown may already have disconnected these nodes.
          }
        }, { once: true });
        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.015);
      }
      return true;
    } catch {
      stopAll();
      return false;
    }
  }

  /**
   * Play a short mood-based arpeggio. Call from a user gesture when possible,
   * since browsers may require interaction before resuming AudioContext.
   *
   * componentLoadState scales note gain so background/loading UI is quieter than
   * a fully ready interaction. `soundEnabled` is the current application toggle;
   * call setEnabled on toggle changes as well to stop already scheduled voices.
   */
  async function playArpeggio({
    moodConfig = {},
    text = "",
    keywords = [],
    soundEnabled = true,
    componentLoadState = "ready",
    componentLoadFactor,
    volume = 0.12,
    delayMs,
    durationMs = 300,
    noteSpacingMs,
    noteCount,
  } = {}) {
    if (disposed || !locallyEnabled || soundEnabled === false || !safelyReadEnabled(isSoundEnabled)) return false;

    const graph = resolveGraph();
    if (!graph) return false;
    const { context, output } = graph;

    try {
      if (context.state === "suspended") await context.resume();
    } catch {
      return false;
    }

    // The toggle may have changed while context.resume() was pending.
    if (disposed || !locallyEnabled || soundEnabled === false || !safelyReadEnabled(isSoundEnabled)) return false;

    const audioConfig = moodConfig.audio ?? moodConfig;
    const normalizedText = String(text ?? "").slice(0, 2000);
    const tags = normalizeKeywords([
      ...(Array.isArray(moodConfig.keywords) ? moodConfig.keywords : []),
      ...(Array.isArray(keywords) ? keywords : [keywords]),
      ...normalizedText.toLowerCase().split(/[^a-z0-9-]+/),
    ]);

    const baseFrequency = safeFrequency(
      audioConfig.baseFrequencyHz ?? moodConfig.baseFrequencyHz ?? moodConfig.frequencyHz,
    );
    const requestedWave = audioConfig.oscillatorType ?? moodConfig.oscillatorType ?? moodConfig.oscillator;
    const fallbackWave = tags.has("curious") || tags.has("wonder") || tags.has("adventure")
      ? "triangle"
      : "sine";
    const oscillatorType = VALID_OSCILLATORS.has(requestedWave) ? requestedWave : fallbackWave;
    const ratiosSource = Array.isArray(audioConfig.noteRatios) && audioConfig.noteRatios.length
      ? audioConfig.noteRatios
      : DEFAULT_NOTE_RATIOS;
    const ratios = ratiosSource.slice(0, 8).map((ratio) => clamp(ratio, 0.5, 3));

    const stateMultiplier = LOAD_STATE_VOLUME[componentLoadState] ?? LOAD_STATE_VOLUME.ready;
    const customLoadMultiplier = componentLoadFactor === undefined
      ? stateMultiplier
      : clamp(componentLoadFactor, 0, 1);
    const moodVolume = clamp(audioConfig.volumeMultiplier ?? 1, 0, 1);
    // Longer copy gets a small, bounded reduction so busy text does not become loud.
    const textVolumeMultiplier = Math.max(0.55, 1 - Math.min(normalizedText.length, 180) / 400);
    const targetVolume = clamp(volume, 0, 0.18) * moodVolume * customLoadMultiplier * textVolumeMultiplier;
    if (targetVolume < 0.0005) return false;

    const safeDurationMs = clamp(durationMs, 120, MAX_DURATION_MS);
    const hasSoftTag = ["sleepy", "rest", "quiet", "soft", "gentle", "moon"].some((tag) => tags.has(tag));
    const computedDelayMs = delayMs === undefined
      ? 45 + (normalizedText.length % 5) * 16 + (hasSoftTag ? 24 : 0)
      : clamp(delayMs, 0, 500);
    const spacing = noteSpacingMs === undefined
      ? clamp(audioConfig.noteSpacingMs ?? (hasSoftTag ? 145 : 105), 55, 260)
      : clamp(noteSpacingMs, 40, 300);
    const derivedNoteCount = Math.ceil(Math.sqrt(Math.max(1, normalizedText.length)));
    const numberOfNotes = Math.floor(clamp(noteCount ?? Math.max(3, derivedNoteCount), 2, 8));
    const startAt = context.currentTime + computedDelayMs / 1000;
    const noteDurationSeconds = safeDurationMs / 1000;

    try {
      for (let index = 0; index < numberOfNotes; index += 1) {
        // Bound the number of live voices before allocating the next Web Audio nodes.
        while (activeVoices.size >= voiceLimit) {
          const oldestVoice = activeVoices.values().next().value;
          if (!oldestVoice) break;
          stopVoice(oldestVoice);
        }

        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        const noteStart = startAt + (index * spacing) / 1000;
        const frequency = safeFrequency(baseFrequency * ratios[index % ratios.length], baseFrequency);
        oscillator.type = oscillatorType;
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        envelope.gain.setValueAtTime(0.0001, noteStart);
        envelope.gain.exponentialRampToValueAtTime(Math.max(0.0006, targetVolume), noteStart + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDurationSeconds);
        oscillator.connect(envelope);
        envelope.connect(output);

        const voice = { oscillator, gain: envelope };
        activeVoices.add(voice);
        oscillator.addEventListener("ended", () => {
          activeVoices.delete(voice);
          try {
            oscillator.disconnect();
            envelope.disconnect();
          } catch {
            // Nodes may already be disconnected by mute or dispose.
          }
        }, { once: true });
        oscillator.start(noteStart);
        oscillator.stop(noteStart + noteDurationSeconds + 0.025);
      }
      return true;
    } catch {
      // Stop partial arpeggios if the browser rejects one of the scheduled nodes.
      stopAll();
      return false;
    }
  }

  async function dispose() {
    // A pending resume() must not schedule notes after the owning component unmounts.
    disposed = true;
    stopAll();
  }

  return Object.freeze({
    playArpeggio,
    playSparkleChime,
    setEnabled,
    stopAll,
    dispose,
  });
}

