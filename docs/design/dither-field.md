# DitherField — the hero's ground

Build specification. This merges the dithering research (`docs/research/dithering.md`), the
audit of the two components the client found on 21st.dev, and the art direction for the
field into one buildable document. Where those three disagree, **this document decides**.
Build from this; do not re-litigate against the sources.

The client asked for the *look* of `@paper-design/shaders-react`'s `Dithering` — chunky
square pixels, ordered dithering — with the *behaviour* of a music-reactive canvas, in the
portfolio's colours, discreet enough to sit under white hero copy.

What ships is a **tide**: one dithered contour sweeping the foot of the hero on a shallow
left-to-right rake, solid below, dithering out above, rising and quickening while a Song
plays. It occupies the Ribbon's footprint and replaces it. It is drawn on a 2D canvas at
one buffer pixel per dither cell, upscaled by the browser with `image-rendering: pixelated`.
It touches no Web Audio, adds no dependency, and cannot lift the ground under the copy.

---

## 0. The decisions, and what they overrule

Read this section before anything else. Each line is a place two of the three sources
disagreed, and the resolution is binding.

| Question | Decision | Overrules |
| --- | --- | --- |
| WebGL or canvas? | **Canvas 2D**, one pixel per cell. | The library route. At a 12px cell a 1440×833 hero is a 120×70 buffer — 8,400 pixels. GPU is right when shading a million pixels; here we shade eight thousand. |
| Add `@paper-design/shaders-react`? | **No.** | The client's snippet. It is two hard-thresholded colours (`step(.5, …)`), has no `webglcontextlost` handling, is 0.0.x, and the snippet already writes against `pxSize`, which is deprecated. Our own version is smaller than the dependency. |
| `AnalyserNode` via `createMediaElementSource`? | **Never, at any point, on the shared element.** | The reactive component. Three independent killers; the decisive one is CORS — tracks come off the R2 public domain, the element has no `crossOrigin`, and a tainted source outputs **silence**. The first press in production would play nothing. |
| Cell size | **12 CSS px**, fixed at every viewport. Three keylines. | The landed `CELL = 8`. 8px reads as a halftone once the tone step comes down to 1.20:1; 8px and 1.83:1 are a coherent pair, and that pair is the one that gets rejected as a lattice. |
| Tone step | **1.2031:1 between levels.** | The landed `front = back * 0.62` (1.8332:1), at which the Bayer 50% band is a visible checkerboard. |
| Field shape | **A tide with one contour**, not a full-field brightness function. | The landed vertical-ramp falloff, which puts crests at every height and thins by scattering isolated cells into the h1 — the rejected piano roll, drawn faintly. |
| Frame rate | **10 steps/s playing, 2.5 idle**, both from the piano's 4.8 s clock. | The landed fixed `FPS = 20`, which is unmotivated and 2× the work. |
| Transition | **Quantised: 4 steps in, 12 steps out.** | The landed exponential ease `energy += (target - energy) * step * 1.6`. A continuous ease is exactly the eased motion this system rejects. |
| Does the loop idle-stop? | **No — it slows to the piano's own step.** | The audit's "the loop never idle-stops, so it is wallpaper". That objection is against an idle state *indistinguishable from playing*, which this is not. The piano beside it also never stops, and they now share one clock. Gating is spatial and temporal — off-screen and hidden — not amplitude-based. |
| Where the playback signal is published | **`data-audio` on the field's own wrapper**, set from `state.status`. | The art direction's "on the hero section". `hero.tsx` is a Server Component and cannot call `useAudioEngine()`. Architecture decides this one. |
| Rake | **A fixed angle, 6.5°.** | The art direction's "0.86 → 0.74 of hero height", which is 3.97° at 1440×833, not the 6.5° it claims, and which changes angle with aspect ratio — 11° on a phone. An angle is constant across breakpoints; a fraction of height is not. |
| Baseline anchoring | **Whole cells above the foot**, via `--field-baseline`. | A fraction of hero height. Hero height swings with `svh`, the URL bar, and a three-line Italian tagline; the tide's relationship to the keyboard must not. |
| Mask under the copy | **None.** | Every prior background attempt. There is nothing to mask: the field's lightest possible pixel is the bare blue. |
| Post-processing (grain, scanlines, chromatic aberration, vignette, dust, flicker) | **All refused.** | The reactive component, entirely. §8. |

---

## 1. Public interface

```tsx
// src/components/dither-field.tsx
'use client'

export function DitherField({ className }: { className?: string | undefined }) { … }
```

**One optional prop, and it is not a design knob.** `className` exists so a future section
could position the layer differently; `| undefined` is written explicitly because
`exactOptionalPropertyTypes` is on and `className?: string` cannot receive an explicit
`undefined` (`hero.tsx` already declares `listenLabel?: string | undefined` for the same
reason).

Every value the client's snippet passed as a prop is refused as a prop, each for its own
reason:

| Client's prop | Where it goes | Why not a prop |
| --- | --- | --- |
| `type="8x8"` | Fixed. | There is one correct matrix here. A prop implies 2×2 and 4×4 are options; they are not — a travelling wave needs 65 tonal levels to read as a wave rather than four bands. |
| `pxSize={3}` | `CELL = 12`, fixed. | The cell is defined as three 4px keylines. A caller that could change it could break the grid's agreement with every border on the page. (`pxSize` is also `@deprecated` in the library the client copied it from.) |
| `colorBack="#001122"` `colorFront="#ff0088"` | Resolved from `--primary`. | Off the 53.2075° hue lattice and outside the token system. `#ff0088` is within a hair of `--magenta`, which `globals.css` marks *NEVER a section* — white on magenta is 3.478:1, so the client's own reference colour is the single colour on this page that cannot go behind the copy. |
| `speed={0.6}` | Derived from `state.status`. | Speed is a consequence of playback, not a caller's opinion. A settable speed is how a loop becomes wallpaper. |
| `shape="wave"` | Fixed — the tide. | The other six shapes are not this design. |

The tunable surface is deliberately not in TypeScript at all: it is **one CSS custom
property**, `--field-baseline`, on `.dither-field` (§7). It is the only value in this design
that is tuned by measurement rather than derived, and it lives in CSS so it can differ per
breakpoint the way the Ribbon's height did.

### What it reads from the page

Exactly six things, and nothing else:

1. **`getComputedStyle(canvas).color`** → the ground, resolved to sRGB bytes by painting it
   into a 1×1 context and reading the byte back. Not a regex: the palette is authored in
   `oklch` and Chromium hands back `lab(42.4292 0.830233 -40.9019)`, so a `rgb()` match
   finds nothing and silently falls through to a default. A 2D context converts any CSS
   colour to sRGB by definition, which makes this exact rather than hopeful.
2. **`getComputedStyle(canvas).getPropertyValue('--field-baseline')`** → the tide's height
   above the foot, in cells.
3. **`canvas.getBoundingClientRect()`**, via `ResizeObserver` → the buffer size.
4. **`useAudioEngine().state.status`** → `'idle' | 'playing' | 'paused'`. The whole drive.
5. **`window.matchMedia('(prefers-reduced-motion: reduce)')`**, subscribed, not sampled.
6. **`document.hidden`** and `visibilitychange`; **`IntersectionObserver`** on the canvas.

Note what is absent: **`devicePixelRatio` never appears in the file.** The buffer is
measured in cells, so it is DPR-independent by construction — at DPR 2 each cell is simply
24 device pixels at no extra cost, and the upscale is governed by `image-rendering` alone.

### Module split

```
src/lib/dither/field.ts        pure maths, no DOM, no React — unit-tested
src/components/dither-field.tsx  'use client' leaf — canvas, lifecycle, engine wiring
src/tests/dither-field.test.ts   vitest against the pure module
e2e/dither-field.spec.ts         Playwright, pixel measurement
```

This mirrors `src/lib/player/controller.ts` + `src/components/audio-engine.tsx`: the awkward
arithmetic is testable without a browser, and the component is left holding only lifecycle.

`src/lib/dither/field.ts` exports:

```ts
export const BAYER_8X8: Uint8Array          // 64 entries, row-major, values 0..63
export const THRESHOLDS: Float32Array       // 64 entries, (BAYER + 0.5) / 64
export type FieldMode = { a0: number; a1: number; a2: number; reach: number; depth: number; core: number }
export const IDLE: FieldMode
export const PLAYING: FieldMode
export function modeAt(t: number): FieldMode
export function contour(out: Float32Array, cols: number, rows: number, baseline: number, mode: FieldMode, phase: number): void
export function levelAt(s: number, threshold: number, mode: FieldMode): 0 | 1 | 2
```

---

## 2. The palette — two tokens, three levels, all darker than the ground

```
L0 = var(--blue)                                       #3866A8   rgb(56,102,168)   Y = 0.131706
L1 = color-mix(in srgb, var(--blue) 88%, var(--ink))   #315A94   rgb(49, 90,148)   Y = 0.101034
L2 = color-mix(in srgb, var(--blue) 76%, var(--ink))   #2B4E80   rgb(43, 78,128)   Y = 0.075209
```

L0 is the untouched hero ground and is **never painted** in the sense of being a decision —
it is the "off" cell. The whole field is one colour at three depths: hue drift across the
ramp is 257.59 → 257.33 → 257.47 in oklch, under 0.3°, so this is genuinely the blue getting
deeper rather than a second hue creeping in. Chroma falls with L (0.117 → 0.105 → 0.093),
which is what a shadow does.

Because `--ink` is pure black, `color-mix(in srgb, blue N%, ink)` is **exactly** a multiply
by N in sRGB byte space. So the component derives both levels by multiplying the resolved
ground by `0.88` and `0.76` and the result is byte-identical to the `color-mix` above. One
mechanism, two notations, no drift.

### The steps are even, and the 1.20 is load-bearing twice

```
L0 → L1   1.2031:1
L1 → L2   1.2063:1
L0 → L2   1.4512:1
```

It is small enough that **no single cell is legible as an object** — a cell has to be
readable on its own before it can be a shape — and small enough that the Bayer matrix's
50%-density checkerboard, the most lattice-like thing an ordered dither can produce, reads
as a flat mid-tone rather than as a grid. The landed `0.62` gives 1.8332:1, at which the
50% band *is* visibly a checkerboard, and that is the rejected piano roll with extra steps.

### No hue is admitted

Measured, one per candidate, all against the blue: magenta **1.662:1**, grape **1.052:1**
(invisible), cantaloupe 2.781, lemon 4.05, spring 3.54, paper 4.80, dust 4.58. Every light
one lifts the ground, and a dither cell is a hard-edged 100% fill, not an alpha wash — a
white glyph over one cantaloupe cell is at 2.08:1 no matter what the field averages.

There is a real temptation to put cantaloupe in the crest, because cantaloupe is already
this page's "active" colour — the struck key, the vinyl label, the Listen button. **Reject
it.** Make the rhyme temporal instead: the field steps on the keyboard's own beat (§4).
Same rhyme, zero contrast cost.

### The contrast proof — one sentence, and no mask

**The field's lightest possible pixel is the blue itself.**

| Ground | vs white | vs ink keyline | vs cantaloupe fill | vs paper fill |
| --- | --- | --- | --- | --- |
| L0 `#3866A8` | **5.779:1** | 3.634:1 | 2.781:1 | 4.800:1 |
| L1 `#315A94` | **6.952:1** | 3.021:1 | 3.346:1 | 5.775:1 |
| L2 `#2B4E80` | **8.386:1** | 2.504:1 | 4.036:1 | 6.966:1 |

Worst case behind the 20px tagline is 5.779:1 — the contrast it already has today over bare
blue. Headroom over the 4.5 floor is 1.28×. This holds at every viewport, in every playback
state, on every frame, for every cell, **by construction, not by sampling**, because there
is no compositing: hard-edged opaque cells, no alpha, no blend mode.

Compare the layer that was rejected: sheet at 17% over the blue composites to `#5980B6`,
white on it 4.048:1. That layer failed because it *lifted*. This one cannot lift. The
direction of the ramp is the entire safety argument, which is why "darker, never lighter"
is enforced in code (§3, the ground guard) rather than left as a coincidence of the chosen
multipliers.

**The inversion worth handing the client: where the field is present the copy gets *more*
contrast, up to 8.39:1. The worst case for the tagline is the part of the hero the field
has not reached.**

Two consequences to note rather than fix:

- The magenta ornament at the hero's foot goes from 1.662:1 on bare blue to **2.411:1** on
  L2. The field improves it.
- The ink keyline drops from 3.634:1 on L0 to **2.504:1** on L2. Where that keyline is a
  control's boundary, the *fill* takes over: cantaloupe rises 2.781 → **4.036** and paper
  4.800 → **6.966** across the same ramp. So at every level at least one channel of every
  control's boundary clears 3:1 — L0 and L1 on the keyline, L2 on the fill. Nothing needs
  to move. The piano's own keyline is decorative (`aria-hidden`) and its boundary is carried
  by sheet-against-field at 8.17:1 regardless.

---

## 3. The render loop

### Geometry

```
CELL      = 12                       CSS pixels per cell — three 4px keylines
cols      = max(1, ceil(rect.width  / CELL))
rows      = max(1, ceil(rect.height / CELL))
canvas.width  = cols                 backing store, in cells
canvas.height = rows
```

CSS stretches the canvas to `100%` × `100%`, so the browser upscales by `rect.width / cols`,
which is always in `(CELL-1, CELL]`. At 1440 × 833 that is **120 × 70 = 8,400 pixels**.

Measured, so you know what you are buying: at 12px cells and 10 steps/s that is **84,000
pixel writes per second** playing, 21,000 idle. The source component's `FilmGrain.update()`
alone walked 1600×900×4 = 5.76 M byte-writes every other frame — roughly 173 M/s — before
its per-frame full-size canvas allocation for chromatic aberration and its ~300 stroked
scanlines. Same visual grid, three orders of magnitude less work.

**The buffer flexes, the cells do not.** Deriving `cols` from the measured element rather
than from a constant is what keeps the scale factor at CELL at any viewport width. At a
non-integer scale the blocks stay perfectly hard — measured across 16→150, 16→100 and
320→1512, not one blended pixel appeared at any scale — they merely beat by ±1 device pixel
between `floor` and `ceil`. In a 12px cell that is an 8% width variation on a 1.20:1
contrast step, which is not visible and is not the blurring people fear.

### Setup, once per mount

```
1.  canvas.getContext('2d', { alpha: false })         → null? return, leave bg-primary.
2.  ground = readGround(canvas)                        → null? return.
3.  GUARD: if relativeLuminance(ground) > 0.18333 → return without painting.
4.  L0/L1/L2 packed to machine words via a 1×1 ImageData probe (endianness-correct
    by construction, no branch in the loop).
5.  measure()  →  sizes the buffer, allocates the ImageData ONCE, draws one frame
                  SYNCHRONOUSLY.
6.  if reduced motion → stop here. Nothing is scheduled.
7.  otherwise start the loop.
```

**Step 3 is not optional and is the reason the contrast argument is enforced rather than
assumed.** `1.05 / 4.5 − 0.05 = 0.18333` is the relative luminance at which white type
falls to exactly 4.5:1. The component refuses to paint on any ground lighter than that. The
blue sits at 0.131706, well clear. This one line catches: a stylesheet that has not applied
when the effect runs (`color` inherits and resolves to the body's near-black or to white —
either way the field would paint over the copy), a future retheme, and any caller who mounts
the layer on a light section.

**Step 5 must be synchronous.** A context with `alpha: false` initialises to **opaque
black**, and `canvas.width = cols` resets the backing store on every resize. If the first
draw waits for a rAF, the hero flashes a black rectangle. Draw at the end of `measure()`,
before scheduling anything, and on every resize.

### The tick

```js
const tick = (now) => {
  frame = requestAnimationFrame(tick)

  const status = statusRef.current
  const stepMs = status === 'playing' ? 100 : 400

  const elapsed = now - lastStepAt
  if (elapsed < stepMs) return
  // Drift-free in the normal case; after a stall we resume rather than fast-forward.
  lastStepAt = elapsed > stepMs * 4 ? now : lastStepAt + stepMs

  if (status === 'playing')     t = Math.min(1, t + 1 / 4)
  else if (status === 'idle')   t = Math.max(0, t - 1 / 12)
  // 'paused' holds t where it is.

  phase += phaseStep            // 2 * TAU / cols — exactly one cell of the fundamental
  draw()
}
```

`requestAnimationFrame`, never `setInterval` — the loop must be aligned to the compositor's
existing wakeups, and a `setInterval` in a throttled tab drifts arbitrarily.

**Frame rate matters more than frame cost for battery**, so the win here is scheduling fewer
frames, not cheaper ones: 10 steps/s is a sixth of the wakeups of a 60 fps loop, and 2.5 is a
twenty-fourth. `FPS = 20` in the landed code is the right *kind* of number — the JS
equivalent of the `steps(6, end)` on the console meter and `steps(4, end)` on the piano — it
is simply not derived from anything. These are: 4.8 s / 0.1 s = 48 steps per keyboard bar,
four per key strike; 4.8 / 0.4 = 12, exactly one step per key strike. Do not raise either to
"smooth it out" — that takes it off-style and costs 4× the work.

### draw()

The tide's whole shape is a function of the column, so the wave is evaluated **per column,
not per cell**:

```js
// 1. contour: cols iterations, 3 sines each  →  360 sin() at 120 columns
contour(contourBuf, cols, rows, baseline, mode, phase)

// 2. fill: rows × cols iterations, no transcendentals at all
for (let y = 0; y < rows; y++) {
  const row = y * cols
  const base = (y & 7) << 3
  for (let x = 0; x < cols; x++) {
    const s = (contourBuf[x] ?? 0) - y
    const threshold = THRESHOLDS[base | (x & 7)] ?? 0
    words[row + x] = level(s, threshold, mode)   // → w0 | w1 | w2
  }
}

// 3. one transfer
context.putImageData(image, 0, 0)
```

The tide form makes the separable-fill optimisation from the research **structural rather
than an optimisation**: the landed brightness-field version evaluated three sines per cell,
62,400 transcendental calls at 200×104. This evaluates 360. The inner loop is a subtract, a
compare and a store.

Two rules that must not be broken:

- **Nothing in the render loop allocates.** The `ImageData`, its `Uint32Array` alias and the
  contour `Float32Array` are created once in `measure()` and mutated. The source component
  allocated a full-size canvas *per frame* for chromatic aberration — ~5.76 MB of backing
  store to garbage-collect 60 times a second.
- **One `putImageData`, aliased through a `Uint32Array`.** Little-endian ABGR, one packed
  word per pixel instead of four byte stores. Endianness is not assumed: the three words are
  obtained at setup by writing each colour's bytes into a 1×1 `ImageData` and reading back
  `new Uint32Array(buf)[0]`, so the machine tells us its own layout and the loop carries no
  branch.

`putImageData` is *not* the bottleneck and never was — measured, it is 0.103 ms of a 1.227 ms
frame at 320×180, i.e. 8%; the other 92% is the fill. Optimising the transfer optimises the
wrong thing.

---

## 4. The dither maths

### The matrix

The classic 8×8 Bayer index matrix, values 0..63:

```
 0  32   8  40   2  34  10  42
48  16  56  24  50  18  58  26
12  44   4  36  14  46   6  38
60  28  52  20  62  30  54  22
 3  35  11  43   1  33   9  41
51  19  59  27  49  17  57  25
15  47   7  39  13  45   5  37
63  31  55  23  61  29  53  21
```

Verified three independent ways, all agreeing: the Kronecker recurrence
`M_2n = [[4M, 4M+2J], [4M+3J, 4M+J]]` from `M_2 = [[0,2],[3,1]]`; the bit identity
`M(x,y) = bit_reverse(bit_interleave(x XOR y, y))`; and byte-for-byte against the shipped
`@paper-design/shaders` build. It is an exact permutation of 0..63.

**Ordered, not error-diffused.** Floyd–Steinberg is serial, temporally unstable — a field
moving a fraction of a cell re-routes error across the whole scanline and the output crawls
and fizzes between frames — and its entire virtue is *hiding* the grid, which is the wrong
grammar for a page of zero radius, 4px keylines and `steps()` motion. It is also the same
shape of idea as the concentric ripples and the piano roll the client already rejected.

**8×8, not 4×4.** A bigger matrix gives a smoother gradient but a *more visible* pattern,
which is counter-intuitive: 65 grey levels against 2×2's 5, but an 8-cell repeat that
becomes legible as texture. Here that artefact is the point — a travelling wave needs enough
tonal resolution to read as a wave rather than four bands. At 12px cells the repeat tile is
96px, 24 keylines square, comfortably larger than any one gradient step, so the tile boundary
is never visible.

Store it flat:

```ts
const BAYER_8X8 = new Uint8Array([ 0,32,8,40,2,34,10,42,  48,16,56,24,50,18,58,26, … ])
const THRESHOLDS = Float32Array.from(BAYER_8X8, v => (v + 0.5) / 64)
```

Flat, not nested, for two reasons: it removes the double `noUncheckedIndexedAccess` hit
(`BAYER[y & 7][x & 7]` fails on the first index before the second is reached), and the
division is precomputed. The landed file escapes the type with
`BAYER[y & 7] as unknown as number[]` — that double cast typechecks and passes Biome, but it
launders away a real `undefined` and is the one place in the file that lies. `?? 0` on the
flat read is free at runtime and honest.

**The `+ 0.5` centres each threshold in its bucket**, so a flat 0.0 field is fully off and
1.0 fully on, symmetrically. Without it a flat 0.0 field still lights the cell whose matrix
entry is 0.

### The contour

Cell units. `u` is the column index `0..cols-1`, `v` the row index `0..rows-1`, `v` growing
downward. `TAU = 2π`.

```js
const rake = Math.tan(6.5 * Math.PI / 180) * cols   // 13.67 cells at cols = 120

contour[u] =
    rows
  - baseline                                  // --field-baseline, in cells
  - rake * (u / (cols - 1) - 0.5)             // rises left to right, pivoting on centre
  - a0 * Math.sin(2 * TAU * u / cols - phase * 1.00)
  - a1 * Math.sin(4 * TAU * u / cols - phase * 1.55 + 1.7)
  - a2 * Math.sin(6 * TAU * u / cols - phase * 0.68 + 0.4)
```

**Three bands, and three for a reason that is checkable.** The keyboard at the foot is three
octaves, the quantiser has three levels, and 1:2:3 is fundamental, octave, twelfth — a real
harmonic series, not three arbitrary frequencies. The amplitudes 8 : 3 : 1.5 are a 1/f
rolloff, which is what a real spectrum does.

**Wavelength is locked to the container, not to a pixel period.** The fundamental is exactly
two cycles across the hero at any width, harmonics at four and six, so the field shows the
same number of crests at 375px and at 2560px. One cycle would read as a slope rather than a
wave — the comment in the landed file about `0.055` giving "a gradient, not a wave" is right
about that and wrong about the fix.

**Spatially harmonic, temporally incommensurate.** The phase velocities 1.00 / 1.55 / 0.68
are deliberately not in small-integer ratio. Advance them all at the fundamental's rate and
the composite is rigid and merely slides; at these ratios it morphs continuously and never
recurs. A pattern is something you can recognise a second time; this has no second time.

**The rake is 6.5°, fixed**, which is the Ribbon's own incline — its spine climbs 222 units
over 1800, 7.03°. The field inherits the composition the client already approved; only the
material changes.

### Phase — motion advances in whole cells

```js
const phaseStep = 2 * TAU / cols     // exactly one cell of the fundamental per step
```

The fundamental therefore translates by exactly **one cell (12px) per step** at every
viewport width — 120 px/s playing, 30 px/s idle — while the harmonics, at 0.775 and 0.227
cells per step, drag the shape out of rigidity.

This is not only style. A continuously sliding dither **boils**: sub-cell motion makes cells
flip between levels at arbitrary sub-frame phases and the pattern crawls through the grid
instead of sitting in it. That shimmer is the single tell that reads as "shader" rather than
as "print". Stepping means each cell holds its value for a whole step and changes once — a
flipbook of stills, dither locked to the grid, hard edges preserved. It is what `steps()`
already means everywhere else on this page.

The sign is `- phase` so the tide travels left to right, with the reading direction and with
the rake.

### The threshold comparison and the palette mapping

`s = contour[u] - v` is the signed distance above the contour, in cells. Positive is above.

```js
function level(s, threshold, mode) {
  if (s > mode.reach) return 0                                  // L0 — hard cut, no tail
  if (s >= 0) {
    const d = 1 - s / mode.reach                                // 1 at the contour → 0 at reach
    return d >= FLOOR && d > threshold ? 1 : 0                  // L1 over L0
  }
  const d = Math.min(1, -s / mode.depth) * mode.core            // 0 at the contour → 1 at depth
  return d >= FLOOR && d > threshold ? 2 : 1                    // L2 over L1
}
```

Two dithered gradients back to back, with no flat region anywhere except the last rows at
the very foot — where a solid horizon is exactly what the keyboard wants to sit on.

**`FLOOR = 0.12`, and it is not a tidiness detail — it is the whole defence against being
rejected as the piano roll.** With no floor and a minimum threshold of `0.5/64 = 0.0078`,
the field does not end: it thins to roughly one cell in sixty-four and keeps going all the
way up into the h1. Isolated single cells scattered across a blue ground is not a sparse
gradient, it is the scattered-rectangles design that was already rejected, drawn faintly.
**A clean edge beats a sparse tail, always.** The floor also gives the dark core a clean
start rather than letting single L2 cells appear at the contour.

Why this is not the piano roll, property by property. The piano roll was N discrete marks,
each individually legible, separated by gaps, on a repeating lattice, unrelated to the music.
All four must fail, and if any one slips this becomes the piano roll:

1. **No gaps.** Adjacent cells at the same level fuse. What the eye tracks is the ragged
   boundary between two regions — an irregular polygon edge — not a population of squares.
   Guaranteed by `FLOOR` and the hard cut.
2. **No repeat.** Two cycles across the container, incommensurate phase velocities.
3. **No individually legible cell.** 1.2031:1 between adjacent levels.
4. **It is attached to the music.** §5.

### Packing

```js
// obtained once at setup, endianness-correct by construction
const probe = context.createImageData(1, 1)
const pack = (r, g, b) => { probe.data.set([r, g, b, 255]); return new Uint32Array(probe.data.buffer)[0] ?? 0 }
const w0 = pack(ground.r, ground.g, ground.b)
const w1 = pack(...scale(ground, 0.88))
const w2 = pack(...scale(ground, 0.76))
```

`scale` rounds each channel: `Math.round(c * f)`. With `--ink` at pure black this is
byte-identical to the `color-mix` in §2.

---

## 5. Playback wiring

**The signal is the reducer's discrete status, read through the context that already exists.**
Not the playhead fraction. Not a boolean. Not a new method on `Engine`. No Web Audio of any
kind.

```tsx
const { state } = useAudioEngine()
const statusRef = useRef<PlayerStatus>('idle')

// In an effect, never during render. Mutating a ref in the component body is unsafe under
// concurrent rendering and double-invokes under Strict Mode; React 19 documents refs as
// not to be read or written during render. The landed file does this at the top level.
useEffect(() => {
  statusRef.current = state.status
}, [state.status])

// The main effect keeps [] deps, so the loop is never torn down and rebuilt when a Song
// starts. That instinct in the landed code is right and is preserved.

return (
  <div className={`dither-field ${className ?? ''}`} aria-hidden="true" data-dither-field data-audio={state.status}>
    <canvas ref={canvasRef} className="dither-canvas" />
  </div>
)
```

**Why status and not a boolean.** `PlayerStatus = 'idle' | 'playing' | 'paused'` already
exists in `src/lib/player/controller.ts`, and the third value earns its keep: `paused` is the
sound stopping mid-phrase, `idle` is the room going quiet. A boolean cannot express that, and
the enum costs nothing because it is already computed and already correct. It also arrives
free from the reducer's own semantics — `stopped` (the element paused) maps to `paused`, and
`ended` and `failed` map to `idle`. So finishing a track runs the full 4.8 s departure and
pressing pause holds the tide where it is, without a line of code for either.

**Why not the playhead fraction**, which is the tempting answer. It is monotonic and
aperiodic: over a four-minute track it advances 0.4% per second, imperceptible as motion, and
`music-visual-language.md` §7 states the principle this page is built on — *audio is periodic
and continuous; graphics that are periodic and continuous read as audio; a one-shot ease-out
reads as UI*. Consuming it would also mean registering a full-viewport element into
`progressNodesRef`, putting a `style.setProperty()` on the largest composited layer on the
page inside the 60 Hz loop, carrying a signal nobody can read. And it is semantically wrong:
a background that shows progress is a progress bar, and one already exists in the right place
with a keyboard control on it.

**Why a data attribute and not a custom property.** The value is an enum, not a number.
`--playing: 1` is a number pretending to be a state, and CSS cannot branch on a custom
property's value without `@container style()`. A data attribute is a first-class selector and
it is the mechanism this codebase already uses for exactly this job:
`.folder:has([data-playing="true"]) .folder-disc { animation-play-state: running }`, fed by
`data-playing` on the transport button. One more consumer of an existing pattern beats a new
one. Here the JS reads the ref and the attribute exists for CSS and for measurement — it is
how a Playwright test can assert the wiring without reaching into React.

**Why subscribing to the context is safe.** The "no React state" rule is scoped precisely to
per-frame values, and the engine says so: *"Written to a custom property, never to React
state: `timeupdate` has no specified frequency and a state write per frame would re-render
the whole stack sixty times a second."* A status transition is not a per-frame value — it
fires on press, pause, scrub-commit, stop, end and fail, a handful of times per session.
`send()` is never called from the rAF loop (the loop calls `writePlayhead` directly) and the
seek input commits on native `change` rather than `input`, so `setState` genuinely does not
fire during a drag.

**Do not publish the song id.** Tempting — a colour per Song — but the hero is off-screen
whenever a Folder is playing, so nobody would see the switch, and it puts a CMS value into a
decorative layer's styling.

### The two states

| | idle | playing |
| --- | --- | --- |
| levels | 2 (L0, L1) | 3 |
| amplitudes (cells) | 3.0 / 1.0 / 0.5 | 8.0 / 3.0 / 1.5 |
| peak excursion | 4.5 cells = 54 px | 12.5 cells = 150 px |
| `reach` above contour | 11 cells | 18 cells |
| `depth` below contour | 6 cells | 10 cells |
| `core` (L2 density gain) | 0 | 1 |
| step | 400 ms — one per key strike | 100 ms — four per key strike |
| density floor | 0.12 | 0.12 |

Idle reads as a shallow, slow swell — present, but you have to look at it to see it move.
Playing reads as the tide coming in, getting a dark core, and moving at a speed you notice
without looking for it.

Four things change: amplitude, reach, step rate, and depth of ramp. **Palette hue does not
change, and neither does the wave's identity. It is the same object, louder.** And the state
change moves in the only direction the contrast proof allows: it *deepens*. It never
brightens — which is also what this page does when something is pressed.

### The transition is quantised too, and asymmetric

```
entering play:  4 steps at 100 ms = 0.400 s  =  one key strike
leaving play:  12 steps at 400 ms = 4.800 s  =  one full keyboard bar
```

Both are integer counts of the destination state's own step, both derived from the same 4.8 s
clock. It wakes on a strike and takes a bar to settle: a press that lands, then a room going
quiet. `t` therefore takes the values `0, ¼, ½, ¾, 1` on the way in and twelfths on the way
out, and every parameter is linear in `t`:

```js
modeAt(t) = {
  a0: 3.0 + 5.0 * t,   a1: 1.0 + 2.0 * t,   a2: 0.5 + 1.0 * t,
  reach: 11 + 7 * t,   depth: 6 + 4 * t,    core: t,
}
```

`core` is the answer to a real problem: **L2 cannot be half-present**, because a three-level
quantiser has no half-colour. So it ramps by *density*, not by colour — the fraction of
below-contour cells that reach L2 goes 0 → ¼ → ½ → ¾ → 1 through the same Bayer threshold.
That is the honest quantised answer, and it looks like the dark core growing rather than
fading in. (The art direction's "0 → 0.25 → 0.5 → 1.0" is four values over four steps, which
is five; `core = t` is the correction.)

**Replace the exponential ease in the landed file** (`energy += (target - energy) * step * 1.6`).
A continuous ease is precisely the eased motion this system rejects, and it also breaks
whole-cell stepping.

`paused` holds `t` where it is and drops to the idle step rate: the tide stays as tall as it
was and slows to the room's tempo. It never freezes — nothing on this page freezes mid-motion
— and it is legibly different from both other states in one line of code.

---

## 6. Reduced motion, visibility, cleanup

### Reduced motion — never start, rather than stop later

```js
if (still.matches) {
  measure()          // draws one frame at phase 0 with the IDLE parameters
  return             // nothing is scheduled that then has to be cancelled
}
```

The field is still there, still a tide, just holding still. This matches the convention
stated four times in `globals.css` — the console meter, the piano, the record spin, and the
section entrance with its reason: *"the usual `animation-duration: 0.001ms` override does not
stop a scroll-driven animation, so an entrance disabled that way would still move."*

**Subscribe, do not sample.** `still.addEventListener('change', …)` that starts or stops the
loop. The landed file reads `still.matches` once at mount inside a `[]`-dep effect: a reader
who turns reduced motion *on* mid-session keeps a moving field until they reload, and one who
turns it *off* gets a permanently frozen one.

**The still state must be the readable state.** Nothing may depend on the layer having
painted. `bg-primary` sits under the canvas and is the ground for SSR, for hydration, for a
failed 2D context and for a ground that trips the luminance guard. Motion never gates access
to content, and **motion may amplify a state but never carry it alone** — with reduced motion
on, "a Song is playing" is still legible from the pause glyph, `data-playing="true"` and the
filling `.playhead-fill`. The field adds nothing that exists only in movement.

### Off-screen — cancel the frame, do not early-return from it

```js
const observer = new IntersectionObserver(entries => {
  const onScreen = entries[0]?.isIntersecting ?? true
  if (onScreen) { start() } else { stop() }
}, { threshold: 0 })
observer.observe(canvas)
```

`start()` resets `lastStepAt` to `performance.now()` and schedules a frame if none is
pending; `stop()` calls `cancelAnimationFrame` and clears the handle. Resetting `lastStepAt`
matters: without it the first frame back integrates a huge delta and the tide lurches.

This is the highest-value gate of the three. The hero scrolls away and playback starts in a
Folder below it, so the layer's only animated moments are the ones nobody is looking at. The
landed file observes intersection and early-returns from `tick`, but still calls
`requestAnimationFrame(tick)` unconditionally at the top of every tick — a scrolled-away hero
keeps a 60 Hz callback alive to do nothing. `IntersectionObserver` runs asynchronously off
the main thread, far cheaper than polling `getBoundingClientRect()`.

### Visibility — and this is not redundant

```js
document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start() })
```

The common belief is that this is belt-and-braces because browsers stop rAF in background
tabs. **MDN lists explicit exemptions from throttling for tabs playing audio**, along with
WebSocket, WebRTC and IndexedDB. *This page plays audio by design.* A listener who starts a
track and switches tabs is the expected behaviour here, not the edge case. This is the single
most valuable line in the section and the one most likely to be deleted as redundant.

### Resize — `ResizeObserver`, not `window.resize`

```js
const resize = new ResizeObserver(() => { measure() })   // measure() redraws synchronously
resize.observe(canvas)
```

The landed file listens on `window.resize` alone, which misses every hero height change that
is not a window resize: a webfont landing and reflowing the tagline, a longer Italian CMS
string wrapping it to a third line, and mobile URL-bar show/hide, which changes viewport
height without firing `resize` reliably on iOS. `ResizeObserver` catches all of them and is
less code. `measure()` reallocates the `ImageData`, so debounce it with a trailing
`requestAnimationFrame` — a drag-resize must not allocate sixty times a second.

### Cleanup — all five, in the effect return

```js
return () => {
  stop()                        // cancelAnimationFrame + clear the handle
  observer.disconnect()
  resize.disconnect()
  still.removeEventListener('change', onStillChange)
  document.removeEventListener('visibilitychange', onVisibility)
}
```

This layer survives every client navigation between `/` and `/en`, so a leaked observer or
listener accumulates across locale switches and the field ends up running at 2× or 3× speed.
React 19 Strict Mode's double-invoke leaves two loops running in dev if `stop()` is missed.
The engine models the discipline: `cancelAnimationFrame` in *both* branches of the playhead
effect, `removeEventListener` in the transport's commit effect.

### Determinism

**Nothing random, ever.** `folder.tsx` states the reason for the whole codebase:
*"Deterministic rather than random: a random angle differs between the server render and the
client."* A `Math.random()` seed in the field would hydration-mismatch. The phase accumulates
from a clock and starts at 0.

---

## 7. The CSS

Replace the `.dither-field` / `.dither-canvas` block in `src/app/(frontend)/globals.css`
(currently lines 710–725) with:

```css
	/* The dithered field — the hero's ground.
	 *
	 * z-index: -1 against the section's `isolate`, so the field paints after the section's
	 * own background and before every one of its children, positioned or not. Without it the
	 * ordering is an accident: an absolutely positioned canvas with `z-index: auto` paints in
	 * the same step as its positioned siblings and *above* every static one, so this layer
	 * sits behind the copy today only because each column in the hero happens to carry
	 * `position: relative`. Remove one `relative` and the hero goes blank. */
	.dither-field {
		position: absolute;
		z-index: -1;
		inset: 0;
		pointer-events: none;
		/* Where the tide sits: whole cells above the foot of the section, measured at its
		 * horizontal centre. The one number in this design that is tuned rather than derived,
		 * and it lives here rather than in the component so it can differ per breakpoint the
		 * way the ribbon's height did. 14 cells is 168px. */
		--field-baseline: 14;
	}
	@media (width <= 48rem) {
		.dither-field {
			--field-baseline: 10;
		}
	}
	.dither-canvas {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		/* What the component reads to resolve the palette's blue out of oklch. */
		color: var(--primary);
		/* Nearest-neighbour on the upscale: every cell stays a hard square with no filtering,
		 * which is the whole look. `pixelated`, not `crisp-edges` — unprefixed crisp-edges
		 * only reached Chrome in 148; pixelated has been in all four engines since
		 * Firefox 93. */
		image-rendering: pixelated;
		/* Stated, not left to default. `putImageData` ignores globalAlpha, the compositing
		 * mode, the clip region and the transform, so the only way to fade this layer is from
		 * CSS — and fading it would composite the cells toward the ground and break the
		 * contrast proof, which depends on every pixel being exactly one of three opaque
		 * values. These three declarations are the guard rail. */
		opacity: 1;
		filter: none;
		mix-blend-mode: normal;
	}
```

And add `isolate` to the hero section's class list in `src/components/hero.tsx`:

```
className="relative isolate flex flex-col overflow-hidden border-b-brutal border-border bg-primary …"
```

**No mask. No scrim. No `::after` gradient.** There is nothing to mask: the field's lightest
possible pixel is the bare blue, so it can only ever raise white's contrast. Every previous
hero background needed a mask because it lifted the ground; this one is safe by direction.

**No `will-change`.** A layer repainted 2.5–10 times a second does not need a promotion hint,
and `will-change` on a full-viewport element costs memory for nothing.

### What replaces the mask is a placement constraint

Density, not contrast, is the thing that needs bounding — a 50%-dense field of two tones
behind 20px type is visually busy even when it passes. The rule:

> **The contour's 50%-density line sits at or below the top edge of the button row, at every
> breakpoint. Only the sub-35% tail may reach the tagline. Nothing may reach the h1.**

Expressed as a relationship, not a magic pixel value: the contour's mean baseline is placed
from the **bottom** of the section (`--field-baseline`, in cells) and the falloff distance
(`reach`) is what is capped. `--field-baseline` is the single knob, and §9 step 8 gives the
measurement that tunes it.

### Decorative throughout

`aria-hidden="true"` goes on the **wrapper, not on the canvas**. A canvas counts as focusable,
and hiding a focusable element from assistive technology creates a trap rather than tidying
up. `pointer-events: none`, nothing focusable, no text. This matches `.ribbon` and
`<Piano aria-hidden="true">`.

### Z-order in the hero, front to back

field (`z-index: -1`) → the section's in-flow content → ornaments → copy column → vinyl →
portrait → badge → keyboard. **The field never overlaps a keyline because it has none of its
own.** It is ground, and the absence of a border on it is the clearest statement that it is
not an object.

---

## 8. What to delete

### The Ribbon goes. The field leads.

Not negotiable if the field ships, and it should be presented to the client as *the point of
the work* rather than as collateral damage.

The argument in one line: **the Ribbon and the dithered tide are the same gesture — one
continuous band sweeping the foot of the hero on a shallow left-to-right rake — and only one
of them knows whether the music is playing.**

Keeping both puts three things in a 420px strip: four saturated stroke bands with two records
caught in them, a three-octave keyboard, and a dithered tide. The hero's signature object is
already settled and it is the portrait–vinyl–badge composition on the right. The foot gets
one supporting element, not two, and the keyboard is not optional — it is about Anna
specifically, where the Ribbon is about record shops generally.

The field inherits what the Ribbon earned: same footprint, same rake (7.03° → 6.5°), same
relationship to the keyboard. The composition the client approved does not move; only the
material changes, from four bands of saturated colour to one graded field of his own ground
colour.

Name the loss out loud, because he will feel it: the Ribbon carries cantaloupe, lemon, spring
and grape, and it is the only place in the hero those four appear together. The hero after
this change is blue, white, black, the composition's cantaloupe accents and one magenta
ornament. That is a quieter hero. It is also a more confident one, and the colour lattice
still runs riot below the fold. **If he will not accept the loss, the fallback is not to keep
both — it is to keep the Ribbon and ship nothing here.** Two foot-sweeping objects is the
worst of the three outcomes.

Concretely:

1. **`src/components/ribbon.tsx`** — delete the file. It is already unmounted (`hero.tsx`
   imports `DitherField`, not `Ribbon`), so nothing references it and no lint rule will ever
   tell you: `noUnusedImports` does not see an unreferenced file.
2. **The `.ribbon` block in `globals.css`** (currently lines 727–747), including its
   `@media (width <= 48rem)` height override and the comment above it. Dead CSS ships.

### From `src/components/dither-field.tsx`

3. `falloff()` and the `rowFalloff` multiply — replaced by the contour and signed distance.
4. The per-cell three-sine brightness field (`a`, `b`, `c`, `wave`) — replaced by the
   per-column contour.
5. `const amplitude = 0.62 + energy * 0.5` and `const drift = time * (0.35 + energy * 0.85)`.
6. The exponential ease `energy += ((playingRef.current ? 1 : 0) - energy) * Math.min(1, step * 1.6)`.
7. `const front = { r: back.r * 0.62, … }` — 0.62 becomes 0.88, and 0.76 joins it.
8. `BAYER[y & 7] as unknown as number[]` and the nested `BAYER` — replaced by the flat
   `Uint8Array` and `THRESHOLDS`.
9. The `throw new Error('cannot resolve the field colour without a 2D context')` in
   `readColour` — an uncaught error inside `useEffect` takes down the hero rather than
   degrading it. Return `null` and let `bg-primary` carry the ground.
10. `playingRef.current = state.status === 'playing'` **in the component body** — moves into
    an effect.
11. `window.addEventListener('resize', onResize)` — replaced by `ResizeObserver`.
12. `const FPS = 20` — replaced by the two step rates.

### Never add — the client's post-processing chain, refused item by item

| | Why |
| --- | --- |
| **Film grain** | Three compounding reasons. *Genre*: film emulation on a page that is print — the house texture is halftone, and grain is stochastic where dither is ordered, the precise opposite of what was asked for. *Cost*: `width*height*4` = 5.76 M byte-writes per update at 1600×900, every other frame, on the main thread. *It defeats the dither*: noise over an ordered matrix destroys the regularity that is the whole read. If a static tooth is ever wanted, it is one tiled asset at zero per-frame cost. |
| **Scanlines** | ~300 `ctx.stroke()` calls per frame for a static pattern that is one `repeating-linear-gradient`. Refuse even that version: scanlines say CRT/VHS, a different genre from print, and they will moiré against the dither grid — the identical failure already documented for vinyl grooves. The dither grid already supplies the regular rhythm scanlines were there to provide. |
| **Chromatic aberration** | The worst line in the source: a full-size offscreen canvas allocated **every frame**. And it is a lens artefact — a misregistered RGB fringe is a soft edge by definition, on a system whose first rule is zero blur and zero radius. The legitimate cousin already exists: misregistration as a *hard* offset is literally what `--shadow-*` is (`4px 4px 0 0`). |
| **Vignette** | A radial darkening is a blur gradient on a system with none, and a lens framing device fighting a page of edge-to-edge colour fields. The hero already has its edge treatment: `border-b-brutal`. Note the tempting counter-argument — a vignette in ink would *raise* white's contrast at the edges — and why it fails: the copy sits at the left edge where the ramp is strongest, making contrast a function of position and therefore unverifiable. |
| **Dust** | Same stochastic-vs-ordered mismatch, plus it implies a projector gate. The page already has an authored answer to "things scattered on the page": `src/components/ornament.tsx` — drawn, positioned, keylined, deterministic. Random specks are the cheap version of something the page already does well. |
| **Flicker** | Non-negotiable. Global opacity or brightness modulation under body copy makes the ground's luminance a function of **time**, so the 4.5:1 the tagline needs is only true on some frames and contrast can no longer be verified at all. It is the most likely thing here to draw a photosensitivity complaint, and WCAG 2.3.1 Three Flashes is Level A. It is also the wallpaper failure mode by construction: it modulates regardless of playback. |
| **FPS counter** | Debug instrumentation shipped by accident. Per-frame `performance.now()` plus a `textContent` write, visible text no reader can act on, untranslated against ADR-0003. Delete, do not hide. `suspicious/noConsole: "error"` would fail the build if it logs. |
| **The play button** | A second transport. ADR-0007 permits exactly one `<audio>` and one owner of play/pause, so it either mounts a forbidden second element or duplicates a control with no Song to name. The hero's correct affordance already exists and is an anchor: `<a href="#ascolta" className="control control-accent" data-hero-listen>`. |
| **The progress bar** | Already built, better, and to a documented contract: `.playhead-fill { clip-path: inset(…) }` is composited so it costs nothing per frame, with a real transparent `<input type="range">` on top for arrow keys, Home/End and a reported value, and `aria-label` from the CMS. The source's version is a `<div>` with `onClick` — no keyboard, no ARIA. A second one in the hero would be a progress bar with no song and no control. |
| **`@paper-design/shaders-react`** | `package.json` carries eleven runtime dependencies, all Payload/Next/React/Sharp. There is no motion library by deliberate choice; all animation is CSS. Separately, `docs/research/21stdev-components.md` concludes the 21st.dev Terms *never grant users a licence to use community components in commercial or client projects* — the reactive component is a reference, not a source to copy from, regardless of the technical audit. |

---

## 9. Build order, each step with its measurement

This project verifies by measuring, not by eye. Pure maths is measured with vitest; anything
rendered is measured with Playwright reading real pixels. Screenshots decode through `sharp`,
which is already a dependency.

Run the Playwright suite at a **1440 × 900 viewport** so `1440 / 120 = 12` exactly and the
cell grid is device-pixel aligned. `deviceScaleFactor` is 1 in the `Desktop Chrome` project,
so one CSS pixel is one image pixel.

Two shared helpers, in `e2e/dither-field.spec.ts`:

```ts
const L0 = [56, 102, 168] as const
const L1 = [49, 90, 148] as const
const L2 = [43, 78, 128] as const

// Counts every draw, with a timestamp. Installed before the page script runs.
const countDraws = (page: Page) =>
  page.addInitScript(() => {
    const marks: number[] = []
    ;(window as unknown as { __draws: number[] }).__draws = marks
    const original = CanvasRenderingContext2D.prototype.putImageData
    CanvasRenderingContext2D.prototype.putImageData = function (...args) {
      marks.push(performance.now())
      return original.apply(this, args as Parameters<typeof original>)
    }
  })
```

---

**1 — `src/lib/dither/field.ts`: the pure module.**
Bayer table, thresholds, `IDLE`, `PLAYING`, `modeAt`, `contour`, `levelAt`. No DOM, no React.

*Measure* — `src/tests/dither-field.test.ts`, `bun run test`:
`[...BAYER_8X8].sort((a,b)=>a-b)` equals `[0..63]` (an exact permutation); the Kronecker
recurrence `M_2n = [[4M, 4M+2J],[4M+3J, 4M+J]]` from `[[0,2],[3,1]]` reproduces the table
element for element; every threshold is strictly inside `(0, 1)` and `THRESHOLDS[0] === 0.5/64`;
`modeAt(0)` deep-equals `IDLE` and `modeAt(1)` deep-equals `PLAYING`; the contour's extreme
excursion from its rake line equals `a0+a1+a2` to within 1e-6 when the three phases align;
`levelAt(s > reach)` is always `0`; `levelAt` never returns `2` when `mode.core === 0`; and
`levelAt` never returns a level whose density is below `FLOOR`.

---

**2 — Rewrite `src/components/dither-field.tsx`: geometry, ground, one static frame.**
Context, `readGround`, the luminance guard, packed words, `measure()` with a synchronous
draw. No loop yet.

*Measure* — Playwright:
`canvas.width === Math.ceil(rect.width / 12)` and the same for height (120 × 70 at
1440 × 900 minus the 67px header, adjusted for the section's actual box);
`getComputedStyle(canvas).imageRendering === 'pixelated'`.
**Palette closure, the headline check**: screenshot the hero section, decode with `sharp`,
and assert the set of distinct colours in the 20px left padding strip — which is field only,
no copy — is a subset of `{L0, L1, L2}`. Zero blended pixels. This single assertion proves
darken-only, no lift, no anti-aliasing and no stray colour, all at once.
**Block rAF and reload**: `page.addInitScript(() => { window.requestAnimationFrame = () => 0 })`,
then assert the same strip is still `{L0, L1, L2}` and contains no `#000000`. That proves the
first draw is synchronous and that the `alpha: false` black never reaches the screen.
**Force the guard**: `page.addStyleTag({ content: '.dither-canvas { color: #ffffff }' })`
before load, then assert the strip is uniformly `L0` — the component refused to paint.

---

**3 — The CSS block, `--field-baseline`, and `isolate` on the hero section.**

*Measure* — Playwright: `getComputedStyle(field).zIndex === '-1'`, `opacity === '1'`,
`filter === 'none'`, `mixBlendMode === 'normal'`;
`getComputedStyle(section).isolation === 'isolate'`;
`getComputedStyle(field).getPropertyValue('--field-baseline').trim() === '14'` at 1440 and
`'10'` at 375. Then the z-order proof: sample the pixel at the centre of the piano's white
key rect and assert it equals sheet `#FDFCF8`, not a field colour — if the field painted over
static content, this is the pixel that catches it.

---

**4 — The step loop, idle only.** rAF, the drift-free throttle, `phaseStep`, `t` pinned at 0.

*Measure* — Playwright with `countDraws`: load, wait 3200 ms, read `__draws.length` and
assert it is in `[6, 10]` (nominal 8 at 2.5/s, allowing one rAF of quantisation at each end).
Assert consecutive gaps have a median in `[380, 460]` ms.
**Phase travels exactly one cell per step**: screenshot, wait 400 ms, screenshot again;
for each column compute the topmost row that is not `L0`; assert the second profile equals
the first shifted right by exactly one cell over at least 90% of columns. That measures
whole-cell stepping directly, not by eye.

---

**5 — Playback wiring.** `statusRef` in an effect, `data-audio`, `modeAt(t)`, the 4/12-step
transition.

*Measure* — Playwright, reusing the existing audio spec's handle
(`page.locator('[data-play="notturno-per-tram-vuoto"]').click()`):
`data-audio` is `"idle"` on load, `"playing"` after the press, `"paused"` after pressing
again. Then, with `countDraws`, scroll the hero back into view, press play, wait 2000 ms and
assert the draw count for that window is in `[15, 24]` (nominal 20).
**The transition is quantised and asymmetric**: sample the topmost non-`L0` row in the left
padding strip every 100 ms across the press; assert it takes **4 distinct values** and settles
within 500 ms. Then pause, wait for `ended`/press pause and assert the retreat takes at least
4600 ms and no more than 5200 ms.
**L2 exists only while playing**: assert the screenshot contains zero `L2` pixels at
`data-audio="idle"` and a non-zero count at `data-audio="playing"`.

---

**6 — Lifecycle.** Reduced-motion subscription, visibility, `IntersectionObserver` with real
cancellation, `ResizeObserver`, full cleanup.

*Measure* — Playwright, four assertions:
(a) `emulateMedia({ reducedMotion: 'reduce' })`, load, wait 3000 ms → `__draws.length === 1`,
and the strip still contains at least two distinct colours (still ≠ absent).
(b) Load normally, let it draw, then `emulateMedia({ reducedMotion: 'reduce' })` mid-session,
record the count, wait 2000 ms → the count has not increased. Set it back to
`'no-preference'` → it increases again. That measures the listener the landed code lacks.
(c) Also patch `requestAnimationFrame` to count scheduled callbacks. Scroll the hero fully out
of view, wait 1000 ms → **zero** new rAF callbacks scheduled, not merely zero draws. That is
the difference between cancelling the frame and early-returning from it.
(d) **The leak check**: navigate `/` → `/en` → `/` through the language switch, then assert
`document.querySelectorAll('[data-dither-field]').length === 1` and that the idle draw rate
over 3200 ms is still in `[6, 10]` — not doubled or tripled by leaked loops.

---

**7 — Delete the Ribbon.** File and CSS.

*Measure*: `test -f src/components/ribbon.tsx` fails; `grep -rn "ribbon" src/` returns
nothing; and a Playwright assertion that no rule with selector text containing `.ribbon`
exists in any `document.styleSheets` — the same iteration the motion spec already uses to
find the reduced-motion query. Then `bun run build` to confirm nothing imported it.

---

**8 — The copy-legibility gate, and the one tuning pass.**

*Measure* — Playwright, at 375 × 812, 768 × 1024 and 1440 × 900, on both `/` and `/en`:
take the h1's and the tagline's bounding boxes, decode the section screenshot, and count
pixels **exactly equal** to `L1` or `L2` inside each box.

The exactness is sound and not a coincidence: L1 and L2 are darker than L0 in every channel,
and text anti-aliasing only ever produces blends *between white and the ground*, which are
lighter than L0. **No blend of white and L0 can equal L1 or L2.** So the count is an exact
measure of how much field is behind the type.

- inside the h1 box: **0**
- inside the tagline box: **≤ 35%** of the box area

**This is the only tuning pass in the build.** If either assertion fails, lower
`--field-baseline` in `globals.css` — not the amplitudes, not the reach, not the palette —
until it passes at all six combinations. It is the one number in this design that is measured
rather than derived, and its whole job is to absorb layout differences between locales and
breakpoints.

---

**9 — Wire it in.** `e2e/dither-field.spec.ts` and `src/tests/dither-field.test.ts` run under
`bun run validate`, which is `lint && typecheck && test && build && test:e2e`. Note the order:
`biome ci .` runs **before** `tsc`, so a stray `any`, an unused import or a `console.log`
fails the build before a type error is ever reported.

### TypeScript and lint, ahead of time

Every one of these will bite on a canvas loop in this repo. Written correctly the first time,
none of them costs a runtime instruction.

- **`noUncheckedIndexedAccess`** makes every typed-array read `number | undefined`, including
  `THRESHOLDS[i]` and `contourBuf[x]`. Use `?? 0`, matching `folder.tsx`'s
  `TAPE_TINTS[index % TAPE_TINTS.length] ?? TAPE_TINTS[0]`. Never `as unknown as number[]`.
- **`exactOptionalPropertyTypes`** breaks `className?: string`. Write
  `className?: string | undefined`.
- **`strict`/`noImplicitAny`** plus `suspicious/noExplicitAny: "error"` means every callback
  parameter needs a real annotation; `(e: any)` is a lint failure, not a warning.
- **`useRef<HTMLCanvasElement>(null)`** yields `RefObject<HTMLCanvasElement | null>`. Bind to
  a local before use: `const canvas = canvasRef.current; if (canvas === null) return`, the
  shape the engine uses at `audio-engine.tsx:82-85`. Under `@types/react` 19, `useRef()` with
  no argument is an error.
- **`canvas.getContext('2d')`** returns `… | null`; handle the branch, never throw inside an
  effect.
- **rAF handles**: `useRef<number | null>(null)` with explicit null checks. A bare
  `let raf: number` then `cancelAnimationFrame(raf)` is TS2454. With `@types/node` in scope,
  `setTimeout` returns `NodeJS.Timeout`, not `number` — do not type a timer as a number.
- **Custom properties in a `style` object** are TS2353. The repo's form is
  `style={{ '--x': v } as React.CSSProperties}` — not needed here, since `--field-baseline`
  is authored in CSS.
- **`'use client'` at the top**, every DOM read inside an effect. A `.tsx` under the App
  Router is a Server Component by default; `window.devicePixelRatio` outside an effect
  typechecks and then crashes at prerender. `useAudioEngine()` throws by design outside the
  provider, so this must be a client leaf inside `<AudioEngine>` — which
  `src/app/(frontend)/[lang]/layout.tsx` provides.
- **`correctness/noUnusedImports` and `noUnusedVariables` are errors**, not warnings.
- **`suspicious/noConsole: "error"`** — no debug logging survives.

---

## 10. The three most likely ways this goes wrong

### 1. The hero flashes, or stays, black

`getContext('2d', { alpha: false })` initialises the backing store to **opaque black**, and
assigning `canvas.width` resets it on every resize. Any path that reaches the screen before
the first `putImageData` shows a full-viewport black rectangle over the hero — the single
worst visual failure available here, and the most likely, because the fix (a synchronous
first draw) is invisible in code review and works fine on a fast machine where the first rAF
lands in 16 ms.

Three routes in: the first draw scheduled rather than called; a resize that re-sizes the
buffer and waits for the next tick; and a mount where the loop never starts — reduced motion,
a hidden tab, or the hero already scrolled out of view on a deep link — leaving a canvas
sized but never painted.

**The check.** In `e2e/dither-field.spec.ts`, disable rAF entirely with an init script
(`window.requestAnimationFrame = () => 0`), load the page, screenshot the hero and assert the
left padding strip contains no `#000000` and is a subset of `{L0, L1, L2}`. Repeat with
`emulateMedia({ reducedMotion: 'reduce' })` and with the page loaded scrolled past the hero.
If the strip is ever black, the draw is not synchronous.

### 2. The tide climbs into the copy after a layout change

The field's height is anchored to the foot of the section, but the copy's position is not —
it is centred in whatever `md:my-auto` leaves. Three routine events move one without the
other: the Italian tagline runs 74 characters against 62 in English and wraps to a third line
at some widths; the display webfont landing reflows the h1 and shifts everything below it;
and mobile URL-bar show/hide changes `svh` without firing `resize`. Any of them can put the
50%-density band behind the tagline or a sparse tail behind the h1.

Note what this failure is *not*: it is never a contrast failure. Every pixel is still L0, L1
or L2, so white type is still at 5.78:1 or better. It is a **busyness** failure — and it is
also the exact condition under which the client rejects this the way he rejected the piano
roll, because a sparse tail behind a headline is scattered rectangles.

**The check.** Step 8's assertion, run as a matrix: 375 × 812, 768 × 1024 and 1440 × 900 ×
`/` and `/en`. Zero pixels exactly equal to L1 or L2 inside the h1's box; at most 35% of the
tagline's box. It is exact because L1 and L2 are darker than L0 in every channel and white
text anti-aliasing can only produce colours *lighter* than the ground. Add
`await page.evaluate(() => document.fonts.ready)` before measuring, the way the ornament and
motion specs already do, so the webfont reflow has happened.

### 3. The ground resolves to something that is not the blue

The entire contrast argument rests on one line: `getComputedStyle(canvas).color`. If that
returns anything lighter than the blue, the component paints a light field across the whole
hero — including the h1 — and white copy fails everywhere at once. It fails **silently**,
because the canvas paints happily whatever colour it is handed.

Three routes in: the effect running before the stylesheet applies, so `color` inherits from
the body instead of resolving `var(--primary)` (Next serves CSS render-blocking in
production, but Turbopack injects it via JS in dev, which is exactly where this would first
be seen and dismissed as a dev artefact); a future retheme repointing `--primary`; and a
caller mounting `DitherField` on a light section, which the `className` prop invites.

**The check.** The guard in §3 step 3 makes this structural rather than a hope: the component
computes the ground's relative luminance and refuses to paint anything above **0.18333**,
which is precisely the luminance at which white type falls to 4.5:1. The blue sits at
0.131706. Verify it two ways — inject `.dither-canvas { color: #ffffff }` before load and
assert the left strip is uniformly `L0` (nothing was painted, `bg-primary` carried the
ground); and run the palette-closure assertion from step 2 on every page and both locales, so
any drift out of `{L0, L1, L2}` fails the build rather than shipping.

---

## Appendix — the client conversation

Three things he is likely to push back on. Get ahead of all three with the measurement rather
than with taste.

**"I asked for `#001122` and `#ff0088` and you gave me three shades of my own blue."** White
on magenta is **3.478:1**, so his `colorFront` is the one colour on this page that cannot go
behind the copy. He asked for *discreet enough to sit behind hero copy* and for a hot pink;
those two requests are in direct conflict and only one of them can survive. The inversion is
the thing to lead with: **where the field is present, his copy gets more contrast than it has
today — up to 8.39:1 against 5.78:1 on bare blue.**

**"It is a grid of small squares. I rejected that twice."** He has standing, and "it is
ordered dithering, not a lattice" is a phrase, not a defence. The defence is the four
properties in §4 — no gaps, no repeat, no individually legible cell at 1.2031:1, and it moves
because a Song is playing. If any one of them slips in the build, he is right and it should
not ship.

**The one claim in this document a render could falsify.** The 50%-density band is a true
checkerboard for one to two cells of the gradient's height, 12–24px. At 1.2031:1 it should
read as a flat mid-tone. That is believed, not seen. **Look at it on a screen before anything
goes to the client**, and if it reads as a checkerboard, the fix is to lower the tone step
further — never to raise it.
