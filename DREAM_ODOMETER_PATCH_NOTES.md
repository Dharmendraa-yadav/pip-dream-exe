# Dream Activity Odometer Patch

## Files changed by this patch

- `src/App.jsx`
- `src/App.css`

## Behavior

- Replaces the visible `LOCAL VISITS` label with `DREAMS SIMULATED`.
- Uses the new localStorage key `pip-dream-simulated-count` for dream activity.
- Counts each successfully compiled dream recipe.
- Counts a save only when that recipe ID is newly added to the Dream Shelf; saving the same recipe again or reopening it does not increment the counter.
- Caps the display counter at `999,999`, formats it as `000,000`, and animates value changes in a fixed-width numeric area to prevent layout shifts.
- Includes a polite live announcement for assistive technology and disables the tick animation for reduced-motion preferences.
- If this is the first run of the new counter, it seeds from existing saved shelf entries. It does not invent past compilation events.

## Existing data and behavior preserved

- `pip-dream-visit-count` and `pip-dream-counted-this-session` remain untouched for returning-visitor logic.
- `pip-dream-shelf` remains the shelf storage key and retains its existing four-item cap.
- `pip-dream-guestbook` and its existing entry shape/storage behavior are untouched.
- No audio, mute, sound-indicator, or intentional scrolling handlers were changed.

## Validation in the current workspace

- `npm run lint`: **passed** (ESLint returned no errors).
- `npm run build`: **attempted but blocked by the environment**, before Vite compiled the application. This copy of `node_modules` lacks the Linux Rolldown native binding `@rolldown/binding-linux-x64-gnu`; the project archive excludes `node_modules` so dependencies can be installed on the target machine.

On your Windows project folder, run:

```powershell
npm ci
npm run lint
npm run build
```

The counter is browser-local activity, not a global or shared visitor count.
