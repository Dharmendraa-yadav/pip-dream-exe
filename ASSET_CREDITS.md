# Asset, Tool, and Attribution Credits

This document records the assets, libraries, browser APIs, and project origins identifiable in the current source. It should accompany the public repository and final hackathon submission.

## Character and event material

- **Pip:** the character associated with the haX.baby *Baby’s First Website* Pip track. Pip is not an original character created by this team. Follow the organizer’s official attribution and usage guidance in the final submission.
- **Pip illustration in the interface:** the active profile uses an inline SVG illustration stored in `src/components/SkullBabyAvatar.jsx`, styled with CSS from the project. This describes the implementation technique; it does not transfer ownership of the underlying character.

## Fonts

- **Nunito** — Google Fonts: <https://fonts.google.com/specimen/Nunito>
- **DM Mono** — Google Fonts: <https://fonts.google.com/specimen/DM+Mono>

## Frameworks and developer tools

- **React** — <https://react.dev/>
- **Vite** — <https://vite.dev/>
- **ESLint** — <https://eslint.org/>

These tools are used as project dependencies and development tooling. Refer to their official sites and package metadata for their respective licenses and notices.

## Browser platform APIs

- **Web Audio API** — synthesizes the lullaby and short interface tones in the browser.
- **`localStorage`** — stores local preferences, Dream Shelf entries, Dreambook notes, and local activity data.
- **`IntersectionObserver`** — supports scroll-revealed origin-story scenes where available.

These are browser platform APIs rather than separately downloaded third-party assets.

## Project origin and team contributions

The project evolved from the team’s existing `pip-dream-exe` React/Vite codebase. Preserve the repository’s Git history and acknowledge the starter work and subsequent contributions fairly.

Team members:

- Anandsingh Rajput
- Dharmendrakumar Yadav
- Pratham S B

Feature-level ownership is not assigned in this file because individual responsibilities have not been independently verified. The team should use the actual commit history and its own records when more detailed contribution statements are required.

## Audio, imagery, and other assets

The current implementation synthesizes its interface tones and lullaby with the Web Audio API, and the Pip figure is an inline SVG illustration styled with project CSS. Before publishing, review the final repository and deployed build for any additional third-party icons, images, textures, sounds, snippets, or downloaded assets. Add their source and license here if any are present.

## AI assistance disclosure

AI tools were used during development for brainstorming, documentation drafting, and implementation support. The team remains responsible for reviewing, testing, and understanding the submitted code. Confirm that this disclosure accurately describes the team’s process and satisfies the event’s rules before submission.

## Attribution review

The source and dependencies identify the credits listed above. The following checks are part of final release review, not claims that external attribution requirements have already been confirmed:

- Confirm the exact Pip credit line required by the event organizer.
- Check the final source tree and production assets for any additional third-party material.
- Ensure the public repository retains license notices required by dependencies and assets.
- Ensure the README, hackathon write-up, and submission form use consistent project and team names.
