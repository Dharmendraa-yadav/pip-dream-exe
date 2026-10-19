# PIP:// DREAM.EXE

### Pip: Junior Dream Engineer · A tiny operating system for the things we dream about

**Built by `pip-dream-exe-team` for haX.baby — Baby's First Website.**

PIP:// DREAM.EXE is an atmospheric, interactive dream workshop starring Pip, a gentle junior dream engineer. Visitors compose a small dream from a mood, an ingredient, and a destination; save it to a personal Dream Shelf; and send it through Pip's animated Dream Courier.

> **Soft Magic Enabled. No Dream Left Behind.**

## Our design thesis: Structured Whimsicalism

“Baby's First Website” can evoke loud colors, flashing decorations, and deliberate early-web messiness. We chose a different interpretation: preserve the intimacy, curiosity, and surprising discoveries of a personal 1999-era website, but present them through the deliberate visual language of a cozy indie game and a fictional desktop operating system.

That approach is **Structured Whimsicalism**. A midnight-plum workspace, dusty-pink accents, moon-gold highlights, terminal-inspired labels, restrained motion, and synthesized sound give Pip a consistent world to inhabit. Boot-up copy and hidden interactions bring back the delight of exploring a hand-built personal website without making the interface hard to use.

The contrast is intentional: the interface feels calm, while its little world remains full of secrets.

## Walkthrough: the experience in the demo

### 1. Boot Splash Screen

The experience opens as a tiny system boot sequence for Midnight Nursery Systems. Visitors choose **Enter Dream Mode** to enter Pip's workshop. The boot screen establishes the character, tone, and fantasy before presenting the interactive desktop.

### 2. Day/Night Mode Theme Switcher

The header toggle switches between the default night palette and a lighter day presentation. The theme is an explicit visitor-controlled state; it is not described as a sensor for a person's biological clock or local sleep cycle.

### 3. Lullaby Lab Synthesizer

The Lullaby Lab plays short melodies generated in the browser with the Web Audio API. The mood-aware engine accepts configured oscillator profiles and note ratios, and routes generated notes through the app's shared audio bus. The global mute control remains authoritative, and scheduled notes are stopped when sound is disabled.

### 4. Nightlight Studio — brightness range control

Nightlight Studio provides an on/off control and a brightness range slider that changes the displayed ambient glow. It turns a simple form control into part of the fictional workspace and gives visitors a tactile way to shape the scene.

### 5. Dream Ritual — compose a recipe

Visitors choose a mood, a dream ingredient, and a destination. The app fills a configured title and message template to produce a personalized dream receipt. Mood colors, emotional keywords, audio parameters, ingredients, destinations, and recipe copy live in `src/dreams.config.json` instead of being maintained as unrelated lists inside the rendering loop.

Dream composition is client-side and template-driven. It does not claim to be an external or generative-AI service.

### 6. Dream Shelf — zero-auth, browser-local persistence

A visitor can save a generated dream to Dream Shelf and reopen it later in the same browser. The app uses `localStorage`, so there is no sign-in gate or database round trip for the core save/reopen experience. The shelf is intentionally small and local-first; saved items are not synced across devices or shared with other visitors.

### 7. Dream Courier — constellation delivery sequence

Dream Courier lets a visitor choose a destination and watch Pip's rocket delivery animation progress through the night-sky setting. Delivery state and receipt feedback give the action a beginning, middle, and end, making the courier an experience rather than a static portfolio card.

### 8. Dream Passport — native print / PDF pipeline

A delivered dream can be presented as a keepsake in a dedicated browser window. The page is styled for a landscape passport layout and invokes the browser's native print interface, where visitors can print or choose **Save as PDF**. This is a browser-native print flow, not a server-generated PDF service.

### 9. Lore side quest — origin story and Dreambook message board

Pip's origin story unfolds over three scenes. The Dreambook invites visitors to leave a small note in the workshop, and its local entries remain in that browser. This is a local message board rather than a shared live feed; the project does not claim real-time cross-visitor messaging.

Additional discoveries include Pip's hidden interaction, a daily dream prompt, the Dream activity odometer, sound feedback, and Chaos Mode's more playful visual treatment.

## Architecture and implementation

| Layer | Implementation | Responsibility |
|---|---|---|
| UI | React 19.2.8 | Functional components, stateful interactions, and UI composition |
| Tooling | Vite 8 + Rolldown | Development server and production asset bundling |
| Styling | Custom CSS | Dream OS theme, transitions, responsive layout, and scene styling |
| Audio | Web Audio API | Synthesized lullaby and interface cues through a shared master gain |
| Content | `src/dreams.config.json` | Mood profiles, template copy, ingredients, destinations, and local-only feature metadata |
| Persistence | `localStorage` | Dream Shelf, Dreambook entries, and local activity/preferences |
| Quality | ESLint flat config | JavaScript and React Hooks checks |
| Release gate | `scripts/validate-dream-os.mjs` | Source architecture assertions and post-build distribution audit |

### Shared audio, not one audio graph per widget

`src/audio/dreamAudioBus.js` owns the application audio context and master gain. The Lullaby Lab engine and interaction controllers route sounds through that shared output. The canvas sparkle hook delegates short chimes to the same engine; it does not create its own AudioContext inside a pointer or animation loop. This keeps sound control consistent and avoids allocating audio contexts as a side effect of cursor movement.

### Canvas-based sparkle trail

`src/hooks/useSparkleTrail.js` renders cursor particles on a single canvas using `requestAnimationFrame`. Particle count, lifespan, spawn frequency, and burst size are bounded; the frame loop sleeps when no particles remain; and resize, visibility, reduced-motion, and unmount handling clean up the canvas work. A throttled chime callback can accompany mouse-click bursts while respecting the app's sound state.

### Production build gate

The `build` script runs architecture checks before invoking Vite, then audits `dist/` after compilation. The distribution audit checks that the expected HTML and asset tree exist, local HTML asset references resolve to files, source-only modules and backup files have not leaked into the deployment folder, and `dist/index.html` does not contain references to `App.original.jsx` or raw JSX entry points.

Hashed asset names change when build content changes. The release gate therefore verifies the references generated by the current build instead of hard-coding a filename such as `index-DYlRFjqM.css`.

## Run locally

### Requirements

- Node.js compatible with the Vite version specified in `package.json`
- npm

### Install and start

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

### Quality checks

```bash
# Verify the source-level modular architecture
npm run validate:architecture

# Test the Lullaby Lab shared audio bus and mute behavior
npm run test:audio-engine

# ESLint
npm run lint

# Production build: architecture checks + Vite build + dist audit
npm run build
```

To serve a completed build locally:

```bash
npm run preview
```

## Privacy and product boundaries

PIP:// DREAM.EXE is a client-side frontend prototype. The core interaction has **zero database or authentication dependency** and does not need a remote service to compose, save, or reopen a dream in the same browser. That also means local data has limits: clearing browser site data may remove the Dream Shelf, Dreambook notes, and local counters. Browser settings can block local storage, and content does not sync between devices.

The Dream activity odometer reflects recorded local activity. It is not a global visitor counter, a unique-user count, or analytics shared with the team. The Dreambook is local-only, not a multi-user live guestbook. The project does not capture microphone input or provide remote AI dream generation.

## Team

`pip-dream-exe-team`

Built collaboratively on the team's existing React/Vite codebase. Preserve the repository's commit history so individual contributions and integration work remain reviewable.

## Credits and attribution

See [ASSET_CREDITS.md](./ASSET_CREDITS.md) for the current asset and technology attributions. Pip is associated with the event's Pip character track; follow the organizer's official guidance and do not claim the official character as an original character created by the team.

## Submission checklist

- [ ] Run `npm run lint` and `npm run build` on the final commit.
- [ ] Test the boot-to-delivery journey on desktop and a mobile-sized viewport.
- [ ] Test global mute while the lullaby and sparkle chime are active.
- [ ] Test browser refresh for Dream Shelf and odometer persistence.
- [ ] Verify the public repository and deployed URL in the hackathon submission form.
- [ ] Keep claims consistent with shipped behavior: local features are local, and generated dreams are template-driven.

**PIP:// DREAM.EXE — a little operating system for the things we dream about.**
