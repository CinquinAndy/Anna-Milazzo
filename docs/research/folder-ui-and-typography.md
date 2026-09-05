# Folder UI, scrapbook devices and typography, design research

Research brief for the Anna Milazzo neo-brutalist portfolio (IT default, EN secondary).
Palette locked: `#3866A8` blue primary, `#F79E76` cantaloupe accent (black text only), black keylines, warm off-white paper, lime as decoration.

> **Status legend.** `[VERIFIED]` = page fetched and read in this session. `[UNVERIFIED]` = not reached, or asserted from technique knowledge rather than a live page. `[BLOCKED]` = host refused automated access.
> Technique sections marked *analysis* are worked CSS reasoning, not a claim about a specific shipped site.

---

## Summary

1. **The folder tab is a nine-line CSS problem, not a `clip-path` problem.** Two boxes; the tab gets `border-bottom: 0`, `margin-block-end: -4px` and `z-index: 2` over an opaque body. Unbroken 4px keyline over the whole silhouette, no seam under the tab, mitred corners, fully fluid. §1.2
2. **I read the source of three real folder implementations and *none of them has an outline*.** Skewed pseudo-elements, CSS border-triangles, `clip-path: shape()`, the entire published state of the art for folder tabs is fill-only, because every technique quietly depends on having no stroke to reconcile. `clip-path` clips the border (confirmed in writing), and each workaround either rounds the corners or must be re-derived per breakpoint. The outlined folder is the unsolved part, which is exactly why it is worth doing. §1.3, §1.9b
3. **Shadow the union, not the parts.** `filter: drop-shadow(8px 8px 0 #000)` on the folder wrapper. Per-box `box-shadow` puts a black notch inside the tab/body join. §1.6
4. **An overlapping folder stack at 375px is a genuine usability trap**, tab collision, overlapping tap targets against WCAG 2.2 SC 2.5.8 (AA, 24×24px), hidden content requiring JS state, and a false "one is current" hierarchy imposed on a portfolio where all works are equal. Break the stack on mobile; keep the per-card metaphor. §1.8
5. **It looks like a tab UI and must never be one.** No `role="tablist"`, that promises arrow-key navigation between exclusive panels. `<ul>`/`<li>`/`<article>`, and a non-black focus ring, because a black ring is invisible against black keylines. §1.7
6. **The Italian expansion figure in the brief is too optimistic by an order of magnitude.** Per the IBM table via W3C, strings under 10 characters expand **200–300%**, and a brutalist portfolio is made almost entirely of short strings set very large. Design to the Italian string, not the English one. §4.2
7. **The constraint nobody writes down: Italian all-caps carries accents above the cap height.** `È À Ù` will clip at the `line-height: 0.82` this style wants. Floor at `0.9`, or set the hero in sentence case, which is better Italian typography anyway. Test string: `ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ`. §4.2
8. **Pick a display face with a variable `wdth` axis.** It is the only typographic lever that buys ~20% more characters at the same optical size, which is precisely what Italian needs. Bricolage Grotesque (75–100), Archivo (62–125), Instrument Sans and Martian Mono all have one. **DM Sans does not**, and `neobrutalism.dev` ships DM Sans as its default, which is the strongest possible evidence that it is the genre's safe house font rather than a differentiator. §4.3, §4.5
9. **Ruled paper is free; grain should be baked.** A notebook rule is two stacked gradients and zero bytes (verified source in §3.1). `feTurbulence` grain is CPU-rasterised and scales with painted area, bake it to a ~4KB seamless tile instead of paying a full-viewport filter pass on top of one `drop-shadow` layer per folder. And texture should **scroll with the page**, not sit fixed, or the grain swims relative to the paper it is meant to be part of. §3
10. **The genre has largely avoided photography, and Gumroad has walked its brutalism back** (measured live: 1px borders, 4–24px radii, no hard shadows, `background-image: none`, hero at weight **400**). So a well-handled portrait is a real differentiator, choose the robust treatment (baked die-cut cut-out for the hero, hard-bordered taped rectangles for the folders), and get Anna's shot list out early, because Shot 1 gates the hero. §1.10, §5

---

## 1. The paper-folder / manila-folder UI, done well

### 1.1 The actual hard problem

A manila folder is a **single continuous outline**: the tab and the body share one silhouette, and there is *no* line where the tab meets the body. Every naive implementation gets this wrong, because in CSS a tab and a body are two boxes and each box draws its own complete border. With a 3–4px black keyline the seam is glaring.

So the requirement is precise:

- outer edge: unbroken 3–4px black on *every* exterior edge, including up and over the tab
- interior: **no** line under the tab
- crisp mitred corners (no blur, no rounding), `border-radius: 0` is locked
- must reflow: the body height is driven by content (title, story, player, link), so nothing can be fixed-aspect
- must carry one hard offset shadow for the *whole* composite silhouette, not one per box

### 1.2 Technique A, negative-margin seam removal (*analysis; recommended*)

This is the old CSS tab-strip trick and it is the only approach that satisfies all five constraints with zero filters, zero SVG and zero clipping.

```css
.folder {
  /* no border here, the wrapper only exists for the shadow, see 1.6 */
  --keyline: 4px;
  --paper: #FBF7F0;
}

.folder__tab {
  position: relative;
  z-index: 2;                       /* paints ON TOP of the body */
  display: block;
  width: max-content;
  max-width: 70%;
  margin-inline-start: 1.5rem;      /* tab inset from the left edge */
  margin-block-end: calc(var(--keyline) * -1);  /* THE TRICK */
  padding: 0.4rem 1.25rem;
  background: var(--paper);         /* must be OPAQUE and identical to body */
  border: var(--keyline) solid #000;
  border-block-end: 0;              /* seam removed */
}

.folder__body {
  position: relative;
  z-index: 1;
  background: var(--paper);
  border: var(--keyline) solid #000;
}
```

**Why it works.** Without the negative margin the body's top border would draw a full-width line *including* under the tab. `margin-block-end: -4px` pulls the body up by exactly one keyline, so the body's top border now occupies the bottom 4px of the tab's box. The tab has `z-index: 2` and an opaque background, so it paints over that 4px strip *for exactly its own width*. Outside the tab, the body's top border is untouched and visible. Result: one continuous outline, no seam, no clipping, no filter.

**Properties.**

- Fully fluid in both axes. The tab sizes to its label; the body sizes to its content.
- Mitred corners are real border corners, perfectly crisp.
- Survives text zoom and Italian's longer labels, because `width: max-content` on the tab just grows.
- Works with `border-radius: 0` (which we want) *and* would work with a radius if only the tab's top corners were rounded.
- Keyboard/focus: put the focus ring on `.folder`, not on the two children, or you get two rings.

**The one real gotcha: texture alignment.** The tab and the body are separate painting boxes. If you give each of them a repeating paper texture, the texture will visibly *jump* at the seam, because each box restarts its own `background-position` origin. Three fixes, in order of preference:

1. Keep the card a **flat opaque paper colour** and put the grain on the page background only. Cards read as clean paper *on* a textured desk. Cleanest, cheapest, and the most neo-brutalist answer.
2. `background-attachment: fixed` on both boxes so they sample one viewport-anchored texture, but this has the iOS Safari problem (see §3.4) and makes the texture "swim" while the card scrolls.
3. Give both boxes the texture and correct the tab with `background-position: 0 <tab-height>`, brittle, breaks the moment the tab wraps.

**Verdict: use fix 1.** Flat paper cards on a grainy ground. It also keeps the black keyline maximally crisp, grain under a hard line muddies it.

### 1.3 Technique B, `clip-path` on a single element (*analysis; do NOT use here*)

The obvious idea is one element with a folder silhouette:

```css
.folder {
  clip-path: polygon(0 0, 42% 0, 46% 12%, 100% 12%, 100% 100%, 0 100%);
}
```

This is a trap for an outlined design, and it is worth stating plainly because it is the first thing most people reach for.

**`clip-path` clips the border along with everything else.** The border is painted as a normal rectangle and *then* the clip is applied, so along every cut edge you get a hard alpha cut with **no stroke at all**. You end up with a folder that has a black keyline on the parts that happened to coincide with the original rectangle and bare paper along the whole tab profile. There is no `clip-path` equivalent of "stroke the clip".

Workarounds, and why each fails for us:

| Workaround | Why it fails |
|---|---|
| A larger black element behind with the same `clip-path`, offset | A uniform 4px outset of a non-uniform polygon is not expressible as `scale()` or `translate()`. The offset is correct on one edge and wrong everywhere else. You can hand-author a second polygon, but it must be re-derived by hand at every breakpoint. |
| Stacked `filter: drop-shadow(0 0 0 #000)` (4–8 of them at ±2px) to fake a stroke | Produces a *blobby, rounded* outline, not mitred corners, it is a dilation of the alpha channel, so every sharp corner comes back radiused. It is also 4–8 separate filter passes per card; on a list of folders on a mid-range phone this is the single most expensive thing on the page. Directly contradicts "hard keyline". |
| SVG `feMorphology` `dilate` | Same rounding problem (dilation uses a rectangular/round structuring element) and it also dilates the *content*, not just the frame. |
| `paint-order: stroke fill` | Text only. Does not apply to boxes. Useful for sticker *lettering* (see §2), not for the folder. |

**Conclusion: `clip-path` is the right tool for un-outlined shapes (torn paper edges, colour blocks) and the wrong tool for an outlined folder.** Reserve it for the torn-edge decorations in §5.

### 1.4 Technique C, SVG frame (*analysis; use only for the hand-drawn variant*)

Draw the entire folder outline as one `<path>` with `fill: var(--paper); stroke: #000; stroke-width: 8` (a centred stroke straddles the path, so 8 reads as 4 outside) and position HTML content on top.

**Pros:** one genuinely continuous outline including the tab, perfect control, and, the real reason to choose it, you can make the path *wobble*, i.e. a hand-drawn folder rather than a geometric one. That is a strong scrapbook move.

**Cons, and they are decisive for the default case:**

- It does not reflow. A folder behind variable-height content needs `preserveAspectRatio="none"`, which **distorts the stroke**: stretch a square SVG to 3:1 and the vertical strokes become three times thinner than the horizontal ones. Instantly visible with a 4px keyline.
- `vector-effect="non-scaling-stroke"` fixes the *width* but not the *shape*, the tab's proportions still stretch.
- `border-image` with an SVG source and a 9-slice *does* stretch the middles while preserving corners, but a 9-slice grid cannot express a tab, because the tab lives in the middle of the top edge, which is precisely the region a 9-slice stretches.

**Practical compromise if you want the hand-drawn look:** keep Technique A's box structure, and apply a wobbly `border-image` (SVG, 9-slice) to the *body* only, with the tab as a small fixed-size inline SVG. Accept a slightly different line quality at the join. Only worth it if the hand-drawn line is a core identity move.

### 1.5 Tab shape: rectangle vs trapezoid

Real manila folders have a slightly tapered tab. Two ways to get the taper with a border intact:

**Skewed halves.** Two pseudo-elements, `transform: skewX(-8deg)` and `skewX(8deg)`, each with its own border, meeting in the middle with the inner borders removed. Borders survive transforms (they are painted, then transformed), and at 8° the stroke thickens by only `1/cos(8°) ≈ 1.01`, i.e. imperceptible. This is the classic browser-tab CSS demo shape. It is fiddly: you need `transform-origin: bottom left` / `bottom right` and the two halves must not leave a hairline gap at the join (give them a 1px overlap).

**Opinion: don't.** For *ultra* neo-brutalism a plain rectangular tab is more correct than a tapered one. Brutalism is right angles, hard stops, no easing into shapes. The "folder" read should come from the **tab + the offset shadow + the taped-on cover image**, not from a trapezoid. A skewed tab adds engineering fragility and subtracts from the style. Keep Technique A's rectangle.

If you want more folder-ness for free: **alternate the tab position per card** (left / centre / right / left …). That single detail is what makes a column of cards read as a filing drawer, and it costs one nth-child rule.

```css
.folder:nth-child(3n+2) .folder__tab { margin-inline: auto; }
.folder:nth-child(3n)   .folder__tab { margin-inline-start: auto; margin-inline-end: 1.5rem; }
```

### 1.6 The offset shadow across a tab + body composite (*important detail*)

`box-shadow: 8px 8px 0 #000` applied to the tab and the body independently produces a **broken shadow**: the tab casts its own shadow down onto the body's top edge, leaving a black notch inside the silhouette, and the shadow has a step where the tab's right edge meets the body.

The correct fix is to shadow the **union**:

```css
.folder {
  filter: drop-shadow(8px 8px 0 #000);
}
.folder__tab,
.folder__body { box-shadow: none; }
```

`drop-shadow` operates on the composited alpha of the element *and its descendants*, so tab + body produce one silhouette and one correct shadow. With `0` blur radius this is a cheap filter (no Gaussian pass), but note two side effects:

- `filter` creates a containing block for `position: fixed` descendants and a new stacking context. Do not put a fixed-position element (a modal, a sticky player) inside a filtered folder.
- Anything that *overflows* the folder, a tape strip poking past the edge, a sticker rotated off-corner, will also get the shadow. For tape and stickers this is usually **desirable** (they should cast the same hard shadow, they are physically on top of the paper). Check it deliberately rather than by accident.

Alternative without `filter`, if you hit a stacking-context problem: give the body `box-shadow: 8px 8px 0 #000` and the tab `box-shadow: 8px 0 0 #000` (right side only, no vertical offset) and ensure the body paints above the tab's shadow. It works but it is more fragile than `drop-shadow`.

### 1.7 Accessibility: it looks like a tab UI and must not be one

This is the trap that matters most and is the easiest to get wrong. The visual metaphor is tabs; the semantics are **not** tabs.

- **Do not** use `role="tablist"` / `role="tab"` / `role="tabpanel"`. Those roles promise arrow-key navigation between mutually exclusive panels. A list of works is not that. A screen-reader user would be told "tab 1 of 6, selected" for content that is simply always visible.
- Correct markup: `<ul>` of `<li>`, each containing an `<article>`. The tab label is a heading (`<h3>`) or, if it duplicates the title, is `aria-hidden` decoration.
- If the tab carries the work's *number* or *year*, that is decorative repetition, hide it from AT and keep the real title in the heading.
- Give `.folder` a single visible `:focus-visible` outline. With a black keyline everywhere, a black focus ring is invisible, use the **cantaloupe `#F79E76`** or blue `#3866A8` at 3px with a 2px offset, or better, a double ring (white then blue) so it reads on both paper and colour blocks.

### 1.8 Mobile: is a folder *stack* a usability trap at 375px?, **Yes. Honest verdict below.**

A stacked / overlapping filing-cabinet metaphor at 375px fails on five counts:

1. **Tab collision.** A row of tabs needs horizontal room that does not exist. Italian labels are longer (see §4). Tabs either truncate or wrap, and a wrapped tab breaks the seam trick in §1.2 (a two-line tab is fine, but a tab wider than the body is not).
2. **Overlapping hit targets.** WCAG 2.2 *Target Size (Minimum)* wants 24×24 CSS px; practical guidance is 44px. Overlapped cards put a tappable card under another tappable card, and the top one wins in ways users cannot predict.
3. **Hidden content requires state.** A peek-and-expand stack needs JS, `aria-expanded`, focus management, and a way back out. That is a lot of machinery for a three-page site.
4. **It imposes a false hierarchy.** A stack says "this one is on top / current". In a portfolio every work is equally on offer. The metaphor actively lies about the content model.
5. **It fights the hard shadow.** Overlapping cards each carrying an 8px hard black shadow produces a mess of black bars between cards at small sizes.

**What to build instead (the compromise worth having):**

- On mobile, **break the stack**. One Song = one full-width folder, vertically stacked, generous gap (`clamp(2rem, 8vw, 4rem)`), cover image above the text block.
- Keep the *per-card* folder metaphor intact, tab, keyline, taped cover, hard shadow. The metaphor survives; only the stacking dies.
- Optional and cheap: let consecutive folders overlap by **only the tab height** (~36–40px) with **alternating tab positions** so tabs never collide. Every folder body remains fully visible; the tabs interleave like a real drawer. This is the one form of "stack" that is honest at 375px.
- Reduce the shadow offset on mobile (`8px → 5px`) so it stays proportional and stops eating the gutter.

```css
.folder { --shadow: 8px; }
@media (max-width: 640px) { .folder { --shadow: 5px; } }
```

### 1.9 What the published literature actually says

**`clip-path` clips borders, confirmed in writing.** freeCodeCamp, *How to Apply Borders to Clip Paths with CSS* (Michael Frederick, 12 Apr 2023) [VERIFIED] states plainly that the CSS `border` property does not work with clip-paths, because borders render around the rectangular container rather than following the clipped edge. Its own solution is exactly the fragile one I flag in §1.3, stack two clipped elements, a larger coloured one behind a smaller background-coloured one, and it uses `repeating-linear-gradient` and an SVG `background-image` overlay to fake dashed edges. Useful confirmation; not a technique to adopt for a 4px keyline.
<https://www.freecodecamp.org/news/apply-borders-to-clip-paths-with-css/>

**The modern `shape()` approach, and its blind spot.** Chris Coyier, *Modern CSS Round-Out Tabs* (13 Oct 2025) [VERIFIED], originally on the Frontend Masters blog, now redirecting to `blog.master.dev`, builds a tab profile in one element with the new `clip-path: shape()` function, replacing an older method that needed four extra elements per tab:

```css
.tab {
  --tabGirth: 12px;
  clip-path: shape(
    from bottom left,
    curve to var(--tabGirth) calc(100% - var(--tabGirth)) with var(--tabGirth) 100%,
    vline to var(--tabGirth),
    curve to calc(var(--tabGirth) * 2) 0 with var(--tabGirth) 0,
    hline to calc(100% - calc(var(--tabGirth) * 2)),
    curve to calc(100% - var(--tabGirth)) var(--tabGirth) with calc(100% - var(--tabGirth)) 0,
    vline to calc(100% - var(--tabGirth)),
    curve to 100% 100% with calc(100% - var(--tabGirth)) 100%
  );
}
```

Critically, **the article never addresses borders or outlines**, it is an un-outlined, filled tab. That is precisely the gap our design falls into. `shape()` is elegant for a filled tab and useless for an outlined one.
<https://blog.master.dev/modern-css-round-out-tabs/>

`shape()` itself is **Baseline 2026, newly available since February 2026** per MDN [VERIFIED], usable, but new enough that it should not be load-bearing on a client site shipping now.
<https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/shape>

**The one genuinely interesting future option: `corner-shape`.** MDN [VERIFIED] documents `corner-shape` as a shorthand taking `round | square | bevel | scoop | notch | squircle | superellipse(<number>)`, operating within the area set by `border-radius`. The important part for us: **`border`, `outline`, `box-shadow`, `background-color` and `overflow` all follow the corner shape.** That is the property that would finally let a non-rectangular box carry a real, mitred, stroked outline without SVG or filters.

```css
div {
  border-radius: 30px;
  corner-shape: scoop;
  border: 2px solid blue;
  box-shadow: 1px 1px 3px gray;   /* border AND shadow follow the scoop */
}
```

But MDN states it is **Limited availability / not Baseline**, "does not work in some of the most widely-used browsers". So: **do not ship on it, watch it.** `corner-shape: bevel` on a folder tab is the eventual clean answer to §1.5's trapezoid problem. Today it is a progressive enhancement at best (`@supports (corner-shape: bevel)`).
<https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape>

### 1.9b Three real folder implementations, source read

CodePen refuses automated fetch (403), so I loaded the pens in a real browser and pulled their raw stylesheets. **All three are [VERIFIED], this is their actual shipped CSS.**

**(a) `uffou/jzzyvB`, "Cool CSS Folder Tabs".** The canonical skew-transform folder tab:

```css
.folder-tab {
  height: 36px; position: relative; top: 10px;   /* overlaps the page below */
  background-color: #FcFcfc; left: 28px;
  display: inline-block; z-index: 2;             /* paints over #page */
}
.folder-tab:before {
  content: ""; position: absolute; left: -20px; top: 0;
  height: 36px; width: 30px;
  border-radius: 10px 10px 0 0;
  background-color: #FcFcfc;
  transform: skewX(-20deg);
  z-index: -1;                                   /* sits BEHIND the tab's fill */
}
.folder-tab:after  { /* mirrored, right: -20px; transform: skewX(20deg); */ }
#page { background-color: white; position: relative; top: 10px; }
```

Two things to take from this. First, it **confirms the §1.2 mechanism**: the seam is hidden purely by `position: relative; top: 10px` plus `z-index: 2` and an opaque fill over the page, the same overlap trick, expressed with `top` instead of a negative margin. Second, and decisively: **there is not a single `border` declaration anywhere in the pen.** The whole effect is fill-only.

That is not a coincidence, and it is the crux of this brief. Put a 4px black keyline on those skewed pseudo-elements and three things break at once:
- each pseudo-element draws its **own bottom border**, re-creating the seam across the join;
- the **inner vertical borders** where each pseudo meets the tab body appear as two lines *inside* the tab;
- because the pseudo is skewed, its **top border is horizontally offset** from the tab's top border, so the two do not meet, the top edge comes out as a zigzag rather than one continuous line.

The `z-index: -1` trick that hides the joins works for *fills* and cannot work for *strokes*.

**(b) `faelpatrick/GRedNmR`, "Card Folder Style".** Builds the folder flap with the classic CSS border-triangle trick and shadows it with `drop-shadow`:

```css
.item::after {
  content: ""; position: absolute; top: 8px; left: 0; z-index: 2;
  height: 80%; box-sizing: border-box;
  border-style: solid;
  border-color: transparent transparent transparent var(--color);
  border-width: 40px 40px 40px 40px;
  filter: drop-shadow(5px 0 4px #00000094);
  transition: filter 0.5s;
}
```

Note it uses `border` purely as a *shape generator* (transparent on three sides), not as a keyline, and it confirms empirically that **`drop-shadow` follows the triangle's alpha, not its box**, which is the same property §1.6 relies on for the composite folder shadow. Again: **no outline on the folder**.

**(c) `teddyzetterlund/YPjEzP`, "Index Card".** Zero-asset ruled paper, and it is genuinely elegant:

```css
.card {
  background-image:
    linear-gradient(180deg, white 3rem, #F0A4A4 calc(3rem),
                    #F0A4A4 calc(3rem + 2px), transparent 1px),
    repeating-linear-gradient(0deg, transparent, transparent 1.5rem,
                              #DDD 1px, #DDD calc(1.5rem + 1px));
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.25);
}
```

A 2px red header rule at `3rem` layered over grey rules repeating every `1.5rem`. **Zero bytes, infinitely scalable, re-colourable from tokens.** Carried forward into §3 as the ruled-paper technique of choice.

### 1.9c The finding that matters

**Not one of the three real folder implementations carries an outline.** Neither does the modern `shape()` article. The published state of the art for folder tabs is **fill-only**, and every technique in circulation, skewed pseudo-elements, border-triangles, `clip-path: shape()`, quietly depends on having no stroke to reconcile.

So: I found no *shipped production* site doing an outlined manila folder. The metaphor lives mostly in concept work on hosts that gate scraping (Pinterest, Dribbble, [BLOCKED] by design, do not plan around them). Two readings: either it is under-explored, or it is repeatedly abandoned at build time because of the seam-and-border problem.

The evidence points at the second cause producing the first effect, people reach for `clip-path` or skew, hit the border wall, and give up. But §1.2 solves it in nine lines by *not* reaching for either. **That makes this a genuine differentiator rather than a trap**, provided the tab stays rectangular (§1.5) and the stack is dropped on mobile (§1.8).

---

### 1.10 Shipped token benchmarks (measured live, not quoted)

I read the **computed styles off two live sites** in a real browser. These are measurements, not blog claims.

**`neobrutalism.dev`**, the canonical neo-brutalist component library (shadcn-based) [VERIFIED, computed styles read from `:root`]:

```
--border:           oklch(0% 0 0)            /* pure black */
--border-radius:    5px                      /* NOT zero */
--box-shadow-x:     4px
--box-shadow-y:     4px
--shadow:           4px 4px 0px 0px oklch(0% 0 0)
--reverse-box-shadow-x: -4px
--reverse-box-shadow-y: -4px
--main:             oklch(67.47% 0.1725 259.61)   /* a blue */
--background:       oklch(93.46% 0.0304 254.32)   /* cool near-white */
--base-font-weight:    500
--heading-font-weight: 700
```
Measured component border width: **2px**. Measured component font: **DM Sans**.

Three things fall out of this, and they matter:

1. **The library baseline is softer than our brief.** 2px borders, 5px radius, 4px shadow, headings at weight 700. Our locked direction, 3–4px keylines, `border-radius: 0`, hard offset shadow, is a **deliberate escalation past the library default**, which is exactly right for "ultra". Do not import the library's tokens; they will read as generic.
2. **Its `--main` is a blue at hue ~259.6.** Our primary `#3866A8` = `oklch(0.5104 0.1169 257.59)` sits in the same hue family but is substantially **darker and less chromatic**. That is a good thing, it is why ours carries white text at 5.78:1 while the library's bright blue would not. Worth stating: our palette is the grown-up version of the genre default.
3. **The library ships DM Sans.** That is the strongest possible evidence for the §4.5 verdict: DM Sans is what you pick when a *component library* needs a font that offends nobody. It is the genre's house default, which is precisely why it cannot also be the thing that makes this site distinctive.

**`gumroad.com`**, the most-cited *shipped commercial* neo-brutalist site [VERIFIED, computed styles read live]:

```
body background:  rgb(244, 244, 240)   /* #F4F4F0, warm off-white paper */
h1:               ABC Favorit, 60px / 60px (line-height 1.0), letter-spacing -0.4px, font-weight 400
buttons:          border-radius 0px
accent blocks:    rgb(241, 243, 51) yellow, rgb(220, 52, 30) red, 1px solid black
cards:            border-width 1px, border-radius 4px / 16px / 24px, box-shadow: none
```

**The honest and slightly awkward finding: Gumroad has largely walked its neo-brutalism back.** On the current homepage there are **no hard offset shadows at all**, borders are 1px, and most cards have 16–24px radii. What survives is the *palette discipline*, a warm off-white ground, pure black keylines, and two loud saturated accents, plus zero-radius buttons.

Also counterintuitive: **the hero is set at `font-weight: 400`, not 900**, at `line-height: 1.0` with slight negative tracking. Impact comes from size, colour and layout, not from mass.

Two conclusions for us:

- **Do not treat Gumroad as a fidelity target.** A commerce product optimising for trust and conversion over years will sand its edges off. A portfolio optimising for one memorable visit should not. Portfolio ≠ product; the escalation is correct here.
- **Do steal the palette discipline and the `#F4F4F0`-class warm ground**, it independently confirms the locked "warm off-white paper" decision, and take seriously that a hero does not have to be black-weight to hit hard.

---

## 2. Tape, stickers and scrapbook devices

### 2.1 Washi tape, CSS, and it should be CSS

A tape strip is a rotated rectangle with a translucent fill, slightly darker at the torn ends. It needs no asset:

```css
.tape {
  position: absolute;
  inline-size: 7rem; block-size: 2.2rem;
  background: linear-gradient(90deg,
      rgb(247 158 118 / 0.55) 0 6%,      /* cantaloupe, semi-transparent */
      rgb(247 158 118 / 0.72) 6% 94%,
      rgb(247 158 118 / 0.55) 94% 100%);
  transform: rotate(-6deg);
  /* torn ends: a shallow zigzag, no asset */
  clip-path: polygon(0 6%, 4% 0, 8% 8%, 12% 1%, 100% 3%,
                     96% 12%, 100% 97%, 8% 100%, 3% 92%, 0 99%);
  mix-blend-mode: multiply;              /* lets the paper grain show through */
}
```

Three details separate confident tape from clip-art tape, and they are all about **translucency and inheritance**:

1. **`mix-blend-mode: multiply` plus an alpha under 0.8.** Real tape is translucent; you can see the paper and the grain through it. Opaque tape reads as a coloured rectangle, which is the single most common failure.
2. **The tape must cross an edge.** Tape that sits entirely inside a photo is a sticker, not tape. It has to bridge two surfaces, a corner of the image and the folder beneath it, or the whole illusion collapses.
3. **Irregular rotation.** `-6deg`, `4deg`, `-2.5deg`, never the same angle twice, never `0`.

**This is the one place `clip-path` is exactly the right tool** (§1.3): a torn end is an un-outlined shape, so there is no border to reconcile.

### 2.2 Sticker outlines, bake them, don't stack drop-shadows

The white die-cut keyline around a cut-out. Two routes, and the trade-off is the same one as §1.3 and §5.1:

- **Runtime:** stack `filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) …` at 4–8 angles. `drop-shadow` follows the element's **alpha contour**, not its box, verified empirically in the `faelpatrick` pen (§1.9b), where a `drop-shadow` correctly follows a CSS border-triangle. But dilating alpha this way produces a **rounded, slightly blobby** outline, and each shadow is a separate filter pass.
- **Build time:** bake the keyline into the PNG in Figma/Photoshop.

**Bake it.** One pass, exact corners, no per-paint cost. Take the runtime route only if the keyline colour must change with theme, which here it does not.

For sticker *lettering*, the equivalent is `paint-order: stroke fill`, which puts the stroke outside the glyph instead of straddling it (without it, a stroke eats into the letterforms). It is well-supported for SVG text; support for HTML text is more recent and patchier, so guard it: `@supports (paint-order: stroke) { … }`. *(MDN reached; the deeper HTML-text write-up at `tylersticka.com` was [BLOCKED] 403, treat the HTML-text detail as UNVERIFIED and test it.)*

### 2.3 Doodles, arrows and asterisks, inline SVG

Hand-drawn arrows, circles-around-a-word, stars and asterisks should be **inline SVG**, not raster and not icon-font:

- They must inherit colour (`stroke: currentColor`) so a doodle on the blue block flips to paper-white without a second asset.
- They must scale without blurring.
- They are tiny, a hand-drawn arrow is typically under 1KB of path data, far smaller than any PNG of it.

Use `stroke-linecap: round`, a slightly irregular path, and **never** `vector-effect: non-scaling-stroke` here, you *want* the stroke weight to vary with size, because a real pen does.

**Accessibility, and this is not optional:** every decorative SVG needs

```html
<svg aria-hidden="true" focusable="false" ...>
```

`aria-hidden` keeps it out of the accessibility tree; `focusable="false"` stops legacy IE/Edge putting it in the tab order. If a doodle *does* carry meaning, an arrow that says "listen here", then the meaning belongs in the adjacent text, not in the graphic.

### 2.4 What keeps it confident rather than clip-art, opinionated

Four rules, in priority order:

1. **Restrict the vocabulary.** Three devices, not nine. Pick tape, one doodle style, and the sticker outline, and refuse everything else. Scrapbook layouts fail by accumulation.
2. **One hand.** Every doodle must look drawn by the same pen: same stroke weight, same wobble amplitude, same colour. Mixed line weights is what actually reads as clip-art, more than the drawings themselves.
3. **Decoration must never carry information.** If removing every sticker, doodle and tape strip leaves the page fully comprehensible, the layer is doing its job. If it does not, the decoration has become UI and now has accessibility obligations it cannot meet.
4. **Rotation as composition, not animation** (§6.5). Static `rotate(-3deg)` is craft; a wobbling sticker is a toy.

**Performance:** many rotated, filtered elements each get their own compositor layer. Keep decorations to `transform` and `opacity` only, do **not** blanket-apply `will-change` (it costs memory per layer and is counter-productive at scale), and remember the `filter: drop-shadow` on each folder (§1.6) already creates a layer per card, do not stack more filters inside it.

**Evidence note, stated honestly.** §2.1–2.4 are technique analysis plus behaviour I verified directly (the `drop-shadow`-follows-alpha result from the `faelpatrick` pen, §1.9b). **I did not find shipped, live scrapbook sites to cite for tape and stickers**, the genre lives overwhelmingly on Pinterest and Dribbble, both of which gate automated access [BLOCKED], and the neo-brutalist sites I could measure (Gumroad, `neobrutalism.dev`) are illustration-and-block based with no paper devices at all. So treat this section as a **build brief to test**, not as a survey of precedent. It is the thinnest-evidenced section in this document and the one most worth a manual browsing pass by a human.

---

## 3. Paper texture backgrounds

### 3.1 Ruled / notebook paper, pure CSS, zero bytes

Settled, and I have working source for it. From the `teddyzetterlund` index card, read directly (§1.9b) [VERIFIED]:

```css
.card {
  background-image:
    /* the red margin/header rule, 2px at 3rem */
    linear-gradient(180deg, white 3rem, #F0A4A4 calc(3rem),
                    #F0A4A4 calc(3rem + 2px), transparent 1px),
    /* the ruled lines, every 1.5rem */
    repeating-linear-gradient(0deg, transparent, transparent 1.5rem,
                              #DDD 1px, #DDD calc(1.5rem + 1px));
}
```

For a **vertical** left margin rule (the more common notebook form), swap the first layer for `linear-gradient(90deg, transparent 3rem, #F0A4A4 3rem, #F0A4A4 calc(3rem + 2px), transparent calc(3rem + 2px))`.

**Zero bytes, infinitely scalable, re-colourable from tokens, and it survives zoom.** There is no reason to use an image for ruled paper. One caution: tie the rule spacing to the **text `line-height`**, or the ruling and the type will drift out of phase and look wrong in a way people notice without being able to say why.

### 3.2 Grain / sand texture, SVG `feTurbulence` as a data URI

The standard modern approach: an inline SVG `<filter>` with `feTurbulence`, encoded as a data URI in `background-image`, laid over the paper colour at low opacity.

```css
.grain::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background-image: url("data:image/svg+xml,\
    <svg xmlns='http://www.w3.org/2000/svg'>\
      <filter id='n'>\
        <feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/>\
        <feColorMatrix type='saturate' values='0'/>\
      </filter>\
      <rect width='100%' height='100%' filter='url(%23n)'/>\
    </svg>");
}
```

Key parameters, and what each actually controls:

- **`type="fractalNoise"`**, not `turbulence`. `fractalNoise` gives the soft, even, film-grain distribution you want for paper; `turbulence` gives a wispy, cloud-like result that reads as smoke.
- **`baseFrequency`**, grain size. High values (~0.6–0.9) give fine paper grain; low values (~0.02–0.05) give large blotches. Codrops' torn-edge recipe uses `0.04` with `numOctaves="5"` feeding a `feDisplacementMap scale="30"` [VERIFIED], that low frequency is for *displacing an edge*, not for grain. Do not copy edge-displacement values into a grain background.
- **`numOctaves`**, detail layers. Cost scales roughly linearly with this; 3–4 is plenty for grain, and each extra octave is real CPU.
- **`stitchTiles="stitch"`**, makes the noise tile seamlessly. Omit it and you get visible seams when the background repeats.
- **`feColorMatrix type="saturate" values="0"`**, desaturates. Without it the noise is coloured RGB confetti.

**The performance trap, stated plainly.** `feTurbulence` is a Perlin-noise generator that is **rasterised on the CPU**, and the cost scales with the *painted area*. A full-viewport grain layer is a genuinely expensive paint, and it re-rasterises on resize. Two consequences:

1. **Never put `feTurbulence` on an element that animates, resizes, or scrolls with transform.** Put it on a fixed-size, fixed-position overlay so it rasterises once.
2. **Consider baking it.** Render the turbulence once, export a small seamless PNG/WebP tile (a 128×128 or 256×256 tile at low opacity is usually indistinguishable), and `background-repeat` it. A 256×256 grayscale PNG grain tile is typically **2–8KB**, cheaper at runtime than a live filter, and deterministic across browsers. Live `feTurbulence` renders differently between engines; a tile does not.

**My call for this project: bake a tile.** The site has a hard-edged, high-contrast design where grain is a subtle ground, not a feature. Paying a full-viewport CPU filter pass, on top of one `drop-shadow` layer per folder (§1.6), for something a 4KB tile does identically is a bad trade, especially on the mid-range Android that a booker will open this on.

### 3.3 Pure-CSS grain, and when it is enough

`repeating-linear-gradient` and layered `radial-gradient`s can fake a subtle tooth without any filter or asset. It is cheap and it is honest, but it produces a *regular* pattern, and regularity is exactly what paper is not, the eye finds the repeat quickly at large sizes. Fine for a small card, poor for a full page.

**The cheapest credible option is often no grain at all.** Measured live: **Gumroad's `body` has `background-image: none` and a flat `rgb(244, 244, 240)`** [VERIFIED]. The most-cited shipped site in this genre gets its paper feeling from a *warm off-white colour* alone. Worth a serious A/B before committing to a texture layer at all.

### 3.4 Fixed vs scrolling background, and the mobile Safari problem

Two behaviours, and they read completely differently:

- **Texture fixed to the viewport** (`background-attachment: fixed`, or a `position: fixed` pseudo-element): the grain stays put while content scrolls over it. The page reads as content *on* a desk.
- **Texture scrolling with the page:** the grain moves with the paper. The page reads as one continuous sheet.

**For a scrapbook/paper metaphor, scrolling is the correct choice.** Fixed grain makes the texture "swim" relative to the paper it is supposed to be *part of*, which subtly breaks the material illusion, the same reason parallax on a texture is wrong (§6.5).

That is convenient, because `background-attachment: fixed` has a long history of being unreliable on iOS Safari (ignored, or forcing an expensive repaint on every scroll frame). **If you ever do need viewport-fixed texture, use a `position: fixed` pseudo-element with a negative `z-index` rather than `background-attachment: fixed`**, it is composited properly and behaves consistently. *(The current precise iOS status is UNVERIFIED here, the fixed-pseudo-element workaround is the durable pattern regardless.)*

**One interaction to watch:** if grain sits on the page and folder cards are flat opaque paper (the §1.2 recommendation), the cards will read as *lighter and cleaner* than the ground. That is the desired effect, clean sheets on a textured desk, but it means the grain must be subtle enough that the contrast between card and ground does not compete with the black keylines. Keep grain opacity low (0.2–0.4) and check it at 100% zoom on a real screen, not a retina laptop.

---

## 4. Typography for ultra neo-brutalism

All font metadata below is **[VERIFIED]** against the upstream `google/fonts` repository `METADATA.pb` files (`raw.githubusercontent.com/google/fonts/main/ofl/<family>/METADATA.pb`), which is the authoritative source for subsets and variable axes, not from a specimen page or a blog list.

### 4.1 What actually recurs on shipped neo-brutalist sites

Two surveys read in full [VERIFIED]:

- Kristi.Digital, *My Favourite Fonts for Neobrutalist Web Design*, names **Sora, Epilogue, Syne, Bricolage Grotesque, Plus Jakarta Sans, Darker Grotesque, Archivo Black, Anton, Climate Crisis**. Describes Syne as "a Geometric Sans Serif font that gets wider as it gets heavier", Bricolage Grotesque as a neo-grotesque with playful ascenders/descenders, Anton as a "90s newspaper headline or retro ad poster feel". <https://blog.kristi.digital/p/my-favourite-fonts-for-neobrutalist-web-design>
- A second survey pass names **Archivo Black** as "the king of neobrutalist fonts… used by default in neobrutalism designs", plus **Oswald**, **Rubik** and **Barlow**.

Add the obvious incumbent the lists under-report: **Space Grotesk** is the de-facto default of the whole genre. If you pick it for display you will look like everyone else.

The pattern is consistent: *heavy neo-grotesque or geometric sans, quirky detail, high weight, low or negative tracking.*

### 4.2 The two Italian constraints, and one nobody mentions

**(a) Length, and the brief's ~10% figure is too optimistic.**

The W3C's *Text size in translation* article [VERIFIED] reproduces IBM's canonical expansion table for English → European languages, and it is driven by **source string length**, not by language:

| English characters | Average expansion |
|---|---|
| up to 10 | **200–300%** |
| 11–20 | 180–200% |
| 21–30 | 160–180% |
| 31–50 | 140–160% |
| 51–70 | 151–170% |
| over 70 | 130% |

<https://www.w3.org/International/articles/article-text-size.en.html>

Localisation practice puts Italian specifically at **+20–30% over English**, with the standard design guidance to **reserve 35–50% for short labels**, navigation, tabs, buttons, because the shorter the string, the bigger the multiplier.

This matters enormously for *this* design, because a brutalist portfolio is made almost entirely of short strings set very large: nav items, folder tab labels, section eyebrows, buttons. **Those are exactly the strings in the 200–300% expansion band.** Plan for a folder tab label to be twice as wide in Italian as your English mock-up suggests.

Concrete strings for this site:

| EN | IT | Δ |
|---|---|---|
| Work | Lavori | +50% |
| Projects | Progetti | 0% |
| About | Chi sono | +60% |
| Contact | Contatti | +14% |
| Listen | Ascolta | +17% |
| Read more | Scopri di più | +44% |
| Get in touch | Mettiamoci in contatto | +83% |
| Download the CV | Scarica il curriculum | +40% |

Since Italian is the **default** here, design to the Italian string and let English be the language with slack, the opposite of the usual habit. And this is the strongest practical argument for a display face with a variable `wdth` axis (§4.3).

| EN | IT | Δ |
|---|---|---|
| Work | Lavori | +50% |
| Projects | Progetti | 0% |
| About | Chi sono | +60% |
| Contact | Contatti | +14% |
| Listen | Ascolta | +17% |
| Read more | Scopri di più | +44% |
| Get in touch | Mettiamoci in contatto | +83% |
| Download the CV | Scarica il curriculum | +40% |

Nav labels and buttons are where this bites, not paragraphs. Since Italian is the **default** here, design to the Italian string and let English be the one that has slack, the opposite of the usual habit.

**(b) Latin Extended is mandatory.** Italian needs à è é ì í î ò ó ù ú.

> **Correction, 2026-09-04 (ticket 02).** The claim below that omitting `latin-ext` makes
> Italian accents fall back mid-word is **wrong**, and it is repeated in §4.6. Checked
> against Google's own published `unicode-range` descriptors for Bricolage Grotesque:
> `latin` covers `U+0000-00FF`, which contains every accented character Italian uses, > à U+00E0, è U+00E8, é U+00E9, ì U+00EC, ò U+00F2, ù U+00F9 and their capitals.
> `latin-ext` begins at `U+0100`. Requesting `latin-ext` is still worth doing for breadth,
> but it is not what carries Italian, and a test written to "prove latin-ext" with Italian
> accents proves nothing. Every family recommended below is `[VERIFIED]` to carry a `latin-ext` subset. In `next/font/google` you must write `subsets: ['latin', 'latin-ext']`, with `['latin']` alone the accented glyphs fall back to a system font *mid-word*, producing a visible letterform mismatch inside words like "città". **This is the single most common Italian-site typography bug.**

**(c) The one nobody mentions: accents above cap height.** All-caps display type is the neo-brutalist default, and Italian all-caps carries diacritics **above the cap height**: `È À Ù Ò É Ì`. Real strings that will appear on this site: `PERCHÉ`, `PIÙ`, `È`, `PERÒ`, `CITTÀ`, `UNIVERSITÀ`. A hero set at `line-height: 0.82`, normal for this style, will **clip or collide** those accents against the line above.

Mitigations, in order:
1. Never go below `line-height: 0.9` on all-caps display text containing Italian.
2. Or set the hero in **sentence case**, which is also better Italian typography, Italian does not use Title Case For Headings the way English does. "Chi sono", not "Chi Sono".
3. Or reserve space explicitly: `h1 { padding-block-start: 0.08em; }`.
4. Test string to paste into every candidate at final hero size: **`ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ`**. If it clips, the pairing fails regardless of how good it looks in English.

Also: the lazy Italian keyboard habit is to type `E'` for `È`. Use the correct `È` in all copy, an apostrophe next to a giant display glyph looks like a mistake, because it is one.

### 4.3 Are heavy condensed grotesques right here, or a cliché to avoid?

**Half-right. Use condensed as a role, never as the system.**

For: condensed solves the Italian length problem for free, it is the only typographic lever that buys you 20% more characters at the same optical size, and Anton/Oswald/Big Shoulders are all `latin-ext`-complete.

Against: heavy condensed grotesque *is* the neo-brutalist house style, to the point that Anton is arguably the most-used free display face on the web. It has crossed from "idiomatic" into "template". A site for a *musician* built entirely on Anton will read as a gig-poster generator.

**Verdict:** allow condensed in exactly one role, either the giant name in the hero, or the small all-caps eyebrow labels (`01 / ASCOLTA`), **not both**. And strongly prefer a **variable `wdth` axis** over a fixed condensed face, so one font file gives you `wdth: 78` for a long Italian heading and `wdth: 100` for the nav. Archivo (62–125), Bricolage Grotesque (75–100), Instrument Sans (75–100) and Martian Mono (75–112.5) all offer this. A fixed condensed face does not.

### 4.4 Four concrete pairings

#### Pairing 1, **Bricolage Grotesque + Instrument Sans + Azeret Mono** ← my pick

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Bricolage Grotesque** | Mathieu Triay · sans-serif · `latin, latin-ext, vietnamese` · axes **`opsz` 12–96, `wdth` 75–100, `wght` 200–800** |
| Body | **Instrument Sans** | Rodrigo Fuenzalida & Jordan Egstad · sans-serif · `latin, latin-ext` · axes **`wdth` 75–100, `wght` 400–700** |
| Mono | **Azeret Mono** | Displaay / Martin Vácha · monospace · `latin, latin-ext` · axis **`wght` 100–900** |

**Why it suits a young Italian musician fresh out of school.** Bricolage Grotesque is a deliberately *imperfect* grotesque, irregular ascenders and descenders, slightly off-key proportions. It reads DIY, printed, photocopied, which is the scrapbook register the whole design is chasing, without wearing a costume. It is the only face on this list whose personality comes from craft rather than from volume, which matters for someone presenting themselves as a serious young professional rather than shouting.

The two variable axes are the real argument. `wdth 75` gives a free condensed for the long Italian headings, you solve §4.2(a) inside one font file. And `opsz 12–96` means the 96px hero and the 13px folder-tab label are **optically different cuts**, not one outline scaled up and down: heavier hairlines and looser spacing at small sizes, tighter and more refined at display sizes. That is the single biggest free quality jump available on Google Fonts, and almost nobody uses it.

Azeret Mono is squarer and colder than Space Mono and carries far less baggage, right for tab labels, track durations, year stamps, and the `01 / 02 / 03` folder numbering.

**Caution.** Bricolage's quirk competes with tape, doodles and stickers, you cannot have a loud typeface *and* a loud decoration layer without the page fighting itself. Discipline: **Bricolage at display sizes only, never in running copy.** Also, `next/font/google` ships weight-only unless you declare the axes explicitly (`axes: ['opsz', 'wdth']`); forget that and you silently lose the two features you chose the face for.

#### Pairing 2, **Anton + Public Sans + Space Mono** (the loud poster route)

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Anton** | Vernon Adams · display · `latin, latin-ext, vietnamese` · **single weight 400, no variable axes** |
| Body | **Public Sans** | USWDS / Dan Williams / Impallari / Fuenzalida · sans-serif · `latin, latin-ext, vietnamese` · axis `wght` 100–900 |
| Mono | **Space Mono** | Colophon Foundry · monospace · `latin, latin-ext, vietnamese` · static 400/700 + italics |

**Why.** Maximum volume for zero effort, and being condensed it absorbs Italian length. It reads flyposter / gig poster / record-shop window, which is genuinely on-brief for a musician in a way that a tech-startup grotesque is not. Public Sans is deliberately plain civic-service type, a good, uncompetitive foil that will never fight the display face.

**Caution.** Anton has **exactly one weight**. You cannot build a type scale from it; every level below H1 must come from Public Sans, so the system has a hard seam in the middle. Its internal leading is tight and its accents sit high, this is the pairing most likely to fail the `ÈÀÙ PERCHÉ` test, so check it first. And it is ubiquitous.

#### Pairing 3, **Fraunces + Space Grotesk** (the editorial / musician route)

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Fraunces** | Undercase Type, Phaedra Charles, Flavia Zimbardi · **serif** · `latin, latin-ext, vietnamese` · axes **`SOFT` 0–100, `WONK` 0–1, `opsz` 9–144, `wght` 100–900** |
| Body | **Space Grotesk** | Florian Karsten · sans-serif · `latin, latin-ext, vietnamese` · axis `wght` 300–700 |

**Why.** A high-contrast display *serif* inside a hard-black-keyline brutalist frame is the least-copied move available, and it reads **musician**, concert programme, record sleeve, conservatory diploma, rather than SaaS landing page. Fraunces' `WONK` axis switches on the eccentric alternates (the swashy `g`, angled terminals) and `SOFT` softens the joins; at `WONK 1, SOFT 60, wght 900` it is one of the most characterful faces on Google Fonts, full stop. It is also the pairing that best fits "fresh out of music school" without being either corporate or childish.

**Caution.** It is a serif, and thin strokes look weak next to a 4px black keyline, it must be used **heavy (700–900) and large**, never at 18px. Four axes also means a fat variable file, so declare only the axes you actually animate/use. And Space Grotesk in the body slot is the genre cliché, acceptable, because nobody notices a body face, but do not promote it to display.

#### Pairing 4, **Archivo (whole superfamily) + Martian Mono** (the systematic route)

| Role | Family | Verified metadata |
|---|---|---|
| Display + Body | **Archivo** | Omnibus-Type · sans-serif · `latin, latin-ext, vietnamese` · axes **`wdth` 62–125, `wght` 100–900** |
| Mono | **Martian Mono** | Roman Shamin / Evil Martians · monospace · `latin, latin-ext, cyrillic, cyrillic-ext` · axes **`wdth` 75–112.5, `wght` 100–800** |

**Why.** One file covers everything from Archivo Condensed Thin to Archivo Expanded Black, including the Archivo Black that every neo-brutalist site reaches for, already inside the range. `wdth 62` is a real condensed for long Italian headings; `wdth 125` is a real expanded for a wide hero name. Smallest total font payload of the four options and the most controllable type scale. Martian Mono is very wide and very brutal, excellent for a marquee ticker strip.

**Caution.** This is the *safe* answer. Archivo is a well-mannered, slightly Swiss workhorse; on its own it reads systematic and corporate, not scrappy. **All** the personality then has to come from layout, colour blocks and the paper devices. If the decoration budget gets cut late, this pairing has nothing in reserve.

#### Optional fifth voice, handwriting for the marginalia

**Caveat** (Impallari Type · handwriting · `latin, latin-ext, cyrillic, cyrillic-ext` · axis `wght` 400–700) [VERIFIED] is the least clip-arty handwriting face on Google Fonts, and unlike most of them it is **variable**, so the annotations can vary in pressure. Rules if used: never more than ~8 words at a time, never load-bearing information, never below 18px, and keep it out of anything a screen reader needs to read carefully. Handwriting faces are measurably harder for dyslexic readers, this is decoration with a text alternative, not content.

### 4.5 Verdict on the proposed **DM Sans + Space Mono**

Verified metadata first, because DM Sans is better than its reputation:

- **DM Sans**, Colophon Foundry · sans-serif · `latin, latin-ext` · axes **`opsz` 9–40, `wght` 100–1000** [VERIFIED]
- **Space Mono**, Colophon Foundry · monospace · `latin, latin-ext, vietnamese` · static 400/700 + italics, **no variable axes** [VERIFIED]

**Verdict: competent, and too tame for "ultra neo-brutalist".** Three specific reasons, not vibes:

1. **The letterforms are drawn, not cut.** DM Sans is a geometric neo-grotesque with soft, closed, friendly terminals and near-circular bowls. Even at `wght 1000`, and it does genuinely go to 1000, it stays affable. Ultra neo-brutalism needs a face that looks stamped or cut. DM Sans always looks *considered*, which is the opposite register.
2. **No width axis.** `opsz` + `wght` only. So the Italian-length problem (§4.2a) can only be solved by reducing `font-size`, which directly costs you the impact the whole style depends on. Every other display candidate here gives you width for free.
3. **Two faces from the same foundry that are neither a system nor a contrast.** DM Sans and Space Mono are both Colophon. They are not related enough to read as a superfamily, and not different enough to read as a deliberate clash. It is the least interesting possible distance between two faces. Space Mono is also the single most over-used "we're being edgy" mono on the web, sitting right beside Space Grotesk.

**What I would actually do: keep DM Sans, demote it.** It is an excellent body face, `latin-ext`, a real `opsz` axis, superb legibility at 16–18px, and it will handle Italian body copy beautifully. Make it the **body**, put a face with a voice in the display slot (Bricolage Grotesque or Fraunces), and swap Space Mono for **Azeret Mono** (colder, squarer, far less common), or **DM Mono** if you specifically want the mono to sit inside the DM system.

If the pairing must stay exactly as proposed: set display at `wght 1000`, `opsz 40`, `letter-spacing: -0.04em`, uppercase, and carry the brutalism entirely on scale, colour blocks and the keylines. It will be a good site. It will not be an *ultra* one, and the brief asked for ultra.

### 4.6 `next/font/google` implementation notes

```ts
import { Bricolage_Grotesque, Instrument_Sans, Azeret_Mono } from 'next/font/google'

export const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],   // latin-ext is NOT optional for Italian
  axes: ['opsz', 'wdth'],            // wght is implicit; the others are NOT
  display: 'swap',
  variable: '--font-display',
})
```

- `subsets: ['latin', 'latin-ext']`, see the correction at §4.2(b): `latin` alone already carries every Italian accent. Request `latin-ext` for breadth, not for Italian.
- Instrument Sans carries a `wdth` axis too (75–100), so it needs `axes: ['wdth']` for the same reason Bricolage does. Azeret Mono publishes no axis but `wght`, and passing `axes` to it is a build error.
- Non-`wght` variable axes must be listed in `axes` or they are dropped from the build.
- `next/font/google` downloads and self-hosts at build time, so **there is no runtime request to Google**, worth stating on the legals page, because it means fonts create no third-party data transfer and no consent obligation.
- Keep `adjustFontFallback` on (default) and preload only the display face. With a hero this large, a mismatched fallback metric is a very visible CLS hit.

---

## 5. Photography in a neo-brutalist system

A note on evidence quality first, because it shapes the recommendation. **Neo-brutalist sites are overwhelmingly illustration-led, not photography-led.** Reading `gumroad.com` live [VERIFIED] confirms it: the page is built from illustration and flat colour blocks, and the only photographs are plain circular testimonial avatars, no cut-outs, no duotone, no hard-bordered frames. That is a real signal: **the genre has not solved photography, it has mostly avoided it.** Which means a portrait handled well here is a differentiator, and also that we are partly designing without precedent and should choose the *robust* option.

### 5.1 The seven treatments, with technique

**1. Knockout / cut-out with a die-cut sticker outline.**
Two routes. (a) Runtime: a pre-baked alpha PNG plus stacked `filter: drop-shadow(Npx 0 0 #fff)` at 4–8 angles, `drop-shadow` follows the alpha contour, unlike `box-shadow` which follows the box [VERIFIED: MDN `filter`]. (b) Build time: bake the white keyline into the PNG in Figma/Photoshop.
**(b) wins.** One pass instead of eight, exact mitre joins instead of the rounded blob that stacked drop-shadows produce (the same dilation problem as §1.3), and no per-paint cost. Take (a) only if the outline colour must change with theme.
Alpha survives Next.js optimisation, the optimizer emits WebP and AVIF, both of which carry alpha [VERIFIED: Next.js image docs], so ship the source PNG and let `next/image` re-encode.

**2. Duotone.** Runtime, and this is the technically best-behaved option. Grayscale via `feColorMatrix`, then gradient-map via `feComponentTransfer type="table"` with two stops per channel derived from your two hex values ÷ 255 [VERIFIED: Codrops, CSS-Tricks]:

```xml
<filter id="duotone">
  <feColorMatrix type="matrix"
    values=".33 .33 .33 0 0  .33 .33 .33 0 0  .33 .33 .33 0 0  0 0 0 1 0"/>
  <feComponentTransfer color-interpolation-filters="sRGB">
    <feFuncR type="table" tableValues="<shadowR/255> <highlightR/255>"/>
    <feFuncG type="table" tableValues="<shadowG/255> <highlightG/255>"/>
    <feFuncB type="table" tableValues="<shadowB/255> <highlightB/255>"/>
  </feComponentTransfer>
</filter>
```

Applied as `filter: url(#duotone)`. **`color-interpolation-filters="sRGB"` is mandatory**, the SVG default is linearRGB and your brand colours will come out visibly wrong. Firefox historically required a full path to an external filter file, so **inline the `<svg><filter>` in the DOM** and reference `url(#id)`.
For us this maps beautifully: shadows → `#3866A8`, highlights → the warm paper. The palette becomes two CSS variables, swappable with zero re-export. Cost: a real per-paint filter pass, hero only, never a gallery of thirty.

**3. Halftone / newsprint.** Pure CSS is possible in three declarations [VERIFIED]:

```css
div {
  background: radial-gradient(closest-side, #777, #fff) 0 / 1em 1em space,
              linear-gradient(90deg, #888, #fff);
  background-blend-mode: multiply;
  filter: contrast(16);
}
```

Dot layer × map layer, multiplied, with `contrast()` acting as a 50%-grey threshold. For a real photo, swap the linear-gradient for the image and `mask-image` it, with `filter: contrast(50)` on a parent **that must have a solid background colour or the contrast has nothing to bite on** [VERIFIED: css-irl].
**Caution:** the dot pitch is fixed in `rem`, so the effect *changes character* between 375px and 1440px. For a hero, pre-bake (Photoshop → Bitmap → Halftone Screen); it compresses brilliantly and is deterministic.

**4. Hard-bordered rectangle with a hard offset shadow.** `border: 3px solid #000; border-radius: 0; box-shadow: 6px 6px 0 0 #000`, blur *and* spread at zero is the whole trick. Zero runtime cost, fully tokenised, trivially themeable. **This is the default; it should carry ~80% of the imagery on the site.**

**5. Torn / ripped paper edge.** `mask-image` with a pre-drawn SVG/PNG tear (`mask-size: 100% auto; mask-repeat: no-repeat`), or generated with `feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5"` → `feDisplacementMap scale="30"` [VERIFIED: Codrops]. Gradient-based sawtooth masking avoids data-URI pain [VERIFIED: CSS-Tricks]. `mask-image` is Baseline (widely available since Dec 2023); keep `-webkit-` prefixes for older Safari [VERIFIED: MDN].
**This is where `clip-path` finally earns its place** (§1.3), an un-outlined torn edge is exactly the shape it is good at.
Cost: `feDisplacementMap` on a large photo is the most expensive option in this list. Bake the mask.

**6. Photocopy / threshold / xerox.** `filter: grayscale(1) contrast(400%) brightness(115%)` gets 90% of the way in one declaration; filters compose left-to-right, each consuming the previous output [VERIFIED: MDN]. For a true 1-bit look add `feComponentTransfer type="discrete" tableValues="0 1"`, `discrete` creates hard steps with no interpolation [VERIFIED: MDN].

**7. Taped photo / photo corners.** Pure decoration: a rotated `::before`/`::after` tape gradient plus `transform: rotate(-2.5deg)` on the frame. No filters, cheapest treatment, highest "a human made this" payoff. **Keep faces out of the four corners** so the tape never lands on one.

### 5.2 Which treatment for a single portrait of a musician, verdict

**Use two, in a deliberate hierarchy. Do not use five.**

1. **Hero: knockout cut-out with a baked white die-cut outline, on the blue block, with a hard offset shadow.** This is the single strongest image a portfolio hero can carry: it removes the background entirely (so an amateur photo's messy room stops mattering), it reads unmistakably as a *sticker*, which ties the hero to the tape-and-folder language, and it lets the blue `#3866A8` block do the colour work. It also survives being resized aggressively for mobile.
2. **Folder covers: hard-bordered rectangle + offset shadow, taped on.** Cheap, uniform, robust to whatever photos exist. This is the workhorse.
3. **One duotone, once, as a mid-page full-bleed moment** if a photo with genuine directional light exists. It ties the photography to `#3866A8` and it is the one treatment that is fully re-colourable later.

**Explicitly do not:** halftone the hero (dot pitch instability across breakpoints), or use torn edges on more than one or two items (the effect dies from repetition and every tear must be hand-checked against the crop).

### 5.3 What each treatment demands of the source photo

| Treatment | Non-negotiable requirement |
|---|---|
| Cut-out sticker | Clean silhouette; hair contained; background contrasting with hair; no fake bokeh; generous margin |
| Duotone | Genuine directional light and a full tonal range; face not blown out |
| Halftone | Bold graphic contrast; no fine-patterned clothing (moiré) |
| Hard border | Almost nothing, any well-exposed photo works |
| Torn edge | Bleed on all four edges; nothing important within ~60px of the crop |
| Xerox | One hard light source and a sharp-edged shadow; bracketed exposures |
| Taped | 4:3, casual, imperfect; face away from the corners |

### 5.4 The shot list to send Anna

Send this more or less verbatim. It is written for someone shooting on a phone with a friend.

**Universal rules**

- Shoot at **maximum resolution**, minimum **3000px on the long edge**. HEIC or ProRAW is fine.
- **No Portrait Mode. No beauty filters. No Instagram/Snapchat filters.** Fake background blur destroys hair edges and makes a clean cut-out impossible.
- Send **originals by WeTransfer or AirDrop**, not WhatsApp, not Instagram DM. Both recompress and both will ruin the hero.
- Clean the lens. Flash off. Avoid mixed light (daylight window + yellow bulb in one frame).
- Shoot **every setup both vertical and horizontal**, 20+ frames each.
- Also shoot **one frame of the empty background wall** with nobody in it, it makes retouching far easier.
- Tell us **who took each photo**, so we can credit correctly on the legals page.

**Shot 1, Hero cut-out (the most important one)**

- Plain, flat, evenly lit single-colour wall. **The wall must contrast with your hair**, dark hair needs a light wall.
- **Hair tied back, up, or in a defined shape.** Loose flyaway strands cannot be cut out with a hard outline; they turn to mush.
- Soft frontal light: overcast day or open shade. **No window directly behind you**, backlight creates a halo that breaks the cut.
- Three-quarter or full length, with **one arm away from the body** (hand on hip, instrument held out). That hole of negative space is what makes a silhouette read as a sticker rather than a blob.
- Instrument: yes, but **entirely inside the frame**. A neck cropped by the frame edge becomes an amputated sticker.
- **Leave 25–30% empty margin on all four sides.** Do not crop tight.
- Solid-colour clothing. Avoid lace, mesh, fringe, and anything the same colour as the wall.

**Shot 2, Duotone portrait**

- **Directional light**: stand at 45° to a window, or one lamp to one side. Flat overcast light kills duotone, we need real shadow modelling on the face.
- Head-and-shoulders or waist-up. Face at mid-tone, **not overexposed**, blown cheeks become a flat colour blob with no features.
- Self-test: switch the phone to black-and-white preview. If the face looks flat grey or pure white, move the light.

**Shot 3, High-contrast / photocopy**

- **One hard light source**: direct sun, a desk lamp, a friend's phone torch to one side. You want a **sharp-edged shadow** across the face.
- Face three-quarters so the nose casts a shadow. Dark clothing on light ground, or the reverse.
- **Bracket the exposure**, the same frame normal, one darker, one brighter.

**Shot 4, Halftone candidate**

- Bold, simple, graphic. Head-and-shoulders, strong silhouette, punchy contrast.
- **No fine-patterned clothing** (stripes, houndstooth, knitwear), it moirés against the dot grid.

**Shot 5, Environmental / performance** (feeds the folder covers)

- Rehearsal room, stage, street, conservatory. Some context around you.
- **Leave bleed on all four edges**, a torn edge eats 20–60px and must never cross your face or the instrument's headstock.

**Shot 6, Snapshot / taped**

- Deliberately casual, 4:3, imperfect. Behind the scenes, hands on the instrument, laughing.
- This is the one that makes the site feel like a person made it rather than a template.

---

## 6. Motion vocabulary

### 6.1 The canonical move: press-to-collapse-shadow

The element translates **toward** its shadow by exactly the shadow offset while the shadow collapses to zero:

```css
.btn {
  border: 3px solid #000;
  border-radius: 0;
  box-shadow: 6px 6px 0 0 #000;
  transition: transform 90ms ease-out, box-shadow 90ms ease-out;
}
.btn:hover  { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 0 #000; }
.btn:active { transform: translate(6px, 6px);   box-shadow: 0 0 0 0 #000; }
```

Two variants, and they mean different things:

- **Translate toward the shadow, shadow → 0** = *press*. Correct for `:active` on buttons and links. It is a physical, mechanical metaphor and it is the single most idiomatic gesture in the whole style.
- **Translate away (`-2px, -2px`), shadow grows** = *lift*. Correct for `:hover` on cards and folders. Softer, more decorative.

Use both, but assign them: **hover lifts, press presses.** A great many sites use only one and the interaction feels half-built.

Timing: **80–120ms, `ease-out` or `linear`.** Anything over ~250ms is wrong for this style, brutalism is abrupt, and a slow tween on a hard-edged object reads as a different design language entirely. Animate `transform` and `box-shadow` only, never `top`/`left`/`margin`; keep outer dimensions static so nothing reflows.

**What the canonical library actually ships (measured live on `neobrutalism.dev`) [VERIFIED]:**

```
transition-property:        all                              /* ← smell */
transition-duration:        0.15s  and  0.2s
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)     /* symmetric ease-in-out */
resting box-shadow:         4px 4px 0px 0px oklch(0 0 0)
border:                     2px solid black · border-radius: 5px
```

Read that critically. `cubic-bezier(0.4, 0, 0.2, 1)` at 150–200ms is **Tailwind's default transition**, it is what you get by typing `transition`, not a considered choice. And `transition-property: all` is a real performance smell: it will happily animate layout properties and force reflow, and it makes every future style change a potential accidental animation.

**So: deviate deliberately.** Name the properties, and go faster and asymmetric:

```css
transition: transform 90ms cubic-bezier(0, 0, 0.58, 1),   /* ease-out */
            box-shadow 90ms cubic-bezier(0, 0, 0.58, 1);
```

A symmetric ease-in-out means the object *accelerates away* from the press, which is exactly backwards for a physical button, a press should start instantly and settle. `ease-out` at ~90ms is the difference between a control that feels stamped and one that feels animated.

### 6.2 Marquee tickers

Idiomatic and cheap. The structure that actually loops seamlessly [VERIFIED: ryanmulligan.dev]: duplicate the content, `overflow: hidden` on the wrapper, `min-width: 100%` on the track, and

```css
@keyframes scroll { to { transform: translateX(calc(-100% - var(--gap))); } }
```

The `var(--gap)` inside the `calc()` is the whole trick, without it you get a visible jump at the loop point. Aim for roughly **40–70px/s**; faster reads frantic, slower reads broken.

Two obligations: the duplicated copy must be `aria-hidden="true"`, and the marquee must never be the only place a piece of information lives (a screen-reader user and a reduced-motion user must both get it elsewhere).

### 6.3 `steps()` versus smooth easing

`steps(n, jump-start | jump-end | jump-none | jump-both)`; `step-start` ≡ `steps(1, jump-start)` [VERIFIED: MDN].

**Opinion: `steps()` is genuinely idiomatic here, with one exception.** Brutalism is about un-smoothed materials, so a marquee that *ticks* in ~12 steps, a sticker that snaps between three fixed rotations, or a `steps(1)` instant colour inversion all read as deliberate rather than cheap. **But do not use `steps()` on the button press**, a press needs to feel physical, and a stepped press reads as broken, not brutal.

### 6.4 Scroll-triggered entrance

Modern approach: `animation-timeline: view(); animation-range: entry;` with `animation-duration` omitted [VERIFIED: developer.chrome.com]. Chrome/Edge 115+, Safari 26+, Firefox behind a flag.

**What reads premium in this style: a hard arrival.** Opacity 0→1 plus a ≤12px translate, ~120ms, staggered 40–60ms, **one stagger per section, not per element**. A slow 600ms fade-up on every block is the single clearest tell of a template, and it fights the hard-edged vocabulary, you cannot have crisp 4px keylines that drift gently into place.

### 6.5 Premium versus gimmicky, opinionated

**Premium**

- Press-collapse hover/active, assigned as in §6.1.
- Hard-cut state changes with no tween at all (colour inversion, block swap).
- One honest constant-speed marquee. One.
- **Static** `rotate(-3deg)` on stickers and tape, rotation used as *composition*, not as animation. This is the highest-value, lowest-cost move on the whole list.
- The folder lifting 4px on hover with its shadow deepening, and nothing else. One signature move, done everywhere, consistently.

**Gimmicky**

- **Custom cursors** that replace the pointer, destroys affordance, entirely dead on touch.
- **Magnetic buttons, actively wrong here.** Magnetism is smooth and organic and directly contradicts the rigid mechanical-press metaphor the style is built on. This is not a taste call; it is an internal contradiction.
- Full-screen preloaders with counters on a **three-page** site. You are inventing wait time you do not have.
- **Parallax**, Smashing Magazine's research [VERIFIED] finds it "universally triggering" for people with vestibular disorders. Also: parallax on the paper texture makes the grain *swim*, which is exactly the wrong reading (paper does not slide relative to itself).
- Scroll-jacked horizontal sections; per-letter reveals on every heading; infinite wobble loops. Motion that never resolves is noise.
- For a musician specifically: audio-reactive visuals when no audio is playing.

### 6.6 `prefers-reduced-motion`, exactly where it gates

**Must gate:** marquees and any infinite loop, scroll-triggered entrances, parallax, auto-advancing carousels, wobble/jitter, page transitions, preloader animation. Smashing [VERIFIED] names large movements, parallax, multi-directional motion and looping animation as the triggers.

**Does not need gating:** hover micro-interactions under ~150ms, colour changes, opacity fades, focus rings. Smashing states that opacity changes and small scale changes "are unlikely to be problematic" and explicitly retains hover effects. **So the sub-100ms press in §6.1 does not need gating.**

**Best practice is the opt-in pattern, not the nuke:** write the base styles with no motion, add motion inside `@media (prefers-reduced-motion: no-preference)` [VERIFIED: web.dev].

If you also want a global safety net, use the tiny-duration form, not `none` [VERIFIED: CSS-Tricks]:

```css
@media (prefers-reduced-motion: reduce) {
  **::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Why `0.001ms` and not `animation: none`:** `none` *cancels* the animation, so keyframe **end states never apply**, an element animating `opacity: 0 → 1` stays invisible forever, and `animationend` never fires, hanging any JS waiting on it. `animation-iteration-count: 1` is what actually stops the infinite loops.

**Two gotchas worth writing down:**

1. **The `0.001ms` nuke does not stop scroll-driven animations.** Their duration is `auto`/timeline-bound. Any `view()` or `scroll()` animation must be declared *inside* `@media (prefers-reduced-motion: no-preference)` [VERIFIED: developer.chrome.com].
2. **Better than killing motion: swap the property.** Keep the timing, easing and delay identical and animate `opacity` instead of `transform` [VERIFIED: Smashing]. The choreography survives; the vestibular trigger does not.

In JS: `window.matchMedia('(prefers-reduced-motion: reduce)')` plus an `addEventListener('change', …)` so the page responds when the user changes the setting mid-session [VERIFIED: web.dev].

---

## Reference table

Every row below was reached and read. Rows measured in a real browser (computed styles) are marked **measured**; the rest were fetched as text.

| Site | URL | Why it matters | What to steal |
|---|---|---|---|
| neobrutalism.dev (**measured**) | <https://www.neobrutalism.dev/> | The genre's canonical component library. Real tokens: black border, `--border-radius: 5px`, `4px 4px 0` shadow, 2px borders, DM Sans, heading weight 700 | The `--box-shadow-x/y` + `--reverse-box-shadow-x/y` token pattern. Then **escalate past it**, its defaults are the generic baseline |
| Gumroad (**measured**) | <https://gumroad.com> | The most-cited shipped neo-brutalist product site. Now 1px borders, 4–24px radii, **no hard shadows**; hero at weight 400 / line-height 1.0 | The palette discipline: warm off-white `#F4F4F0` ground + pure black + two loud saturated accents. And the lesson that impact ≠ weight |
| Chris Coyier, *Modern CSS Round-Out Tabs* | <https://blog.master.dev/modern-css-round-out-tabs/> | The current best-practice tab shape via `clip-path: shape()`, and it never addresses borders | The `shape()` syntax, for any **un-outlined** shape. Not for our folder |
| freeCodeCamp, *Apply Borders to Clip Paths* | <https://www.freecodecamp.org/news/apply-borders-to-clip-paths-with-css/> | Written confirmation that `border` does not follow `clip-path` | The confirmation, so nobody re-litigates it mid-build |
| MDN `shape()` | <https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/shape> | Baseline 2026, newly available since Feb 2026 | Support status, too new to be load-bearing today |
| MDN `corner-shape` | <https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape> | **`border`, `outline` and `box-shadow` all follow `corner-shape`**, the eventual clean answer to outlined non-rectangles. Limited availability, not Baseline | Put `@supports (corner-shape: bevel)` on the roadmap for the tapered tab |
| W3C, *Text size in translation* | <https://www.w3.org/International/articles/article-text-size.en.html> | IBM expansion table: strings under 10 chars expand **200–300%** | The table. It reframes the whole Italian-first layout problem |
| WCAG 2.2 SC 2.5.8 | <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html> | Target Size (Minimum), Level **AA**: 24×24 CSS px | The hard number that kills the overlapping mobile folder stack |
| Google Fonts `METADATA.pb` (× 12 families) | `raw.githubusercontent.com/google/fonts/main/ofl/<family>/METADATA.pb` | Authoritative subsets and variable axes, not a specimen page | Verify `latin-ext` and axis ranges here, never from a blog list |
| Kristi.Digital, neobrutalist fonts | <https://blog.kristi.digital/p/my-favourite-fonts-for-neobrutalist-web-design> | Survey naming Sora, Epilogue, Syne, Bricolage Grotesque, Plus Jakarta Sans, Darker Grotesque, Archivo Black, Anton | The consensus list, mainly so you know what to avoid |
| Codrops, duotone with `feComponentTransfer` | <https://tympanus.net/codrops/2019/02/05/svg-filter-effects-duotone-images-with-fecomponenttransfer/> | The complete duotone filter and how to derive `tableValues` from hex ÷ 255 | The filter, verbatim. Remember `color-interpolation-filters="sRGB"` |
| CSS-Tricks, duotone via SVG | <https://css-tricks.com/using-svg-to-create-a-duotone-image-effect/> | Applying it via `filter: url()`, plus the Firefox external-path caveat | Inline the `<filter>` in the DOM |
| Codrops, texture with `feTurbulence` | <https://tympanus.net/codrops/2019/02/19/svg-filter-effects-creating-texture-with-feturbulence/> | `feTurbulence` + `feDisplacementMap` parameters for rough/torn edges | `type="fractalNoise" baseFrequency="0.04" numOctaves="5"`, displacement `scale="30"` |
| css-irl, CSS halftone | <https://css-irl.info/css-halftone-patterns/> | Photo halftone with `radial-gradient` + `mask-image` + `filter: contrast(50)` | The parent-needs-a-solid-background gotcha |
| master.dev, 3-declaration halftone | <https://blog.master.dev/pure-css-halftone-effect-in-3-declarations/> | Why `contrast()` acts as a 50%-grey threshold | The three-line pattern for decorative blocks |
| CSS-Tricks, jagged edges with masks | <https://css-tricks.com/using-css-masks-to-create-jagged-edges/> | Gradient sawtooth masking without data-URI SVG | Torn-edge technique that stays editable in CSS |
| MDN `mask-image` | <https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image> | Baseline since Dec 2023; alpha vs luminance; CORS restriction | Support facts before committing to masks |
| MDN `filter` | <https://developer.mozilla.org/en-US/docs/Web/CSS/filter> | Filters compose left-to-right, each consuming the previous output | `grayscale(1) contrast(400%) brightness(115%)` as the one-line xerox |
| MDN `feComponentTransfer` | <https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer> | `table` / `discrete` / `linear` / `gamma` | `discrete` with `tableValues="0 1"` for a true 1-bit threshold |
| Ryan Mulligan, CSS marquee | <https://ryanmulligan.dev/blog/css-marquee/> | Seamless marquee structure | `translateX(calc(-100% - var(--gap)))`, the fix for the loop jump |
| Chrome, scroll-driven animations | <https://developer.chrome.com/docs/css-ui/scroll-driven-animations> | `view()` / `scroll()` / `animation-range` | **Scroll-driven animations must be declared inside `no-preference`**, the reduced-motion nuke does not stop them |
| web.dev, `prefers-reduced-motion` | <https://web.dev/articles/prefers-reduced-motion> | The opt-in pattern and the `matchMedia` listener | Base = no motion; add motion in `no-preference` |
| CSS-Tricks, `prefers-reduced-motion` almanac | <https://css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/> | The `0.001ms !important` safety net | Why `0.001ms` beats `animation: none` |
| Smashing, designing for reduced motion | <https://www.smashingmagazine.com/2020/09/design-reduced-motion-sensitivities/> | Parallax called "universally triggering"; opacity/small-scale/hover judged safe | The property-swap pattern: same timing, animate `opacity` not `transform` |
| Next.js Image docs | <https://nextjs.org/docs/app/api-reference/components/image> | WebP/AVIF output (both alpha-capable); `.svg` auto-unoptimized; `dangerouslyAllowSVG` | Ship cut-out PNGs with confidence; inline the duotone filter rather than serving an SVG file |
| Awwwards brutalism collection | <https://www.awwwards.com/awwwards/collections/brutalism/> | A real listing of brutalist sites | Candidate URLs for a manual design review (see Open questions) |

**Reached but yielded nothing usable:** `neobrutalism.dev` docs pages (404 on the styling route; tokens are only in compiled CSS, which is why §1.10 was measured in-browser instead); `ekmas/neobrutalism-components` README (project no longer maintained, no tokens).

**CodePen sources (403 to automated fetch; loaded in a real browser and stylesheets read, all [VERIFIED], see §1.9b):**

| Pen | URL | Why it matters | What to steal |
|---|---|---|---|
| Cool CSS Folder Tabs | <https://codepen.io/uffou/pen/jzzyvB> | The canonical skewed-pseudo-element folder tab, and it contains **zero `border` declarations** | The overlap-and-`z-index` seam mechanism. Then note why it cannot be given a keyline |
| Card Folder Style | <https://codepen.io/faelpatrick/pen/GRedNmR> | Folder flap from a CSS border-triangle; `drop-shadow` follows the triangle's alpha | Empirical proof of the `drop-shadow`-follows-alpha behaviour §1.6 depends on |
| Index Card | <https://codepen.io/teddyzetterlund/pen/YPjEzP> | Ruled index-card paper in two stacked gradients, **zero assets** | The `repeating-linear-gradient` ruled-paper recipe, adopted in §3 |

**[BLOCKED], could not reach:** `hyperui.dev/components/neobrutalism/` (403), `tylersticka.com/journal/improved-css-text-stroke/` (403), `recent.design` (403, the Godly redirect target), Pinterest and Dribbble (gate scraping by design, do not plan around them).

**Warning inherited from the research sweep:** **`yoyoyo.photos`, listed in the Awwwards brutalism collection, currently resolves to an unrelated business. Do not cite it.**

---

## Recommendations

### The folder-tab technique I would build

**Technique A, negative-margin seam removal (§1.2).** Two boxes, tab with `border-bottom: 0` and `margin-block-end: -4px`, `z-index: 2`, opaque background identical to the body. It is nine lines of CSS, it has no browser-support risk, it reflows perfectly in both axes, it keeps genuinely mitred 4px corners, and it is the only option that does all four.

Specifically **not** `clip-path`, because `clip-path` clips the border and every workaround either rounds the corners (stacked `drop-shadow`, `feMorphology`) or has to be re-derived by hand per breakpoint (twin polygons). Not a full SVG frame either, because `preserveAspectRatio="none"` distorts the stroke and a 9-slice cannot express a tab.

Two details that make it look designed rather than assembled:

1. **One `filter: drop-shadow(8px 8px 0 #000)` on the wrapper**, never `box-shadow` on each box, otherwise the composite silhouette gets a notch (§1.6).
2. **Alternate the tab position** left / centre / right down the column. One `nth-child` rule; it is what turns a stack of cards into a filing drawer.

Keep the tab **rectangular**. Revisit the taper only when `corner-shape: bevel` reaches Baseline, at which point `border` and `box-shadow` will follow the bevel for free.

**Card background: flat opaque paper, grain on the page only.** Two adjacent boxes cannot share a repeating texture without a visible seam, and grain under a 4px keyline muddies the line anyway.

**Mobile: break the stack (§1.8).** Full-width folders, vertically stacked, generous gap, shadow offset reduced 8px → 5px. If you want the drawer feeling, overlap by *only* the tab height with alternating tab positions so every body stays fully visible and no tap target hides under another. Overlapping cards at 375px violate WCAG 2.2 SC 2.5.8 (AA, 24×24px) in practice and impose a false "one is current" hierarchy on a portfolio where all works are equal.

**Semantics: `<ul>`/`<li>`/`<article>`, never `role="tablist"`.** The visual is tabs; the content is not. Focus ring in cantaloupe or blue, a black ring is invisible against black keylines.

### The typography pairing I would pick

**Bricolage Grotesque (display) + Instrument Sans (body) + Azeret Mono (labels).**

The deciding argument is not taste, it is the two variable axes. `wdth 75–100` solves the Italian-expansion problem inside one font file, and per the IBM table that problem is a **200–300%** expansion on exactly the short strings this design sets huge, not the 10% the brief assumed. `opsz 12–96` means the hero and the 13px tab label are optically different cuts rather than one outline scaled, which is the largest free quality gain available on Google Fonts and almost nobody takes it. All three families are `[VERIFIED]` `latin-ext`.

Second choice, and the one I would push if the client wants warmth over grit: **Fraunces + Space Grotesk**. A heavy display serif inside hard black keylines is the least-copied move in the genre and reads *musician* rather than *startup*.

**On DM Sans + Space Mono: keep DM Sans, demote it to body; drop Space Mono.** DM Sans has no width axis (only `opsz` + `wght`), so Italian length can only be paid for with `font-size`, i.e. with impact. Its letterforms are drawn, not cut; even at `wght 1000` it stays affable. And it is literally what `neobrutalism.dev` ships as its default, which is the clearest possible evidence that it is the genre's safe house font rather than a differentiator. Replace the mono with **Azeret Mono**, or **DM Mono** if you want the mono inside the DM system.

**Two non-negotiables at build time:**

```ts
subsets: ['latin', 'latin-ext']   // omit and Italian accents fall back mid-word
axes: ['opsz', 'wdth']            // omit and next/font ships weight-only
```

**And test every candidate with `ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ`** at final hero size with the final `line-height`. Italian all-caps carries diacritics above the cap height; a hero at `line-height: 0.82` will clip them. Floor of `0.9`, or set the hero in sentence case, which is better Italian typography anyway.

### Photography

**Ask Anna for the six shots in §5.4 before any layout work is finalised**, because Shot 1 gates the hero treatment. Use **exactly two treatments**: a baked white die-cut cut-out on the blue block for the hero, and hard-bordered + taped rectangles for the folder covers. Add **one** duotone mid-page if a directionally-lit frame exists, mapping shadows to `#3866A8`. Bake the sticker keyline at build time rather than stacking `drop-shadow`s, same rounding problem as §1.3, at eight times the cost.

The genre is illustration-led and has largely avoided photography (Gumroad's only photos are plain circular avatars). A well-handled portrait is therefore a real differentiator, and a reason to choose the *robust* treatment over the clever one.

### Motion

One signature move, applied consistently: **hover lifts (`-2px`, shadow grows), press presses (translate to the shadow, shadow → 0)**, 80–120ms `ease-out`. Static `rotate(-3deg)` on stickers and tape, rotation as composition, not animation, which is the highest-value zero-cost move on the list. At most one marquee. Entrances as a hard arrival: opacity plus ≤12px translate, ~120ms, staggered per section not per element.

**No magnetic buttons.** Magnetism is smooth and organic and contradicts the mechanical-press metaphor the entire style rests on. No custom cursor, no preloader on a three-page site, no parallax.

Gate marquees, loops, entrances and page transitions behind `@media (prefers-reduced-motion: no-preference)`; the sub-100ms press does not need gating. Remember the `0.001ms` safety net does **not** stop scroll-driven animations, those must be declared inside `no-preference` in the first place.

---

## Open questions

1. **Nobody ships an outlined manila folder.** I could not find a live production site doing it. Either it is under-explored (my reading, §1.2 solves it in nine lines) or it keeps getting abandoned at build. Worth building a throwaway prototype of one folder at 375px and 1440px before committing the whole work section to the metaphor.
2. **What is inside a Folder, exactly?** The technique in §1.2 assumes the tab is narrower than the body. If a tab must hold a long Italian title at display size, it will exceed the body width and the seam trick breaks. Decide now: does the tab carry the **title**, or just a **number/year**? I would put the number on the tab and the title in the body, it also removes the accessibility duplication in §1.7.
3. **Does the audio player live inside the folder or outside it?** A player inside a `filter: drop-shadow` wrapper cannot contain a `position: fixed` element (§1.6). If a sticky mini-player is wanted, it must live outside every filtered card.
4. **Client photo reality.** The entire §5 recommendation collapses if Anna only has compressed Instagram exports. Confirm she has originals *before* committing to a cut-out hero; the fallback is hard-bordered rectangles throughout, which is fine but flatter.
5. **Photo credits.** Who shot each image? This is a legals-page obligation and it affects the folder layout (a credit line needs somewhere to sit).
6. **Is the site an EPK?** Everything about the brief, bio, photos, music, press, booking contact, matches the electronic press kit pattern that bookers and venues expect. If the audience includes bookers rather than only listeners, that argues for a downloadable one-page PDF and a prominent, copyable contact block. Worth confirming with Anna who the site is actually *for*.
7. **Lime's exact value is undefined.** The palette locks blue, cantaloupe, black and paper, and calls lime "pure decoration". It still needs a defined token and a rule (decoration only, never text, never a state colour), or it will drift into meaning something.
8. **Timings are now measured for the library, not for shipped sites.** `neobrutalism.dev`'s real values are in §6.1 (150–200ms, `cubic-bezier(0.4,0,0.2,1)`, `transition-property: all`), but that is a Tailwind default, not evidence of what feels right. Still worth a manual DevTools pass over two or three Awwwards brutalism entries to see whether anyone has deliberately tuned this, before we commit to 90ms `ease-out`.
