# Palette v2 — an authored six-hue system

Status: proposal. Supersedes the two-hue palette in `src/app/(frontend)/globals.css`.
All figures below were computed, not estimated; the method is at the end.

---

## 0. What is actually wrong

The brief blames chroma. That is only half right, and the half it gets wrong matters,
because it points at Anna's colours — which cannot change.

Measured against the sRGB chroma ceiling at each colour's own lightness:

| anchor | oklch C | max C available at that L | utilisation |
|---|---|---|---|
| cantaloupe `#F79E76` | 0.1196 | 0.1366 | **87.6 %** |
| blue `#3866A8` | 0.1169 | 0.1858 | **62.9 %** |

Cantaloupe is not timid. At L 0.7803 sRGB has almost nothing left to give — pushing it
further means making it darker, which makes it a different colour. The cantaloupe is
already at the edge of the box.

So the flatness is not "chroma ~0.12". It is that **six surfaces are sharing three
near-identical beiges** (paper 0.9711 / sheet 0.99 / sand 0.931, every pair under 1.1:1),
and the two real hues appear as *objects on* that ground rather than *as* the ground. The
references do the opposite. The fix is more hues used as full-bleed surfaces, and the
retirement of the sand.

---

## 1. The hue lattice

A palette feels authored when the hue spacing is derivable. Anna's two colours already
derive one.

```
cantaloupe h = 44.76°
blue       h = 257.59°
difference   = 212.83°  =  4 × 53.2075°
```

The anchors sit **exactly four steps of 53.2075° apart**. That is the generator. Walking
it from the cantaloupe gives seven points:

| step | hue | colour | in the palette? |
|---|---|---|---|
| 0 | 44.760° | cantaloupe | **yes — anchor** |
| 1 | 97.968° | lemon | yes |
| 2 | 151.175° | spring | yes |
| 3 | 204.382° | teal | **deliberately vacant** |
| 4 | 257.590° | blue | **yes — anchor** |
| 5 | 310.797° | grape | yes |
| 6 | 4.005° | magenta | yes |

Six of seven points are occupied. The vacancy at 204.382° is the argument against
rainbow: a teal there would sit between the spring and the blue and duplicate the blue's
job as the cool surface. **The cool half of the wheel belongs to Anna's blue alone.** One
hole, one reason.

The neutrals are not exempt. Paper, sheet and dust all move to h 97.968° — lattice point
1, the lemon at low chroma. The shift from the current h 92 is invisible (old `#F8F5EC`,
new `#F7F6EC`, 1.004:1 apart) and it means **every hue in the system, ground included,
sits on the lattice. There are no arbitrary hue angles in this file.**

Chroma is assigned by rank, and the ranking is the credibility argument:

```
sheet 0.005 · dust 0.008 · paper 0.0125 · blue 0.1169 · cantaloupe 0.1196
                        · lemon 0.175 · spring 0.18 · magenta 0.22 · grape 0.23
```

Anna's two colours are the **quietest chromatic members of their own palette**, and they
carry the two largest and earliest surfaces (hero, songs). The loud hues are rationed to
later sections and to decoration. That is what keeps this a portfolio and not a toy.

---

## 2. The palette

| name | oklch | hex | role | type it carries |
|---|---|---|---|---|
| **ink** | `oklch(0 0 0)` | `#000000` | every keyline, footer, marquee | white |
| **paper** | `oklch(0.9711 0.0125 97.968)` | `#F7F6EC` | ground, about section | black |
| **sheet** | `oklch(0.99 0.005 97.968)` | `#FDFCF8` | Folder bodies, inputs | black |
| **dust** | `oklch(0.92 0.008 97.968)` | `#E6E5DF` | seek track, rails — never a section | black |
| **blue** *(anchor)* | `oklch(0.5104 0.1169 257.59)` | `#3866A8` | hero, contact form card, tags | white |
| **cantaloupe** *(anchor)* | `oklch(0.7803 0.1196 44.76)` | `#F79E76` | songs section, tape | black |
| **lemon** | `oklch(0.88 0.175 97.968)` | `#F7D725` | skills section | black |
| **spring** | `oklch(0.82 0.18 151.175)` | `#57E486` | contact section | black |
| **magenta** | `oklch(0.66 0.22 4.005)` | `#F74183` | CTA pill, stickers — **no section** | black |
| **grape** | `oklch(0.55 0.23 310.797)` | `#9B35D1` | timeline strip | white |

Seven named colours plus ink and the two utility neutrals. The sand (`0.931 0.023 88`) is
**deleted** — it was the beige-on-beige.

---

## 3. Contrast, measured

Ratios are computed from the **8-bit hex that actually ships**, not from the float, using
WCAG 2.1 relative luminance.

| colour | hex | vs black | vs white | black type | white type |
|---|---|---|---|---|---|
| paper | `#F7F6EC` | **19.348** | 1.085 | body | no |
| sheet | `#FDFCF8` | **20.456** | 1.027 | body | no |
| dust | `#E6E5DF` | **16.638** | 1.262 | body | no |
| lemon | `#F7D725` | **14.702** | 1.428 | body | no |
| spring | `#57E486` | **12.847** | 1.635 | body | no |
| cantaloupe | `#F79E76` | **10.107** | 2.078 | body | no |
| magenta | `#F74183` | **6.039** | 3.478 | body | **large display only** |
| grape | `#9B35D1` | 3.824 | **5.492** | large display only | body |
| blue | `#3866A8` | 3.634 | **5.779** | large display only | body |

Thresholds: body ≥ 4.5:1, large display ≥ 3:1.

Two figures the brief supplied come back exactly — cantaloupe 2.078 on white and 10.107
on black — which is the check that the arithmetic here is the same arithmetic.

### 3.1 The law that governs this palette

For any colour, contrast-against-black × contrast-against-white **equals exactly 21**:

```
#3866A8 : 3.6341 × 5.7785 = 21.0000
#F79E76 : 10.1072 × 2.0777 = 21.0000
#9B35D1 : 3.8236 × 5.4921 = 21.0000
```

(Because (Y+0.05)/0.05 × 1.05/(Y+0.05) = 21 for all Y.) Nothing can be good at both. This
has one consequence that shapes the entire design:

> **A 4px black keyline needs ≥ 3:1 against its own fill.** White body type needs ≥ 4.5:1.
> By the identity, a fill satisfying both must have vs-black in **[3.000, 4.667]** — a
> luminance band only **1.556× wide**.

Which means: **this design can only ever have one dark surface family**, and any two dark
surfaces will always be within 1.556:1 of each other. That is not a flaw in the palette,
it is a corollary of "every fill wears a black keyline". Blue at 3.634 sits almost dead
centre of the legal band — Anna's choice is, arithmetically, the ideal neo-brutalist dark
surface. Grape was tuned to 3.824 to join it.

The genre constraint also **sets a lightness floor for the whole palette**. An earlier
grape at L 0.49 measured 2.982 against black: its own keylines would have disappeared.
That is why grape is L 0.55 and not darker.

---

## 4. Adjacency

### 4.1 Section seams

| seam | ratio | verdict |
|---|---|---|
| hero blue → about paper | **5.324** | clean |
| about paper → skills lemon | 1.316 | **flag — see below** |
| skills lemon → marquee ink | **14.702** | clean |
| marquee ink → songs cantaloupe | **10.107** | clean |
| songs cantaloupe → timeline grape | 2.643 | **flag — see below** |
| timeline grape → contact spring | **3.360** | clean |
| contact spring → footer ink | **12.847** | clean |

**paper → lemon (1.316).** Two colours one lattice step apart at similar lightness. Two
things carry it. First, the seam is drawn in black (`border-b-brutal`), and black clears
19.348:1 and 14.702:1 against the two fills — the boundary is *drawn*, not implied by the
colour change, so WCAG 1.4.11 is satisfied by the rule itself. Second, WCAG contrast is
luminance-only and blind to chroma; these two differ by 0.1625 in chroma, which is a large
perceptual separation the 1.316 figure cannot see. Acceptable. But **nothing meaning-bearing
may be encoded in the paper/lemon difference alone.**

**lemon → cantaloupe (1.455) — resolved structurally.** Two warm lights adjacent was the
worst seam in every ordering I tried, and no reordering fixes it: there are four light
surfaces and only two dark ones, so light-light adjacencies are forced. Rather than accept
it, **a full-width black marquee strip is inserted at that seam.** It splits 1.455:1 into
14.702:1 and 10.107:1, and it supplies the marquee the brief notes is missing (REF C).
The marquee is load-bearing, not ornament — which is the only honest reason to add one.

**cantaloupe → grape (2.643).** Below 3:1 but the two are 266° apart in hue and 0.23 apart
in lightness; the black rule separates them. Flagged, accepted.

### 4.2 Surfaces on sections

Anything at or above 3.0 is clean. Below that, the black keyline is doing the work and the
pairing must not carry meaning.

| element | on | ratio | verdict |
|---|---|---|---|
| Folder body `sheet` | songs cantaloupe | 2.024 | flag — keyline + 8px drop shadow carry it |
| portrait `sheet` | hero blue | **5.629** | clean |
| timeline block `sheet` | grape | **5.350** | clean |
| timeline block `lemon` | grape | **3.836** | clean |
| timeline block `spring` | grape | **3.360** | clean |
| timeline block `cantaloupe` | grape | 2.643 | **drop from the cycle** |
| skills tag `blue` | lemon | **4.045** | clean |
| skills tag `grape` | lemon | **3.836** | clean |
| skills tag `sheet` | lemon | 1.391 | **forbidden — this is the current code** |
| skills tag `spring` | lemon | 1.144 | forbidden |
| skills tag `cantaloupe` | lemon | 1.455 | forbidden |
| skills tag `magenta` | lemon | 2.435 | avoid |
| contact form card `blue` | spring | **3.535** | clean — REF D's blue form card |
| contact form card `sheet` | spring | 1.592 | forbidden |
| input `sheet` | blue form card | **5.629** | clean |
| sticker `lemon` | hero blue | **4.045** | clean |
| sticker `spring` | hero blue | **3.535** | clean |
| sticker `cantaloupe` | hero blue | 2.781 | avoid |
| sticker `magenta` | hero blue | 1.662 | forbidden |
| `sheet` | about paper | 1.057 | **forbidden — do not put bg-card on the about section** |
| `dust` | sheet | 1.229 | acceptable only as a seek track inside a black-bordered box |

### 4.3 The one pair that must never touch

```
blue #3866A8  vs  grape #9B35D1  =  1.052 : 1
```

They are luminance twins, by construction (§3.1 forces it). In greyscale, and for a
viewer with reduced colour vision, they are the same surface. In the rhythm below they are
four sections apart and never adjacent. **Never place them side by side, never use
blue-versus-grape to distinguish two states, and never rely on it in the timeline.**

---

## 5. Section rhythm

```
1  hero      BLUE        #3866A8   L 0.51   white type      ← her colour, full-bleed, loud
2  about     PAPER       #F7F6EC   L 0.97   black type      ← the reading section
3  skills    LEMON       #F7D725   L 0.88   black type
   ————————  MARQUEE INK #000000   L 0.00   white type      ← structural, §4.1
4  songs     CANTALOUPE  #F79E76   L 0.78   black type      ← her colour, the work
5  timeline  GRAPE       #9B35D1   L 0.55   white type
6  contact   SPRING      #57E486   L 0.82   black type
   footer    INK         #000000   L 0.00   white type
```

The reasoning is a lightness contour, and it is meant to be read as one:

**0.51 → 0.97** a hard opening jump. **0.97 → 0.88 → 0.78** a warm diminuendo: three
lights descending by small, deliberate steps, each a different hue, the page getting
progressively warmer as it moves from who she is, to what she can do, to the work itself.
**0.78 → 0.00 → 0.78** the marquee cuts the diminuendo in half so the two warm steps do
not smear. **0.78 → 0.55** the hard drop into the timeline: a dark strip is what makes a
sequencer read as a sequencer, and it is why the timeline's blocks (sheet / lemon /
spring, all ≥ 3.36:1) finally read as distinct — the current build cycles two
near-identical beiges there. **0.55 → 0.82** release into the contact green. **→ 0.00**
footer.

Cool at both ends, warm through the core; Anna's two colours hold positions 1 and 4, the
hero and the work. No neutral sits between every colour — paper appears exactly once, as
the reading section, where it belongs.

---

## 6. Decoration sub-palette

### 6.1 The lime is retired

`--decor-lime oklch(0.87 0.14 128)` → `#B9E67E`. Measured: **1.453:1 on cantaloupe**
(matching the brief's 1.4–1.8), **1.318:1 on paper**. It is invisible on two of the six
grounds it would have to live on. Beyond that:

- h 128° is **the only hue in the file not on the lattice**;
- both of its jobs are now covered by real surfaces one lattice step either side — lemon
  at 97.968° and spring at 151.175°;
- the client is lukewarm on it.

Three independent reasons, so it goes. Its quarantine rule ("ornament only, never a fill,
never behind type") dies with it: in v2, **spring and lemon are ordinary surfaces**, which
is exactly the promotion the lime could never have.

### 6.2 What each ground allows

House rule: an ornament must clear **3:1 against its ground**. Ornaments are `aria-hidden`
and carry no meaning, so this is a visibility floor rather than a WCAG obligation — but an
ornament below it is just a smudge.

| ground | permitted marks |
|---|---|
| hero **blue** | ink 3.63 · sheet 5.63 · paper 5.32 · lemon 4.05 · spring 3.54 |
| about **paper** | ink 19.35 · blue 5.32 · grape 5.06 · magenta 3.20 |
| skills **lemon** | ink 14.70 · blue 4.05 · grape 3.84 |
| songs **cantaloupe** | ink 10.11 *(only)* |
| timeline **grape** | ink 3.82 · sheet 5.35 · paper 5.06 · lemon 3.84 · spring 3.36 |
| contact **spring** | ink 12.85 · blue 3.54 · grape 3.36 |

Read across: **ink works on all six.** It is the default ornament colour, and the lime's
old job — "the mark that is always the same colour" — passes to black, not to a hue.

Assignments:

- **Stars and sparkles** (REF B, C) — ink by default; blue or grape on the light grounds.
- **Blobs** (REF B, D) — the giant number carriers. Grape and blue on paper; lemon and
  spring on grape. A blob is a fill, so its **type** must obey §3, not §6: black on
  lemon/spring, white on blue/grape.
- **Arcs** (REF B's concentric rainbow) — draw in lattice order so the arc *is* the
  system: magenta → cantaloupe → lemon → spring → blue → grape. Only on paper or ink.
- **Ribbon** (REF D, the music one) — the same lattice walk, every band keylined in black.
  **On the blue hero the blue band is omitted** (1.00:1 — literally invisible) and the
  magenta band too (1.662:1). A ribbon crossing more than one ground must be black-keylined
  on every edge or it fails at the crossing.
- **Magenta is decoration-poor and surface-rich.** It clears 3:1 on paper alone. Its real
  role is the CTA pill (REF C) and stickers on the about section, where black type on it
  measures 6.039:1. It never gets a section — it is the hue that would tip the page into
  unserious if given a full bleed, and rationing it to three or four appearances is what
  keeps the palette authored.

---

## 7. Tailwind v4 token block

Two layers: a palette layer named by colour, and the semantic layer pointing into it.
Only the semantic and surface names are exported to `@theme` — `--color-blue` is
deliberately **not** exported, because Tailwind v4 already ships a `blue-*` scale and a
bare `bg-blue` beside `bg-blue-500` is a trap. The blue reaches the page as
`bg-primary`, the cantaloupe as `bg-accent`.

```css
:root {
	/* ---- palette layer -------------------------------------------------
	 * Every hue sits on one 53.2075° lattice generated by Anna's own two colours,
	 * which are exactly four steps apart (257.59 − 44.76 = 212.83 = 4 × 53.2075).
	 * Lattice point 3 (204.382°, teal) is deliberately vacant: the cool half of the
	 * wheel belongs to the blue alone. The neutrals are not exempt — paper, sheet and
	 * dust sit on point 1 at low chroma, so there is no arbitrary hue angle in this
	 * file.
	 *
	 * Chroma is ranked, and the ranking is the point: Anna's two colours are the
	 * quietest chromatic members of their own palette and carry the two largest
	 * surfaces. The loud hues are rationed. That is what keeps this a portfolio. */
	--ink: oklch(0 0 0);
	--paper: oklch(0.9711 0.0125 97.968); /* #F7F6EC */
	--sheet: oklch(0.99 0.005 97.968); /* #FDFCF8 */
	--dust: oklch(0.92 0.008 97.968); /* #E6E5DF — rails only, never a section */

	/* #3866A8 — anchor. 3.634:1 on black, 5.779:1 on white: dead centre of the only
	 * luminance band where a black keyline (≥3:1) and white body type (≥4.5:1) can
	 * coexist. Do not touch. */
	--blue: oklch(0.5104 0.1169 257.59);
	/* #F79E76 Pantone 15-1239 Cantaloupe — anchor, BLACK TYPE ONLY (2.078:1 on white).
	 * Already at 87.6% of the sRGB chroma ceiling for its lightness; it cannot be made
	 * more saturated without being made darker. */
	--cantaloupe: oklch(0.7803 0.1196 44.76);

	--lemon: oklch(0.88 0.175 97.968); /* #F7D725 — black type (14.702:1) */
	--spring: oklch(0.82 0.18 151.175); /* #57E486 — black type (12.847:1) */
	--magenta: oklch(0.66 0.22 4.005); /* #F74183 — black type; NEVER a section */
	/* #9B35D1 — white type (5.492:1). L is 0.55 and not lower because at L 0.49 it
	 * measured 2.982:1 against black and its own 4px keylines vanished. The keyline
	 * sets the palette's lightness floor. */
	--grape: oklch(0.55 0.23 310.797);

	/* ---- semantic layer ------------------------------------------------ */
	--background: var(--paper);
	--foreground: var(--ink);
	--card: var(--sheet);
	--card-foreground: var(--ink);
	--popover: var(--sheet);
	--popover-foreground: var(--ink);

	--primary: var(--blue);
	--primary-foreground: oklch(1 0 0);
	--accent: var(--cantaloupe);
	--accent-foreground: var(--ink);
	/* Was the sand oklch(0.931 0.023 88), which sat 1.06:1 from the paper and 1.08:1
	 * from the card — the beige-on-beige. Repointed to the lemon, so `bg-secondary`
	 * in skills.tsx and the timeline fill cycle become real colours with no code
	 * change. */
	--secondary: var(--lemon);
	--secondary-foreground: var(--ink);
	--muted: var(--dust);
	--muted-foreground: oklch(0.42 0.015 97.968); /* 7.81:1 on paper */

	--destructive: var(--ink);
	--destructive-foreground: oklch(1 0 0);

	/* ---- structure ----------------------------------------------------- */
	--border: var(--ink);
	--input: var(--ink);
	--ring: var(--blue);
	--border-brutal: 4px;

	/* Paired foregrounds, so a surface is never used without its type colour.
	 * There is no --magenta-foreground: oklch(1 0 0) — white on magenta is 3.478:1,
	 * large display only, and it is not worth the footgun. */
	--lemon-foreground: var(--ink);
	--spring-foreground: var(--ink);
	--magenta-foreground: var(--ink);
	--grape-foreground: oklch(1 0 0);

	/* --decor-lime is GONE. #B9E67E measured 1.453:1 on cantaloupe and 1.318:1 on
	 * paper, and h 128 was the one hue off the lattice. Its jobs pass to --lemon and
	 * --spring, which are surfaces rather than quarantined ornament. The default
	 * ornament colour is now --ink: it is the only value clearing 3:1 on all six
	 * grounds. */

	--chart-1: var(--blue);
	--chart-2: var(--cantaloupe);
	--chart-3: var(--grape);
	--chart-4: var(--spring);
	--chart-5: var(--lemon);

	/* type, spacing and shadows are unchanged — see globals.css */
}

@theme inline {
	--color-background: var(--background);
	--color-foreground: var(--foreground);
	--color-card: var(--card);
	--color-card-foreground: var(--card-foreground);
	--color-popover: var(--popover);
	--color-popover-foreground: var(--popover-foreground);
	--color-primary: var(--primary);
	--color-primary-foreground: var(--primary-foreground);
	--color-secondary: var(--secondary);
	--color-secondary-foreground: var(--secondary-foreground);
	--color-muted: var(--muted);
	--color-muted-foreground: var(--muted-foreground);
	--color-accent: var(--accent);
	--color-accent-foreground: var(--accent-foreground);
	--color-destructive: var(--destructive);
	--color-destructive-foreground: var(--destructive-foreground);
	--color-border: var(--border);
	--color-input: var(--input);
	--color-ring: var(--ring);

	/* Surface utilities: bg-ink, bg-paper, bg-sheet, bg-dust, bg-lemon, bg-spring,
	 * bg-magenta, bg-grape. None of these names collide with a Tailwind default
	 * scale. --color-blue and --color-cantaloupe are deliberately absent: Tailwind
	 * ships blue-*, so a bare `bg-blue` next to `bg-blue-500` is a trap. The blue and
	 * the cantaloupe reach the page as bg-primary and bg-accent. */
	--color-ink: var(--ink);
	--color-paper: var(--paper);
	--color-sheet: var(--sheet);
	--color-dust: var(--dust);
	--color-lemon: var(--lemon);
	--color-lemon-foreground: var(--lemon-foreground);
	--color-spring: var(--spring);
	--color-spring-foreground: var(--spring-foreground);
	--color-magenta: var(--magenta);
	--color-magenta-foreground: var(--magenta-foreground);
	--color-grape: var(--grape);
	--color-grape-foreground: var(--grape-foreground);

	--color-chart-1: var(--chart-1);
	--color-chart-2: var(--chart-2);
	--color-chart-3: var(--chart-3);
	--color-chart-4: var(--chart-4);
	--color-chart-5: var(--chart-5);

	/* fonts, radius reset, shadow scale and heading scale unchanged */
}
```

### 7.1 Code that breaks

Repointing `--secondary` and deleting `--decor-lime` is not free. These five files assume
the old palette:

| file | change |
|---|---|
| `src/components/skills.tsx:33` | tags are `bg-card` → **1.391:1 on lemon.** Alternate `bg-primary` (4.045) and `bg-grape` (3.836) with their paired foregrounds. |
| `src/components/timeline.tsx:5,23` | section `bg-background` → `bg-grape`; `FILLS` → `['bg-sheet', 'bg-lemon', 'bg-spring']` (5.350 / 3.836 / 3.360). Cantaloupe leaves the cycle — 2.643 on grape. |
| `src/components/site-footer.tsx:13` | `bg-secondary` → `bg-ink`; the footer would otherwise turn lemon and sit 1.144:1 against the contact spring. |
| `src/components/ornament.tsx:76` | `tone === 'lime'` → retire; default to `var(--border)` and offer `blue` / `grape` / `sheet` per the §6.2 table. |
| `src/app/(specimen)/specimen/page.tsx:21` | `'--decor-lime'` → the new surface tokens. |

Also needed for §5: the songs section gains `bg-accent`, the contact section `bg-spring`
with the form card on `bg-primary`, and the marquee strip is new. `contact-form.tsx:54`
uses `bg-accent` for the success message — on a blue form card that is 2.781:1; use
`bg-lemon` (4.045) instead.

---

## 8. Method

`oklch → OKLab → LMS → linear sRGB → gamma`, per CSS Color 4; gamut ceilings by bisection
on chroma at fixed L and h. Contrast ratios use WCAG 2.1 relative luminance
(0.2126 R + 0.7152 G + 0.0722 B on linearised channels, `(L1+0.05)/(L2+0.05)`) computed
from the **quantised 8-bit hex**, since that is what ships.

Validation: both anchors round-trip exactly (`#3866A8` → `oklch(0.5104 0.1169 257.59)` →
`#3866A8`), and three independently supplied figures reproduce — cantaloupe 2.078:1 on
white, 10.107:1 on black, and the old lime 1.453:1 on cantaloupe against a stated
1.4–1.8:1.
