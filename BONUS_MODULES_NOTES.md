# Bonus modules integration notes

This project copy integrates the three requested modules while preserving the original Pip layout and Lullaby Lab audio path.

## What's changed

- The header mounts `BonusAudioController` with the prominent **MUTE SYSTEM** label. It is synchronized with the existing `soundEnabled` state and Lullaby Lab's master gain; the saved mute preference also survives refresh.
- The old app-level click-chime listener was removed to prevent double chimes. Lullaby Lab's existing Web Audio/master-gain path remains intact.
- The old inline local guestbook was replaced with `DreamGuestbook`. It keeps the original `pip-dream-guestbook` storage key, so existing browser-local entries can be read. New submissions append immediately and increment `DREAMS SIMULATED`.
- `useSparkleTrail` adds a bounded floating emoji trail while preserving Pip's existing eye-follow and sparkle behavior.
- `bonus-modules.css` styles the modules in the existing plum, dusty-pink, and moon-gold palette with responsive layouts and reduced-motion handling.

## Checks to run in the project folder

```powershell
npm ci
npm run lint
npm run build
npm run dev
```

Test both mute directions, Lullaby Lab while muted/unmuted, click chimes on buttons/links, guestbook persistence after refresh, 320px and tablet widths, touch behavior, and reduced-motion preference.

## Score integrity

Guestbook data is stored only in the current browser. It is persistent on that device, but not a shared/live backend. The official haX.baby brief lists Live Guestbook (+2), Sparkle Cursor Trail (+2), Hit Counter Odometer (+1), Click Sounds + Mute Toggle (+3), and Responsive Chaos Mode (+5) as separate quests. The local guestbook alone does not guarantee live-guestbook points; use a shared backend if judges expect visitors to see each other's messages. Keep the existing explicit Chaos Mode control and verify the full layout at real device widths.
