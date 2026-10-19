# PIP:// DREAM.EXE

**Pip’s Dream Workshop** — a small, interactive dream operating system built for the haX.baby *Baby’s First Website* hackathon.

> Visitors enter Pip’s night-time workshop, explore tiny creative tools, turn a mood into a dream recipe, and send or save that dream.

## Project at a glance

- **Event:** haX.baby — Baby’s First Website
- **Track:** Pip (official character track)
- **Format:** React single-page frontend
- **Status:** Interactive prototype; production deployment is not yet recorded in this repository
- **Persistence:** Browser-local storage only; no account system or backend

## Experience and features

- **Dream-mode boot screen** introduces the retro-computer world.
- **Pip profile and hidden interaction** present Pip as the skull-faced baby Junior Dream Engineer, with a small discovery for curious visitors.
- **Lullaby Lab** plays a short melody synthesized in the browser with the Web Audio API.
- **Nightlight Studio** lets visitors adjust a soft glow and switch it on or off.
- **Dream Courier** offers destination selection, an animated rocket delivery, and delivery feedback.
- **Daily prompt** provides a reflection question that changes by calendar day.
- **Dream Ritual** combines a selected mood, ingredient, and destination into a personalized dream recipe using local templates.
- **Dream Shelf** stores a small collection of recipes so they can be reopened in the same browser.
- **Dreambook** lets visitors leave a short note stored locally in their browser.
- **Dream activity odometer** counts dream compilations and first-time shelf saves locally; it is not a global visitor counter.
- **Day/night theme, shared sound control, and a bounded sparkle cursor trail** support the visual and audio experience.
- **Origin story** reveals Pip’s story across three scenes.
- **Responsive layout and Chaos Mode** provide alternate behavior and layouts to explore.

## Try the main journey

1. Start the experience with **Enter Dream Mode**.
2. Explore Lullaby Lab, Nightlight Studio, and Dream Courier.
3. In Dream Ritual, choose a mood, ingredient, and destination, then select **Make my dream**.
4. Save the generated recipe to Dream Shelf, refresh the page, and reopen the saved item.
5. Select **Send with Pip** and follow the delivery through Dream Courier.
6. Explore Pip’s origin story, try the hidden interaction, and leave a Dreambook note.
7. Toggle the sound and day/night controls; check the layout at desktop and mobile widths.

Dream recipes are assembled in the browser from predefined choices and templates. The application does not call an external AI service to generate them.

## Run locally

### Requirements

- Node.js compatible with the Vite version in `package.json`
- npm

### Install dependencies and start the development server

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Run quality checks

```bash
npm run lint
npm run build
```

To serve the production build locally after building:

```bash
npm run preview
```

## Technology

- **React** and **React DOM** — interface and component state
- **Vite** — development server and production build
- **CSS and inline SVG** — visual system, responsive layout, animations, and Pip illustration
- **Web Audio API** — synthesized melody and interface sounds
- **`localStorage`** — browser-local Dream Shelf, Dreambook, and related local preferences/counters
- **Google Fonts** — Nunito and DM Mono

## Data, privacy, and limitations

This is a frontend prototype. It does not currently include a server, user accounts, a database, or cross-device synchronization. Dream Shelf entries, Dreambook notes, and local counters are stored in the current browser. They are not shared with other visitors, and clearing site data may remove them. Browser privacy settings can also restrict persistence.

The Dreambook is therefore a **local guestbook**, not a live community-wide feed. The odometer reflects activity recorded on the current device, not unique people or global visits. Do not enter sensitive or private information into the Dreambook.

## Team

- Anandsingh Rajput
- Dharmendrakumar Yadav
- Pratham S B

The project was developed collaboratively from the team’s existing `pip-dream-exe` React/Vite codebase. Keep the repository history intact so contributions and changes remain reviewable.

## Credits and attribution

See [ASSET_CREDITS.md](./ASSET_CREDITS.md) for the current asset, framework, and browser API credits. Pip is the character associated with the event’s Pip track; follow the event organizer’s official attribution guidance and do not present Pip as an original character created by the team.

## Submission readiness

Before submitting, verify the final public repository settings, deploy and test the intended commit, and provide the real demo URL in the event submission form. No live deployment URL is claimed in this README because one has not been verified here. Run the lint/build checks and test the core journey on desktop and mobile after the final merge.
