# Audio player research, Anna Milazzo landing page

Primary-source build brief. Stack context: Next.js 16.3.4 App Router, React 19, Tailwind v4,
Payload CMS 3.88, Postgres, Cloudflare R2, self-hosted on Coolify. Up to ~12 Songs, each with a
custom-styled player, all on one landing page inside paper-folder cards. No Spotify/SoundCloud
embeds.

Researched 2026-09-04. Package versions verified against the npm registry on that date.

---

## Summary

1. A custom transport needs exactly five events: `loadedmetadata`, `timeupdate`, `ended`, `play`, `pause`. Everything else is polish.
2. `preload="metadata"` fires a real network request **per element**, a dozen players means a dozen requests before anyone presses play; `preload="none"` fires zero.
3. Apple documents that on iOS "preload and autoplay are disabled" outright, so `duration` is unavailable before first play, duration must come from Payload, not the browser.
4. There is no native "only one plays at a time"; it is always app state. Apple documents iOS as limited to "a single audio or video stream at any time".
5. **Recommendation: one shared `<audio>` element, `src` swapped on play.** Mutual exclusion becomes structural, memory and connections stay constant, and it matches the iOS constraint exactly.
6. Use a native `<input type="range">` for the seek bar, the APG slider pattern is a large surface to reimplement and the APG itself warns about touch AT support for custom sliders.
7. wavesurfer.js 7.12.11 (12.2 KB gzip) **fetches the whole file and runs `decodeAudioData` on it** unless you pass `peaks`, verified in its shipped source, not inferred.
8. Precomputed peaks via `bbc/audiowaveform` are cheap (~1 KB JSON per track at card resolution) and wavesurfer auto-normalises raw integer peaks, so no float conversion is needed.
9. **Verdict on waveforms: skip wavesurfer.** If you want a waveform, precompute peaks and render ~150 `<rect>`s in SVG, zero dependency, fully neo-brutalist, and no client-side decode.
10. MP3 at 192 kbps CBR (~5.8 MB per 4-minute track) served from a public R2 custom domain; no second `<source>`, no transcode pipeline, egress is free.

---

## 1. Baseline `<audio>` in React 19

### The events you actually need

MDN lists the full event set on the `<audio>` reference and on `HTMLMediaElement`
([MDN, `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio);
[MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)).
For a custom transport you need a small subset:

| Event | MDN description | Why you need it |
| --- | --- | --- |
| `loadedmetadata` | "The metadata has been loaded." | First moment `duration` is a real number. Sets the seek bar's max. |
| `timeupdate` | "The time indicated by the `currentTime` attribute has been updated." | Drives the playhead. |
| `ended` | "Playback has stopped because the end of the media was reached." | Reset transport to 0, advance to next Song. |
| `play` / `pause` | "Playback has begun." / "Playback has been paused." | **Required.** The button must reflect the element, not your click handler, playback stops for reasons you did not initiate (interruption, another tab, OS media keys). |
| `canplay` | "The browser can play the media, but estimates that not enough data has been loaded to play the media up to its end without having to stop for further buffering of content." | Optional: dismiss a loading state. |
| `waiting` / `playing` | "Playback has stopped because of a temporary lack of data." / "Playback is ready to start after having been paused or delayed due to lack of data." | Optional: buffering indicator. |
| `error` | "Resource failed to load due to an error." | Show a fallback download link. |

Notes that matter in practice:

- **`timeupdate` has no guaranteed frequency.** MDN documents it only as firing when `currentTime`
  is updated and does not specify a rate
  ([MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)).
  INFERRED: browsers fire it roughly 4–66×/s. Do not put `currentTime` into React state at that
  rate for twelve cards; write it to a CSS custom property or a ref-held DOM node so the render
  tree stays still.
- **`duration` is `NaN` before metadata loads** and `Infinity` for indefinite streams
  ([MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)).
  With `preload="none"`, and unconditionally on iOS, see §4, it stays `NaN` until the user presses
  play. This is the decisive argument for storing duration in Payload (§6).
- **`play()` returns a Promise**
  ([MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)).
  It must be `.catch()`-ed; an unhandled rejection is a console error on every blocked play and on
  every rapid play/pause toggle.
- **`buffered`, `played` and `seekable` are `TimeRanges`**, not arrays, index with `.start(i)` /
  `.end(i)` and read `.length` first. `seekable` collapsing to empty is your signal that the origin
  refused range requests (§7).

### React 19 specifics

Media events do not bubble, so React attaches them directly to the element rather than through the
delegated root listener. In JSX they are `onLoadedMetadata`, `onTimeUpdate`, `onEnded`, `onPlay`,
`onPause`, `onCanPlay`, `onError`. INFERRED: a `ref` + `addEventListener` effect and the JSX props
are equivalent here.

- The transport must be a **Client Component** (`'use client'`), it is entirely event handlers and
  imperative element access.
- React 19 supports **returning a cleanup function from a callback ref**, which is the tidiest way
  to attach and detach imperative listeners on the shared element
  ([React 19 release notes](https://react.dev/blog/2024/12/05/react-19)).
- Do not make `<audio>` a controlled element. There is no `value` to control; the element is the
  source of truth and React state mirrors it.

### `preload`, what each value actually costs

MDN quotes the three values exactly
([MDN, `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio)):

- `none`, "Indicates that the audio should not be preloaded."
- `metadata`, "Indicates that only audio metadata (e.g. length) is fetched."
- `auto`, "Indicates that the whole audio file can be downloaded, even if the user is not expected to use it."
- empty string, "A synonym of the `auto` value."

Default: "Different for each browser. The spec advises it to be set to `metadata`."

| Value | Network cost per element | Consequence |
| --- | --- | --- |
| `none` | **0 bytes, 0 requests.** | `duration` is `NaN`, `buffered` empty until play. |
| `metadata` | **≥1 HTTP request per element.** | Typically a ranged GET reading enough of the file to establish duration. INFERRED from the format: an MP3 carrying a Xing/Info VBR header resolves in a few KB; a bare CBR stream may make the browser read further, and browsers differ. Not a fixed, small, predictable number. |
| `auto` | **Potentially the whole file.** | Twelve 6 MB tracks = ~70 MB of speculative download. Never on this page. |

Two documented caveats from the same page:

- "The `autoplay` attribute has precedence over `preload`. If `autoplay` is specified, the browser
  would need to start downloading the audio for playback."
- "The browser is not forced by the specification to follow the value of this attribute; it is a mere
  hint."

Also documented: audio with `loading="lazy"` "will only apply the `preload` behavior once the audio
controls are near or within the viewport". That is a real mitigation for the N-element architecture, but the shared-element architecture (§2) makes it moot.

### Seeking with `currentTime`

MDN: `currentTime` is a "Double-precision float indicating current playback time in seconds. Setting
this value seeks the media to the new time relative to the media's timeline."
([MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)).

Practical rules:

- Setting it fires `seeking`, then `seeked` on completion.
- Guard the write, `if (Number.isFinite(el.duration))`, or the assignment is a no-op while
  `duration` is `NaN`.
- Seeking outside `buffered` triggers a new HTTP range request. This is why `Accept-Ranges` on the
  origin is non-negotiable (§7).
- While the user is dragging the scrub control, **suspend the `timeupdate` → control-value sync**,
  or the playhead fights the thumb. Resume on `pointerup` / `change`.

### Autoplay policy (short version; §4 has the iOS detail)

MDN's autoplay guide states autoplay is permitted if at least one of the following is true
([MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)):

> "The audio is muted or its volume is set to 0"
> "The user has interacted with the site (by clicking, tapping, pressing keys, etc.)"
> "If the site has been allowlisted; this may happen either automatically if the browser determines that the user engages with media frequently, or manually through preferences or other user interface features"
> "If the autoplay Permissions Policy is used to grant autoplay support to an `<iframe>` and its document."

And: "Playback of any media that includes audio is generally blocked if the playback is
programmatically initiated in a tab which has not yet had any user interaction."

For this site the consequence is benign: **the first play is always a click.** After that first
activation, programmatic `play()` (e.g. auto-advance to the next Song) succeeds on desktop. Handle
rejection anyway, the pattern MDN documents:

```js
let startPlayPromise = videoElem.play();

if (startPlayPromise !== undefined) {
  startPlayPromise
    .then(() => {
      // Start whatever you need to do only after playback has begun.
    })
    .catch((error) => {
      if (error.name === "NotAllowedError") {
        showPlayButton(videoElem);
      } else {
        // Handle a load or playback error
      }
    });
}
```

([MDN, Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay))

A feature-detect also exists, `navigator.getAutoplayPolicy("mediaelement")` returns `"allowed"`,
`"allowed-muted"` or `"disallowed"` (same source). INFERRED: not needed here, since every play is
user-initiated by design.

### Accessibility of a custom transport

**Play/pause button.** One `<button>` whose accessible name changes between "Play" and "Pause"
(visually hidden text next to the icon). Do **not** add `aria-pressed` and do **not** use
`role="switch"`: the name already carries the state, and doubling it makes screen readers announce
"Pause, pressed". Include the Song title in the name when the button is icon-only, `aria-label="Play, {song.title}"`, so the twelve buttons are distinguishable in a rotor list.

**Seek bar, use a native `<input type="range">`.** This is the opinionated call.

The APG slider pattern ([W3C ARIA APG, Slider](https://www.w3.org/WAI/ARIA/apg/patterns/slider/))
requires you to implement, on a custom element: `role="slider"`, `aria-valuenow`, `aria-valuemin`,
`aria-valuemax`, `aria-valuetext`, `aria-orientation`, `aria-labelledby`/`aria-label`, plus the full
keyboard table:

| Key | Function |
| --- | --- |
| Right Arrow | Increase value by one step |
| Up Arrow | Increase value by one step |
| Left Arrow | Decrease value by one step |
| Down Arrow | Decrease value by one step |
| Home | Set to minimum value |
| End | Set to maximum value |
| Page Up (Optional) | Increase value by larger increment |
| Page Down (Optional) | Decrease value by larger increment |

A native `<input type="range">` gives all of that from the platform for free, including the implicit
`slider` role and correct behaviour with touch assistive technology. The APG explicitly flags the
custom path's weakness: "Some users of touch-based assistive technologies may experience difficulty"
because touch AT must synthesize keyboard events to operate sliders, a convention "not yet fully
implemented by some assistive technologies" (same source).

Neo-brutalism is not a reason to abandon the native element. `input[type=range]` with
`appearance: none` is fully stylable through `::-webkit-slider-runnable-track` /
`::-webkit-slider-thumb` and `::-moz-range-track` / `::-moz-range-thumb`, square thumbs, 3 px black
borders and hard offset shadows are all reachable. INFERRED but strongly held: the visual direction
costs you nothing here, and reimplementing the APG pattern costs you a week and still ships worse
touch-AT behaviour.

What to add on top of the native element:

- `aria-label` naming the Song: `aria-label="Seek, {song.title}"`.
- `aria-valuetext` with human-readable time: `"1 minute 12 seconds of 3 minutes 40 seconds"`. The APG
  calls for `aria-valuetext` "when numeric values lack clarity", a raw `73` is exactly that case.
- `max` set from the Payload-stored duration so the control is operable *before* the audio loads.
- Update on `input` (live scrub), commit the actual seek on `change`.

**Focus handling with a shared element.** Focus never moves, buttons and range inputs live in each
card and stay put. INFERRED but important: when the "now playing" Song changes, announce it from a
single page-level `aria-live="polite"` region, not one per card, and keep the ticking elapsed-time
text out of that region.

---

## 2. Many players on one page

### What actually happens with a dozen `<audio>` elements

- **`preload="metadata"` fires a request per element.** The attribute is defined and evaluated
  per element ([MDN, `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio)).
  Twelve elements = twelve requests, competing on first paint with images, fonts and the RSC payload,
  and bounded by the browser's per-origin connection limit (6 on HTTP/1.1; multiplexed but still
  twelve concurrent streams on HTTP/2).
- **`preload="none"` fires zero requests** and costs essentially nothing, the element exists with no
  media resource attached.
- **Memory scales with loaded data, not element count.** INFERRED: twelve idle `preload="none"`
  elements are cheap; twelve elements that have each buffered several MB are not, and mobile Safari
  is the first place that bites.
- **iOS is the hard constraint.** Apple's own developer documentation states it plainly:

  > "Currently, all devices running iOS are limited to playback of a single audio or video stream at
  > any time. Playing more than one video, side by side, partly overlapping, or completely
  > overlaid, is not currently supported on iOS devices. Playing multiple simultaneous audio streams
  > is also not supported."
  >
  >, [Apple, Device-Specific Considerations, *Safari HTML5 Audio and Video Guide* (archived)](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)

  Caveat, stated honestly: this document lives in Apple's *archive* and modern iOS is more permissive
  than it claims. But it is the only authoritative Apple statement on the subject, and it is the
  right constraint to design to. Designing for one stream costs nothing here, nobody wants two Songs
  at once, and removes an entire class of platform bug.

- **The same page also disables `preload` on iOS entirely**, see §4. So on iOS your
  `preload="metadata"` is ignored anyway and `duration` stays `NaN` until first play. Any design that
  needs duration before playback **must** get it from the server.

### "Only one plays at a time"

**There is nothing native.** HTML has no attribute or mechanism for mutual exclusion between audio
elements. (The old `mediagroup` / `MediaController` API was for *synchronised* playback, not
exclusion, and has been removed from browsers.) It is application state, always.

Two implementations:

1. **N elements + a coordinator.** Keep `currentlyPlayingId` in context; on play, pause every other
   element. Needs a registry of refs, and you must also handle the *browser* pausing an element
   (interruption, tab switch, media keys) so state does not desync, which means subscribing to
   `pause` on all twelve.
2. **One shared element.** Mutual exclusion is structural: there is only one thing that can play.

### Recommendation: one shared `<audio>`, `src` swapped on play

**This is the right architecture for this page.** Reasoning:

- **Mutual exclusion is free**, not coordinated. No registry, no desync, no "who paused whom".
- **One connection, one buffer.** Network and memory are constant whether Anna has 6 Songs or 30.
- **Matches the documented iOS single-stream constraint** exactly, so there is no platform branch.
- **Auto-advance is one line**, on `ended`, set the next Song's `src` and `play()`, versus
  orchestrating refs and focus across twelve components.
- **Media Session API integration is trivial**: one element, one
  `navigator.mediaSession.metadata` update per Song change, and lock-screen / AirPods controls work
  for the whole page. With twelve elements you would have to decide which one owns the session.
- **Payload already supplies title, duration and cover per Song**, so no card needs to read metadata
  off its own element.

The costs, stated honestly:

- **Swapping `src` restarts the load.** A → B → A refetches A. With
  `Cache-Control: public, max-age=31536000, immutable` on R2 objects (§7) this is a disk/memory cache
  hit, not a network round trip. If you want resume-where-you-left-off, keep a
  `Record<songId, seconds>` map in state and restore `currentTime` after `loadedmetadata`.
- **The element must live above the cards**, in a layout-level client component, with cards talking
  to it through context. That is a less obvious component tree than "each card owns its player" and
  is worth an ADR line.
- **`src` assignment and `play()` must happen in the same user-gesture tick** on iOS (§4). Do not
  `await` anything, no fetch, no router call, no state flush, between the click and the `play()`.

INFERRED architectural shape (the seam, not the code):

- `AudioEngineProvider` (client) owns the single `<audio preload="none">` and exposes
  `{ currentSongId, isPlaying, play(song), pause(), toggle(song), seek(seconds) }`.
- Each `SongCard` (client) subscribes only to `currentSongId === song.id` and `isPlaying`, two
  booleans, so a Song change re-renders exactly two cards.
- The high-frequency `currentTime` is **not** in context state. Publish it to the active card through
  a ref or a CSS custom property so a `timeupdate` never re-renders anything.
- Cards render their static duration from Payload, so the transport is complete and operable before
  a single byte of audio is fetched.

---

## 3. Waveforms without downloading the audio

### Is a waveform worth it here at all?

**Probably not, and if yes, not via wavesurfer.** Read §3 to the end before deciding; the pipeline
is cheap but the dependency is not, and the two are separable.

A waveform on a musician's portfolio is decorative, not functional. It communicates "this is audio"
and gives a rough shape to scrub against. It does not help a visitor decide whether to listen. For
twelve tracks in paper-folder cards, a hard-edged progress bar in the neo-brutalist palette does the
same job. The genuine argument in favour is aesthetic: a bar-chart waveform is a strong graphic
element and fits the visual direction well.

### wavesurfer.js, current state

- **Version 7.12.11**, published 2026-09-03 (npm registry, checked 2026-09-04). Dist-tags also carry
  `beta: 8.0.0-beta.5`. **Zero runtime dependencies.** BSD-3-Clause.
- **Bundle size, measured from the published tarball** (`npm pack wavesurfer.js@7.12.11`):
  `dist/wavesurfer.esm.js` is 42,771 bytes raw / **12,187 bytes gzipped**. Plugins are separate
  entry points and add on top. That is the core only; you would likely not need any plugin here.
- **React usage** is via a separate first-party wrapper, `@wavesurfer/react` **1.0.12**, 13,233 bytes
  unpacked, with peer deps `react: ^18.2.0 || ^19.0.0` and `wavesurfer.js: >=7.7.14` (npm registry).
  React 19 is supported.
- Rendering uses Shadow DOM, with styling exposed through `::part()` pseudo-selectors
  ([wavesurfer.js README](https://github.com/katspaugh/wavesurfer.js)).

### Does it decode the whole file client-side? Yes, unless you give it peaks.

The README says so:

> "we recommend using pre-decoded peaks for large files"
> "Streaming audio is supported only with pre-decoded peaks and duration"
>
>, [wavesurfer.js README](https://github.com/katspaugh/wavesurfer.js)

The shipped source confirms the mechanism exactly. From `dist/wavesurfer.js` in
`wavesurfer.js@7.12.11`, inside `loadAudio(url, blob, channelData, duration)`:

```js
// Fetch the entire audio as a blob if pre-decoded data is not provided
if (!blob && !channelData) {
    const fetchParams = this.options.fetchParams || {};
    ...
    blob = yield Fetcher.fetchBlob(url, onProgress, fetchParams);
```

and further down:

```js
// Decode the audio data or use user-provided peaks
if (channelData) {
    this.decodedData = Decoder.createBuffer(channelData, audioDuration || 0);
}
else if (blob) {
    const arrayBuffer = yield blob.arrayBuffer();
    this.decodedData = yield Decoder.decode(arrayBuffer, this.options.sampleRate);
}
```

with `Decoder.decode` in `dist/decoder.js`:

```js
function decode(audioData, sampleRate) {
    const audioCtx = new AudioContext({ sampleRate });
    try {
        return yield audioCtx.decodeAudioData(audioData);
    } finally { ... }
}
```

**So without `peaks`, each wavesurfer instance downloads the complete audio file and runs
`decodeAudioData` on it.** Twelve instances on the landing page = twelve full-file downloads
(~70 MB) plus twelve PCM decodes, before anyone presses play. That is disqualifying on its own.

The relevant options, from the `WaveSurferOptions` type
([wavesurfer.js source, `src/wavesurfer.ts`](https://github.com/katspaugh/wavesurfer.js/blob/main/src/wavesurfer.ts)):

```ts
/** Pre-computed audio data, arrays of floats for each channel */
peaks?: Array<Float32Array | number[]>
/** Pre-computed audio duration in seconds */
duration?: number
```

and `public load(url: string, channelData?: WaveSurferOptions['peaks'], duration?: number): Promise<void>`.
The documented usage pattern, verbatim from
[`examples/predecoded.js`](https://github.com/katspaugh/wavesurfer.js/blob/main/examples/predecoded.js):

```js
const wavesurfer = WaveSurfer.create({
  container: document.body,
  waveColor: 'rgb(200, 0, 200)',
  progressColor: 'rgb(100, 0, 100)',
  barWidth: 10,
  barRadius: 10,
  barGap: 2,
  url: '/examples/audio/demo.wav',
  peaks: [ [ 0, 0.0023595101665705442, /* … */ ] ],
  duration: 22,
})
```

Two more findings from the source that matter:

- **wavesurfer never sets `preload` on its internal element.** `grep -n preload dist/*.js` returns
  nothing in 7.12.11; `Player` just does `this.media = document.createElement('audio')`. So even in
  the peaks path it calls `setSrc(url, blob)` and inherits the browser's default preload, likely a
  metadata request per instance. The escape hatch is the `media?: HTMLMediaElement` option, which
  lets you supply your own element; but twelve instances sharing one element is not a coherent
  design.
- **Raw integer peaks are auto-normalised.** `dist/decoder.js` contains a `normalize()` that scans
  channel 0 and, "if `firstChannel.some((n) => n > 1 || n < -1)`", divides every channel by the
  maximum absolute value. So you can hand it `audiowaveform`'s int8 values directly, no float
  conversion step in your pipeline.

### The alternative: precompute peaks at upload time

**`bbc/audiowaveform`** is the standard tool. It "generates waveform data from either MP3, WAV, FLAC,
Ogg Vorbis, or Opus format audio files" and emits binary `.dat`, JSON, PNG or WAV
([bbc/audiowaveform](https://github.com/bbc/audiowaveform)). Documented example commands, verbatim:

```
audiowaveform -i test.mp3 -o test.dat -z 256 -b 8
audiowaveform -i test.flac -o test.json -z 256 -b 8
```

`--pixels-per-second` "specifies the number of output waveform data points to generate for each
second of audio input" (default 100); `--bits` accepts 8 or 16 (default 16).

**The JSON format** ([bbc/audiowaveform DataFormat.md](https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md)),
verbatim example:

```json
{
  "version": 2,
  "channels": 2,
  "sample_rate": 48000,
  "samples_per_pixel": 512,
  "bits": 8,
  "length": 3,
  "data": [-65,63,-66,64,-40,41,-39,45,-55,43,-55,44]
}
```

`data` is interleaved min/max pairs per channel; values are −128..+127 at 8 bits or −32768..+32767 at
16 bits. The binary `.dat` header is 20 bytes (v1) or 24 bytes (v2), little-endian: version, flags,
sample rate, samples-per-pixel, length, and (v2) channels.

**How big is it?** INFERRED from the format arithmetic, not quoted:

| Setting | 4-minute track | JSON size |
| --- | --- | --- |
| default: 100 px/s, 16-bit, stereo | 24,000 pairs × 2 ch | ~250 KB, unusable |
| `-b 8 --pixels-per-second 4`, mono | 960 pairs | ~7 KB |
| **card resolution: ~150–200 values, mono, 8-bit** | 200 values | **~0.8–1.4 KB** |

That last row is the one that matters. **The waveform is drawn at a fixed card width.** A 600 px card
with 3 px bars and 1 px gaps is 150 bars. You need 150–200 numbers *regardless of track length*.
Twelve tracks × ~1 KB is ~12 KB total in the RSC payload, free.

**How it is rendered.** Three options, in increasing cost:

1. **Plain SVG `<rect>` per bar.** ~20 lines. A `<g>` of bars in the base colour, a second identical
   `<g>` in the progress colour clipped by a `<clipPath>` whose `width` is driven by a CSS custom
   property you update on `timeupdate`. Zero dependencies, zero JS in the render path, works in a
   Server Component with only the progress mask needing client code.
2. **CSS-only bars.** A flex row of `<div>`s with `height: calc(var(--peak) * 100%)`, and a
   `background: linear-gradient` progress mask. Slightly less crisp control than SVG.
3. **wavesurfer with `peaks` + `duration`.** 12.2 KB gzip + a wrapper, Shadow DOM you style through
   `::part()`, canvas rendering you do not control, and an internal `<audio>` per instance that
   fights the shared-element architecture from §2.

### Verdict

**Precomputed peaks are worth it. wavesurfer is not.**

- The pipeline is genuinely cheap: one `audiowaveform` invocation on upload, ~1 KB of numbers in a
  Postgres JSONB column, downsampled to card resolution before storage.
- But once you have the peaks, wavesurfer buys you almost nothing you need. Its value is zoom,
  regions, spectrograms, timeline, minimap, a DAW-adjacent feature set for an editing UI. This is a
  portfolio with twelve read-only tracks.
- And it actively conflicts with the shared-element architecture: it wants to own an `<audio>` per
  instance, it does not set `preload`, and it renders into Shadow DOM you style at arm's length
  through `::part()`, the opposite of what a hand-built neo-brutalist visual wants.

**If the pipeline complexity is unwelcome, drop the waveform, not the architecture.** A hard-edged
progress bar with the Song's duration from Payload is honest, accessible and free. The waveform is
the optional half; the shared element and server-side duration are not.

---

## 4. iOS / mobile Safari

Authoritative statements only.

### `volume` is not settable

> "On iOS devices, the audio level is always under the user's physical control. The `volume` property
> is not settable in JavaScript. Reading the `volume` property always returns 1."
>
>, [Apple, Device-Specific Considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)

**Design consequence: ship no volume slider.** A dead control on half your traffic is worse than no
control. The OS has a volume rocker. If you want one audio control beyond play/pause, make it
**mute**, `muted` *is* settable on iOS
([MDN, `HTMLMediaElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement)), and
it maps cleanly to a neo-brutalist toggle. INFERRED feature-detect if you insist on a volume slider:
write `0.5`, read it back, hide the control if the write did not stick.

### `preload` and `autoplay` are disabled outright

> "In Safari on iOS (for all devices, including iPad), where the user may be on a cellular network and
> be charged per data unit, preload and autoplay are disabled. No data is loaded until the user
> initiates it. This means the JavaScript `play()` and `load()` methods are also inactive until the
> user initiates playback, unless the `play()` or `load()` method is triggered by user action."
>
>, [Apple, Device-Specific Considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)

Apple's own contrast, verbatim from the same page:

- **This plays the movie:** `<input type="button" value="Play" onclick="document.myMovie.play()">`
- **This does nothing on iOS:** `<body onload="document.myMovie.play()">`

**Design consequence:** `play()` and `load()` must be called *synchronously inside the gesture
handler*. If you `await` a fetch, or push a route, or wait on a React state flush before calling
`play()`, the call is outside the gesture and iOS drops it. With the shared-element architecture:
set `src`, call `play()`, both in the click handler; do everything else after. This also means
duration and peaks must already be on the client, they cannot be fetched at play time without
breaking the gesture.

### Autoplay: what WebKit does allow

WebKit's policy article documents that elements are "allowed to `play()` without a user gesture if
their source media contains no audio tracks, or if their `muted` property is set to `true`", that
muted autoplaying elements "only begin playing when visible on-screen such as when they are scrolled
into the viewport" and "will pause if they become non-visible", and that if audio is added or muting
removed, "playback will pause". `play()` "will return a `Promise`, which will be rejected if any of
these conditions are not met"
([WebKit, "New `<video>` Policies for iOS", 2016](https://webkit.org/blog/6784/new-video-policies-for-ios/)).

That article is about `<video>`, and none of the muted-autoplay exemptions are useful for an audio
portfolio, muted music is not a feature. **Every play on this site is a tap. Build for that and the
policy stops being a problem.**

### The Web Audio unlock gesture

An `AudioContext` is created in the `suspended` state when there is no user activation and must be
started with `resume()` inside a user gesture
([MDN, `AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext);
[MDN, `BaseAudioContext.state`](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state)).
The practical "unlock" is: construct the context lazily and call `ctx.resume()` in a real gesture
handler.

**This only matters if you touch Web Audio at all.** With plain `<audio>` + `src` you never construct
an `AudioContext`, so there is no unlock problem, no suspended-context bug class, and no iOS-specific
branch. It becomes relevant the moment you reach for client-side waveform decoding (§3, wavesurfer's
`Decoder.decode` constructs one per load) or `createMediaElementSource` for a live visualiser. One
more reason to precompute.

Note also: routing an `<audio>` through `createMediaElementSource` requires the media to be CORS-clean
or the graph outputs silence. Since R2 is a different origin (§7), that would mean
`crossorigin="anonymous"` on the element plus `Access-Control-Allow-Origin` on the bucket
([MDN, `<audio>` `crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio)).
Avoidable, and worth avoiding.

---

## 5. Formats, encoding, and file size

### Codec support today

From [MDN's Web audio codec guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs):

| Codec | Container | Browser support | MDN note |
| --- | --- | --- | --- |
| **MP3** | MPEG-1/2, MP4, ADTS, 3GP | Chrome, Edge, Firefox, Opera, **Safari 3.1+** | "MP3 (MPEG-1 Audio Layer III) is supported by all major browsers." |
| **AAC** | MP4, ADTS, 3GP | Chrome (MP4 only), Edge, Firefox (OS-dependent), Opera, Safari | "Based on this, AAC is likely your best choice if you can only support one audio format." |
| **Opus** | WebM, MP4, Ogg, MPEG-TS | Chrome 33+, Edge 14+, Firefox 15+, Opera 20+, Safari 11+ **with caveats** | "Safari supports Opus in the `<audio>` element only when packaged in a CAF file, and only on macOS High Sierra (10.13) or iOS 11." |
| **Vorbis** | Ogg, WebM | **Safari: not supported** | "Ogg containers are not universally supported." |
| **FLAC** | MP4, Ogg, FLAC | Chrome, Edge, Firefox 51+, Opera, Safari 11+ | Lossless, 40–50% size reduction. Wrong tool for streaming a portfolio. |

**MDN nominates AAC** as the single-format choice. **I am overruling that for this project, and
choosing MP3.** Reasoning:

- MDN's own Firefox note is the tell: Firefox's AAC support is "platform-dependent", it "relies on
  OS native support". That is a real, if narrow, failure mode (Linux Firefox without the right system
  codecs) and it fails *silently* into an `error` event.
- MP3 support is unqualified across every browser MDN lists, with no OS dependency and no container
  ambiguity.
- The quality delta at the bitrates and material in question is inaudible on the devices this site
  will actually be heard on (phone speakers, laptop speakers, earbuds).
- Anna is uploading through a CMS. `.mp3` is the file she will already have. Every extra step between
  "the file on her desktop" and "the file on the site" is a step that will eventually go wrong when
  nobody is looking.

**Opus is out.** MDN's Safari caveat, CAF container only, makes it a non-starter for a site whose
audience will heavily be iPhone users.

### Bitrate and resulting file size

MDN gives MP3's recommended range as 128–320 kbps in MPEG-1 mode, with a stated minimum of 128 kbps
at 48 kHz for stereo ([MDN, audio codecs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs)).

INFERRED arithmetic (`bitrate × seconds ÷ 8`), for a 4-minute track:

| Bitrate | 4-min file size | Assessment |
| --- | --- | --- |
| 128 kbps | 3.84 MB | Audibly compromised on cymbals and reverb tails. Too low for a musician's own portfolio. |
| 160 kbps | 4.80 MB | Acceptable. |
| **192 kbps** | **5.76 MB** | **Recommended.** Transparent enough for casual listening on any device this site reaches. |
| 256 kbps | 7.68 MB | Diminishing returns for web delivery. |
| 320 kbps | 9.60 MB | Reserve for a download link, not for streaming. |

**Recommendation: 192 kbps CBR, 44.1 kHz, stereo.** CBR rather than VBR for one specific reason: the
wavesurfer README warns that "Variable bit rate (VBR) files may cause audio/waveform mismatches"
([wavesurfer.js README](https://github.com/katspaugh/wavesurfer.js)), and the same class of problem, inaccurate duration and imprecise seeking from a missing or wrong Xing header, affects any
peaks-driven scrub bar, wavesurfer or hand-rolled. CBR makes byte offset ↔ time a straight line, which
makes range-request seeking exact.

Total footprint: 12 tracks × ~5.8 MB ≈ **70 MB**. That is inside R2's 10 GB-month free tier by three
orders of magnitude (§7).

### Is a second `<source>` worth it?

**No.** MDN's own advice is that multiple formats let you "avoid many or all of those exceptions"
(same page), but the exceptions it is talking about are for Opus, Vorbis and FLAC. MP3 has no
exceptions. A second `<source>` would double storage, double the transcode pipeline, and serve
exactly zero additional browsers.

Note also the failure semantics if you did use several: "the browser attempts to load each source
sequentially. If a source fails … the next source is attempted… An `error` event fires on the
`<audio>` element after all sources have failed; `error` events are not fired on each individual
`<source>` element"
([MDN, `<audio>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio)).
That serial-fallback behaviour is a latency cost you would pay for nothing.

**Use `<audio src="…">` directly**, no `<source>` children at all. It is simpler, and it lets you
swap `src` imperatively for the shared-element architecture without rebuilding child nodes and
calling `load()`.

### Should there be a server-side transcode on upload?

**No, with one guardrail.** Reasoning:

- Anna is the only uploader. The set of inputs is "whatever she exported", not arbitrary internet
  files. A conversation ("export MP3, 192 CBR") solves this more reliably than a pipeline.
- A transcode step on a Coolify-hosted Next.js container means shipping an ffmpeg binary in the
  image, doing CPU-bound work inside a request or a job runner, holding a temp file, and owning a
  new failure mode on every upload, for twelve files, ever.
- Payload's upload docs confirm non-image files "bypass resizing entirely", there is no built-in
  media-processing pipeline for audio to hook into
  ([Payload, Uploads](https://payloadcms.com/docs/upload/overview)).

The guardrail: **validate on upload rather than transcode.** A `beforeChange` hook that reads
`req.file` and rejects anything that is not `audio/mpeg`, or is over a size ceiling, gives you the
safety of a pipeline at a fraction of the cost. See §6.

### Can a Payload hook run ffmpeg?

Yes, mechanically. Payload documents that in hooks "the `req.file` object will have additional
information about the file, such as mimeType and extension, and you also have full access to the file
data itself" ([Payload, Uploads](https://payloadcms.com/docs/upload/overview)), `req.file.data` is a
Buffer, `req.file.tempFilePath` is a path when temp files are enabled.

**There is no official Payload/ffmpeg pattern.** The common community shape is a `beforeChange` hook
that writes the buffer to a temp path and shells out. Relevant packages, versions verified on npm
2026-09-04: `fluent-ffmpeg@2.1.3` (last published 2025-05-22, effectively unmaintained),
`ffmpeg-static@5.3.0` (ships a prebuilt binary; must survive your Docker build).

**Recommendation: do not run ffmpeg.** Use `music-metadata@11.15.0` instead, pure JavaScript, no
binary, reads a Buffer, and returns `format.duration`, `format.bitrate`, `format.sampleRate` and
`format.numberOfChannels`. That covers the only thing you actually need from the file (duration), at
zero infrastructure cost. Peaks are the one thing it cannot give you, see the decision in §"Decisions
this forces".

---

## 6. Payload uploads for audio

### Upload-enabled collections and non-image files

From [Payload, Uploads overview](https://payloadcms.com/docs/upload/overview):

- Enabling `upload` automatically adds **`filename`, `mimeType`, `filesize`** fields (plus a `sizes`
  array only if `imageSizes` is configured).
- **Non-image files bypass resizing entirely.** Sharp is never invoked, so `imageSizes`,
  `resizeOptions`, `formatOptions`, `withMetadata`, `crop` and `focalPoint` are all inert for audio.
  Do not configure them on a Songs/audio collection; they are noise.
- `adminThumbnail` will therefore have nothing to show. Point it at the Song's cover image field, or
  accept a blank tile in the admin list.
- `disableLocalStorage: true` is required when an S3/R2 adapter owns the bytes. The docs warn that
  with it set, "your admin panel's thumbnails will be broken as you will not have stored a file", irrelevant for audio, which has no thumbnail anyway.

### `mimeTypes`

> "Specifying the `mimeTypes` property can restrict what files are allowed from the user's file
> picker. This accepts an array of strings, which can be any valid mimetype or mimetype wildcards."
>
>, [Payload, Uploads overview](https://payloadcms.com/docs/upload/overview)

Documented shape:

```ts
upload: {
  mimeTypes: ['image/*', 'application/pdf'],
}
```

For audio: `mimeTypes: ['audio/mpeg']` if you are committing to MP3 (§5), or `['audio/*']` if you
want to be permissive. **Prefer the narrow one.** `mimeTypes` is a *file-picker* filter and a
client-side convenience, it is not a server-side guarantee. Back it with a `beforeChange` check on
`req.file.mimetype`.

### Size limits, and where each one lives

This is the part that bites, because there are **three independent ceilings** and a 6 MB MP3 has to
clear all of them.

| Layer | Setting | Default | Notes |
| --- | --- | --- | --- |
| **Payload** | `upload.limits.fileSize` (bytes), in the top-level config | see below | `abortOnLimit: true` returns HTTP 413 instead of silently truncating. |
| **Next.js** | `experimental.proxyClientMaxBodySize` | **10 MB** | Only applies "when proxy is used". |
| **Reverse proxy** | Traefik (Coolify's default) | no documented limit | Coolify "uses Traefik as its proxy" by default. |

Payload's documented config, verbatim:

```ts
upload: {
  limits: {
    fileSize: 5000000, // 5MB in bytes
  },
}
```

([Payload, Uploads overview](https://payloadcms.com/docs/upload/overview)), note that **the value
in Payload's own example is smaller than a 4-minute 192 kbps MP3.** If you copy the docs example
verbatim, every upload fails. Set it to ~20–25 MB.

**Next.js.** `experimental.proxyClientMaxBodySize` is documented for 16.3.4 (page `lastUpdated`
2025-10-20) and is flagged "currently experimental and subject to change, it's not recommended for
production"
([Next.js, `proxyClientMaxBodySize`](https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize)).
Its behaviour on overflow is **the nastiest failure mode in this whole document**:

> "By default, the maximum body size is **10MB**. If a request body exceeds this limit, the body will
> only be buffered up to the limit, and a warning will be logged indicating which route exceeded the
> limit."

and explicitly:

> "3. The request will continue processing normally, but only the partial body will be available
> 4. The request will **not** fail or return an error to the client"

**A silently truncated upload.** Anna uploads a 12 MB file, the admin UI reports success, and the
stored MP3 is cut off. Two mitigations: keep audio comfortably under 10 MB (192 kbps CBR gets you
there for anything under ~7 minutes), and note that this setting "only applies when proxy is used in
your application", if you have no `proxy.ts`, it does not apply at all. **INFERRED: verify empirically
with a deliberately oversized file before launch.** This is the single highest-value pre-launch test
in this document.

**Coolify / Traefik.** Coolify's docs confirm Traefik is the default proxy
([Coolify, Traefik overview](https://coolify.io/docs/knowledge-base/proxy/traefik/overview)) but
document no body-size limit. INFERRED: Traefik does not impose one unless a `buffering` middleware
with `maxRequestBodyBytes` is explicitly configured, so on a stock Coolify install the proxy is not
your constraint. The widely-cited `client_max_body_size 1M` default is **nginx**, not Traefik, do
not go hunting for it. If you switch Coolify to the nginx/Caddy proxy, this changes.

### Hooks: what they can and cannot do

Payload's collection hooks and their arguments
([Payload, Collection Hooks](https://payloadcms.com/docs/hooks/collections)):

- `beforeOperation`, modifies operation arguments. Payload's docs name this as the place to
  "customize the filename before it's uploaded to the server".
- `beforeValidate` → `beforeChange` → **write** → `afterChange`.
- `beforeChange({ data, originalDoc, operation, req })`, `data` is the incoming delta.
- `afterChange({ doc, previousDoc, data, operation, req })`, `doc` is the resulting document.

`req.file` carries `name`, `data` (Buffer), `size`, `encoding`, `tempFilePath`, `truncated`,
`mimetype`, `md5`
([Payload, Uploads overview](https://payloadcms.com/docs/upload/overview)).

**Note `truncated`.** That flag is how you catch the Payload-level truncation described above. Reject
in `beforeChange` when it is true.

**Recommended hook plan** (INFERRED, no official pattern exists):

- `beforeChange`: read `req.file`. Reject non-`audio/mpeg`. Reject `truncated`. Run
  `music-metadata@11.15.0` over `req.file.data` and write `data.duration` (seconds, float) onto the
  document. Pure JS, no binary, fast, no temp file.
- **Do not put ffmpeg or `audiowaveform` in `beforeChange`.** They are CPU-bound shell-outs that would
  block the admin request and require binaries in the Docker image. If peaks are wanted, generate them
  out-of-band (see §"Decisions this forces").
- `afterChange` is the wrong place for duration, the document is already written, so you would need
  a second update and would risk a hook loop.

### `@payloadcms/storage-s3` with Cloudflare R2

Payload ships `@payloadcms/storage-s3@3.88.0` (npm, checked 2026-09-04), version-locked to
`payload@3.88.0`. The docs state directly: "Cloudflare R2 exposes an S3-compatible API, so you can
use `@payloadcms/storage-s3` to connect to it", requiring `region: 'auto'`, a custom endpoint, and
`forcePathStyle: true` ([Payload, Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)).

The documented plugin shape, verbatim from the same page:

```js
s3Storage({
  collections: {
    media: true,
    'media-with-prefix': { prefix },
  },
  bucket: process.env.S3_BUCKET,
  config: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.S3_REGION,
  },
})
```

Cloudflare's own SDK example confirms the client shape
([Cloudflare, aws-sdk-js-v3](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)),
noting `region: "auto"` is "Required by SDK but not used by R2":

```ts
const S3 = new S3Client({
	region: "auto",
	endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
});
```

### R2 quirks that will actually cost you time

1. **Do not set `acl`.** `@payloadcms/storage-s3` exposes `acl` ("Access control list for uploaded
   files (e.g. `'public-read'`)"), but Cloudflare's S3 compatibility page lists ACL headers
   (`x-amz-acl`, grant headers) among the **unsupported headers**
   ([Cloudflare, S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)). Make the
   bucket public through a Cloudflare custom domain instead (§7).

2. **Checksums.** Cloudflare's compatibility table shows CRC32, CRC32C, SHA-1 and SHA-256 as **not
   supported for full-object** checksums (composite only); only CRC64NVME is supported full-object
   ([Cloudflare, S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)). AWS
   enabled CRC32 by default from `@aws-sdk/client-s3` v3.729.0, producing
   `NotImplemented: Header 'x-amz-checksum-crc32' … not implemented` against R2
   ([Cloudflare Community, "@aws-sdk/client-s3 v3.729.0 Breaks UploadPart and PutObject R2 S3 API Compatibility"](https://community.cloudflare.com/t/aws-sdk-client-s3-v3-729-0-breaks-uploadpart-and-putobject-r2-s3-api-compatibility/758637);
   [Cloudflare Community, "AWS S3 SDK compatibility inconsistencies with R2"](https://community.cloudflare.com/t/aws-s3-sdk-compatibility-inconsistencies-with-r2/759067)).
   Cloudflare reported a fix on 2025-02-03, but the unsupported-checksum table still stands.
   **Mitigation if it recurs:** pass `requestChecksumCalculation: 'WHEN_REQUIRED'` and
   `responseChecksumValidation: 'WHEN_REQUIRED'` in the S3 client `config`, which restores the prior
   default of not sending checksums.

3. **`forcePathStyle: true` is required**, R2 does not do virtual-host-style bucket addressing
   ([Payload, Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)).

4. **The S3 API endpoint and the public URL are two different hosts.**
   `https://<account-id>.r2.cloudflarestorage.com` is for writes; the public custom domain is for
   reads. Configure both; do not try to serve audio from the S3 endpoint.

5. **Multipart is fully supported** (CreateMultipartUpload, UploadPart, UploadPartCopy,
   CompleteMultipartUpload, AbortMultipartUpload, ListMultipartUploads), with the caveat that
   "Uploading to the same part number replaces the previous part. If a subsequent upload to the same
   part fails, the original part is lost and must be re-uploaded"
   ([Cloudflare, S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)). Not
   relevant at 6 MB, but relevant if you ever add a "download the WAV" feature.

---

## 7. Serving and streaming

### Does `<audio src>` do range requests? Yes.

MDN is explicit that range requests exist for exactly this:

> "An HTTP `Range` request asks the server to send parts of a resource back to a client. Range
> requests are useful for various clients, including **media players that support random access**,
> data tools that require only part of a large file, and download managers that let users pause and
> resume a download."
>
>, [MDN, HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests)

That is what progressive playback and scrubbing are built on: the element issues
`Range: bytes=0-` to start, and a fresh `Range: bytes=N-` when you seek past what is buffered. Each
partial response is `206 Partial Content` with a `Content-Range` header; an out-of-bounds range gets
`416`.

### What the server must support

> "If an HTTP response includes the `Accept-Ranges` header with any value other than `none`, the
> server supports range requests. If responses omit the `Accept-Ranges` header, it indicates the
> server doesn't support partial requests."
>
>, [MDN, HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests)

`bytes` is currently the only defined unit. Requirements for the audio origin:

- `Accept-Ranges: bytes` on the response.
- Correct `Content-Length`.
- `206` + `Content-Range` for ranged requests.
- Correct `Content-Type: audio/mpeg`.

**Without ranges, the scrub bar is decorative**, `seekable` collapses, and seeking forward means
re-downloading from byte zero.

### Does R2 support ranges on public objects?

**Yes.** Cloudflare's S3 compatibility page lists `Range` as a supported feature of `GetObject`
([Cloudflare, S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/)), and
`HeadObject` is fully supported including conditional operations. R2 objects served through a public
custom domain go through the standard Cloudflare edge, which handles ranges natively. INFERRED but
easily verified: `curl -I` the public URL and check for `accept-ranges: bytes`. **Do this before
launch**, it is a 5-second check that validates the entire seek feature.

### R2 direct vs. proxying through the Next app

**Serve audio directly from a public R2 bucket on a Cloudflare custom domain. Do not proxy it through
Next.js.**

**Egress is free.** Cloudflare's pricing page states it verbatim:

> "Egressing directly from R2, including via the Workers API, S3 API, and r2.dev domains does not
> incur data transfer (egress) charges and is free."
>
>, [Cloudflare, R2 pricing](https://developers.cloudflare.com/r2/pricing/)

Storage is $0.015/GB-month standard, Class A operations $4.50/million and Class B $0.36/million, with
a free tier of 10 GB-month storage, 1M Class A and 10M Class B per month (same page). This project's
~70 MB of audio and its traffic sit **entirely inside the free tier**. Cost is not a factor in this
decision, in either direction.

**Use a custom domain, not `r2.dev`.** Cloudflare is unambiguous:

> "Public access through `r2.dev` subdomains is rate-limited and should only be used for development
> purposes."
> "This endpoint is intended for non-production traffic."
>
>, [Cloudflare, Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)

The docs also warn that CNAME-ing to `r2.dev` is "an unsupported access path" where reliability
cannot be guaranteed. Add the domain as a Cloudflare zone and attach the bucket to it. Note also:
"By default, only certain file types are cached", a Cache Rule / Cache Everything setting is needed
to get MP3s into the edge cache (same page).

**Trade-offs, honestly:**

| | Direct from R2 custom domain | Proxied through Next.js |
| --- | --- | --- |
| Egress cost | Free (quoted above) | Free from R2 → your server, then paid from your Coolify host's bandwidth |
| Range requests | Native, edge-served | You must implement `206`/`Content-Range` correctly by hand |
| Server load | Zero | Every byte of every play streams through your Node process |
| Latency | Cloudflare edge | One origin, wherever Coolify is |
| Hotlinking | Possible | Controllable |
| Signed URLs | Only via `signedDownloads` | Easy |
| Complexity | A DNS record | A route handler you own forever |

**On hotlinking and signed URLs.** `@payloadcms/storage-s3` supports `signedDownloads` with a
per-file predicate, the docs' own example gates on `filename.endsWith('.mp4')`
([Payload, Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)). **Do not use it
here.** Signed URLs expire, which breaks HTTP caching, breaks the `src`-swap resume path, and creates
a class of "the player worked five minutes ago" bugs, all to protect music that is, by the entire
purpose of this site, meant to be heard. If hotlinking ever becomes a real problem, a Cloudflare
Hotlink Protection / WAF referrer rule solves it at the edge without touching the app.

**Caching.** Set `Cache-Control: public, max-age=31536000, immutable` on audio objects. Payload
filenames are stable per document and R2 objects are effectively immutable once written, so this is
safe, and it is what makes the shared-element `src`-swap architecture (§2) cheap on revisits.

---

## Recommended architecture

End to end, as a sequence.

**Upload (once per Song, by Anna)**

1. Anna exports **MP3, 192 kbps CBR, 44.1 kHz stereo** and uploads it through the Payload admin into
   an upload-enabled `songs-audio` collection (or an `audio` field on `Songs`).
2. The collection sets `mimeTypes: ['audio/mpeg']`, `disableLocalStorage: true`, and no image options
   at all. Payload-level `upload.limits.fileSize` is raised to ~25 MB, **not** the 5 MB from the docs
   example.
3. A `beforeChange` hook reads `req.file`: rejects anything not `audio/mpeg`, rejects
   `req.file.truncated`, then runs **`music-metadata@11.15.0`** over `req.file.data` and writes
   `duration` (seconds) onto the document. No ffmpeg, no binaries, no temp files.
4. `@payloadcms/storage-s3@3.88.0` puts the object into R2 with `region: 'auto'`, a custom
   `endpoint`, `forcePathStyle: true`, and **no `acl`**. If `NotImplemented` checksum errors appear,
   add `requestChecksumCalculation: 'WHEN_REQUIRED'` and `responseChecksumValidation: 'WHEN_REQUIRED'`.
5. *(Optional, only if the waveform is wanted)* An out-of-band step runs
   `audiowaveform -i <file> -o peaks.json -b 8 --pixels-per-second 4`, downsamples to ~180 values,
   and writes them to a `peaks` JSONB column. **Not** in `beforeChange`.

**Serving**

6. The R2 bucket is attached to a **Cloudflare custom domain** (not `r2.dev`), with a Cache Rule so
   MP3s are edge-cached, and `Cache-Control: public, max-age=31536000, immutable` on the objects.
7. Audio is **never proxied through the Next app.** `curl -I` the public URL and confirm
   `accept-ranges: bytes` before launch.

**Page render**

8. The landing page is a Server Component. It fetches all Songs from Payload, title, story, cover,
   `duration`, `peaks`, R2 URL, outbound link, in one query, and passes them into the card tree.
9. `AudioEngineProvider` (client, mounted once at layout level) renders **one** `<audio preload="none">`
   and exposes `{ currentSongId, isPlaying, play(song), pause(), toggle(song), seek(s) }`. Zero
   network requests on page load.
10. Each `SongCard` renders a complete, operable transport from server data alone: play button, seek
    range with `max={song.duration}`, formatted total time, optional SVG waveform from `peaks`. It
    subscribes to two booleans, `currentSongId === song.id` and `isPlaying`.

**Playback**

11. Tap a play button → **synchronously** set `audio.src` and call `audio.play()` in the same handler.
    Nothing is awaited in between (iOS gesture requirement).
12. `.catch()` the returned Promise; on `NotAllowedError`, restore the play button.
13. `loadedmetadata` reconciles the server-supplied duration against the real one.
14. `timeupdate` writes the playhead to a **CSS custom property** on the active card. No React state,
    no re-render.
15. Scrub → `input` updates the visual, `change` writes `currentTime`, which fires a `Range` request
    to R2 as needed. `timeupdate` sync is suspended while dragging.
16. `ended` → reset to 0, clear the now-playing slot, optionally set the next Song's `src` and play
    (allowed: the document has user activation by now).
17. Song change updates `navigator.mediaSession.metadata` once, and announces the new title through a
    single page-level `aria-live="polite"` region.

**Explicitly not in this architecture:** wavesurfer.js, Web Audio, `AudioContext`, a volume slider, a
second `<source>`, an ffmpeg transcode step, signed URLs, a Next.js audio proxy route, and twelve
`<audio>` elements.

---

## Decisions this forces

1. **Waveform: precomputed peaks, or no waveform at all?**
   Either accept a build-time/upload-time `audiowaveform` step (a binary in the image or a manual
   pre-upload step) and get bar waveforms, **or** ship a plain progress bar and no peaks pipeline.
   *There is no third option*, client-side decoding is off the table (§3). If peaks are wanted,
   also decide **who runs `audiowaveform`**: a binary baked into the Coolify image and shelled out
   from a background job, or Anna running it locally and pasting JSON into a Payload field. For
   twelve tracks, the second is genuinely defensible.

2. **MP3 192 kbps CBR, or defer to whatever Anna uploads?**
   Encoding as a documented instruction to Anna (recommended, §5) vs. a validated pipeline that
   rejects out-of-spec files vs. accepting anything and living with 30 MB WAVs. This is a
   people-process decision, not a technical one.

3. **`upload.limits.fileSize` ceiling.** Pick a number. 25 MB gives headroom for a long track;
   10 MB keeps you clear of `proxyClientMaxBodySize`'s silent-truncation behaviour. **You cannot have
   both**, decide which risk you prefer.

4. **Volume control: omit entirely, or ship a mute toggle?**
   A volume slider is ruled out (dead on iOS, §4). Between "play/pause only" and "play/pause + mute",
   pick one; adding mute later means adding a control to twelve cards.

5. **Auto-advance to the next Song on `ended`: yes or no?**
   Technically free with the shared element. Editorially it changes the site from "a folder of works"
   into "an album", which is a statement about the work.

6. **Custom domain for R2.** Requires a real subdomain decision (`audio.annamilazzo.xxx`?) and the
   zone living in Cloudflare. If the apex DNS is not at Cloudflare, this is a migration, not a config
   change.

7. **Where duration lives if the `beforeChange` hook is rejected.** If `music-metadata` in a hook is
   unwanted, duration becomes a manual number field Anna types in, which works, but is a data-entry
   burden and will drift.

---

## Open questions

1. **Does `proxyClientMaxBodySize` actually apply without a `proxy.ts`?** The docs say it "only
   applies when proxy is used", and it is flagged experimental and "not recommended for production"
   ([Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize)).
   Whether a Payload admin upload through a Next route handler counts is unverified. **Test with a
   deliberately oversized file before launch**, the failure mode is a silently truncated MP3, not an
   error.
2. **Coolify's Traefik body-size default is undocumented.** No limit is stated in Coolify's proxy
   docs. INFERRED that Traefik imposes none without an explicit `buffering` middleware, but this is
   worth confirming against the deployed instance rather than assumed.
3. **What does `preload="metadata"` actually cost for a 192 kbps CBR MP3 in each browser?** No source
   quantifies it; it depends on the Xing/Info header and on per-browser heuristics. Moot under the
   recommended architecture, but unmeasured.
4. **How permissive is modern iOS really about concurrent audio?** Apple's single-stream statement is
   in the *archive* and predates a decade of WebKit change. The recommended architecture makes this
   irrelevant, but the constraint may be softer than documented.
5. **Is `audiowaveform` available as a prebuilt binary for the Coolify base image?** It is a C++ tool
   distributed mainly as Debian/Ubuntu packages; whether it installs cleanly in the app's Docker base
   image is unverified.
6. **How should peaks map to wavesurfer's/SVG's expected shape?** `audiowaveform` emits interleaved
   min/max integer pairs; wavesurfer's `peaks` is "arrays of floats for each channel". wavesurfer
   auto-normalises out-of-range integers (verified in `dist/decoder.js`), but collapsing min/max pairs
   into a single series loses the asymmetry. For a hand-rolled SVG this is your choice to make; no
   source prescribes it.
7. **Does R2's edge cache honour `Range` on a cache MISS for a large object?** Range support on
   `GetObject` is documented, and edge behaviour is standard, but the interaction with the Cache Rule
   needed to cache MP3s at all is unverified. `curl -r 0-1000` against the custom domain answers it.
8. **Does Payload 3.88's `beforeChange` see `req.file` on *update* operations** where the file is
   unchanged? Relevant to whether the duration hook needs an `operation === 'create'` guard or a
   null check.
