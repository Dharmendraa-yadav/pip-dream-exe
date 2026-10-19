# PIP:// DREAM.EXE — Integrated Architecture Notes

The mood configuration, Chaos Overlay, and Lullaby Lab engine are integrated into `src/App.jsx`.

## Canonical content configuration

- `src/dreams.config.json` is the single source of truth for mood profiles, mood colors/audio settings, dream ingredients, destination labels, daily prompts, recipe templates, asset URLs, and local-only tracking metadata.
- `src/dreams.schema.json` describes the accepted config shape.
- The app derives its mood, ingredient, destination and daily-prompt arrays from this JSON. Do not re-add parallel hard-coded arrays to `App.jsx`.

## Chaos Overlay

`src/components/ChaosOverlay.jsx` is mounted in the header in controlled mode. `App.jsx` owns `chaosMode`; the overlay consumes `enabled` and calls `onToggle`. The original `.desktop.chaos-mode` stylesheet remains intact. The injected 1999 effect owns and removes its scoped CSS, star layer, pointer listeners and trail nodes when disabled or unmounted. It respects reduced motion and skips touch pointer trails.

## Shared audio

- `src/audio/dreamAudioBus.js` remains the only module that connects a master gain to `AudioContext.destination`.
- `getDreamAudioGraph()` exposes that same graph to feature modules; it returns `null` when the global mute is active.
- `src/utils/LullabyLabEngine.js` creates bounded oscillator voices and routes them through the supplied graph. The app passes `getDreamAudioGraph` and a current-state sound callback, and calls `engine.setEnabled(false)` synchronously on mute before React re-renders.
- Lullaby Lab uses the mood configuration for its arpeggio. Compiling a dream also plays a short contextual cue while sound is enabled.

Do not instantiate another audio engine or connect a feature directly to `AudioContext.destination`. If you add another sound feature, pass the existing graph and make the app-level sound state authoritative.

## Local data and privacy

Dream Shelf, Dreambook wishes, and the odometer remain browser-local. The tracking matrix in the configuration is declarative metadata; it does not enable remote analytics or cross-device sharing.

## Verification

Run these commands in the project root:

```powershell
npm ci
npm run validate:architecture
npm run test:audio-engine
npm run lint
npm run build
```

Then manually test:

1. Toggle 1999 Chaos Mode repeatedly and confirm the original visual theme returns without leftover stars or pointer trails.
2. Turn sound off while the lullaby or a generated cue is playing. No scheduled notes should continue or resume unexpectedly.
3. Change mood, ingredient and destination; the recipe and its sound should be sourced from the canonical JSON.
4. Test keyboard navigation, mobile layout and `prefers-reduced-motion: reduce`.
