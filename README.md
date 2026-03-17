Designed as an experiment to measure user scrolling behavior - a demo/snippet of a larger project.
 
Intended for mobile browsers and will not work on desktop browsers. Designed as an experiment to measure user behavior when they receive toast notifications that they are scrolling too quickly. Exports a data file with scrolling metrics after each session.

## Challenges / Workarounds

- **YouTube looping in an iframe**
  - Uses the YouTube iframe API (`enablejsapi=1`) and the common loop workaround (`loop=1` + `playlist=<videoId>`), since looping does not reliably work without the `playlist` parameter.
- **Mobile autoplay + audio restrictions**
  - Mobile browsers generally block autoplay with sound unless it is tied to an explicit user gesture.
  - Swipes/touch scrolling alone aren’t treated as consent for unmuted playback, so the app uses the Start button click to “pre-play” each iframe once (via `postMessage` commands), then immediately stops it. After that, the videos are able to play/unmute during swipes.
- **Shorts-style feed without a native player**
  - The feed is simulated by stacking full-screen-ish `.content` containers and translating them with `transform: translateY(...)` on swipe.
  - Swipe detection is implemented with `touchstart`/`touchend` and a pixel threshold.

## Data export (end of session)

- **What is captured**
  - Data is stored as CSV text in-memory with header: `videoNumber,time`.
  - Each successful swipe appends a row where:
    - `videoNumber` is `numOfSwipes + 1` (one-indexed).
    - `time` is elapsed seconds since the experiment start (`(now - START_TIME) / 1000`).
  - If the user is swiping too quickly (above the threshold), a “Slow Down” toast is shown.
- **How it’s exported**
  - Tap **X** to end the session, then tap **Download Data**.
  - Download is generated client-side using a `data:` URL and a temporary `<a download>` element.
  - If the browser doesn’t support the `download` attribute, it falls back to navigating to the encoded `data:` URL.
- **Filename**
  - The filename is derived from the experiment start time, formatted like `MM-DD-YYYY_HH.MM.SS.csv`.
