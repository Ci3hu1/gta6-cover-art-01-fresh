# gta6-cover-art-01-fresh

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-fresh/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-fresh/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Afterglow Vice Cover Studio** — a free, offline web app that turns any photo into GTA 6-style magazine cover art. Pick one of five painted Vice City scenes (or load your own photo), choose from 8 layouts and 8 sunset/neon colour grades, type a headline and a cast, then export the cover as a PNG in portrait, square or landscape. Everything runs in the browser; nothing is uploaded.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Drag the cover to reframe the photo, scroll to zoom, undo/redo with the top buttons. Export writes `afterglow-vice-portrait.png` (1080×1350), `afterglow-vice-square.png` (1080×1080) or `afterglow-vice-landscape.png` (1920×1080).

## How it works

- `app/src/scenes.js` — five procedural Vice City scenes (Boulevard Gold, Rooftop Dusk, Neon Street, Pier Light, Night Drive), painted with plain canvas gradients and silhouettes.
- `app/src/cover.js` — the compositor: 8 layouts, 8 colour grades, masthead, cover lines, type band, cast strip, barcode, seal and the TITO REYES name tag.
- `app/src/main.js` — the studio: state, undo/redo history, photo rail, pickers, drag-to-reframe, export and photo upload.
- `app/src/shots.js` — fixed `?shot=` scenes for screenshots.
- `main.ts` hands the app in (copies `app/` and `screenshots/`, writes `dossier.json`).

All art and lettering are original, drawn in code. No Rockstar Games logo, artwork or fonts.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cc7tcnw6&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
