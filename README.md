# PIP:// DREAM.EXE — Pip's Dream Workshop

A tiny dream-operating system for Pip: a sleepy little dream engineer who helps visitors turn a mood, a small ingredient, and a destination into a personal dream recipe.

> **Hackathon:** haX.baby — Baby's First Website  
> **Track:** Pip (canon character)  
> **Status:** Interactive frontend prototype; no backend or account system.

## The experience

PIP:// DREAM.EXE is designed to feel like opening a whimsical, retro personal computer after dark. Visitors meet Pip, explore a small workshop, make and deliver dreams, and leave a tiny message for the next visitor.

### Features

- **Dream-mode boot screen** that introduces Pip's world.
- **Pip profile** with a CSS-drawn character, a cursor sparkle on pointer devices, and a hidden note revealed after five taps/clicks on Pip.
- **Lullaby Lab** that plays a short synthesized melody using the browser's Web Audio API.
- **Nightlight Studio** with an adjustable glow and an on/off control.
- **Dream Courier** with selectable destinations, a rocket journey animation, and delivery feedback.
- **Daily dream prompt** that changes by calendar day.
- **Personal Dream Ritual** where visitors choose a mood, dream ingredient, and destination to create a short, personalized dream recipe.
- **Dream Shelf** for saving up to four generated dreams and reopening them later.
- **Dreambook guestbook** for leaving a short note.
- **Day/night appearance toggle** and a shared sound on/off control.
- **Scroll-revealed origin story** told across three scenes.
- **Responsive layout** intended for desktop and mobile screens.

## Try the core journey

1. Select **Enter Dream Mode**.
2. Explore the three workshop modules.
3. In the Dream Ritual, choose a mood, ingredient, and destination, then select **Make my dream**.
4. Save the generated recipe to the Dream Shelf, refresh the page, and reopen the saved item.
5. Select **Send with Pip** to open Dream Courier with that destination selected, then send the dream.
6. Leave a note in the Dreambook or find Pip's hidden note.

Dream recipes are generated in the browser from the visitor's choices and local prompt data; the app does not call an external AI service.

## Run locally

### Requirements

- Node.js compatible with the installed Vite version
- npm

### Install and start

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal (usually `http://localhost:5173`).

### Validate the project

```bash
npm run lint
npm run build
```

To preview the production build locally after building:

```bash
npm run preview
```

## Technology

- React and React DOM
- Vite
- CSS for the visual system, responsive layout, and CSS-drawn Pip character
- Web Audio API for synthesized interaction tones and the lullaby
- `localStorage` for the Dream Shelf and Dreambook entries
- Google Fonts: **Nunito** and **DM Mono**

## Local data and privacy

The project does not currently have a backend, accounts, or cross-device synchronization. Dream Shelf entries and Dreambook notes are stored in the current browser using `localStorage`. They are not shared with other visitors. Clearing site data may remove them; private-browsing settings or browser storage restrictions can prevent persistence. Do not enter sensitive personal information into the guestbook.

## Credits and attribution

- **Pip:** rendered as a CSS-drawn character in this project; Pip is the character for the hackathon's Pip track. Credit the original character/organizer according to the event's official rules.
- **Fonts:** Nunito and DM Mono, served through Google Fonts. See [Google Fonts](https://fonts.google.com/).
- **Framework/tooling:** [React](https://react.dev/), [Vite](https://vite.dev/), and [ESLint](https://eslint.org/).
- **Browser APIs:** Web Audio API and `localStorage` are browser platform features, not external services.
- **Team code and starter:** this project evolved from the team's existing `pip-dream-exe` React/Vite repository. Before submission, list every team member and accurately credit the original starter code and each contributor's work.

### Team

Add all official team-member names and contributions here before submitting. Do not leave this section incomplete in the final public repository.

| Team member | Contribution |
|---|---|
| `Add name` | `Add verified contribution` |
| `Add name` | `Add verified contribution` |
| `Add name` | `Add verified contribution` |

## Known limitations

- Saved dreams and guestbook entries are local to one browser/device; they are not a shared guestbook for all visitors.
- The project has no authentication, database, or server-side persistence.
- A synthesized melody and tones are used instead of a recorded music track.
- The public live-demo URL should be added here after the team intentionally deploys and tests the final merged `main` branch.

## Submission checklist

- [ ] Fill in the team roster and contribution credits.
- [ ] Confirm the official Pip/character attribution and all font/library credits.
- [ ] Confirm the repository is public if required by the event.
- [ ] Run `npm run lint` and `npm run build` on the final `main` branch.
- [ ] Test the final live URL after deployment.
- [ ] Add the final live URL and event-required write-up to this README or the submission form.
