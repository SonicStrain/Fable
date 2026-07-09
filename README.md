# The Mysteries of Grey Harbor

A three-chapter point-&-click mystery game for **Android and iOS**. Lightweight
(the whole game is ~220 KB of hand-crafted SVG art and vanilla JavaScript — no
engine, no frameworks, fully offline), atmospheric, and story-driven.

> **Chapter One — The Keeper of Grey Harbor.** Your uncle Alvar kept the
> light for nine years. Three weeks ago his letters stopped — mid-sentence.
> The light still turns every night, but its keeper is gone.
>
> **Chapter Two — The Silent Bell** *(unlocked by finishing Chapter One)*.
> Winter fog swallows the harbor, Marta's midnight ferry is feeling her way
> home — and for the first time in eighty years, the fog bell of Bell Rock
> is silent.
>
> **Chapter Three — The Wreck of the Marigold** *(unlocked by finishing
> Chapter Two)*. The storm of the century is bearing down, Voss will finally
> talk, and everything — the darkened light, the silenced bell, a ship lost
> in 1893 — turns out to be one story. Light and bell against the storm, in
> an animated finale that ties every thread together.

## The game

- **Three chapters, fourteen scenes** — from the dusk dock and the
  smuggler's sea cave, through the fog-bound shore and Bell Rock, to the
  storm-lashed dock, Voss's lock-up, and a climactic finale — each chapter
  opening with its own animated cutscene.
- **8 puzzles** — a code lock fed by a stopped clock, a Caesar-wheel cipher,
  a lens-alignment mechanism, a rusted winch, a storm-year padlock, a bell
  you must ring in time with its swing, a hidden relay lock, and a
  rotating flywheel you must catch to charge the storm reserve.
- **Animated story cutscenes** at the start of every chapter and driving
  Chapter Three's finale — full-screen scenes with drawn-on ink, flickering
  candlelight, drifting fog, driving storm rain and lightning, and a
  multi-slide climax (the light and bell overwhelming a smuggler's
  schooner, the harbor closing in, dawn breaking over the recovered chest)
  — tap to advance, or Skip straight to the point.
- **Branching dialogue** with the folk of Grey Harbor, a field-notes journal
  that tracks clues and your current objective, tap-to-use inventory, and a
  hotspot hint button.
- **Save & continue per chapter** — progress saves automatically on every
  action, the menu has an explicit "Save & Exit to Title", the title screen
  is a chapter-select showing lock state and "✓ solved" badges, and each
  chapter's ending offers a direct "Begin/Continue Next Chapter ▸" button.
- **A procedural soundtrack** — every scene has its own generative ambient
  score (dusk harbor waves, a music-box cottage, wind on the black cliffs,
  echoing cave drips, a muffled fog hush, a tense storm), synthesized live
  with WebAudio — including a real bronze bell strike and a metallic
  flywheel clank — so it adds zero bytes of assets. Toggle it with the ♪
  button on the title screen, in the top bar, or from the menu; the
  preference is remembered.
- All art is procedural inline SVG with subtle ambient animation (sweeping
  beams, flickering fires, drifting waves, driving rain) — crisp at any
  resolution and battery-friendly.

## Builds

### Android (ready to install)

Prebuilt APKs are in [`builds/`](builds/):

| File | Use |
|---|---|
| `GreyHarbor-release.apk` | **Recommended.** Signed release build (3.5 MB). |
| `GreyHarbor-debug.apk` | Debug build, for development. |

Install by copying to a device and opening it (enable "install unknown apps"),
or via `adb install builds/GreyHarbor-release.apk`. Minimum Android supported
by Capacitor 8 (API 23+ / Android 6).

> The release APK is signed with the demo keystore `android/release.keystore`
> (see `android/app/build.gradle`). Replace it with your own key before any
> store distribution.

To rebuild:

```bash
npm install
npx cap sync
cd android && ./gradlew assembleRelease   # or: gradle assembleRelease
```

### iOS (Xcode project, ready to build)

iOS apps can only be compiled and signed by Xcode on macOS, so the deliverable
is the complete, synced Xcode project in [`ios/`](ios/). On a Mac:

```bash
npm install
npx cap open ios        # opens ios/App in Xcode
```

Then select your signing team (Signing & Capabilities → Team), pick a device
or simulator, and press Run. For a distributable `.ipa`: Product → Archive.
The project is already configured with the app icon, night-sky splash screen,
portrait orientation lock, and the full game in `ios/App/App/public`.

### Play instantly in a browser

The game is plain web tech — for a quick look:

```bash
cd www && python3 -m http.server 8000
# open http://localhost:8000 (use a phone-sized window)
```

## Testing

The game ships with an automated test suite that plays the entire story like
a real player — every dialogue branch, wrong-answer paths, all puzzles, the
save/reload cycle — plus a hotspot-reachability audit across 9 device sizes
from the iPhone SE to a 21:9 Sony to an iPad:

```bash
npm install
node test/playthrough.js            # all 3 chapters, 210+ assertions (VP=320x568 to vary viewport)
node test/reachability.js           # every hotspot tappable on 9 viewports, all 14 scenes
node test/gen-icons.js              # regenerate app icons/splashes from SVG
```

Screenshots from the test run land in `test/shots/`.

## Project layout

```
www/            the game (index.html, css/, js/art.js, js/data.js, js/engine.js)
android/        Capacitor Android project (Gradle)
ios/            Capacitor iOS project (Xcode)
builds/         prebuilt Android APKs
test/           automated playthrough + device-matrix tests
```

- `js/art.js` — all scene art, portraits, and item icons as generated SVG.
- `js/audio.js` — the generative WebAudio soundtrack (per-scene moods).
- `js/data.js` — the story: items, clues, objectives, dialogue trees, scene
  hotspots, and puzzle definitions.
- `js/engine.js` — the point-&-click engine: state, saving, rendering,
  inventory, dialogue, puzzles, journal.
