# Is 2200 lines of CSS a problem?

## 1. The answer

**No.** The file is not fat, it is specific, and the synthesis he is asking for mostly is not available. `globals.css` is 2218 lines, but only **1352 of them are CSS**: 641 are comments and 226 are blank. Of the 107 classes those 1352 lines declare, 39 cannot become Tailwind utilities at any price, because they need a selector no element can carry (24 involve a media query, 18 a pseudo-class, 11 a descendant selector, 9 an attribute state, 6 an animation, 4 `:has()`, 3 a pseudo-element, 1 a container query). Of the 68 that remain, **only 24 map onto plain Tailwind utilities without a square-bracket escape hatch**. That is the number that matters: 24 out of 107. Everything else would move into the JSX as `[image-rendering:pixelated]`, `mb-[calc(var(--border-brutal)*-1)]` or `w-[max(calc(var(--length)*var(--bar)_-_var(--spacing)*2),12rem)]`, which is longer, less readable, and ungreppable. And the weight half of the question is already answered: the entire frontend stylesheet ships as **51.4 KB raw, 11.2 KB gzipped**, in one cached chunk. There is nothing to lighten. Where he is right, and he is right, is that repetition has drifted, but it drifted in the components, not in the stylesheet: nine sections copy the same three-layer band by hand and three of them copied it wrong, and ten tape strips are drawn two incompatible ways. The fix for that is two React components, not Tailwind utilities.

One thing he needs to hear before anything else: **the e2e suite is currently red.** I ran it on a clean tree. It is 301 tests, not 296: `296 passed, 5 failed (2m46s)`. Any refactor gated on "the tests still pass" is gated on nothing until those five are dealt with.

---

## 2. What is actually worth doing

**How every item below is proved.** Not screenshots. A computed-style plus box-geometry fingerprint: for each of the six routes and fourteen viewports `e2e/responsive.spec.ts` already uses, walk every element including `::before` and `::after`, hash the full computed style plus the bounding box, and diff the artifact before and after. That is 28,277 element hashes in under two minutes, and it catches what a screenshot cannot: `overflow: clip` versus `hidden`, `container-type`, `z-index`, `overscroll-behavior`, any value that does not paint today. One trap, and it is fatal if you do not know it: Chromium's enumeration order for custom properties is not stable across browser launches, and every element inherits about 102 of them from `:root`, so the naive version reports 100% of elements changed on an unchanged tree. **Sort the property names before hashing.** A working harness already exists at `/tmp/claude-1000/-home-andycinquin-clonedrepo-anna-milazzo/8e55e7d3-9f9e-4104-8b5b-fbb02b51495f/scratchpad/vis/dump2.mjs`.

---

### 1. Fix the five failing e2e tests. Prerequisite, not a nice-to-have.

Not a CSS change, but nothing below is provable until it is done, and one of the five is the exact check that would catch item 9.

| spec | what it asserts | why it fails |
|---|---|---|
| `motion.spec.ts:34` | the Folder lifts 2px on hover | `globals.css:598-605` says the lift was **deliberately removed** ("Deliberately NOT hover-reactive... entering the card shifted every child by 2px, then landing on a button shifted that button another 2px"). The prose was updated in place and the executable check was not. |
| `ornament.spec.ts:164` | no ornament sits inside a clipping parent | four already do (`asterisk, cross, asterisk, cross`), inside `hero.tsx:47` and `contact-cta.tsx:28`, both `overflow-hidden`, which ADR-0009 forbids. |
| `ornament.spec.ts:112` | lime appears only in the ornament layer | 208 elements report it. |
| `theme.spec.ts:130` | every `COLOUR_TOKENS` entry has a swatch | one is missing from the specimen. |
| `theme.spec.ts:141` | `--background` resolves to the paper white | expected `248,245,236`, got `254,229,219`. |

The last one is the interesting one for the client: **`--background` is currently the wrong colour, or the test is.** Somebody should decide which before anything else moves.

- **Lines removed:** 0. **Files:** `e2e/motion.spec.ts`, `e2e/ornament.spec.ts`, `e2e/theme.spec.ts`, plus `hero.tsx` and `contact-cta.tsx` if the clip defect is real. **Tests broken:** none, five repaired.

---

### 2. Delete the five dead things. Zero risk, zero test cost.

Each verified by grep across `src/` and `e2e/`, which returns exactly one hit: its own declaration.

```css
/* globals.css:558 — zero uses anywhere in src/ or e2e/ */
.control-ink { background-color: var(--ink); color: var(--sheet); }

/* globals.css:257 — zero uses. Section rules use border-b-brutal (11 uses);
 * the tab seam uses `border-block-end: 0` on a full shorthand. */
/* The same width on one edge, for section rules and the Folder's tab seam. */
@utility border-t-brutal { border-top-width: var(--border-brutal); }

/* globals.css:137 — sits in :root, not @theme inline, so no tracking-* utility
 * comes from it, and var(--tracking-normal) appears nowhere. A tweakcn leftover. */
--tracking-normal: 0em;

/* globals.css:1526 — the base rule at :1507 already sets the identical value */
@media (width < 64rem) { .transport { ...; gap: calc(var(--spacing) * 4); } }

/* globals.css:2071-2078 — the only anchor inside .footer-credit is
 * site-footer.tsx:115, which already carries className="footer-link",
 * and .footer-link declares these same three values */
.footer-credit a { display: inline-block; padding-block: 0.25rem; margin-block: -0.25rem; }
```

`.footer-credit a` is the best of the five, and better than "inert": at specificity (0,1,1) against `.footer-link`'s (0,1,0) it **wins today**, and is invisible only while the values stay equal. Change `.footer-link`'s padding and that one link silently keeps the old value.

- **Lines removed:** 21 from the file, 14 of them CSS. **Files:** `globals.css`. **Tests broken:** none (`e2e/footer.spec.ts:86` selects `.footer-link, .footer-credit a` in the DOM, not the rule).
- **Caveat:** `docs/design/direction-v2.md` names `.control-ink` four times and says to use it everywhere, while `.control-paper`, which that doc says it replaced, has 7 live uses. Record in the commit message that the doc is now the stale artefact. `docs/` is excluded from Tailwind's scan at `globals.css:19`, so nothing links the two.

---

### 3. Change four `<=` to `<`. Four characters, and the one real defect the split has produced.

```css
@media (width <= 40rem) { .folder { --folder-shadow: 5px; } }        /* :613 */
@media (width <= 48rem) { .ribbon { block-size: 300px; } }           /* :929 */
@media (width <= 40rem) { .daw { --bar: 9rem; --gutter: 7rem; } }    /* :1165 */
@media (width <= 40rem) { .daw-edge-mark { inline-size: 1.75rem; } } /* :1424 */
```

Tailwind's `sm:` is `(width >= 40rem)` and `md:` is `(width >= 48rem)`, both inclusive. `<=` is also inclusive, so at exactly 640px the page renders a 5px Folder shadow and 9rem DAW bars **inside** `sm:px-8` gutters, and at 768px a 300px ribbon inside `md:` spacing. The project's own audit already filed this as P6 `breakpoint-40rem-mixed`, and found three of the four. I compiled `max-sm:` against the project's Tailwind 4.3.3 and it emits `@media (width < 40rem)` exactly, so `<` is Tailwind's own boundary.

- **Lines removed:** 0. **Files:** `globals.css`. **Tests broken:** none.
- **This one changes pixels, deliberately, at exactly 640px and 768px.** It moves those two widths onto the values 641px and 769px already render. It breaches the "nothing may change visually" rule and must be landed as its own commit, described as a fix, with a 640 case added to `e2e/responsive.spec.ts` (which today tests 320/375/768/1024/1440).

---

### 4. Delete four superseded comment blocks, and move one orphan onto its rule.

The 641 lines of comment are the project's best asset and I am keeping 606 of them. These four describe code that no longer exists, which is strictly more expensive than no comment at all.

`globals.css:1786-1798` is the worst. Thirteen confident lines about how the Turnstile widget "is framed rather than fought: on `--card` its fill and its edge disappear into the frame, and what the page shows is a hard box with the house keyline like every other object here." They sit directly above the block that replaced them at `:1799`, which says the frame "made a compartment out of the one object here that already explains itself", above a rule with **no border and no background**:

```css
.check-slot { min-block-size: 4.5rem; overflow-x: auto; overscroll-behavior-inline: contain; }
```

Also: `:1034-1038`, `.folder-disc`'s header orphaned above `.folder-sleeve`, claiming "it costs two rules" when the disc now has six. `:650-655`, two tape headers stacked. And `:882-885`, which explains `image-rendering: pixelated` and the `color` the component reads back, but sits above `.dither-field`, which has neither; the rule it describes is `.dither-canvas` at `:904`. Move it, do not delete it.

- **Lines removed:** about 35, all comment, 0 CSS. **Files:** `globals.css`. **Tests broken:** none.

---

### 5. Merge the three pixelated canvases. Keep all three class names.

```css
/* today: 19 CSS lines and the same sentence written twice */
.dither-canvas       { display:block; inline-size:100%; block-size:100%; color:var(--primary); image-rendering:pixelated; }
.dither-panel-canvas { display:block; inline-size:100%; block-size:100%; image-rendering:pixelated; }
.playhead-canvas     { display:block; inline-size:100%; block-size:100%; image-rendering:pixelated; }
```

```css
/* ---- the pixel canvases --------------------------------------------
 * Three on this page: the hero's spectrum, the CTA panel's field, and the playhead's
 * histogram. All three hold one pixel per cell and are stretched to fill, and `pixelated`
 * is what makes the browser scale them nearest-neighbour so every cell stays a hard
 * square. Interpolating would average the ordered dithering away, and the dithering is
 * the image. */
.dither-canvas,
.dither-panel-canvas,
.playhead-canvas {
	display: block;
	inline-size: 100%;
	block-size: 100%;
	image-rendering: pixelated;
}

/* `color` is what the hero's component reads back with getComputedStyle to get the
 * palette's blue resolved out of oklch; the other two are handed their ground as a prop. */
.dither-canvas { color: var(--primary); }
```

This is the only byte-identical repetition in the file large enough to be worth touching, and the reason for it was written out twice because there was nowhere to write it once.

**Do the grouped-selector version, not the `@utility pixel-canvas` version.** `e2e/waveform.spec.ts` selects `.playhead-canvas` at lines 12, 64 and 198 and reads pixels off it, so replacing the class with a utility leaves a ruleless class name on the element purely as a test hook, which is exactly the thing somebody tidies away six months later.

- **Lines removed:** 8 CSS, plus 3 duplicated comment lines. **Files:** `globals.css`. **Tests broken:** none.

---

### 6. Name the page gutter. One token, two media queries gone, and it works from both languages.

One decision, the band's inline padding, is currently written in four notations across sixteen sites: `px-5 sm:px-8` in eleven className strings, `calc(var(--spacing)*5)` / `*8` in the footer, and `-1.25rem` / `-2rem` in three rules whose comments each apologise for the duplication separately (`:888` "the two values match px-5 and sm:px-8 exactly", `:1176` and `:1717` "the negative margin is exactly the section's own px-5"). Three comments explaining a magic number is the shape of a missing token.

```css
/* in :root, beside --measure and --header-h */
/* The page gutter, and the one number the stylesheet and the JSX have to agree on: it is
 * `px-5` / `sm:px-8` on every band, and it is what anything bleeding out of a band has to
 * cancel. Three rules wrote it out as a literal and each explained in prose that it
 * "matches px-5", because there was nothing to point at. */
--page-gutter: calc(var(--spacing) * 5);

/* one line added to the breakpoint that already exists at :158 */
@media (width >= 40rem) { :root { --header-h: 67px; --page-gutter: calc(var(--spacing) * 8); } }
```

```css
/* .dither-field: its whole @media (width >= 40rem) block at :898 disappears */
.dither-field { position:absolute; inset-block:0; inset-inline:calc(var(--page-gutter) * -1); color:var(--grape); pointer-events:none; }

/* .site-footer: its @media block at :1978 disappears too */
.site-footer { ...; padding: calc(var(--spacing) * 12) var(--page-gutter); }

/* .daw at :1179 and .form-panel at :1711, both below 40rem, so the token resolves to the
 * same 1.25rem it always did */
margin-inline: calc(var(--page-gutter) * -1);
```

And in the JSX. I compiled these against the project's own Tailwind 4.3.3: `px-(--page-gutter)` emits `padding-inline: var(--page-gutter)` and `-mx-(--page-gutter)` emits `margin-inline: calc(var(--page-gutter) * -1)`. **The `sm:` variant disappears from all eleven strings**, because the token carries the breakpoint at exactly the width `sm:` uses:

```diff
- <div className="relative px-5 py-14 sm:px-8 md:py-20">
+ <div className="relative px-(--page-gutter) py-14 md:py-20">
```

- **Lines removed:** 8 CSS (two whole media queries out, two lines in). **Files:** `globals.css` plus eleven call sites. **Tests broken:** none.
- **Watch:** `section-title.tsx` carries `const NARROW_BAND = 472`, documented as "512px minus the 40px of padding the band carries below sm". That 40 is two gutters, stated a third time in TypeScript where no CSS token reaches. Comment the dependency or the token is two-thirds true.

---

### 7. Write `ease-out` instead of `cubic-bezier(0, 0, 0.58, 1)`, nine times.

The two are the same function by definition, and the repo already knows it: `e2e/arrival.spec.ts:3` and `e2e/motion.spec.ts:3` both open with a comment saying so, `motion.spec.ts:27` asserts the string `'ease-out, ease-out'` against the computed style, and the comment at `globals.css:336` calls it "~90ms ease-out" in prose above a rule that then spells the bezier out. It appears in `.control`, `.nav-pill`, `.transport-play`, `.cta-arrow`, `.daw-edge-mark` and `.daw-edge-arrow`.

The value is legibility only. **It removes zero lines**, and I measured that rather than assuming: I ran the project's own Biome 2.5.12 with its own config, and the formatter explodes a comma-separated `transition` value across lines unconditionally, not by width, so the three-line block stays three lines. It also saves zero bytes: Lightning CSS already performs this substitution, and the shipped chunk contains **13 copies of `ease-out` and zero copies of the bezier**.

What it buys is that the two curves which are genuinely one-offs stand out. `.folder-disc` uses `cubic-bezier(0.4, 0, 1, 1)` and `cubic-bezier(0.16, 0.84, 0.44, 1)` forty lines away, written in exactly the same shape, and today a reader cannot tell the house curve from a deliberate exception on sight.

**The trap, and it is live.** Tailwind's `ease-out` *utility* is not the CSS `ease-out` *keyword*. I compiled it: `.ease-out { transition-timing-function: var(--ease-out) }` where `--ease-out: cubic-bezier(0, 0, 0.2, 1)`. That variable is sitting in the shipped stylesheet right now. So this substitution is correct **in the stylesheet and only there**, and the moment anyone follows the logic of this refactor and moves the press geometry into a className, the curve silently changes. Write that in the comment.

- **Lines removed:** 0. **Files:** `globals.css`. **Tests broken:** none.

---

### 8. A `<Tape>` component. Ten sites, one object, two incompatible mechanisms.

Eight sites put the tint and the angle in the class string; two, in `folder.tsx`, compute both from the deterministic `TAPE_ANGLES` / `TAPE_TINTS` tables into a `style` prop. Only one of those two mechanisms can take a computed angle, which is why the Folder had to invent it.

```tsx
// about.tsx, contact-arrival.tsx, contact-desk.tsx, eight of these
<span aria-hidden="true"
  className="tape tape-on-colour -top-2 left-8 z-10 [--tape-tint:var(--lemon)] rotate-[-44deg]" />

// folder.tsx:98 and :108, two of these
<span aria-hidden="true" className="tape -top-2 -left-5"
  style={{ transform: `rotate(${tapeAngle(index,'start')}deg)`,
           '--tape-tint': tapeTint(index,'start') } as React.CSSProperties} />
```

```tsx
// src/components/tape.tsx
/**
 * A strip of tape laid across a corner so it straddles the boundary between the thing and
 * the paper behind it.
 *
 * `transform: rotate()`, NOT the `rotate` property, even though this design animates
 * `rotate` elsewhere and gives a reason for it. e2e/song-stack.spec.ts:152 asserts
 * getComputedStyle(strip).transform !== 'none' and :158 counts distinct transform values
 * to prove no two strips share an angle. Setting `rotate` leaves `transform` computing to
 * `none` and fails both.
 *
 * `onColour` is not taste: .tape multiplies, and multiply only ever darkens, so on a
 * saturated band the strip turns muddy. Blue tape on the green field came out dark teal.
 */
export function Tape({ tint, angle, onColour = false, className = '' }: {
	tint: string   /** A palette custom property, e.g. 'var(--lemon)'. */
	angle: number  /** Degrees. Never zero, or it reads as a printed graphic. */
	onColour?: boolean
	className?: string  /** Where it sits, and nothing else. */
}) {
	return <span aria-hidden="true"
		className={`tape${onColour ? ' tape-on-colour' : ''} ${className}`}
		style={{ transform: `rotate(${angle}deg)`, '--tape-tint': tint } as React.CSSProperties} />
}

// the ten call sites
<Tape onColour tint="var(--lemon)" angle={-44} className="-top-2 left-8 z-10" />
<Tape tint={tapeTint(index,'start')} angle={tapeAngle(index,'start')} className="-top-2 -left-5" />
```

The migration goes **toward** `folder.tsx`'s mechanism, not away from it. That is the single sharpest correctness point in this whole review and three of the four proposals got it wrong.

- **Lines removed:** 0 CSS, about 30 JSX. Removes 16 arbitrary-value utilities. **Files:** one new, plus `about.tsx`, `contact-arrival.tsx`, `contact-desk.tsx`, `folder.tsx`. **Tests broken:** none. `.tape` and `.tape-on-colour` are untouched.

---

### 9. A `<Band>` component. Last, because it is gated on item 1.

This is where the client's instinct about repetition is exactly right, and it is in the JSX. Seven sections open with the same three layers, and the copies have drifted three ways.

```
about.tsx:40            relative overflow-clip   border-b-brutal border-border bg-spring    text-spring-foreground
contact-arrival.tsx:34  relative overflow-hidden border-b-brutal border-border bg-primary   text-primary-foreground
contact-desk.tsx:34     relative overflow-hidden border-b-brutal border-border bg-accent    text-accent-foreground
contact-facts.tsx:33    relative                 border-b-brutal border-border bg-secondary text-secondary-foreground
song-stack.tsx:24       relative                 border-b-brutal border-border bg-accent    text-accent-foreground
timeline.tsx:46         relative                 border-b-brutal border-border bg-grape     text-grape-foreground
skills.tsx:34           relative                 border-b-brutal border-border bg-secondary
```

Three defects, none of which any CSS change can catch, because a band has no class, no rule and no comment in the stylesheet. First, `skills.tsx` sets a ground and **no paired type colour**, against the theme's own note at `globals.css:104`. Second, two sections crop with `overflow-hidden`, which ADR-0009 forbids because `hidden` makes the section a scroll container and `view()` resolves against the nearest one, so a scroll-driven animation inside jumps straight to its finished state, silently, looking correct. Third, five distinct vertical rhythms across seven sections with nothing recorded about why.

```tsx
const GROUNDS = {
	accent: 'bg-accent text-accent-foreground',
	grape: 'bg-grape text-grape-foreground',
	primary: 'bg-primary text-primary-foreground',
	secondary: 'bg-secondary text-secondary-foreground',
	spring: 'bg-spring text-spring-foreground',
} as const

export function Band({ ground, rhythm, title, behind, children, ...section }: {
	ground: keyof typeof GROUNDS
	/** The two py steps, verbatim, e.g. "py-16 md:py-28". Passed rather than mapped:
	 *  there are five of them today and a map would round one to its neighbour. */
	rhythm: string
	title?: React.ReactNode
	/** Painted first, so positioned siblings paint on top with no z-index to reason about. */
	behind?: React.ReactNode
	children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<'section'>, 'className' | 'title'>) {
	return (
		<section className={`relative overflow-clip border-b-brutal border-border ${GROUNDS[ground]}`} {...section}>
			{behind}
			{title}
			<div className={`relative px-(--page-gutter) ${rhythm}`}>{children}</div>
		</section>
	)
}

// about.tsx
<Band ground="spring" rhythm="py-24 md:py-48" data-enter data-about
      title={about?.heading ? <SectionTitle>{about.heading}</SectionTitle> : null}>
```

**Pass the rhythm as a verbatim string, do not map it to four names.** The page renders five: `py-14 md:py-20` (x3), `py-16 md:py-24` (x2), `py-16 md:py-28`, `py-24 md:py-40`, `py-24 md:py-48`. Two of the four proposals wrote a four-entry map and silently dropped `contact-arrival` from `md:py-28` to `md:py-24`, a 1rem loss at every width from 48rem up, on a page whose brief says nothing may change visually.

- **Lines removed:** 0 CSS, about 40 JSX. **Files:** one new, plus seven sections. **Tests broken:** none, provided the spread keeps every `data-*` (`data-song-stack` alone is used 32 times in `e2e/`). The type must `Omit` `className` or the component's whole reason for existing can be overridden at the call site.
- **The gate.** Standardising on `overflow-clip` turns four sections that crop nothing today into clipping contexts. The one test that would catch that, `ornament.spec.ts:164`, is **already failing with four entries**, so a reviewer comparing "5 failed" before to "5 failed" after learns nothing. Do item 1 first, then this, then the fingerprint diff.

---

## 3. What is not worth doing

**Refuse the large move outright.** The most ambitious proposal on the table relocates 47 classes and about 320 lines into the components. It should be declined, and here is why in twelve sentences.

1. **`text-2xl` on `.marquee-item`.** A named Tailwind text size is not a font-size; I compiled it, and `.text-2xl` emits `line-height: var(--tw-leading, var(--text-2xl--line-height))` where that is `calc(2/1.5)`. `.marquee-item` declares no line-height and inherits preflight's `html { line-height: 1.5 }`, so the swap takes the line box from 36px to 32px and the whole band shrinks 4px, moving everything below it up the page.
2. **`text-xs` on `.footer-credit`.** Same mechanism, landing on a number the suite measures: the credit's link is `inline-block` with `padding-block: 0.25rem`, so its hit box goes from 26px to 24px against `e2e/footer.spec.ts:87`, which fails anything under 24px. The stylesheet's own comment at `:2017` states the arithmetic the change invalidates.
3. **Moving the footer's nine classes.** `site-footer.tsx` is 123 lines and every className in it is a single word (`site-footer`, `footer-columns`, `footer-heading`, `footer-foot`); replacing them with `font-mono text-[0.8125rem] tracking-[0.1em] text-dust uppercase` makes the most readable file in the repository less readable, in the name of readability.
4. **Deleting `.form-note`, `.check-slot`, `.footer-columns` and `.footer-sep`.** Four still-open items in the project's own audit (N19, N20, P3, P4) prescribe their fix **as a CSS declaration on those exact classes** and prescribe a test that selects them; two of the four use `23rem` and `30rem`, which are not Tailwind breakpoints, so the moved versions need `[@media(width<23rem)]:` and `min-[30rem]:` in a className.
5. **The "only seven spec lines change" argument.** That number measures the wrong thing: the whole suite contains 46 computed-style assertions and every one of them attaches to an object the proposal keeps, so seven is small precisely because the tests are silent about the code being moved, not because the move is safe.
6. **A four-entry `RHYTHMS` map in `<Band>`.** It drops `contact-arrival` from `md:py-28` to `md:py-24`, which is a visual change nobody asked for.
7. **A `<Tape>` that sets the `rotate` property.** It makes `getComputedStyle(strip).transform` compute to `none` and fails `e2e/song-stack.spec.ts:152` and `:159` on every strip in the stack.
8. **Moving the fifteen flat DAW children.** They are flat and still immovable, because every one multiplies `--bar` or `--gutter` declared on `.daw`; move them and the variables stay in CSS while their consumers sit in JSX as 195-character bracket strings, which is longer than the longest className in the repo today.
9. **Moving anything in the Folder.** `margin-block-end: calc(var(--border-brutal) * -1)` is defined **as** the keyline width so the invariant cannot drift; as a utility you get `-mb-1`, which hard-codes 4px and breaks silently, or an unreadable calc string with nowhere to write "Must equal the keyline width exactly", and the three cooperating declarations end up on two elements forty lines apart with the explanation attached to neither.
10. **Moving the Folder's shadow.** `--drop-shadow-*: initial` is declared at `globals.css:230` with the comment "Cleared rather than redefined, so `shadow-inner`, `drop-shadow` and `blur` simply do not exist here", so the utility version either does not compile or contradicts a comment two hundred lines above it.
11. **`--tape-strength`, `--text-label`, `--transition-press`, `--shadow-flat`.** Each costs a line or two of indirection to name a value that already reads as what it is; the tracking inconsistency `--text-label` exposes (0.08em, 0.06em, 0.1em, absent) is a design question for the client, not something a refactor should quietly collapse.
12. **Grouping `.form-foot` with `.footer-foot`, or hoisting the five `background-color: var(--ink); color: var(--sheet)` pairs, or `display: flex; align-items: center` from 9 rules.** All three trade locality for a saving of three or four lines and would put unrelated objects in one rule, 200 to 1400 lines from the comment that explains each of them; the last one produces `.u-flex-center`, which is a worse Tailwind than Tailwind.

One correction to the record that matters for future arguments: **"Tailwind has no utility for it" is almost never true.** I compiled `[image-rendering:pixelated]`, `[overscroll-behavior-inline:contain]`, `[container-type:scroll-state]` and `mb-[calc(var(--border-brutal)*-1)]`, and all of them emit. The honest keep-argument is never "impossible", it is "the only way to say it is a raw declaration in square brackets, which is worse than a class".

And no `clsx`, no `cva`, no `tailwind-merge`. Nothing above needs one, the README already names and rejects `cn()`, and template literals cover every case here.

---

## 4. The rule, for next time

**Write it on the element if you can say it in Tailwind's own words with no square brackets, it is true of that one element only, and you would not write a comment above it. Put it in the stylesheet the moment any one of three things is true: the rule needs a selector the element cannot carry (a state, a pseudo-element, a descendant, a `:has()`, a container query, an animation); the value is derived from another value (a custom property an ancestor declares, a negative margin that must equal a keyline, arithmetic on a token); or you have a sentence to write and that sentence explains a property rather than an element.** The runnable version, ten seconds in your head: type out the className you would actually write. If it has a bracket in it, it belongs in the stylesheet. If you would need a comment above the element to justify a number in it, it belongs in the stylesheet, because a JSX comment sits between elements and describes markup, while a CSS comment sits above a declaration and describes that declaration. If it reads as ordinary English (`relative flex items-center gap-3`), it belongs on the element. Two clauses that override everything else: a class name any e2e spec selects is an interface, not a style, and it stays whatever else you do; and a named Tailwind text size (`text-xs`, `text-2xl`) is not a font-size, it carries a line-height, so use `text-xs/[1.5]` or `text-[0.8125rem]` whenever the rule you are replacing did not set one.

---

## 5. The size of the prize

After everything in section 2, **about 1320 of the 1352 lines of CSS remain.** Thirty-two go: fourteen dead, eight duplicated canvas geometry, eight from two media queries the gutter token makes unnecessary, plus two custom properties added back. Another 35 lines of stale prose go, so the file a reader scrolls through drops from 2218 lines to roughly 2140. On the JSX side about 70 lines and 16 arbitrary-value utilities go with `<Tape>` and `<Band>`, and eleven className strings lose their `sm:` gutter variant.

**He would not feel it.** That is a 2.4% reduction in CSS and a 3.5% reduction in the file. It still opens as a 2100-line stylesheet, it still takes the same scroll to reach the DAW, and the shipped bytes do not move at all, because they were already 11.2 KB gzipped. Anyone who promises him a noticeably shorter file is either deleting the 641 lines of reasoning, which is where every measurement in this project is recorded and where 43 of the 80 commits landed, or moving 330 declarations into class strings, which trades a 2200-line file he can grep for a set of components he cannot.

What he would feel is different and smaller and real: the page gutter, the press curve, the pixelated canvas and the section band each stated once instead of between three and sixteen times; tape drawn one way instead of two; three sections that can no longer break ADR-0009 by being copied; and 640px and 768px rendering the same page as 641px and 769px. That is the honest prize. The file is not the problem, and telling him so is worth more than a hundred lines.