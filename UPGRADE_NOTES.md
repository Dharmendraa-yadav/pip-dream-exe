# PIP:// DREAM.EXE — Final Frontend Upgrades

## Primary requested files

- `src/hooks/useSparkleTrail.js` — canvas particle trail rendered with `requestAnimationFrame`; bounded particle/burst counts; randomized 600–1200 Hz base chime requests; respects reduced-motion preference and cleans up listeners/frames.
- `README.md` — judge-facing project landing page covering Structured Whimsicalism and the modules demonstrated in the presentation, with local-only boundaries stated accurately.
- `scripts/validate-dream-os.mjs` — source-architecture checks and a production `dist/` audit. The dist audit validates `index.html`, its bundle references, and absence of raw source/backup files.

## Necessary integration files included

- `src/utils/LullabyLabEngine.js` — adds `playSparkleChime()` to the existing shared-bus engine. No new AudioContext is created by the hook.
- `src/App.jsx` — mounts the canvas and passes chime events to the existing engine; the app-level sound state remains authoritative.
- `package.json` — makes the build run source checks before Vite and distribution checks after Vite.
- `scripts/test-lullaby-engine.mjs` — tests the new harmonic chime path.

## Verification performed in this environment

Passed: `npm run lint`, `npm run validate:architecture`, `npm run test:audio-engine`, `node scripts/validate-dream-os.mjs --dist-only`, and `git diff --check`.

A fresh Vite build could not be completed in this Linux environment because the extracted dependency tree did not contain Rolldown's Linux native binding (it had been installed for another platform). The deliverable excludes `node_modules/` and `dist/`; install dependencies on the target machine and run `npm ci` before `npm run build` to get a native install and a fresh release artifact.
