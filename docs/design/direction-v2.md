# Direction v2, the Portfolio as a pressing plant

Authoritative art direction. This document merges the client critique (`client-critique-v2.md`),
the loud-neobrutalism survey (`docs/research/loud-neobrutalism.md`), the palette proposal
(`docs/research/palette-v2.md`) and the music-vocabulary shortlist
(`docs/research/music-visual-language.md`) into one buildable direction. Where those four
disagree, this document decides. Build from this; do not re-litigate against the sources.

---

## 0. The thesis

**The ground stops being a neutral and becomes Anna's cantaloupe at ground scale. Every
loud thing on the page is then either one of her two colours or a music object that carries
information.**

The current build fails for one structural reason, and it is not chroma. Anna's cantaloupe
already sits at 87.6% of the sRGB chroma ceiling for its lightness, it cannot be made
louder without being made darker. The failure is that six surfaces share three
indistinguishable beiges, and her two real colours appear as *objects on* a neutral ground
rather than *as* the ground. A page whose ground is a near-white with a hue accident at
h 92 reads as a template that someone tinted.

So: the ground becomes `oklch(0.92 0.042 44.76)`, hue 44.76 is the cantaloupe's own hue,
exactly. It is her colour, at 35% of its chroma, holding roughly half the page. That single
change answers "too white, too bland", answers "punchier pastel ground with more brand
presence" (the Ubay note), and answers the survey's rule that *the colour must be one
decision, not a palette*, because now the ground and the two anchors are the same decision.

Everything else follows from three rules:

1. **Loud in two dimensions, disciplined in every other.** We shout with **ground colour**
   and **display scale**. We are austere about border widths (two), shadow offsets (three),
   radii (zero), ornament shapes (two), decorative motion loops (one), and hues that get a
   full-bleed section (four).
2. **Every large object is a music object, and every music object carries a fact.** The
   ribbon is sound. The disc spins because audio is playing. The faders are the skills list.
   The DAW ruler is the timeline. The oversized numerals are true. Nothing on this page is
   decoration pretending to be meaning.
3. **The work is playable above the fold.** A recruiter gives twenty seconds. If the first
   pressable thing is at 60% scroll depth, no amount of art direction recovers it.

---

## 1. The four conflicts, resolved

### 1.1 The palette designer wants six differently-hued sections. The survey says that is exactly how this style dies.

The palette proposal gives blue / paper / lemon / cantaloupe / grape / spring one full-bleed
section each. The survey's single strongest music-specific finding is the opposite: *"The
failure mode the comps invite, section 1 blue, section 2 green, section 3 pink, reads as a
template with a colour picker. One ground held across the whole page, other hues confined to
badge-scale marks, reads as an identity."*

**Decision: I take the palette's expanded set of hues and reject its section rhythm.**

One ground, **shell**, Anna's cantaloupe hue at low chroma, carries About, Songs, the CTA
surround and both secondary pages: roughly 50–55% of painted area. Four hues get a full-bleed
region, and each has a reason that is not "variety":

| Region | Ground | Why this hue and not another |
|---|---|---|
| Hero | **blue** | Anna's own, and arithmetically the ideal dark neo-brutalist surface (3.634:1 on black sits dead centre of the only band where a black keyline and white body type coexist). |
| Stats bar | **blue** | Repetition of one hue is the discipline. Her colour is the page's structural spine: it opens the page and it carries the facts. |
| Skills | **lemon** | The section the client says "reads as a CV line". It needs the loudest surface on the site, and lemon is the only hue that kills the beige-on-beige tag wall outright. |
| Timeline | **grape** | Functional, not decorative: a dark ground is what makes a sequencer strip read as a sequencer, and it is the only thing that separates the blocks (sheet 5.35, lemon 3.85, spring 3.36 against it). |
| Marquee band, header, footer | **ink** | Three black rules bracketing the page. One object family. |

Spring and magenta get **no** section on the landing page. Spring is the contact page's
ground; magenta is confined to badge scale and one folder body. That rationing is the
mechanism the survey identifies as separating "colourful and authored" from "colourful and
childish", and it is preserved.

**Cost:** cantaloupe loses the full-bleed songs section the palette proposal gave it. It is
repaid three times over, it *is* the ground hue, it carries the 88vw CTA block (the single
largest object on the page), it is the tape, and it is the ribbon's widest band.

### 1.2 The palette designer put the stats bar in cantaloupe (Ubay's amber bar). I moved it to blue.

With cantaloupe there, the section sequence produces two seams under 3:1
(shell→cantaloupe 1.627, cantaloupe→lemon 1.455, the worst pair in the palette). With blue
there, **every seam on the page clears 3:1 with no accepted exceptions**:

```
ink header  → blue hero    3.634
blue hero   → shell about  4.526
shell about → blue stats   4.526
blue stats  → lemon skills 4.045
lemon skills→ ink marquee 14.702
ink marquee → shell songs 16.448
shell songs → grape time   4.302
grape time  → shell cta    4.302
shell cta   → ink footer  16.448
```

**Cost:** we lose the literal Ubay amber bar. We gain white numerals on blue at 5.779:1
instead of black on cantaloupe, which is the stronger reading of Gumroad's oversized-numeral
device anyway, and the coral confidence the client asked for goes where they actually asked
for it, the CTA.

### 1.3 The survey says `4px 4px 0 #000` is the loudest amateur tell and six of the best sites ship no hard shadow. The brief says hard shadows stay.

**Decision: hard shadows stay, the brief is a hard constraint, but the symmetric 4px
default is retired as a value anyone reaches for.** We adopt Roze Bunker's rule instead:
**offset tracks element size**, and the scale is three steps, not eight in practice.

| Object class | Shadow |
|---|---|
| Large objects: Folders, the CTA block, the hero disc, photo cards | `12px 12px 0` (`--shadow-xl`), or single-axis `12px 0 0` where the object sits on a rule |
| Controls: play square, buttons, platform links, faders | `6px 6px 0` (`--shadow-md`) |
| Sticker labels, name plates, tags | `0 3px 0`, Refuge Worldwide's no-x-offset printing bite |

`4px 4px 0` appears nowhere. The token scale in `globals.css` keeps all eight steps (the
theme specimen and `theme.spec.ts` enumerate them), but the components use exactly these
three, and a review that finds `shadow` (the 4px step) on a component rejects it.

### 1.4 The survey wants display type at line-height 0.65–0.80. ADR-0008 floors it at 0.9 because Italian all-caps clips its diacritics.

**Decision: ADR-0008 wins. `--leading-display` stays 0.9.** A recorded decision with a
concrete reproducible failure (`È À Ù` colliding with the line above) outranks a survey
average.

We buy the poster read back from two places the constraint does not touch:

- **Size.** The hero name is `clamp(3.5rem, 15vw, 11rem)`, 176px at 1440, against the
  survey's 280–340px band but three times the current build.
- **Width.** Bricolage's `wdth` axis at **75%** on the name (the current build uses 85–88%).
  This is the lever ADR-0008 chose the face for, and it is what makes a poster-scale setting
  survive Italian.
- **The name never translates.** "Anna Milazzo" is two words in both languages. It is the one
  string on the site that can be set at any size with zero expansion risk, and it is the one
  we set biggest. Everything that *does* expand, taglines, headings, clip labels, skill
  names, is set at ordinary scale with room to grow.

**Cost:** the page will not read as tight as Feastables or GT Maru at the very top. It will
read as a gig poster set by someone who can spell Perché.

### 1.5 Two smaller calls, for the record

- **Hue-cycling (Dour's 7s `rainbowColors`) is rejected.** It delivers a "many hues"
  impression from one element, but we now have many hues as real surfaces, so it is
  redundant, and a 7s loop next to a 100s marquee mixes the two motion registers, which the
  survey names as the commonest execution error in this style.
- **A handwriting webfont (REF A) is rejected.** Two strings do not justify a fifth family,
  and handwriting-as-body is the number-one toy tell. The cassette label and the tape sticker
  are set in **Instrument Serif italic**, which we are loading anyway for the About
  pull-quote, so it costs nothing and reads as handwriting's literate cousin.

---

## 2. The system

### 2.1 Palette

Every hue sits on the 53.2075° lattice generated by Anna's own two colours (257.59 − 44.76 =
4 × 53.2075). The change from the palette proposal is that the **neutrals move onto lattice
point 0 (44.76, the cantaloupe's hue) rather than point 1**, because the ground is now a
diluted cantaloupe rather than an unrelated paper.

```css
:root {
	--ink:        oklch(0 0 0);                 /* #000000 */
	--shell:      oklch(0.92  0.042 44.76);     /* #FEDDCE, THE GROUND. Anna's hue, 35% chroma. */
	--sheet:      oklch(0.99  0.005 44.76);     /* #FFFBF9, inputs and manuscript mounts ONLY */
	--dust:       oklch(0.86  0.030 44.76);     /* #E3CBC1, rails and ticks only, never a section */

	--blue:       oklch(0.5104 0.1169 257.59);  /* #3866A8 ANCHOR, white type (5.779) */
	--cantaloupe: oklch(0.7803 0.1196 44.76);   /* #F79E76 ANCHOR, black type only (2.078 on white) */
	--lemon:      oklch(0.88  0.175  97.968);   /* #F7D725, black type (14.702) */
	--spring:     oklch(0.82  0.180  151.175);  /* #57E486, black type (12.847) */
	--magenta:    oklch(0.66  0.220  4.005);    /* #F74183, black type (6.039); never a landing section */
	--grape:      oklch(0.55  0.230  310.797);  /* #9B35D1, white type (5.492) */

	--background: var(--shell);
	--foreground: var(--ink);
	--card:       var(--sheet);
	--primary:    var(--blue);        --primary-foreground:   oklch(1 0 0);
	--accent:     var(--cantaloupe);  --accent-foreground:    var(--ink);
	--secondary:  var(--lemon);       --secondary-foreground: var(--ink);
	--muted:      var(--dust);        --muted-foreground:     oklch(0.44 0.03 44.76); /* #614E45, 6.128 on shell */
	--border:     var(--ink);
	--ring:       var(--ink);
	--ring-inner: oklch(1 0 0);
}
```

`--decor-lime` is **deleted**. It measured 1.453:1 on cantaloupe and 1.318:1 on paper, invisible
on two of six grounds, and h 128 was the only hue off the lattice. Both of its jobs pass to
`--lemon` and `--spring`, which are now real surfaces. The default ornament colour becomes
`--ink`.

**The rules that fall out of the matrix, and that a reviewer checks:**

- On the shell ground, **only blue (4.526) and grape (4.302) separate by luminance alone.**
  Everything else, sheet 1.241, lemon 1.119, spring 1.280, cantaloupe 1.627, magenta 2.724, depends on its black keyline. This is why the Folders *must* be coloured: a sheet card on
  shell is 1.241:1, which is the original beige-on-beige reappearing in peach.
- **Blue and grape must never touch** (1.052:1). They are luminance twins by construction:
  the black-keyline floor confines every dark surface to a band 1.556× wide, so the site can
  support exactly one dark surface family. No blue clips on the grape timeline. No grape band
  in the hero ribbon.
- **White type exists on two fills only**: blue and grape. Every other surface is black-type-only.
  There is deliberately no `--magenta-foreground: white` (3.478:1, large display only).
- **Magenta is decoration-poor.** It clears 3:1 on nothing in this palette (2.724 on shell,
  2.435 on lemon, 1.674 on cantaloupe). Use it as a *keylined surface with black type*, never
  as an ornament stroke.

### 2.2 Keylines, two widths, and the width is a rule

| Width | Applies to |
|---|---|
| **8px** | Objects wider than ~28rem: Folders, the CTA block, the stats bar's rules, full-bleed section seams, the hero disc |
| **4px** | Everything else that is an object: controls, stickers, clips, fader caps, covers, inputs |

**`2px` is deleted.** The language switch and the skill tags move to 4px.

`--border-brutal` stays 4px as the default. Introduce `--border-brutal-lg: 8px`, and note the
one trap: `.folder-tab` uses `margin-block-end: calc(var(--border-brutal) * -1)` to make the
tab and body one continuous outline, so the Folder must set `--border-brutal: 8px` *locally on
the `.folder` element* rather than hard-coding 8px on the body, otherwise the tab seam opens
by 4px.

**Keyline colour is black, except on the ink bands where it is white.** One rule, two values,
determined by ground. On the black footer, a black keyline around a coloured square is
invisible; an 8px white keyline is Oatly's inverse move and it is the correct answer, not a
decoration. The second sanctioned exception: the hero disc behind the cut-out portrait carries
its keyline in white where it crosses her dark hair.

### 2.3 Type

One display face at three sizes, mono for labels only, one serif for one purpose.

| Role | Face | Setting |
|---|---|---|
| The name | Bricolage | `clamp(3.5rem, 15vw, 11rem)` / `wdth 75%` / `ls -0.03em` / lh 0.9 / uppercase |
| Section heading | Bricolage | `clamp(2rem, 6vw, 4rem)` / `wdth 85%` / lh 0.9 / uppercase |
| Object heading (Folder title, clip label) | Bricolage | `--text-h3` / `wdth 88%` / uppercase |
| Oversized numeral | Bricolage | `clamp(4rem, 13vw, 12rem)` / `proportional-nums` / `ls -0.045em`; suffix a separate baseline-aligned element at 0.28× |
| Body | Instrument Sans | 1.0625–1.125rem / lh 1.6 / max 62ch |
| Labels, times, plates, marquee, ruler | Azeret Mono | 0.6875–0.8125rem / uppercase / `ls 0.08em` |
| The About pull-quote, the cassette label | **Instrument Serif italic** (new) | pull-quote `clamp(1.5rem, 3.5vw, 2.5rem)` / lh 1.15 |

`font-variant-numeric: proportional-nums` on the numerals is not optional: at 176px the
tabular gaps in `1` and `2` open into visible holes.

Adding Instrument Serif is a fourth family and amends ADR-0008, **write ADR-0009** recording
that a serif is loaded for exactly two uses, that the survey's most reliable single move is
letting the colour shout and a serif carry the credibility, and that it is capped at those uses.

### 2.4 Ornament and motion budgets, two budgets, separately capped

**Free-floating ornament: two shapes, five instances, all black.** Keep `arrow` and
`underline`, the two hand-drawn gestures. **Delete `asterisk`, `blob` and `cross`**: the
asterisk and cross are icon-set glyphs, the blob is the generator-preset shape the survey
tells us to drop, and three shapes is where the eye stops reading a system and starts reading
stock art. **The four-point sparkle is never added**, it appears in the comps and on none of
the eighteen sites measured.

**Music objects are a different budget: one signature object per section, no cap on kind**,
because they are the content's form rather than decoration. They carry `data-music`, not
`data-ornament`, so `e2e/ornament.spec.ts` keeps testing the ornament layer alone, which
matters, because that suite asserts no ornament is clipped by its container and the ribbon is
cropped by design.

**Rotation:** stickers, plates and Folders draw from the closed set `−3, −1.5, 1.5, 3deg`,
cycled by index, never random, never zero. Tape is exempt and stays at 38–47deg, that is not
a sticker rotation, it is tape across a corner.

**Motion:** exactly two loops on the landing page.

| Loop | Duration | Gate |
|---|---|---|
| Marquee | derived: `contentWidth / 40px per second` (≈60–100s) | `@media (prefers-reduced-motion: no-preference)` |
| Disc spin | `1.8s` = 60 ÷ 33⅓ rpm, and it runs **only while that Song is playing** | same |

Deriving the marquee duration from content width is a live bug fix, not a refinement: Italian
runs 200–300% longer than English, so a fixed duration makes the two languages scroll at
visibly different speeds from the same CSS.

Both loops are declared *inside* the no-preference query, never switched off afterwards, the
`animation-duration: 0.001ms` override does not stop scroll-driven animation. And motion may
amplify a state, never carry it alone: with reduced motion, "playing" must still be legible
from the pause glyph and the filled disc label.

Fast motion is for feedback only: the existing 90ms `.control` hover/press stays exactly as
built. Nothing decorative runs on a 2–5s loop.

### 2.5 Focus, one indicator that works on all nine grounds

The current blue ring is invisible on the blue hero. Replace it with a two-tone indicator:

```css
:focus-visible {
	outline: 3px solid var(--ring);          /* black */
	outline-offset: 3px;
	box-shadow: 0 0 0 3px var(--ring-inner); /* white, filling the gap */
}
```

Black and white are 21:1 apart, and every member of this palette clears 3:1 against at least
one of them, so this indicator is legible on shell, blue, lemon, spring, cantaloupe, magenta,
grape, sheet and ink. The white inner line also solves the problem the current comment
identifies, a black ring around an element that already has a black keyline reads as a
doubled border, because the white gap separates them.

### 2.6 Photography

- **Cut-outs are prepared as assets.** `filter: grayscale(1)` is banned outright: it maps
  luminance directly, produces mud, and none of the eighteen sites measured uses it. Channel-mix
  to lift skin off the background, then push contrast harder than you would on white, a
  cut-out on a saturated ground needs more contrast, not less. A real alpha matte, so the
  silhouette (hair, a raised hand, an instrument neck) breaks the edge of the block behind it.
- **Song covers stay in colour**, keylined 4px, taped, rotated from the closed set.
- `Portrait` needs an **unframed variant**, no border, no shadow, for the cut-out. The framed
  classes stay for covers and the manuscript.

---

## 3. Per region

Read each block as: **ground / layout change / devices / the one thing that stops it looking
safe / Italian / contrast.**

### 3.1 Header

**Ground: ink.** White type. Sticky, 56px, full-bleed, `border-b` 8px in white.

**Layout change.** The current header is a black rule with an empty `<span />` on the landing
page and a language switch. It becomes a **transport bar**: the wordmark `ANNA MILAZZO` in mono
at the left, a live datum in the middle, `DISPONIBILE DA [month year] · [city]`, and the
language switch at the right as two hard 4px-white-keylined squares, the active one filled
white with black type.

**Devices.** None. The header is chrome; it holds no ornament and no music object.

**The unsafe thing.** It carries a **fact, not a menu**. A portfolio header that states when
she is available and where she is reads as a working musician's; a header with three nav links
to a three-page site reads as a template. There is nowhere to navigate to (ADR-0002: Songs have
no URL), so we do not pretend there is.

**What the client asked for and did not get.** Robin's pill bar with icons. Pills are forbidden
by the zero-radius constraint, and an icon set inside a 4px-keyline page is the borrowed-design-
system tell. We take the **filled active state** and the **segmented feel**, and refuse the
radius and the icons. Cost: less playful chrome, paid back by the header being one of the three
black bands that give the page its skeleton.

**Italian.** `DISPONIBILE DA` vs `AVAILABLE FROM`, the middle datum collapses out below 48rem,
leaving wordmark and switch. Nothing depends on it fitting.

**Contrast.** White on ink 21:1. ink→blue hero 3.634:1.

### 3.2 Hero

**Ground: blue, full-bleed.** White type. `border-b` 8px black.

**Layout change.** The current symmetric `1.2fr 1fr` grid, name and tagline on the left, a
bordered rectangle photo on the right, is deleted. The hero becomes a **layered composition
with no grid**:

1. The **ribbon** (`data-music="ribbon"`), full-bleed, entering the left edge and exiting the
   right, sweeping behind everything. One `#spine` path in `<defs>`, ten `<use>` elements, the
   onion-of-strokes construction: each black stroke is 8 units wider than the colour stroke
   beneath it, so every band gets exactly 4 units of black on each edge and the keyline *is*
   the stroke underneath rather than extra geometry. Widths 208/200, 160/152, 112/104.
   `viewBox="0 0 1440 420"`, `preserveAspectRatio="xMidYMid slice"`, crop, never stretch, so
   hand-placed discs stay stuck to the curve at every viewport. Must be inline SVG; an external
   `<img src>` cannot resolve `var(--lemon)`.
   **Three bands only: cantaloupe (2.781), lemon (4.045), spring (3.535).** The blue band is
   literally invisible on the blue hero (1.000) and the grape band nearly so (1.052); magenta
   fails at 1.662. Three hues is enough, Curry Cafe runs a whole site on it.
2. One **vinyl disc**, ~340px, **55% occluded** behind her, embedded on the ribbon's spine so it
   reads as carried by the gesture rather than placed near it. Black disc, cantaloupe label,
   spindle hole filled with the blue ground, nine grooves at irregular radii (92, 86, 83, 74,
   70, 61, 56, 54, 45, no repeating period, so no carrier beats against the pixel grid),
   `vector-effect="non-scaling-stroke"` on the grooves and the keyline so a scaled disc keeps a
   4px keyline identical to every CSS border on the page.
3. Her **cut-out portrait**, matted, breaking the disc's edge and the ribbon's top band.
4. The **name**, `ANNA` / `MILAZZO` on two lines, poster scale, overlapping the disc's left edge.
5. A **sticker cluster** of three squares, lemon (4.045), spring (3.535), sheet (5.619), black
   type, 4px keylines, `0 3px 0` shadows, rotations from the closed set. They carry facts, not
   adjectives: `COMPOSITRICE E SOUND DESIGNER` · `[CONSERVATORIO], [ANNO]` · `[CITTÀ]`.
6. The **positioning line** in Instrument Sans below, one sentence, max 42ch.
7. **`ASCOLTA` / `LISTEN`**, a cantaloupe control with a black triangle that starts Song 01 and
   scrolls its Folder into view.

**The unsafe thing.** **The portrait loses its frame.** On a page where everything is keylined,
the one un-keylined object is the person. That is the single most art-directed decision
available here, it costs one asset prep, and it directly answers the survey's finding that
keylining everything flattens hierarchy, if the hero photo, the paragraph, the badge and the
footer all carry the same rule, nothing is foreground.

**Why the play control is in the hero.** The survey's hardest rule: *"The work is playable
within one scroll of the top."* The client did not ask for this. Ship it anyway. It is the one
thing on this list that changes whether the Portfolio does its job.

**Italian.** "Anna Milazzo" is identical in both languages, it is the one string that can be
set at 176px with no expansion risk, which is exactly why it is the string we set biggest. The
tagline sits at 1.125rem with a 42ch measure and room to run to three lines.

**Contrast.** White display on blue 5.779. Stickers 3.5–5.6. Cantaloupe control on blue 2.781, carried by its 4px black keyline (10.107 against the cantaloupe, 3.634 against the blue).

### 3.3 About

**Ground: shell.** Black type. The one calm reading surface on the site, and the argument for
every loud section around it.

**Layout change.** Two columns at ≥64rem: prose left at a 62ch measure, an **object cluster**
right. No ornament crosses the text, ever, in any breakpoint.

The object cluster is the only place notation belongs on this site, because here it is evidence
rather than decoration:

- A scan of **her own manuscript or engraved score**, black-and-white, contrast-pushed, keylined
  4px, rotated 1.5deg, taped at two corners.
- A **cassette** (`data-music="cassette"`) laid across its lower corner, rotated −3deg. Ten flat
  shapes: outer rect in lemon with a 4px keyline, label rect in sheet, window, two hubs with six
  spokes each, a solid black tape-path trapezoid at the bottom edge, four corner screw dots. The
  label carries a piece title in **Instrument Serif italic**. The cassette is *static*, the
  reels do not turn. One spinning object on the page, and it is the disc, because the disc's
  spin means something.

**The unsafe thing.** A **pull-quote in a serif**, set at `clamp(1.5rem, 3.5vw, 2.5rem)` italic,
in Anna's own words, breaking the prose column and hanging into the left margin. Every amateur
version of this style reaches for a fat geometric sans everywhere and lands between a children's
app and a fintech startup. Letting the colour shout and a serif carry the credibility is the
most reliable move in the whole survey, and this is the one place it goes.

**Italian.** Prose is a `textarea` with `whitespace-pre-line`; length is unconstrained by design.
The pull-quote must be a *separate short field* with a 140-character admin limit, or an Italian
pull-quote at 40px will run six lines and swamp the column.

**Contrast.** Black on shell 16.448. The manuscript and cassette sit on shell behind 4px black
keylines (1.241 and 1.119 respectively without them, the keyline is doing all the work, as
designed).

### 3.4 Stats bar

**Ground: blue, full-bleed.** White type. 8px black rules top and bottom. Sits between About and
Skills.

**Layout change.** New section. Three figures across, one row at ≥48rem, stacked below. Each:
the numeral at `clamp(4rem, 13vw, 12rem)` with `proportional-nums` and `ls -0.045em`, the suffix
(`+`, `MIN`, `°`) as a separate baseline-aligned element at 0.28×, and a two-line mono label
beneath.

**Devices.** One `underline` ornament in black, drawn through the row (Ubay's squiggle). That
is one of the five permitted ornament instances.

**The unsafe thing.** **The numerals are the largest type on the page after her name**, larger
than every section heading. A page whose second-biggest type is a fact reads as a professional's;
a page whose second-biggest type is the word "Skills" reads as a template.

**This is the highest-return device on the entire list and it is blocked on content.** It is what
Gumroad kept after abandoning thick borders and hard shadows, and it only works because
`$2,193,086` is true. Candidate figures: works completed, minutes of finished music, years at the
conservatory, commissions delivered, instruments played, cities recorded in. **If Anna cannot
supply three true numbers, the section does not ship.** Three invented numbers on a portfolio is
worse than no stats bar, and it is checkable.

**Italian.** The numeral is language-independent; the *label* expands. Clamp on the label, not
the numeral: fixed numeral size, mono label at 0.6875rem with `text-wrap: balance`, two lines
maximum, and the grid drops to one column at 48rem before the labels can collide.

**Contrast.** White on blue 5.779 (body) and comfortably over 3:1 for display. Black rules on
blue 3.634.

### 3.5 Marquee band

**Ground: ink, full-bleed.** Two lanes in one object, ~120px total. Sits between Skills and Songs.

**Layout change.** New section, and it is **structural before it is decorative**. Four light
surfaces and two darks make some light–light adjacency unavoidable; the band is what keeps the
lemon skills section from smearing into the shell songs ground (1.119:1, the worst pair on the
page), splitting it into 14.702 and 16.448.

- **Upper lane:** the marquee. Track duplicated twice, wrapper at `width: max-content; display:
  flex`, `animation: slide Ns linear infinite` with `@keyframes slide { to { transform:
  translateX(-50%) } }`, `will-change: transform`. Duration derived from measured content width
  at 40px/s. Separator is a repeated glyph, a small filled disc, never a comma.
  Content is **hard information**: collaborators, venues, ensembles, studios, years, producers,
  labels. Not adjectives.
- **Lower lane:** the amplitude strip. CSS boxes, not SVG, a flex row of spans with `flex: 1`
  and `height: calc(var(--h) * 1%)` reflows to any width with real keylines, whereas an SVG bar
  strip stretched with `preserveAspectRatio="none"` shears them. 24–36 bars, mirrored around a
  centreline (mirrored reads as waveform; single-sided reads as a spectrum analyser), widths
  varied ±25% as well as heights, a per-bar rotation of 0.5–2deg baked into the authored array,
  some bars overshooting and clipped by the strip edge so it reads as a window onto something
  longer. Fills cycle cantaloupe / lemon / spring / magenta. **The sequence is hand-authored,
  never `Math.random()`**, random has no phrase structure, so it reads as noise, and it changes
  between server and client render.

**The unsafe thing.** **It is one object doing two jobs.** Running the marquee and the waveform
as two separate strips would cost 180px of scroll for one idea; running them as two lanes of one
black band is the difference between a page that has devices and a page that has a system.

**Italian.** This is where the derived duration matters. Do not ship a fixed `Ns`.

**Contrast.** White on ink 21:1. Every bar fill clears on black; there is no check to run.

### 3.6 Skills

**Ground: lemon, full-bleed.** Black type. The loudest surface on the site.

**Layout change.** The tag row is deleted. `skills.tsx:33` currently sets `bg-card` tags on
`bg-secondary`, 1.391:1, the single worst thing in the current build, and repointing
`--secondary` to lemon would carry it straight into the new one at 1.119. The whole component is
replaced by a **fader bank** (`data-music="faders"`).

One channel strip per skill: a 6px vertical rail with a 4px black keyline, a 44×20 cap block
with a centre notch positioned at `bottom: calc(var(--level) * 1%)`, scale ticks down one side
via `repeating-linear-gradient` in dust, and a mono name plate at the base with a `0 3px 0`
shadow. Cap fills cycle **blue (4.045) / grape (3.845) / magenta (2.435, keyline-carried) /
sheet (1.389, keyline-carried)**.

Semantics: the name plates are the `<li>` elements, the real list stays the content. The rail
and cap above each are `aria-hidden`.

**Two hard rules.**

1. **A single fader is a slider; four or more is a mixer.** Below four skills the section renders
   as plates only, with no rails. The read does not work at three.
2. **Never encode a percentage.** "Piano 87%" is unverifiable, faintly absurd, and a classic toy
   tell. Cap positions are composition; the meaning lives entirely in the words. Vary them, a mixer with every fader level looks dead.

**The unsafe thing.** **Full-bleed acid lemon with no white anywhere on it.** This is the section
the client says reads as a CV line. It now has the loudest ground on the site and a form that is
unmistakably a mixer.

**Italian.** `Sound design per immagini` against `Sound design for film`. Plates are 6.5rem wide,
mono at 0.6875rem, `text-wrap: balance`, up to two lines, with the bank's row height fixed so a
long plate does not push its rail. Below 40rem the bank becomes a horizontal scroller, reuse the
timeline's proven pattern exactly: `overflow-x: auto`, `tabIndex={0}`, `aria-label`, and the
`biome-ignore` already justified in `timeline.tsx`.

**Contrast.** Black body on lemon 14.702. Every cap either clears 3:1 on lemon or is carried by
its 4px black keyline (14.702 against the ground).

### 3.7 Songs, the Folder stack

**Ground: shell.** Black type. The quietest ground on the page, deliberately, because it has to
hold five multicoloured objects.

**Layout change, five things.**

1. **The Folder bodies become coloured.** Fills cycle **sheet / lemon / spring / cantaloupe /
   magenta**, all with black type (20.419 / 14.702 / 12.847 / 10.107 / 6.039 against black, every
   one clears body copy). This is not decoration: a sheet card on shell is **1.241:1**, which is
   the original beige-on-beige reappearing in peach. Colouring the Folders is *forced* by the
   ground change.
2. **The tab takes a different fill from the same cycle** than its body, REF A's black-and-yellow
   folder tabs. The tab only needs to be opaque, not to match. Keep the negative-margin technique
   exactly as built; set `--border-brutal: 8px` on `.folder` so the tab seam math follows.
3. **The tape comes in several colours**, the client's explicit note. Cycle cantaloupe / lemon /
   spring / sheet at 78% with `mix-blend-mode: multiply`. Keep the two mirrored strips straddling
   the cover's edge; `e2e/song-stack.spec.ts:132` asserts a strip crosses the cover boundary, and
   that assertion is correct, tape contained inside the image is a printed graphic.
4. **A vinyl disc slides out from behind each cover**, 25–40% visible at the outer edge (below 25%
   it reads as a stray black blob), 4px keyline, label in a hue that is not the body's, drawn
   with the sleeve-peek shadow written longhand as `filter: drop-shadow(12px 12px 0 var(--border))`, the Tailwind `drop-shadow` scale is cleared in `globals.css`. **The disc spins at 1.8s while
   that Song is playing** and is otherwise still.
5. **Folders rotate from the closed set (−1.5, 1.5, −1, 1deg).** They do **not** overlap. REF A and
   the Ubay note both want overlapping cards; `song-stack.tsx` refuses it, and the refusal is
   right, an overlapping card puts one tap target under another and at 375px the top one wins
   unpredictably. Rotation plus a 12px hard shadow already reads as stacked paper. **Cost stated:
   we lose the overlap.**

**The transport rebuild, the client's "catastrophe", and the most important fix on this list.**

- **The play control becomes a black square with a white glyph**, 4.5rem, 4px keyline, `6px 6px 0`.
  Black, not blue: black is 21:1 against its own glyph on all five Folder fills, it is the darkest
  thing in the Folder, and it is unmistakably a control. A blue button on a sheet card reads as
  generic UI.
- **The rail stops being a loading bar.** `.playhead-blocks` is currently a
  `repeating-linear-gradient` at a uniform 0.75rem pitch, which is precisely why nobody reads it
  as audio. Replace the uniform pitch with a **hand-authored 24-value amplitude phrase**, rising
  build, swung zigzag, peak at 96, drop, secondary lift, decay, rendered as CSS boxes: hollow
  bars underneath, a duplicate filled copy on top clipped by
  `clip-path: inset(0 calc((1 - var(--playhead)) * 100%) 0 0)`. One custom property still drives
  it from the animation frame, no React re-render per tick, and `clip-path` is composited so it
  costs nothing. Author two or three phrases and pick by song index.
- **The transparent native `<input type="range">` stays exactly where it is.** It is what makes the
  thing you see filling the thing you drag, and it is what gives arrow keys, Home/End and a
  reported value for free. Do not reimplement it as `role="slider"`.
- **Reduced motion must still show state.** With the spin gated off, "playing" is carried by the
  pause glyph and the disc label filling. Motion amplifies a state; it never carries one alone.

**Also add, per Folder, one mono line under the title:** `03:41 · pianoforte, nastro, sintetizzatore
modulare · 2025`. Duration, instrumentation, year. This is what makes the section read as a
professional's catalogue rather than a mood board, and it costs two fields.

**The unsafe thing.** **The cards are five colours and the ground is neutral.** In this genre the
convention is white cards on a colour ground. Inverting it, colouring the objects and calming the
ground, is the move that will make this page not look like the kit.

**Italian.** Titles and stories are localized and long; the Folder is a flow layout with no fixed
heights, so expansion costs vertical space and nothing else. The mono spec line wraps.

**Contrast.** Body copy on every Folder fill clears 6:1 minimum. Folder-on-shell separation is
keyline-carried at 8px. The platform link inside a Folder must **not** use `.control-paper`
(sheet on lemon is 1.389), add **`.control-ink`**, black with white type, and use it everywhere
inside a Folder.

### 3.8 Timeline

**Ground: grape, full-bleed.** White type. The only dark section on the page.

**Layout change, the concept is right, so nothing about the concept changes.** Seven additions,
in order of return:

1. **The dark ground.** Roughly half the read, for one class. It is what makes a sequencer strip
   read as a sequencer, and it is what finally separates the blocks, the current `FILLS` cycle
   runs `bg-card` and `bg-secondary`, two near-identical beiges.
2. **A ruler with a tick hierarchy**, the strongest tell a generic chart never has. Two stacked
   `repeating-linear-gradient`s: 16px ticks at bar pitch, 8px at beat pitch,
   `background-position: 0 100%`. **Bar numbers in mono starting at 1, not 0.** Her judges are
   musicians; one wrong detail reads as a bluff.
3. **Sticky lane headers**: `position: sticky; left: 0` inside the existing `overflow-x` scroller,
   z-index above the clips, opaque grape background, without the opaque fill the blocks slide
   visibly underneath.
4. **A static playhead**: a 3px vertical rule spanning all lanes with a `::before` triangle flag in
   the ruler, **in lemon (3.845 on grape)**. Not magenta, magenta on grape is 1.579:1 and
   disappears. It never sweeps: a moving playhead implies the arrangement is playing, which it is
   not, and it re-fires on every scroll back.
5. **Clip widths that honestly encode duration**, so a three-year conservatory block is genuinely
   3× a one-year workshop. Then it is a correct chart and a convincing arrangement at once.
6. **A loop brace in the ruler** over "available from".
7. **20px S/M solo-mute squares** on each lane header, as `aria-hidden` `<span>` elements, **never `<button>`**. A control that looks pressable and does nothing is both an accessibility
   trap and dishonest.

New `FILLS`: **`bg-sheet` (5.340) / `bg-lemon` (3.845) / `bg-spring` (3.360)**, black type on all
three. Cantaloupe leaves the cycle at 2.643. **No blue clip ever**, blue on grape is 1.052:1.

Do **not** add automation curves, a mixer strip, or per-clip waveforms. Keep the `<ol>`, the
`tabIndex={0}` scroller and the `aria-label`: the list is the content, the DAW is a layout of it.

**The unsafe thing.** **It is the only dark section on the site, and it is purple.** Coming out of
the shell songs ground into a full-bleed grape strip is the biggest lightness drop on the page
(0.92 → 0.55), and it is what makes the sequencer read as a machine rather than a chart.

**Italian.** Clip width is duration-driven, which fights long Italian labels. Give every clip
`min-inline-size: 9rem`; duration governs above that floor and the label wraps. Lane names go in
the sticky headers where they have a fixed 8rem column and can run two lines.

**Contrast.** White on grape 5.492 (body). All three clip fills clear 3:1 against grape for their
keylines and carry black body copy at 12.8+ against black. Section seams shell→grape 4.302 both
sides.

### 3.9 Contact CTA (landing page)

**Ground: shell**, with the block itself in **cantaloupe**.

**Layout change.** The current CTA, a heading, a paragraph and an `.control-accent` button
floating on the ground, is deleted. It becomes a single **object**: a cantaloupe block at
**88vw** (`max-width: 88rem`), 8px black keyline, `16px 16px 0` shadow, `padding: clamp(2rem,
6vw, 4.5rem)`, containing a heading at section scale, one line of body, and one button.

The block must be an object on the shell, not a full-bleed fill, a full-bleed fill cannot carry
a hard shadow, and the shadow is what makes it feel confident rather than merely large.

**The button is black with white type**, `.control-ink`, `6px 6px 0`. Magenta on cantaloupe is
1.674:1 and blue is 2.781:1; black is 10.107:1 and it matches the play control, so the two most
important pressable things on the site look like each other.

**Devices.** One `arrow` ornament in black, sweeping from the button toward the block's edge
(REF B and Ubay both do this). Second of the five permitted ornament instances.

**The unsafe thing.** **It is the single largest object on the page and it hangs off the grid**, 88vw with a 16px shadow, wider than the 72rem content column every other section respects. That
break is the whole point: the client's note is that the CTA "does not work" and must be "wide and
confident".

**Italian.** Heading at section scale with a `wdth 85%` axis and no fixed height; the block grows.
The button label is the risk, `SCRIVIMI` vs `GET IN TOUCH`, so the button is `width: auto` with
generous padding and never a fixed width.

**Contrast.** Black on cantaloupe 10.107. White on black 21. Cantaloupe block on shell 1.627,
carried by the 8px keyline.

### 3.10 Contact page

**Ground: spring, full-bleed.** Black type. The release out of the site's loudest sequence.

**Layout change.** Two columns at ≥64rem: the form card left, hard facts right.

- **The form card is blue** (3.535:1 against spring, REF D's blue form card), 8px keyline,
  `12px 12px 0`, white labels.
- **Inputs are sheet on that card** (5.619:1), 4px black keylines. Note: white type on the card,
  black type in the inputs.
- **`contact-form.tsx:54` must change.** The success message currently uses `bg-accent`; on the
  blue card that is 2.781:1. Use **`bg-lemon`** (4.045).
- The right column carries checkable facts, not a paragraph: real email, city, typical response
  time, languages worked in, availability date.

**Devices.** None. This page is a form; the survey's rule about one calm section applies double to
the one place someone is typing.

**The unsafe thing.** **The whole page is green.** A contact page is the most default-looking
surface on any site, and a full-bleed spring ground with a blue form card is the least default
answer available.

**Ticket/perforated edges are held in reserve.** They belong on a live-dates list and nowhere else, REF A puts them on skill tags, which is decoration pretending to be meaning. The moment Anna has
gig dates, the dates list gets the two half-circle notches via
`radial-gradient(...)` + `mask-composite: intersect`, and it will be self-explanatory.

**Italian.** Field labels are mono and short in both languages. The outcome messages are the long
strings; they sit in a full-width box above the form with no height constraint.

**Contrast.** Black body on spring 12.847. White on blue 5.779. Sheet inputs on blue 5.619.

### 3.11 Legals page

**Ground: shell.** Black type. `legal-prose` at a 62ch measure.

**Layout change.** Almost none, deliberately. The h1, one 8px black rule beneath it, and the body.

**Devices.** None. No ornament, no music object, no colour but the black rules and the ground.

**The unsafe thing.** **It is aggressively plain, and that is the decision.** A site that never
lets up is a poster. The legals page is the proof that every loud surface elsewhere was chosen
rather than defaulted to, and it is the page a careful reader checks to see whether the rest was
an accident.

**Contrast.** Black on shell 16.448.

### 3.12 Footer

**Ground: ink.** White type. `border-t` 8px white. **Must move off `bg-secondary`**, with
`--secondary` repointed to lemon, the current footer turns yellow and sits 1.144:1 against the
contact page's spring.

**Layout change.** Three parts:

1. The wordmark in white Bricolage at section scale, `wdth 85%`.
2. A **grid of coloured squares**, REF D's footer of coloured pills at zero radius. Each is a
   link: Spotify, Instagram, email, legals. Fills cycle lemon / spring / cantaloupe / magenta,
   black type, gap equal to the keyline width (the bento rule: a gap equal to the keyline reads
   as a drawn grid; a 24px gap reads as a generic card list).
3. A mono line: `DISPONIBILE DA [month year] · [city] · [email]`.

**Keylines here are 4px WHITE**, not black, the second sanctioned inversion, and it is forced:
a black keyline around a coloured square on a black ground does not exist.

**The unsafe thing.** **It is the second-loudest thing on the page.** Footers are where portfolios
go quiet; four saturated squares with white keylines on black is the last impression, and it is
the one that makes the page feel designed all the way down.

**Italian.** Link labels come from `settings.socialLinks` and are already localized; the grid
wraps.

**Contrast.** White on ink 21. Every square fill clears 6:1 against black for its type and 6:1+
against black for the ground; the white keyline clears 1.4–3.5 against the fills, which is
adequate for a non-text boundary sitting on 21:1 black.

---

## 4. What gets deleted

A louder page is not an additive page. These go.

**Tokens and theme**

1. **`--decor-lime`**, and the entire quarantine rule that came with it. 1.453:1 on cantaloupe,
   1.318:1 on paper, and the only hue off the lattice. `ornament.tsx:76`, `specimen/page.tsx:21`,
   `theme.spec.ts:53`, `e2e/ornament.spec.ts:114–136` and `--chart-3` all reference it.
2. **`--secondary` as sand** `oklch(0.931 0.023 88)`. Repointed to lemon.
3. **`--background` as paper** `oklch(0.9711 0.0125 92)`. Repointed to shell. There is no longer
   a "paper" in this design.
4. **`2px` as a border width.** Two widths only, and the width is a rule.
5. **`4px 4px 0` as a shadow anyone reaches for.** The token stays in the scale; the value leaves
   the components.
6. **The blue focus ring.** Invisible on the blue hero; replaced by the black/white two-tone.

**Components and layout**

7. **Three of five ornament shapes**: `asterisk`, `blob`, `cross`. Keep `arrow` and `underline`.
8. **The hero's `md:grid-cols-[1.2fr_1fr]` grid** and the framed-rectangle portrait treatment.
9. **The skills tag row** (`skills.tsx:29–38`) entirely, replaced by the fader bank.
10. **The timeline `FILLS` cycle** `['bg-card','bg-secondary','bg-accent']`, two near-identical
    beiges plus a cantaloupe that fails on grape.
11. **The uniform `repeating-linear-gradient` playhead** at 0.75rem pitch. It is why the transport
    reads as a loading bar.
12. **`bg-accent` on the contact success message** (`contact-form.tsx:54`), 2.781:1 on the new
    blue card.
13. **`bg-secondary` on the footer** (`site-footer.tsx:13`).
14. **`.control-paper` inside any Folder**, sheet on lemon is 1.391:1. Replaced by `.control-ink`.
15. **The empty `<span />`** the header renders on the landing page.

**Things that are never added, and a reviewer rejects on sight**

16. The **four-point sparkle**. It is in the comps and on none of the eighteen sites measured.
17. **Notes, clefs, rests and staves.** Hairline curves cannot carry a 4px black keyline; they are
    already black, so a black keyline on them is invisible; and decorative notation is almost
    always *wrong* in a way legible to exactly the musicians judging her. A treble clef beside a
    young musician's name reads as a school recital programme.
18. **Headphone and eighth-note icons.** The definitive stock music glyphs.
19. **A microphone.** It labels her a singer, which mislabels a composer.
20. **`filter: grayscale(1)`** on any photograph.
21. **`Math.random()`** for any rotation, bar height or amplitude value.
22. **Autoplay**, in any form.
23. **Hover-to-scrub a Folder.** It starts audio without consent, and the client has already
    complained that hovering a Folder moves things.
24. **A needle-drop animation.** A 400ms one-shot that delays the perceived response to a press.
    The press must feel instant.
25. **Skill percentages.**
26. **Inline emoji in display type.** The system emoji font drops a glossy 3D gradient into a flat
    keylined page and it looks wrong in a way that is impossible to miss.
27. **Any decorative loop between 2 and 30 seconds.** That register belongs to loading states.
28. **A third dark surface.** The keyline floor confines every dark fill to a luminance band 1.556×
    wide; a third dark hue will be indistinguishable from blue and grape.

---

## 5. Build order

Ordered so the client sees the transformation in the first commit, not the last. Each step is
shippable on its own.

**1, Tokens and grounds.** `globals.css`: shell ground, the six hues, delete lime, repoint
`--secondary`, the two-width keyline rule, the three-step shadow rule, the two-tone focus. Then set
each section's background class and the two black bands. Update `theme.spec.ts`,
`no-dark-mode.test.ts`, `specimen/page.tsx` and `e2e/ornament.spec.ts`'s lime block in the same
commit or CI breaks. **Largest visible change per hour of work on this list by a wide margin**, the page becomes unrecognisable and every remaining step is an improvement on something that
already looks different.

**2, Hero.** Name at poster scale, sticker cluster, cut-out portrait, disc, ribbon, `ASCOLTA`
control. The client's number-one complaint, and the section a recruiter sees first. Blocked on the
cut-out asset; ship the composition with the current photo unframed if the matte is not ready.

**3, Transport.** Black play square, authored amplitude rail, disc spin on `data-playing`. The
client's other stated catastrophe, and the only item on this list that affects whether the
Portfolio does its job at all. Touches no engine code.

**4, Folders.** Coloured bodies and tabs, tape colour cycle, sliding disc, rotation set, the mono
spec line. Answers the tape note and inverts the genre's card convention.

**5, Marquee band.** Marquee lane plus mirrored amplitude lane, duration derived from content
width. Adds the one universally missing device and fixes the page's worst seam at the same time.

**6, Skills fader bank.** Replaces the worst contrast failure in the current build with the
section's signature object.

**7, CTA block and footer.** 88vw cantaloupe block, `.control-ink` button, coloured-square footer
with white keylines. Cheap, and it fixes the last of the client's named regions.

**8, Timeline DAW chrome.** Ruler with tick hierarchy, sticky lane headers, static lemon playhead,
duration-proportional clips, loop brace, S/M squares. The most work per unit of visible change on
this list, which is why it is here and not earlier, the grape ground in step 1 has already done
half of it.

**9, Contact page and header.** Spring ground, blue form card, `bg-lemon` success, transport-bar
header.

**10, Stats bar.** Last, because it is **blocked on Anna supplying three true numbers** and must
not ship with invented ones. When the numbers arrive it is a two-hour section with the highest
return on the page.

**11, Ornament cull, ADRs, specimen.** Delete three shapes, place the five permitted instances,
write ADR-0009 (Instrument Serif amends ADR-0008) and ADR-0010 (the ground is Anna's cantaloupe at
low chroma), refresh the specimen page.

---

## 6. Content Anna must supply, and what is blocked on it

None of this is a visual problem, and no ornament rescues it. Vague copy is the single biggest
reason a page reads as a student's.

| Needed | Blocks |
|---|---|
| A cut-out-ready portrait, plain ground, ideally at an instrument or a desk | Hero (step 2) |
| A scan of her own manuscript or engraved score | About cluster (step 2) |
| **Three true figures** with labels | Stats bar (step 10), does not ship without them |
| Conservatory name, years, city, availability date | Header, hero stickers, timeline |
| Marquee content: real collaborators, venues, studios, labels, years | Marquee band (step 5) |
| Timeline entries with real institutions and real durations | Timeline (step 8), "Studies / Growth / Projects" is worse than no timeline |
| Instrumentation and year per Song | Folder spec line (step 4) |
| **Working platform links** | Songs. The seed ships `placeholder-*` Spotify URLs; a dead "Listen on Spotify" is worse than no button, and the Folder already handles a missing link correctly |
| One short pull-quote, ≤140 characters, per language | About (step 2) |

---

## 7. Files that change

**Theme and tests**, `src/app/(frontend)/globals.css`, `src/tests/no-dark-mode.test.ts`,
`src/app/(specimen)/specimen/page.tsx`, `e2e/theme.spec.ts`, `e2e/ornament.spec.ts`,
`e2e/timeline.spec.ts`, `e2e/landing-top.spec.ts`.

**Rewritten**, `hero.tsx`, `skills.tsx`, `timeline.tsx`, `site-header.tsx`, `site-footer.tsx`,
`ornament.tsx`, `folder.tsx`, `song-transport.tsx` (presentation only, the audio engine and the
`<input type="range">` are untouched), `about.tsx`, `contact-form.tsx:54`, `portrait.tsx` (unframed
variant), `[lang]/page.tsx`, `[lang]/contact/page.tsx`.

**New**, `ribbon.tsx`, `vinyl.tsx`, `cassette.tsx`, `marquee-band.tsx`, `stats-bar.tsx`,
`fader-bank.tsx`, `cta-block.tsx`, `sticker.tsx`.

**Content model**, `src/globals/home.ts` gains `figures` (value / suffix / label), `marquee`
(entries), hero `stickers` and `availableFrom`, and an About `pullQuote` with a 140-character admin
limit. `src/collections/songs.ts` gains `instrumentation` and `year`.

**Every `data-*` hook in the current e2e suite must survive the rewrite**, `data-enter`,
`data-song`, `data-tab`, `data-play`, `data-playing`, `data-progress`, `data-seek`, `data-elapsed`,
`data-duration`, `data-platform-link`, `data-song-stack`, `data-skills`, `data-timeline`,
`data-timeline-scroller`, `data-contact-cta`, `data-contact-form`, `data-contact-outcome`,
`data-legals-link`, `data-legal-body`, `data-language-switch`, `data-site-footer`, `data-ornament`.
Music objects take a **new** `data-music` attribute rather than `data-ornament`, so the ornament
suite keeps testing the ornament layer alone, it asserts that no ornament is clipped by its
container, and the ribbon is cropped by design.

---

## 8. The compressed version

Be loud in the ground and the display scale; be austere in everything else. Two border widths,
three shadow offsets, zero radii, two ornament shapes, two motion loops, four full-bleed hues, one
serif, one spinning object. Make every large object a music object and make every music object
carry a fact. Put the play button above the fold. The decoration says she has taste, the specifics
say she can do the work, and the player proves it, a toy gets one of the three.
