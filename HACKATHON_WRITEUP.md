# PIP:// DREAM.EXE — Hackathon Write-up

## Project summary

- **Event:** haX.baby — Baby’s First Website
- **Track:** Pip (official character track)
- **Project name:** PIP:// DREAM.EXE
- **Experience name:** Pip’s Dream Workshop
- **Format:** Interactive React frontend

## One-line pitch

PIP:// DREAM.EXE is a tiny retro dream operating system where visitors help Pip turn a feeling into a dream, send it across a night sky, and keep a small shelf of dreams for another visit.

## Concept

The project is designed to feel like discovering a strange, gentle personal computer late at night. Pip is more than a homepage mascot: the workshop’s interactions follow the character’s role as a dream engineer. Visitors can experiment with light and sound, compose a dream from a few choices, deliver it, and save it for later.

The visual identity uses a midnight-plum and purple palette with dusty-pink and moon-gold accents, system-like labels, an inline SVG skull-faced Pip illustration, and restrained interface sounds. The goal is to combine the curiosity of an early personal website with a coherent, usable experience.

## Visitor journey

1. **Boot into Dream Mode.** A boot-style opening establishes the retro-computer metaphor and welcomes visitors into Pip’s world.
2. **Meet Pip.** The profile introduces Pip as a sleepy, gentle dream engineer. A hidden interaction rewards exploration.
3. **Explore the workshop.** Lullaby Lab plays a synthesized melody, Nightlight Studio adjusts a glow, and Dream Courier animates a delivery to a selected destination.
4. **Create a dream.** Visitors choose a mood, an ingredient, and a destination. The Dream Ritual combines those choices into a title and message.
5. **Save or send it.** A recipe can be saved to Dream Shelf for reopening in the same browser, or sent with Pip through Dream Courier.
6. **Discover the story.** Three origin-story scenes provide context for Pip and the workshop.
7. **Leave a note.** Dreambook accepts a short message and stores it in the current browser.

## What makes the experience distinctive

- **Connected modules:** Dream Ritual’s selected destination can be carried into Dream Courier, so the tools feel like parts of one workshop.
- **Personal without an account:** visitors can make and save a dream without registering.
- **A reason to return:** the daily reflection prompt changes by date, and Dream Shelf keeps a small set of recipes locally.
- **A consistent visual world:** the dark terminal-inspired interface, soft accent colors, custom character treatment, and sound design reinforce the dream-computer concept.
- **Client-side by design:** dream recipes are assembled from predefined choices and templates. No external AI generation service is used.

## Implementation overview

The interface uses React and Vite. CSS provides the visual system, responsive layout, and animations; an inline SVG provides Pip’s skull-faced character illustration. The browser’s Web Audio API synthesizes the lullaby and interface tones. `localStorage` persists Dream Shelf entries, Dreambook notes, and local activity/preferences. The origin story uses `IntersectionObserver` where available, with a fallback for revealing its scenes.

## Accessibility and responsive considerations

The page includes responsive layout rules, native form controls, explicit sound controls, and reduced-motion handling for supported effects. The final deployed version should still be checked with keyboard-only navigation, a narrow mobile viewport, and the browser’s reduced-motion preference; these checks should be performed on the exact commit submitted to the event.

## Privacy and known limitations

This is a frontend prototype with no backend, authentication, database, or cross-device synchronization. Dream Shelf recipes and Dreambook entries remain in the visitor’s browser and can be removed when site data is cleared. The guestbook is not a shared live feed, and the odometer is a local activity metric rather than a global visitor count. The dream compiler uses local templates and should not be described as an AI model.

## Team

- **Anandsingh Rajput**
- **Dharmendrakumar Yadav**
- **Pratham S B**

The team collaborated on the existing `pip-dream-exe` React/Vite codebase and the hackathon experience. Repository commits provide the detailed development history; do not assign individual feature ownership unless the team has confirmed it.

## Credits and disclosure

- **Pip:** official character associated with the event’s Pip track; follow the organizer’s required attribution.
- **Fonts:** Nunito and DM Mono via Google Fonts.
- **Framework and tooling:** React, Vite, and ESLint.
- **Browser APIs:** Web Audio API, `localStorage`, and `IntersectionObserver`.
- **Starter code and contributions:** the project evolved from the team’s existing `pip-dream-exe` repository. Preserve the Git history and acknowledge team contributions accurately.
- **AI assistance:** AI tools were used during development to assist with brainstorming, documentation, and implementation support. The team should ensure this description matches its actual process and the event’s disclosure rules.

## Final submission checklist

- [ ] Confirm the repository is public if required by the event.
- [ ] Deploy the intended final commit and test the live URL.
- [ ] Run `npm run lint` and `npm run build` on the final commit.
- [ ] Test Dream Ritual → Dream Shelf → Dream Courier end to end.
- [ ] Verify the MUTE SYSTEM control and all contextual sound controls stay synchronized.
- [ ] Verify odometer increments, duplicate-save behavior, and persistence after refresh.
- [ ] Test the day/night theme, hidden interaction, origin story, Dreambook, and Chaos Mode.
- [ ] Test mobile layout, keyboard interaction, reduced-motion behavior, and the sparkle trail on a real pointer device.
- [ ] Confirm Pip attribution, asset credits, team names, and AI disclosure against the event’s requirements.
- [ ] Submit the actual deployed URL and this write-up through the official submission process.
