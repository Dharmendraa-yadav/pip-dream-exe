# PIP:// DREAM.EXE — Hackathon Write-up

**Event:** haX.baby — Baby's First Website  
**Track:** Pip (canon character)  
**Project:** Pip's Dream Workshop

## One-line pitch

PIP:// DREAM.EXE is a tiny retro dream-operating system where visitors help Pip, a sleepy dream engineer, turn a feeling into a dream, send it across a night sky, and keep a small shelf of dreams for another visit.

## The idea

We wanted the site to feel less like a conventional landing page and more like finding a strange, gentle personal computer late at night. Pip is not only a mascot on the homepage: the character's purpose is reflected in what visitors can do. Every module contributes to the same idea—making a small dream and helping it find a place.

## The visitor journey

1. **Enter Dream Mode.** A boot-style opening establishes the retro computer metaphor and invites the visitor into Pip's world.
2. **Meet Pip.** The profile introduces Pip as a curious, sleepy, gentle dream engineer. A small hidden interaction rewards visitors who explore.
3. **Explore the workshop.** Lullaby Lab generates a short melody in the browser, Nightlight Studio lets visitors tune a glow, and Dream Courier animates a delivery to a selected destination.
4. **Create a personal dream.** The daily prompt offers a reflection question. Visitors choose a mood, an ingredient, and a destination; the app combines those choices into a dream title and message.
5. **Keep or send it.** A visitor can save the recipe to the Dream Shelf and reopen it later in the same browser, or send it with Pip by passing its destination into Dream Courier.
6. **Leave a little wonder behind.** The three-scene origin story and Dreambook invite visitors to discover Pip's purpose and leave a short note.

## What makes it distinctive

- **One connected experience:** the Dream Ritual passes the selected destination to Dream Courier instead of treating each widget as an isolated demo.
- **Personal without an account:** visitors can make and save a small dream without signing up.
- **Built for repeat visits:** the reflection prompt changes by calendar day, while the Dream Shelf lets a visitor return to recipes saved in the same browser.
- **A hand-crafted night-sky identity:** a plum/purple palette, soft pink and gold accents, system-like labels, CSS-drawn Pip, and subtle interface sounds carry the retro dream-computer concept through the page.
- **Client-side by design:** dream recipes are composed locally from defined mood, ingredient, and destination options; the app does not send those choices to an external AI service.

## Implementation

The interface is built with React and Vite. CSS provides the visual system, responsive layout, and Pip illustration. The browser's Web Audio API creates the lullaby and light interface tones. `localStorage` keeps the Dream Shelf and Dreambook entries in the current browser. Scroll-triggered story scenes use the browser's `IntersectionObserver` where available, with a fallback that reveals the scenes.

## Privacy and limitations

This is a frontend prototype without a backend, user accounts, or synchronization between devices. Dream Shelf recipes and Dreambook notes are stored in the visitor's browser and can be lost if site data is cleared. Guestbook entries are **not** a community-wide feed shared among all visitors. The project should not be described as cloud-synced or AI-powered.

## Team and credits

**Team members:
    Anandsingh Rajput
    Dharmendrakumar yadav
    Pratham S B** 

**Credits to include in the final submission:**

- Pip character/official hackathon material: follow the event's official attribution guidance.
- Fonts: Nunito and DM Mono via Google Fonts.
- Tooling: React, Vite, and ESLint.
- Browser features: Web Audio API, `localStorage`, `IntersectionObserver`.
- Existing team starter code and prior contributions: acknowledge the original `pip-dream-exe` base and the contributors' work in the final repository history/credits.

**AI assistance disclosure:** AI assistance was used to help brainstorm and draft implementation changes during development; the team integrated the changes and ran local ESLint/build checks. Adjust this statement to match the team's actual process and the event's disclosure requirements.

**Demo URL:** Add only after deployment and testing of the final merged `main` branch.

## Final validation to complete before submission

- Run `npm run lint` and `npm run build` on the final `main` branch.
- Test the complete path from Dream Ritual to Dream Shelf to Dream Courier.
- Test sound mute during interactions, day/night appearance, hidden Easter egg, origin story, and guestbook persistence.
- Check mobile layout and keyboard focus.
- Verify the public repository requirement and complete all asset/team credits.
- Add the real live URL; do not submit a placeholder.
