# PIP:// DREAM.EXE — Modular Upgrade Blueprint

This document describes the integrated frontend architecture for the current React 19 + Vite application.

## Canonical modules

- `src/dreams.config.json`: single source of truth for mood, recipe, ingredient, destination, daily-prompt, color, audio, asset, and local tracking configuration.
- `src/dreams.schema.json`: JSON Schema for validating the configuration structure.
- `src/components/ChaosOverlay.jsx`: controlled, opt-in retro overlay mounted by `App.jsx`; removes every injected style, DOM node, class and pointer listener on disable/unmount.
- `src/utils/LullabyLabEngine.js`: mood-aware arpeggio engine. It is passed the app-owned audio graph, bounds active voices, and stops scheduled voices when the app mute state changes.
- `src/audio/dreamAudioBus.js`: owns the only `AudioContext.destination` connection and global master gain.
- `src/data/DreamSync.js`: separately available local Dream Shelf import/export helper; storage key remains `pip-dream-shelf`. Import validation writes storage before invoking its state callback.

## Architecture contracts

1. Application copy and mood data should be changed in `src/dreams.config.json`, not by creating parallel arrays in JSX.
2. `App.jsx` owns the global `soundEnabled` and `chaosMode` state.
3. The Chaos Overlay is controlled through `enabled` and `onToggle`, so the original `.desktop.chaos-mode` design and injected retro effects remain synchronized.
4. The app passes `getDreamAudioGraph` to the Lullaby Lab engine. Feature audio must route through this shared output and must never connect directly to `AudioContext.destination`.
5. Persistence and tracking stay local-only. No account provider or remote analytics endpoint is present.

## Validation

```powershell
npm ci
npm run validate:architecture
npm run test:audio-engine
npm run lint
npm run build
```

After automated checks, test Chaos Mode cleanup, mute during scheduled notes, mood-driven dream generation, keyboard navigation, mobile widths, and reduced-motion behavior in a browser.
