import assert from "node:assert/strict";
import { createLullabyLabEngine } from "../src/utils/LullabyLabEngine.js";

let globallyMuted = false;
const scheduledOscillators = [];
const createdEnvelopes = [];
const sharedMasterOutput = { name: "app-shared-master-gain" };

const context = {
  state: "running",
  currentTime: 10,
  async resume() {
    this.state = "running";
  },
  createOscillator() {
    const oscillator = {
      type: "sine",
      stopped: false,
      connections: [],
      frequency: { setValueAtTime(value) { this.value = value; } },
      connect(node) { this.connections.push(node); },
      addEventListener() {},
      start(time) { this.startTime = time; },
      stop(time) { this.stopped = true; this.stopTime = time; },
      disconnect() { this.disconnected = true; },
    };
    scheduledOscillators.push(oscillator);
    return oscillator;
  },
  createGain() {
    const envelope = {
      connections: [],
      gain: {
        setValueAtTime() {},
        exponentialRampToValueAtTime() {},
      },
      connect(node) { this.connections.push(node); },
      disconnect() { this.disconnected = true; },
    };
    createdEnvelopes.push(envelope);
    return envelope;
  },
};

const engine = createLullabyLabEngine({
  getAudioGraph: () => ({ context, output: sharedMasterOutput }),
  isSoundEnabled: () => !globallyMuted,
});

const didPlay = await engine.playArpeggio({
  moodConfig: {
    keywords: ["rest", "gentle"],
    audio: {
      baseFrequencyHz: 392,
      oscillatorType: "sine",
      noteRatios: [1, 1.25, 1.5],
      volumeMultiplier: 0.72,
      noteSpacingMs: 110,
    },
  },
  text: "A little moon dream",
  noteCount: 3,
});

assert.equal(didPlay, true, "a configured mood should schedule notes");
assert.equal(scheduledOscillators.length, 3, "noteCount should bound scheduled voices");
assert.ok(
  scheduledOscillators.every((oscillator) => oscillator.connections.length === 1),
  "oscillators must connect to their gain envelopes, not to destination",
);
assert.equal(createdEnvelopes.length, 3, "each note should have one gain envelope");
assert.ok(
  createdEnvelopes.every((envelope) => envelope.connections.includes(sharedMasterOutput)),
  "every envelope must route to the application's shared master output",
);

const firstChimeVoice = scheduledOscillators.length;
assert.equal(
  await engine.playSparkleChime({ frequency: 900 }),
  true,
  "a sparkle burst should schedule its harmonic chime",
);
assert.equal(scheduledOscillators.length - firstChimeVoice, 2, "a sparkle chime uses two bounded harmonic voices");
assert.deepEqual(
  scheduledOscillators.slice(firstChimeVoice).map((oscillator) => oscillator.frequency.value),
  [900, 1350],
  "the sparkle note must remain in the requested 600-1200 Hz base range with a harmonic overtone",
);

engine.setEnabled(false);
assert.ok(
  scheduledOscillators.every((oscillator) => oscillator.stopped),
  "muting the engine should stop every scheduled voice immediately",
);
assert.equal(
  await engine.playArpeggio({ text: "muted" }),
  false,
  "a muted engine must refuse to schedule more notes",
);

globallyMuted = true;
engine.setEnabled(true);
assert.equal(
  await engine.playArpeggio({ text: "global mute remains authoritative" }),
  false,
  "the app-level sound provider must still override the local engine state",
);

await engine.dispose();
assert.equal(
  await engine.playArpeggio({ text: "disposed" }),
  false,
  "a disposed engine must not schedule new notes",
);

console.log("Lullaby Lab shared-bus tests passed.");
