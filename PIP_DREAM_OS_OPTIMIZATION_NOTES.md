# PIP:// DREAM.EXE — Targeted Frontend Optimization

## What changed

- `src/audio/dreamAudioBus.js` is the only owner of the Web Audio context and master gain. Interface chimes and the lullaby route through that output.
- Muting applies a zero gain at the current audio time and stops tracked oscillator nodes immediately. The mute preference is persisted at `pip-dream-audio-muted`.
- `BonusAudioController.jsx` is now controlled by App state and no longer creates a private audio context or private mute state.
- `App.jsx` mounts the controlled sound controller and `DreamGuestbook`, and the app no longer contains a second Web Audio graph or a duplicate guestbook implementation.
- `usePersistentDreamCounter.js` synchronously hydrates the counter on first render, migrates the old modular counter key, seeds from the shelf when needed, clamps values, and writes increments synchronously plus an effect-based safety sync.
- `DreamGuestbook.jsx` receives the canonical counter as a prop and renders a six-digit, zero-padded display; it no longer owns a competing counter key.
- Dreambook entries are persisted from the submit handler, so a quick reload does not depend solely on a later effect.
- Conditional Nightlight/Courier panels have stateful accessible labels and valid active `aria-controls` targets. The project manifest accordion exposes expanded state and makes collapsed panel content inert.
- `eslint.config.js` adds Node globals for the repository’s `.mjs` validation script without changing the browser/React lint rules for app source.

## Validation performed here

- `node scripts/validate-dream-os.mjs --checks-only` — passed.
- TypeScript's JSX transpiler syntax pass across `src/` and `scripts/` — passed.
- A mock Web Audio test verified that one master output reaches `AudioContext.destination`, oscillators do not connect directly to the destination, and mute stops active oscillators — passed.

## Still required on the project machine

Dependency installation timed out in this environment and ESLint was not present, so a full `npm run lint` and `npm run build` were not verified here. From the project root, run:

```powershell
npm ci
node scripts/validate-dream-os.mjs
```

The validation script checks architecture/accessibility invariants, then runs `npm run lint` and `npm run build`, exiting non-zero if any gate fails. Do not treat the change as release-ready until both commands pass on the project machine and the UI is manually tested.
