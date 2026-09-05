# Music visual language, a vocabulary of devices

Status: design brief. Answers the client note "it doesn't feel like the world of music at
all" (`docs/design/client-critique-v2.md`) with a set of drawable objects rather than a
mood.

Every device here is inline SVG or CSS boxes. No raster, no icon font, no stock glyph.
Every device is checked against the two laws this design already lives under: it must
survive a **4px black keyline** and a **hard zero-blur offset shadow**, and it must clear
**3:1 against its ground** per `docs/research/palette-v2.md` §6.2.

---

## 0. The drawing rule

This is the load-bearing decision and everything below inherits it.

> **SVG draws curves. CSS boxes draw rectangles.**

The reason is the keyline. A CSS box's `border: 4px solid` is exactly 4px at every
viewport width, forever. An SVG's stroke is in user units and scales with the element, so
the same shape rendered at two sizes produces two different keyline weights, and in this
design, keyline weight *is* the design. A page where the vinyl's outline is 6px and the
Folder's is 4px looks broken in a way nobody can name.

So:

| thing | draw it as | why |
|---|---|---|
| amplitude bars, faders, sequencer blocks, VU ladders, cassette body | **CSS boxes** | they reflow, and their keylines are always 4px |
| vinyl, ribbon, cable, knob ticks, curves | **inline SVG** | boxes cannot make a circle or a bezier |

For the SVG half there is one escape hatch, and it should be used on every keyline:

```html
stroke="var(--border)" stroke-width="4" vector-effect="non-scaling-stroke"
```

`non-scaling-stroke` makes `stroke-width` a **screen** measurement. A vinyl drawn in a
`0 0 200 200` viewBox and rendered at 90px or at 640px keeps a keyline of exactly 4 device
pixels either way, matching `--border-brutal` and every CSS border on the page. Without it,
scale the disc down and the keyline thins into a hairline; scale it up and it fattens into
a band.

Second rule, equally practical: **inline the SVG in the DOM.** `<img src="ribbon.svg">`
cannot resolve `var(--lemon)`, an external SVG has no access to the page's custom
properties. Inline SVG can, which also sidesteps the Tailwind naming trap noted in
`palette-v2.md` §7: `--color-cantaloupe` is deliberately not exported as a utility, but the
raw `--cantaloupe` custom property exists on `:root` and inline SVG reads it directly.

---

## 1. The vinyl record

**Says music: 5 · Build: 2 · Looks expensive.** The highest value-per-hour object on this
list, and the client already pointed at it twice (REF D's embedded records, Ubay's disc
behind the photo cluster).

### 1.1 Anatomy that reads

Five parts, in this order of importance. Cut from the bottom when small.

1. **Black disc.** The silhouette does 60% of the work.
2. **Coloured centre label at ~34% of the diameter.** This is where the palette lives and
   it is the second-strongest cue, a black circle alone is a dot; a black circle with a
   lemon core is a record. The label is also a real typographic slot: set the song title
   on it, or a curved sticker text like Ubay's badge.
3. **Spindle hole**, ~5% diameter, filled with the section's own ground colour so it reads
   as a hole rather than a dot.
4. **Grooves**, between ~42% and ~94% of the diameter. Never touching the label, never
   reaching the rim, real records have a smooth lead-in edge and a run-out.
5. **A hard-edged shine wedge.** Not a blur gradient, this design has none. A
   `conic-gradient` with two hard stops, or two thin quadrilaterals at 30° and 210°, in
   `color-mix(in oklch, var(--paper) 12%, transparent)`. Flat, straight-edged, on-genre.

### 1.2 Grooves that do not moiré

Moiré is aliasing between the ring pitch and the pixel grid. Any *regularly* spaced ring
set will beat against the display sooner or later, especially at half-integer DPR or under
a CSS transform. Three fixes, use all three:

**Irregular radii.** Moiré needs a regular carrier. Real vinyl already has irregular
spacing, the wide bright rings are the *gaps between tracks*, not grooves. Author them by
hand and the artefact cannot form:

```html
<g fill="none"
   stroke="color-mix(in oklch, var(--ink) 78%, var(--paper))"
   stroke-width="1" vector-effect="non-scaling-stroke">
  <circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="86"/>
  <circle cx="100" cy="100" r="83"/><circle cx="100" cy="100" r="74"/>
  <circle cx="100" cy="100" r="70"/><circle cx="100" cy="100" r="61"/>
  <circle cx="100" cy="100" r="56"/><circle cx="100" cy="100" r="54"/>
  <circle cx="100" cy="100" r="45"/>
</g>
```

Gaps run 6, 3, 9, 4, 9, 5, 2, 9, no repeating period anywhere.

**Non-scaling hairlines.** `stroke-width="1" vector-effect="non-scaling-stroke"` pins each
groove at exactly one device pixel at every rendered size. A scaling 1-unit stroke is what
produces shimmer: at 0.6× it lands on a fraction of a pixel and the rasteriser
half-tones it.

**Shed grooves by size, do not shrink them.** The count is a function of rendered diameter:

| diameter | grooves |
|---|---|
| ≥ 240px | all 9 |
| 120–240px | 5 |
| 64–120px | 3 |
| < 64px | **none**, disc, label, hole only |

Below 64px a record reads from silhouette and label colour alone; grooves there are noise
that costs contrast. Implement with a container query rather than props, so one component
is correct at every placement:

```css
.vinyl { container-type: inline-size; }
@container (max-width: 120px) { .vinyl [data-grooves="fine"] { display: none; } }
@container (max-width: 64px)  { .vinyl [data-grooves]        { display: none; } }
```

### 1.3 Three roles

**As a decorative disc.** The Ubay move, and the cheapest win on the page: a large black
record sitting behind the hero portrait cluster, 50–65% occluded, rotated a few degrees.
Use a music object as pure composition. It needs no grooves at all when mostly hidden.
Place it with `z-index` below the photo cards and give it its own
`filter: drop-shadow(12px 12px 0 var(--border))`, note the Tailwind `drop-shadow-*` scale
is disabled in `globals.css`, so write the filter longhand or as an arbitrary value.

**As a photo frame.** The trap version is a circular crop of Anna with a ring around it, that is a club flyer, and it wastes the face by shrinking it. The version that works puts
the **photo in the label position**: a full record, grooves and all, whose 34% centre label
is a black-and-white cut-out of her. That is literally what a picture-disc label is, and it
fuses REF B's cut-out-on-colour with REF D's vinyl into one object. Mask with
`<clipPath><circle r="34"/></clipPath>` on an `<image>`, then draw the label's 4px keyline
*after* the image so the clip cannot eat it.

**As a sleeve peek.** A disc sliding out from behind a Folder, as a record leaves its
sleeve. The Folder already renders its silhouette with
`filter: drop-shadow(8px 8px 0 var(--border))`, which composites correctly over anything
behind it, so this needs no changes to `.folder`. One constraint: **the visible crescent
must be at least 25% of the disc's width**, or it reads as a stray black shape rather than
a record. Below that, push it further out or drop it.

---

## 2. Waveforms and amplitude bars

**Says music: 4 · Build: 2 · Expensive if authored, cheap if random.**

### 2.1 Bars, never a real waveform

ADR-0007 already rejected real waveforms on cost grounds (you would download and decode
every track to draw one). The aesthetic argument is stronger and worth recording: **the
waveform of a mastered track is a brick.** Modern masters are compressed flat, so the trace
is a solid rectangle with two nibbled ends. It is visually inert, and it renders as thin
grey linework, which is precisely the register this design rejects. A generated waveform
would look *less* like music than a drawn one.

So: few bars, wide bars, hand-authored heights.

- **18–40 bars across a full-width strip**, not 200. At 200 the bars are 3px and the black
  keyline swallows them.
- **Bar width ≥ gap width.** 10–14px bars, 5–7px gaps.
- **Mirrored around a centreline** reads as a waveform; **single-sided** reads as a
  spectrum analyser. Mirrored is the more musical and the more symmetric, use it for
  dividers. Single-sided is fine inside a control where vertical space is short.
- CSS boxes, per §0. A flex row of `<span>`s with `flex: 1` and
  `height: calc(var(--h) * 1%)` scales to any width with zero distortion and real 4px
  borders. An SVG bar strip stretched with `preserveAspectRatio="none"` shears its
  keylines and looks broken.

### 2.2 Making it look drawn, not generated

`Math.random()` is the tell. Random heights read as noise because they have no phrase
structure, no build, no peak, no decay, and because they change on every render, so the
same song looks different twice. Author the sequence:

```ts
// One musical phrase: rising build with a swung internal zigzag, peak at 96,
// drop, a secondary lift, decay. Stable across renders, by construction.
const PHRASE = [18,26,22,34,30,46,41,58,52,71,64,88,79,96,84,62,44,55,38,47,33,25,30,16]
```

Five moves separate authored from generated:

1. **Vary the widths too**, not only the heights. A generated strip has uniform bar width;
   bake a second array of widths at ±25%.
2. **Bake a per-bar rotation of ±0.5–2°** and a 1–2px vertical offset. Stable values in the
   array, never random at runtime.
3. **Let bars overshoot and be clipped** by the strip's own keyline, so it reads as a
   window cut from something longer rather than a self-contained graphic.
4. **Cycle the fills through the hue lattice** rather than using one colour.
5. **Bleed off both edges.** A perfectly centred, perfectly contained bar row is a chart.

Author two or three phrases and choose by song index, different per Folder, but every one
designed.

### 2.3 As a section divider

`palette-v2.md` §4.1 already requires a **full-bleed black strip** at the lemon→cantaloupe
seam, because those two warms sit 1.455:1 apart and the strip splits that into 14.702:1 and
10.107:1. That strip is structural. Make it the amplitude strip: black ground, mirrored
bars in lattice-order colours, ~80–96px tall, keylined top and bottom. It does the contrast
job it was already doing and says music for free. Everything clears on black, so there is
no palette constraint to check.

If both a marquee and a bar strip are wanted, run them as two lanes of one black band, text above, bars below, rather than two separate full-bleed strips, which would eat 180px
of scroll for one idea.

### 2.4 As the progress indicator

`song-transport.tsx` has already been rebuilt so that the blocks **are** the control, with a
transparent native range on top. That is the right architecture and this changes nothing
about it, it is a swap of the fill pattern inside `.playhead-blocks`, nothing more.

Today the rail is `repeating-linear-gradient` at a uniform 0.75rem pitch: even blocks, no
shape, which is why it reads as a loading bar. Replace the uniform pitch with the authored
phrase and it becomes unmistakably audio:

```css
.playhead-blocks { position: relative; }
/* unplayed: hollow bars */
.playhead-bar { border: 2px solid var(--border); background: transparent; }
/* played: the same bars, one clipped copy on top */
.playhead-fill {
  position: absolute; inset: 0;
  clip-path: inset(0 calc(100% - var(--playhead) * 100%) 0 0);
}
.playhead-fill .playhead-bar { background: var(--primary); }
```

One custom property still drives it, still written from the animation frame, still no React
re-render, the existing engine contract is untouched. `clip-path: inset()` is composited
and costs nothing per frame.

---

## 3. The sequencer / piano-roll grid

**Says music: 5 · Build: 3 · Looks expensive.** The client's verdict on `timeline.tsx` was
"the concept is right, the execution is not". The concept is right. What is missing is not
the blocks, it is the **chrome around them**. A row of blocks on a line is a Gantt chart.
Seven additions turn it into a DAW, ranked by how much each one buys.

1. **A dark ground.** `palette-v2.md` §5 already moves this section to grape (`#9B35D1`).
   DAWs are dark; this alone is close to half the read, and it is a one-class change.

2. **A ruler with a tick *hierarchy*.** The single strongest tell, and the thing generic
   charts never have. Not evenly spaced ticks, tall numbered ticks at bar lines, short
   ticks at beats:

   ```css
   .daw-ruler {
     --beat: 24px;
     --bar: calc(var(--beat) * 4);
     height: 28px;
     border-bottom: 4px solid var(--border);
     background-repeat: repeat-x;
     background-position: 0 100%, 0 100%;
     background-size: 100% 16px, 100% 8px;
     background-image:
       repeating-linear-gradient(90deg, var(--border) 0 2px, transparent 2px var(--bar)),
       repeating-linear-gradient(90deg, var(--border) 0 2px, transparent 2px var(--beat));
   }
   ```

   Number the bars in `--font-mono`, **from 1, not 0**, see §11 on details musicians check.

3. **Track lanes with a sticky header column.** A Gantt has rows and dates; a DAW has named
   tracks down a fixed left gutter that stays put while the arrangement scrolls. The
   existing `overflow-x: auto` scroller already supports this: `position: sticky; left: 0`
   on the header cell, with a `z-index` above the blocks and an opaque background (a
   transparent sticky header shows the blocks sliding underneath). Second-strongest tell.

4. **A playhead.** One vertical rule spanning all lanes, with a small triangle flag in the
   ruler. Even completely static it is unmistakable. Put it at "now", her most recent
   entry. Colour: **lemon**, not magenta. Per `palette-v2.md` §6.2 the marks permitted on
   grape are ink 3.82, sheet 5.35, paper 5.06, lemon 3.84, spring 3.36; magenta on grape
   computes to 1.58:1 and would vanish.

   ```css
   .daw-playhead { position: absolute; inset-block: 0; inline-size: 3px;
                   inset-inline-start: var(--x); background: var(--lemon); }
   .daw-playhead::before { content: ""; position: absolute; top: -2px; left: -7px;
                   border: 8px solid transparent; border-top-color: var(--lemon); }
   ```

5. **Clips that start off-grid and have honest lengths.** Gantt bars begin at row starts.
   Piano-roll clips begin at arbitrary grid positions and their *width means duration*, a
   three-year conservatory block should be genuinely three times a one-year workshop. Do
   that and it is simultaneously a correct chart and a convincing arrangement.

6. **A loop brace in the ruler.** Two small triangles and a bar between them, spanning
   "available from, ". Recognisable, and it does real recruiting work.

7. **Tiny S and M squares on each lane header.** Solo and mute, 20px, mono, black keyline.
   The deepest cut on the list: free to anyone who has opened a DAW, invisible to everyone
   else. That is the ideal ornament. **Draw them as `<span>` with `aria-hidden`, never as
   `<button>`**, a control that looks pressable and does nothing is an accessibility trap
   and an honesty problem.

Do not add: fake automation curves (need explaining, read as a chart), a mixer strip (no
vertical budget), a waveform inside each clip (illegible at that height).

Keep the current `<ol>` semantics. The list is the content; the DAW is a layout of it.

---

## 4. The hardware, ranked

The test is: **can it be drawn in eight or fewer flat shapes, and is its silhouette unique
at 120px?** Ranked by legibility-per-effort.

### 1. Cassette tape, says music 5, build 2, looks expensive

The sleeper hit, and I would build it before anything except the record. A cassette is
*already* neo-brutalist: a rectangle with a black keyline, two circles, and a window. It is
the only device on this list whose real-world form matches the design system with no
translation.

Shape list, ten items: outer rect (keyline, palette fill) · label rect in `--sheet` · window
rect · two hubs · six spokes per hub · tape-path trapezoid at the bottom edge in solid black
· four corner screw dots.

Two things it gives you that nothing else does. First, **the label is a real typographic
slot**, a cassette label is handwritten in life, which connects REF A's handwriting face
and taped polaroids to REF D's music objects. That is a genuine bridge between two of the
client's four references, not a mashup. Second, **the reels turn** (§7).

Gotcha: to rotate a hub group inside a larger SVG you need
`transform-box: fill-box; transform-origin: center` in CSS. Without `fill-box` the origin is
the SVG's own origin and the reel flies off across the page.

### 2. Cable and jack plug, says music 4, build 3

Split these. The **plug alone** (a shaft with two ring grooves and a rounded tip) reads only
to musicians, 2/5. The **cable**, a thick black curve with a plug at each end, reads to
everybody as audio, and it is a superb *connector*: REF B's hand-drawn arrow sweeping from
the CTA to the portrait, but audio-native. Build it as one stroked bezier at 10–14px with a
2px lighter inner stroke on the same path, and a small plug group at each end rotated to the
tangent. Same responsive problem as the ribbon; §6 solves it once for both.

### 3. Knob, says music 4, build 1

A circle, a pointer line, and an arc of tick marks. Trivially cheap. Two rules: **never
without its tick arc** (a bare circle with a line is a clock, and this page will already
have records), and **never alone**, one knob reads as nothing, a row of three to five
reads as a panel.

### 4. Fader, says music 4, build 2, looks expensive

Reads instantly *only in a bank of four or more*. One fader is a slider, i.e. generic UI. A
bank of eight at different heights is a mixer, and it is also a chart, which is the honest
killer app: **her skills as a mixer**, one channel per skill, name plate at the bottom in
mono. That is a direct answer to "About and skills reads as a CV line".

Build: column per channel · 6px vertical rail with a 4px keyline · a 44×20 cap block with a
centre notch, positioned `bottom: calc(var(--level) * 1%)` · scale ticks down one side via
`repeating-linear-gradient` · mono name plate. All CSS boxes.

One hard constraint, and it is a credibility issue rather than a technical one: **do not
encode skill percentages.** "Piano 87%" is unverifiable, faintly absurd, and a classic toy
tell. Let the fader positions be composition, varied because a mixer with all faders level
looks dead, and keep the meaning entirely in the words beside them. The visual is
`aria-hidden`; the list underneath is the content.

### 5. Reel-to-reel, says music 3, build 4. **Cut.**

Beautiful and expensive: two large spoked circles plus a threaded tape path plus a
transport deck. At any size below 200px it is a cassette without the rectangle, it costs
double and says less. Its one legitimate use is a single hero-scale ornament where the
spokes actually resolve. The cassette does this job at half the price.

### 6. VU meter, says music 3, build 2–4

Two versions, and they are not the same object. The **needle-on-arc** version is charming
but is the most expensive drawing here, arc, scale, tick labels, red zone, needle, glass, and it says "vintage hi-fi", not "working musician". Skip it. The **LED ladder**, a column
of stacked segments running green to amber to red, is cheap and instant. But note it is an
amplitude bar with a palette ramp, so if §2 is built, this is redundant. Build one, not
both.

### 7. EQ curve, says music 2, build 3. **Cut.**

A bell over a log grid needs explaining to everyone who is not an engineer, and to everyone
else it is a line chart. Its only survivable form is as an abstract swooping underline
beneath a headline, which happens to have the shape of a low shelf, at which point it is
REF A's hand-drawn underline and should be called that. `ornament.tsx` already ships it.

### Two that get named only to be refused

**Headphones and the microphone.** Both score 5/5 on legibility, and both are wrong.
Headphones at icon size are the single most-used stock music glyph on earth, drawing one is
the exact thing the brief forbids. (Drawn *large* and flat as an ornament, a black U with
two rectangles, it is defensible; the 24px version never is.) A microphone says
singer/podcaster, which mislabels a composer.

### One worth adding that was not asked for

**The metronome.** Trapezoid, pendulum rod, bead, scale ticks. Five shapes, unique
silhouette, instant read. And it means *practice and discipline*, which is the single most
useful thing a fresh graduate's page can imply. Cheap, on-message, unclichéd. Says music 4,
build 1.

---

## 5. Notation, the verdict

**It is the kitsch trap. Two narrow exceptions.** Plainly:

A floating eighth note is the musical equivalent of a lightbulb for "idea". It tells a
reader who already learned from the headline that this page is about music, and it tells a
hiring musician that nobody could think of anything. A treble clef beside a young
musician's name reads as a school recital programme, which is *precisely* the failure mode
this page cannot afford, because she is in fact a recent graduate and the whole job is to
not look like one.

Two arguments beyond taste:

**It fails this design system's own test.** Notation is hairline curves and fine stems. A
treble clef with a 4px black keyline is a blob; without one it is the only unkeylined object
on the page. And notation is *already black*, so a black keyline on it is invisible, it
cannot participate in the one rule everything else obeys.

**It fails in front of the actual audience.** Notation is dense with meaning to musicians,
and musicians are exactly who is reading. Decorative notation is almost always wrong, notes that form no phrase, a clef on the wrong line, five beats in a 4/4 bar, beams that
cross a barline. To Anna's judges that is legible as an error. It is a competence own-goal
in the one place she can least afford one.

### Exception 1, the stave as a ruled ground. **Recommended.**

Five black lines with nothing on them. This is REF A's notebook rule, but it is music paper
rather than school paper. It is structural, it survives at any width, it needs no glyphs,
and it says "this is where music gets written" without a single note.

```css
.stave-ground {
  --rule: 2px; --gap: 12px; --stave-gap: 56px;
  background-image: repeating-linear-gradient(
    to bottom,
    var(--border) 0 var(--rule),
    transparent var(--rule) var(--gap)
  );
  background-size: 100% calc(var(--gap) * 5);   /* exactly five lines */
  background-repeat: repeat-x;
}
```

Repeat the five-line block down the section with `--stave-gap` between systems. Use it on
the paper About section, where ink measures 19.35:1, the one place on this page that
wants a quiet texture rather than a colour.

### Exception 2, real notation, as content. **Strongly recommended if the asset exists.**

An excerpt of Anna's **actual manuscript or engraved score**, photographed or exported,
tilted a few degrees and taped like REF A's polaroid. This is the exact opposite of kitsch,
because it is not decoration, it is evidence. It says "I write music" in a way no amount of
ornament can, and after her face it is the highest-credibility image available to this page.

> Stave lines yes. Her own score yes. Floating notes, clefs and rests, no.

---

## 6. The ribbon

**Says music: 3 alone, 5 with records in it · Build: 3 · Looks very expensive.** One of
these, in the hero, and never a second.

### 6.1 The three wrong ways

- **An exported SVG stretched with `preserveAspectRatio="none"`.** Horizontal strokes thin,
  vertical strokes fatten, keylines stop being uniform, embedded records become ellipses.
  Fails against the one rule this design has.
- **CSS `border-radius` gymnastics.** Cannot produce a flowing S.
- **A raster export.** Cannot read the palette, cannot be recoloured per section, and blurs.

### 6.2 The right way, the onion of strokes

**One path. Stroked many times, at decreasing widths, alternating black and colour.** The
black strokes are wider by 8, so each colour band gets exactly 4 units of black on each
edge, the keyline is not extra geometry, it *is* the stroke underneath. Ten elements
sharing one `d`, edited by dragging four control points.

```html
<svg class="ribbon" viewBox="0 0 1440 420"
     preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
  <defs>
    <path id="spine" d="M-160 300 C 220 120, 420 380, 720 250 S 1180 60, 1600 200"/>
    <symbol id="vinyl" viewBox="0 0 200 200"><!-- §1 --></symbol>
  </defs>

  <g fill="none" stroke-linecap="butt">
    <use href="#spine" stroke="var(--ink)"        stroke-width="208"/>
    <use href="#spine" stroke="var(--cantaloupe)" stroke-width="200"/>
    <use href="#spine" stroke="var(--ink)"        stroke-width="160"/>
    <use href="#spine" stroke="var(--lemon)"      stroke-width="152"/>
    <use href="#spine" stroke="var(--ink)"        stroke-width="112"/>
    <use href="#spine" stroke="var(--spring)"     stroke-width="104"/>
    <use href="#spine" stroke="var(--ink)"        stroke-width="64"/>
    <use href="#spine" stroke="var(--grape)"      stroke-width="56"/>
  </g>

  <!-- Records last, so the ribbon's inner bands sit behind them; move a <use>
       above a band to have that band occlude the disc. Document order is z-order. -->
  <use href="#vinyl" x="300" y="150" width="180" height="180"/>
  <use href="#vinyl" x="980" y="96"  width="140" height="140"/>
</svg>
```

Palette constraint, from `palette-v2.md` §6.2: **on the blue hero, omit the blue band**
(1.00:1, literally invisible) **and the magenta band** (1.662:1). The lattice order
cantaloupe → lemon → spring → grape above is already hero-safe.

### 6.3 Responsiveness, crop, never stretch

`preserveAspectRatio="xMidYMid slice"` is the whole answer. `slice` scales the viewBox
uniformly to *cover* the element and clips the overflow, exactly like
`object-fit: cover`. The ribbon never distorts; a narrow screen simply sees less of it.

That has a second payoff which is the real reason to choose it: **hand-placed decorations
stay stuck to the ribbon.** Because the coordinate system is never distorted, a record
positioned by eye at `(300, 150)` sits in the same place on the curve at 375px and at
1920px. With `preserveAspectRatio="none"` every embedded object drifts off the band and you
end up maintaining per-breakpoint coordinates.

Size the viewBox so **one user unit is one CSS pixel at the intended height**, here
`viewBox="0 0 1440 420"` against `width: 100%; height: 420px`. Then the 4-unit keylines land
at exactly 4px, matching every border on the page. Below 1440px wide the height governs the
scale, so the keyline stays exactly 4px and the ribbon crops horizontally, which is the
common case. Above 1440px it scales up and the keyline fattens proportionally; if that
matters at 4K, cap the wrapper with `max-width`.

Let the path start at negative x and end past the viewBox width so it bleeds off both
edges with no visible cap.

Cost check: twelve paths and two records. Nothing.

---

## 7. Sound as motion

The organising principle:

> **Audio is periodic and continuous. Graphics that are periodic and continuous read as
> audio. A one-shot ease-out reads as UI.**

So: loops, not transitions. And the loop must be *tied to playback state*, or it is
wallpaper.

### Cheap and excellent, build these

**The record spins only while its track plays.** Two lines of CSS, and it is the clearest
"this is playing" signal available, better than a label swap, and it speaks to the client's
"you cannot tell it is a play control". The engine already writes `data-playing` on the
button; hang the selector off that.

```css
@media (prefers-reduced-motion: no-preference) {
  .vinyl-disc { animation: spin 1.8s linear infinite; animation-play-state: paused; }
  [data-playing="true"] ~ * .vinyl-disc { animation-play-state: running; }
}
@keyframes spin { to { transform: rotate(360deg); } }
```

1.8s is not arbitrary: 33⅓ rpm is 60 ÷ 33.333 = **1.8 seconds per revolution**. Nobody will
check, and it costs nothing to be right (45 rpm would be 1.333s). `transform: rotate` on a
composited layer is free.

**Cassette reels turn while playing.** Same mechanism, same gate. Both hubs rotate in the
**same** direction, the left hub pays tape out, the right takes it up, and in a compact
cassette both turn clockwise on side A. Do not counter-rotate them; a musician will notice.
Do not model the take-up reel accelerating as its radius grows, correct, invisible, and a
gimmick.

**Amplitude bars react to playback, the canned version.** Each bar gets its own
`animation-duration` between 0.6s and 1.1s and a negative `animation-delay`, so they desync
into something that looks alive. Zero JS, zero audio analysis, runs only while playing. The
mismatch with the actual audio is imperceptible, because nobody cross-checks a bar against
what they are hearing.

**Even-interval section entrances.** Already built (`data-enter` +
`animation-timeline: view()`). Make the stagger interval *even* rather than arbitrary and it
reads as a beat rather than as a transition. Costs nothing.

### Gimmicks, do not build these

**A real `AnalyserNode` driving the bars.** Ties the visual to a Web Audio graph the player
may not have, forces a `requestAnimationFrame` loop and a per-frame DOM write per bar, and, the decisive part, **on a mastered track every bar moves together**, so the honest FFT
version looks *worse* than the canned one. It is more work for a downgrade.

**A marquee that scrolls at the tempo.** A marquee's speed is judged by legibility, not by
BPM, and no viewer can perceive that a strip is moving at 120 rather than 96. It costs a
data field and buys nothing. There *is* a real version of this idea, though, and this site
needs it: derive `animation-duration` from the strip's own **content width** so the linear
speed is constant. Without that, the Italian marquee and the English marquee scroll at
different speeds from the same duration, a live bug on a bilingual page, given ADR-0008's
note that Italian strings run 200–300% longer.

**A playhead sweeping across the timeline on entry.** Implies the sequencer is playing,
which it is not, and it re-fires on every scroll back. Static playhead only.

**Hover-to-scrub a Folder.** Delightful in a music app, wrong here twice over: it starts
audio without consent, and the client has already complained that hovering a Folder moves
things.

**The needle drop.** A tonearm swinging onto the record on play. Charming, expensive, and it
is a 400ms one-shot that delays the perceived response to a press. The press must feel
instant.

### What `prefers-reduced-motion` must gate

Everything looping or unattended: the spin, the reels, the bar loop, the marquee, the
section entrances. Not gated: sub-100ms state changes triggered by direct input, the
`.control` press already documents this correctly in `globals.css`.

Keep the pattern the codebase already got right: **declare loops inside
`@media (prefers-reduced-motion: no-preference)` rather than switching them off
afterwards.** The usual `animation-duration: 0.001ms` override does not stop a scroll-driven
animation, so a gate written that way still moves.

Two rules that are easy to miss:

**Motion may amplify a state, never carry it alone.** With motion off, "playing" must still
be visible: the pause glyph, a filled label on the disc, the bars frozen at a non-flat
shape. Anything whose only signal is movement is invisible to a reduced-motion reader, and
this is also, not coincidentally, the fix for "you cannot tell it is a play control".

**A frozen marquee looks broken.** Do not merely pause it, it stops mid-word. Under reduced
motion, render the strip as a static, complete, non-repeating line.

---

## 8. The scoreboard

| device | says music | build | expensive or cheap here | verdict |
|---|---|---|---|---|
| Vinyl, disc, label-portrait, sleeve peek | 5 | 2 | expensive | **build first** |
| Cassette | 5 | 2 | expensive | **build** |
| Sequencer chrome on the timeline | 5 | 3 | expensive | **build** |
| Spinning record tied to playback | 5 | 1 | expensive | **build** |
| Amplitude bars, authored phrase | 4 | 2 | expensive authored, cheap random | **build** |
| Multicolour ribbon with records | 4 | 3 | very expensive | **build, once** |
| Fader bank as the skills section | 4 | 2 | expensive | **build** |
| Metronome | 4 | 1 | expensive | keep in reserve |
| Cable with jack plugs | 4 | 3 | expensive | substitute |
| Knob (in a bank, with ticks) | 4 | 1 | cheap if alone | reserve |
| Stave lines as ground texture | 3 | 1 | expensive | **build** (free) |
| VU ladder | 3 | 2 | cheap, duplicates the bars | skip |
| Reel-to-reel | 3 | 4 | expensive but redundant | cut |
| Jack plug alone | 2 | 2 | cheap | cut |
| EQ curve | 2 | 3 | cheap | cut |
| Notes, clefs, rests | 1 | 2 | **cheap, actively harmful** | cut |
| Headphone / note icon | 1 | 1 | cheap | cut |

---

## 9. The shortlist, seven to actually build

In build order. Each one is mapped to a complaint from `client-critique-v2.md`, because
decoration that does not fix a named problem is how a page gets cluttered.

1. **The vinyl record, three roles.** Big disc behind the hero photo cluster; her portrait
   in the label of a record; a disc peeking from behind each Folder like a sleeve.
   *Fixes: hero catastrophic, bland ground, "doesn't feel like music".*

2. **The transport: spinning disc plus authored amplitude rail.** The disc spins while its
   track plays; `.playhead-blocks` swaps its uniform gradient for the hand-authored phrase.
   The rebuilt transport architecture is untouched, this is a fill swap and a data
   attribute.
   *Fixes: "the transport is a catastrophe, you cannot tell it is a play control".*

3. **DAW chrome on the timeline.** Grape ground, bar/beat ruler hierarchy, sticky lane
   headers, static lemon playhead, honest clip widths, decorative S/M squares.
   *Fixes: "the concept is right, the execution is not".*

4. **The amplitude strip as the structural seam.** The black band `palette-v2.md` already
   requires at lemon→cantaloupe, carrying marquee text above and mirrored bars below.
   *Fixes: the seam contrast problem and the missing marquee, in one element.*

5. **The fader bank as the skills section.** One channel per skill, name plates in mono,
   varied cap positions, no percentages.
   *Fixes: "about and skills reads as a CV line".*

6. **The cassette.** As the About-section object, or as each Folder's cover treatment, with
   the title handwritten on the label.
   *Fixes: "not memorable", and bridges REF A's handwriting to REF D's music objects.*

7. **The ribbon with embedded records.** One, full-bleed, in the hero.
   *Fixes: hero catastrophic, and it is the client's own strongest reference.*

Free extra, no budget line: **stave ruling on the About ground.**

First substitute if one drops: **the cable**, replacing REF B's hand-drawn arrow on the
contact CTA, which the client also flagged as not working.

---

## 10. Rejected, with reasons

- **Notes, clefs, rests, staves *with* notes on them**, the kitsch trap; cannot carry a 4px
  black keyline; wrong notation reads as incompetence to the exact audience being addressed.
- **Headphone and eighth-note icons**, the definitive stock music glyphs.
- **Microphone**, legible, but labels her a singer or podcaster.
- **EQ curve**, needs explaining; reads as a line chart.
- **Reel-to-reel**, twice the cost of the cassette for a weaker read below 200px.
- **VU needle meter**, most expensive drawing on the list; says vintage hi-fi, not working
  musician.
- **Real FFT-driven bars**, more work than the canned loop and looks worse on mastered
  audio.
- **BPM-locked marquee**, imperceptible; the real problem is constant speed across
  languages.
- **Animated timeline playhead**, implies the arrangement is playing.
- **Hover-to-scrub**, fires audio without consent and re-introduces a complained-about
  hover shift.
- **Needle-drop animation**, delays the response to a press.
- **Skill percentages on the faders**, unverifiable and a toy tell.
- **Inline emoji in the headline** (REF A), works for a Chicago product designer; costs a
  young Italian composer authority and buys nothing. Keep the stickers, drop the emoji.

---

## 11. How this looks like a serious portfolio and not a toy

The purpose is employment. These are ordered by how much each one moves that needle, and
the top three are not visual, which is itself the answer.

1. **The work is playable within one scroll of the top.** A recruiter gives roughly twenty
   seconds. If the first thing you can press is at 60% scroll depth, the page has failed and
   no amount of decoration recovers it. Serious portfolios lead with evidence; toys lead
   with personality.

2. **Play works on the first click and the audio sounds good.** Latency, a stall, or a
   404 destroys more credibility than every visual decision on this page combined. The audio
   *is* the portfolio; everything here is a frame around it.

3. **Specific copy.** "Composer and sound designer" is a toy. "Wrote and produced the score
   for *[title]*, twelve minutes for string quartet and modular synth, recorded at
   *[studio]*, 2025" is a professional. Vague copy is the single biggest reason a page reads
   as a student's, and no ornament rescues it.

4. **Named, checkable facts.** The conservatory by name, the years, the instruments, the
   DAWs, real credits, a real city. The sequencer in §3 is only credible if its clip labels
   are specific, a timeline of "Studies", "Growth", "Projects" is worse than no timeline.

5. **Ration the loudest colour.** `palette-v2.md` already encodes this: magenta never gets a
   section. That mechanism is exactly what separates colourful-and-authored from
   colourful-and-childish. Loud hues everywhere read as a toy; loud hues *rationed* read as
   someone who made decisions.

6. **One signature object per section, at most three small marks.** The references look
   maximal but every one of them has a clear focal object with a few marks around it. Toy =
   ornaments scattered evenly with no hierarchy. And: **no ornament ever overlaps body
   type.**

7. **One calm reading section.** The About stays paper, black type, generous measure, no
   ornament crossing the text. A page that never lets up is a poster. The contrast is what
   makes the loud sections read as deliberate rather than as a default.

8. **A real photograph of her, working.** REF B's cut-out portrait works because it is a
   person. Anna at an instrument or a desk, black-and-white cut-out on a saturated ground,
   is the highest-credibility element on the page. A portfolio with no face is a template.

9. **The music details are correct.** 33⅓ rpm is 1.8s per revolution. Cassette hubs turn the
   same way. A DAW ruler numbers bars from 1. Her judges are musicians: one wrong detail
   reads as a bluff, and one right detail buys trust that no amount of polish can.

10. **Type discipline.** One display face at three sizes, mono for labels only, and the
    handwriting face, if REF A's is adopted, used once or twice, on a cassette label or a
    tape sticker. **Handwriting as body copy is the number-one toy tell.**

11. **Every link goes somewhere real.** A dead "Listen on Spotify" is worse than no button.
    No lorem, no placeholder credits, no "coming soon".

12. **No autoplay.** Ever. It is the most common single thing that makes a music page feel
    amateur, and it is a fast way to be closed.

13. **Accessibility as a craft signal.** Keyboard-operable player, real contrast, visible
    focus, a scrollable timeline that can be reached without a pointer. Invisible to most
    readers, but a page that collapses under a keyboard reads as amateur to the one recruiter
    who tries it, and this codebase is already doing this well. Do not lose it while making
    the page louder.

The compressed version: **be loud in the ornament, precise in the facts, and instant in the
playback.** The decoration says she has taste; the specifics say she can do the work; the
player proves it. Toys get one of the three.
