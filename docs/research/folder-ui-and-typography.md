# Folder UI, scrapbook devices and typography — design research

Research brief for the Anna Milazzo neo-brutalist portfolio (IT default, EN secondary).
Palette locked: `#3866A8` blue primary, `#F79E76` cantaloupe accent (black text only), black keylines, warm off-white paper, lime as decoration.

> **Status legend.** `[VERIFIED]` = page fetched and read in this session. `[UNVERIFIED]` = not reached, or asserted from technique knowledge rather than a live page. `[BLOCKED]` = host refused automated access.
> Technique sections marked *analysis* are worked CSS reasoning, not a claim about a specific shipped site.

---

## Summary

*(Filled in last — see the end of the document for the ten strongest findings.)*

---

## 1. The paper-folder / manila-folder UI, done well

### 1.1 The actual hard problem

A manila folder is a **single continuous outline**: the tab and the body share one silhouette, and there is *no* line where the tab meets the body. Every naive implementation gets this wrong, because in CSS a tab and a body are two boxes and each box draws its own complete border. With a 3–4px black keyline the seam is glaring.

So the requirement is precise:

- outer edge: unbroken 3–4px black on *every* exterior edge, including up and over the tab
- interior: **no** line under the tab
- crisp mitred corners (no blur, no rounding) — `border-radius: 0` is locked
- must reflow: the body height is driven by content (title, story, player, link), so nothing can be fixed-aspect
- must carry one hard offset shadow for the *whole* composite silhouette, not one per box

### 1.2 Technique A — negative-margin seam removal (*analysis; recommended*)

This is the old CSS tab-strip trick and it is the only approach that satisfies all five constraints with zero filters, zero SVG and zero clipping.

```css
.folder {
  /* no border here — the wrapper only exists for the shadow, see 1.6 */
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
- Mitred corners are real border corners — perfectly crisp.
- Survives text zoom and Italian's longer labels, because `width: max-content` on the tab just grows.
- Works with `border-radius: 0` (which we want) *and* would work with a radius if only the tab's top corners were rounded.
- Keyboard/focus: put the focus ring on `.folder`, not on the two children, or you get two rings.

**The one real gotcha: texture alignment.** The tab and the body are separate painting boxes. If you give each of them a repeating paper texture, the texture will visibly *jump* at the seam, because each box restarts its own `background-position` origin. Three fixes, in order of preference:

1. Keep the card a **flat opaque paper colour** and put the grain on the page background only. Cards read as clean paper *on* a textured desk. Cleanest, cheapest, and the most neo-brutalist answer.
2. `background-attachment: fixed` on both boxes so they sample one viewport-anchored texture — but this has the iOS Safari problem (see §3.4) and makes the texture "swim" while the card scrolls.
3. Give both boxes the texture and correct the tab with `background-position: 0 <tab-height>` — brittle, breaks the moment the tab wraps.

**Verdict: use fix 1.** Flat paper cards on a grainy ground. It also keeps the black keyline maximally crisp — grain under a hard line muddies it.

### 1.3 Technique B — `clip-path` on a single element (*analysis; do NOT use here*)

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
| Stacked `filter: drop-shadow(0 0 0 #000)` (4–8 of them at ±2px) to fake a stroke | Produces a *blobby, rounded* outline, not mitred corners — it is a dilation of the alpha channel, so every sharp corner comes back radiused. It is also 4–8 separate filter passes per card; on a list of folders on a mid-range phone this is the single most expensive thing on the page. Directly contradicts "hard keyline". |
| SVG `feMorphology` `dilate` | Same rounding problem (dilation uses a rectangular/round structuring element) and it also dilates the *content*, not just the frame. |
| `paint-order: stroke fill` | Text only. Does not apply to boxes. Useful for sticker *lettering* (see §2), not for the folder. |

**Conclusion: `clip-path` is the right tool for un-outlined shapes (torn paper edges, colour blocks) and the wrong tool for an outlined folder.** Reserve it for the torn-edge decorations in §5.

### 1.4 Technique C — SVG frame (*analysis; use only for the hand-drawn variant*)

Draw the entire folder outline as one `<path>` with `fill: var(--paper); stroke: #000; stroke-width: 8` (a centred stroke straddles the path, so 8 reads as 4 outside) and position HTML content on top.

**Pros:** one genuinely continuous outline including the tab, perfect control, and — the real reason to choose it — you can make the path *wobble*, i.e. a hand-drawn folder rather than a geometric one. That is a strong scrapbook move.

**Cons, and they are decisive for the default case:**

- It does not reflow. A folder behind variable-height content needs `preserveAspectRatio="none"`, which **distorts the stroke**: stretch a square SVG to 3:1 and the vertical strokes become three times thinner than the horizontal ones. Instantly visible with a 4px keyline.
- `vector-effect="non-scaling-stroke"` fixes the *width* but not the *shape* — the tab's proportions still stretch.
- `border-image` with an SVG source and a 9-slice *does* stretch the middles while preserving corners — but a 9-slice grid cannot express a tab, because the tab lives in the middle of the top edge, which is precisely the region a 9-slice stretches.

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
- Anything that *overflows* the folder — a tape strip poking past the edge, a sticker rotated off-corner — will also get the shadow. For tape and stickers this is usually **desirable** (they should cast the same hard shadow, they are physically on top of the paper). Check it deliberately rather than by accident.

Alternative without `filter`, if you hit a stacking-context problem: give the body `box-shadow: 8px 8px 0 #000` and the tab `box-shadow: 8px 0 0 #000` (right side only, no vertical offset) and ensure the body paints above the tab's shadow. It works but it is more fragile than `drop-shadow`.

### 1.7 Accessibility: it looks like a tab UI and must not be one

This is the trap that matters most and is the easiest to get wrong. The visual metaphor is tabs; the semantics are **not** tabs.

- **Do not** use `role="tablist"` / `role="tab"` / `role="tabpanel"`. Those roles promise arrow-key navigation between mutually exclusive panels. A list of works is not that. A screen-reader user would be told "tab 1 of 6, selected" for content that is simply always visible.
- Correct markup: `<ul>` of `<li>`, each containing an `<article>`. The tab label is a heading (`<h3>`) or, if it duplicates the title, is `aria-hidden` decoration.
- If the tab carries the work's *number* or *year*, that is decorative repetition — hide it from AT and keep the real title in the heading.
- Give `.folder` a single visible `:focus-visible` outline. With a black keyline everywhere, a black focus ring is invisible — use the **cantaloupe `#F79E76`** or blue `#3866A8` at 3px with a 2px offset, or better, a double ring (white then blue) so it reads on both paper and colour blocks.

### 1.8 Mobile: is a folder *stack* a usability trap at 375px? — **Yes. Honest verdict below.**

A stacked / overlapping filing-cabinet metaphor at 375px fails on five counts:

1. **Tab collision.** A row of tabs needs horizontal room that does not exist. Italian labels are longer (see §4). Tabs either truncate or wrap, and a wrapped tab breaks the seam trick in §1.2 (a two-line tab is fine, but a tab wider than the body is not).
2. **Overlapping hit targets.** WCAG 2.2 *Target Size (Minimum)* wants 24×24 CSS px; practical guidance is 44px. Overlapped cards put a tappable card under another tappable card, and the top one wins in ways users cannot predict.
3. **Hidden content requires state.** A peek-and-expand stack needs JS, `aria-expanded`, focus management, and a way back out. That is a lot of machinery for a three-page site.
4. **It imposes a false hierarchy.** A stack says "this one is on top / current". In a portfolio every work is equally on offer. The metaphor actively lies about the content model.
5. **It fights the hard shadow.** Overlapping cards each carrying an 8px hard black shadow produces a mess of black bars between cards at small sizes.

**What to build instead (the compromise worth having):**

- On mobile, **break the stack**. One Song = one full-width folder, vertically stacked, generous gap (`clamp(2rem, 8vw, 4rem)`), cover image above the text block.
- Keep the *per-card* folder metaphor intact — tab, keyline, taped cover, hard shadow. The metaphor survives; only the stacking dies.
- Optional and cheap: let consecutive folders overlap by **only the tab height** (~36–40px) with **alternating tab positions** so tabs never collide. Every folder body remains fully visible; the tabs interleave like a real drawer. This is the one form of "stack" that is honest at 375px.
- Reduce the shadow offset on mobile (`8px → 5px`) so it stays proportional and stops eating the gutter.

```css
.folder { --shadow: 8px; }
@media (max-width: 640px) { .folder { --shadow: 5px; } }
```

### 1.9 What the published literature actually says

**`clip-path` clips borders — confirmed in writing.** freeCodeCamp, *How to Apply Borders to Clip Paths with CSS* (Michael Frederick, 12 Apr 2023) [VERIFIED] states plainly that the CSS `border` property does not work with clip-paths, because borders render around the rectangular container rather than following the clipped edge. Its own solution is exactly the fragile one I flag in §1.3 — stack two clipped elements, a larger coloured one behind a smaller background-coloured one — and it uses `repeating-linear-gradient` and an SVG `background-image` overlay to fake dashed edges. Useful confirmation; not a technique to adopt for a 4px keyline.
<https://www.freecodecamp.org/news/apply-borders-to-clip-paths-with-css/>

**The modern `shape()` approach, and its blind spot.** Chris Coyier, *Modern CSS Round-Out Tabs* (13 Oct 2025) [VERIFIED] — originally on the Frontend Masters blog, now redirecting to `blog.master.dev` — builds a tab profile in one element with the new `clip-path: shape()` function, replacing an older method that needed four extra elements per tab:

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

Critically, **the article never addresses borders or outlines** — it is an un-outlined, filled tab. That is precisely the gap our design falls into. `shape()` is elegant for a filled tab and useless for an outlined one.
<https://blog.master.dev/modern-css-round-out-tabs/>

`shape()` itself is **Baseline 2026, newly available since February 2026** per MDN [VERIFIED] — usable, but new enough that it should not be load-bearing on a client site shipping now.
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

But MDN states it is **Limited availability / not Baseline** — "does not work in some of the most widely-used browsers". So: **do not ship on it, watch it.** `corner-shape: bevel` on a folder tab is the eventual clean answer to §1.5's trapezoid problem. Today it is a progressive enhancement at best (`@supports (corner-shape: bevel)`).
<https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape>

**Not reached:** `codepen.io/uffou/pen/jzzyvB` ("Cool CSS Folder Tabs", reportedly skew-transform based) returned **HTTP 403** to automated fetch [BLOCKED]. Other folder/index-card pens surfaced in search but were not opened — treat as UNVERIFIED: `codepen.io/faelpatrick/pen/GRedNmR`, `codepen.io/teddyzetterlund/pen/YPjEzP`.

**Honest gap:** I did not find a *shipped, live, production* site using a manila-folder metaphor with hard outlines. The metaphor appears constantly in dribbble/pinterest-tier concept work (both hosts block automated access [BLOCKED]) and rarely in production. Two readings of that: either it is under-explored and therefore distinctive, or it is repeatedly abandoned at build time because of the seam-and-border problem described above. Given that §1.2 solves the problem in nine lines of CSS, I lean strongly toward the first reading — **this is a genuine differentiator, not a trap**, provided the stack is dropped on mobile (§1.8).

---

## 2. Tape, stickers and scrapbook devices

*(Research pending.)*

---

## 3. Paper texture backgrounds

*(Research pending.)*

---

## 4. Typography for ultra neo-brutalism

All font metadata below is **[VERIFIED]** against the upstream `google/fonts` repository `METADATA.pb` files (`raw.githubusercontent.com/google/fonts/main/ofl/<family>/METADATA.pb`), which is the authoritative source for subsets and variable axes — not from a specimen page or a blog list.

### 4.1 What actually recurs on shipped neo-brutalist sites

Two surveys read in full [VERIFIED]:

- Kristi.Digital, *My Favourite Fonts for Neobrutalist Web Design* — names **Sora, Epilogue, Syne, Bricolage Grotesque, Plus Jakarta Sans, Darker Grotesque, Archivo Black, Anton, Climate Crisis**. Describes Syne as "a Geometric Sans Serif font that gets wider as it gets heavier", Bricolage Grotesque as a neo-grotesque with playful ascenders/descenders, Anton as a "90s newspaper headline or retro ad poster feel". <https://blog.kristi.digital/p/my-favourite-fonts-for-neobrutalist-web-design>
- A second survey pass names **Archivo Black** as "the king of neobrutalist fonts… used by default in neobrutalism designs", plus **Oswald**, **Rubik** and **Barlow**.

Add the obvious incumbent the lists under-report: **Space Grotesk** is the de-facto default of the whole genre. If you pick it for display you will look like everyone else.

The pattern is consistent: *heavy neo-grotesque or geometric sans, quirky detail, high weight, low or negative tracking.*

### 4.2 The two Italian constraints — and one nobody mentions

**(a) Length.** Italian runs roughly 10% longer than English on average, but the variance at *short string* lengths is far worse than the average suggests, and short strings are exactly what a brutalist design sets huge:

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

Nav labels and buttons are where this bites, not paragraphs. Since Italian is the **default** here, design to the Italian string and let English be the one that has slack — the opposite of the usual habit.

**(b) Latin Extended is mandatory.** Italian needs à è é ì í î ò ó ù ú. Every family recommended below is `[VERIFIED]` to carry a `latin-ext` subset. In `next/font/google` you must write `subsets: ['latin', 'latin-ext']` — with `['latin']` alone the accented glyphs fall back to a system font *mid-word*, producing a visible letterform mismatch inside words like "città". **This is the single most common Italian-site typography bug.**

**(c) The one nobody mentions: accents above cap height.** All-caps display type is the neo-brutalist default, and Italian all-caps carries diacritics **above the cap height**: `È À Ù Ò É Ì`. Real strings that will appear on this site: `PERCHÉ`, `PIÙ`, `È`, `PERÒ`, `CITTÀ`, `UNIVERSITÀ`. A hero set at `line-height: 0.82` — normal for this style — will **clip or collide** those accents against the line above.

Mitigations, in order:
1. Never go below `line-height: 0.9` on all-caps display text containing Italian.
2. Or set the hero in **sentence case**, which is also better Italian typography — Italian does not use Title Case For Headings the way English does. "Chi sono", not "Chi Sono".
3. Or reserve space explicitly: `h1 { padding-block-start: 0.08em; }`.
4. Test string to paste into every candidate at final hero size: **`ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ`**. If it clips, the pairing fails regardless of how good it looks in English.

Also: the lazy Italian keyboard habit is to type `E'` for `È`. Use the correct `È` in all copy — an apostrophe next to a giant display glyph looks like a mistake, because it is one.

### 4.3 Are heavy condensed grotesques right here, or a cliché to avoid?

**Half-right. Use condensed as a role, never as the system.**

For: condensed solves the Italian length problem for free — it is the only typographic lever that buys you 20% more characters at the same optical size, and Anton/Oswald/Big Shoulders are all `latin-ext`-complete.

Against: heavy condensed grotesque *is* the neo-brutalist house style, to the point that Anton is arguably the most-used free display face on the web. It has crossed from "idiomatic" into "template". A site for a *musician* built entirely on Anton will read as a gig-poster generator.

**Verdict:** allow condensed in exactly one role — either the giant name in the hero, or the small all-caps eyebrow labels (`01 / ASCOLTA`), **not both**. And strongly prefer a **variable `wdth` axis** over a fixed condensed face, so one font file gives you `wdth: 78` for a long Italian heading and `wdth: 100` for the nav. Archivo (62–125), Bricolage Grotesque (75–100), Instrument Sans (75–100) and Martian Mono (75–112.5) all offer this. A fixed condensed face does not.

### 4.4 Four concrete pairings

#### Pairing 1 — **Bricolage Grotesque + Instrument Sans + Azeret Mono** ← my pick

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Bricolage Grotesque** | Mathieu Triay · sans-serif · `latin, latin-ext, vietnamese` · axes **`opsz` 12–96, `wdth` 75–100, `wght` 200–800** |
| Body | **Instrument Sans** | Rodrigo Fuenzalida & Jordan Egstad · sans-serif · `latin, latin-ext` · axes **`wdth` 75–100, `wght` 400–700** |
| Mono | **Azeret Mono** | Displaay / Martin Vácha · monospace · `latin, latin-ext` · axis **`wght` 100–900** |

**Why it suits a young Italian musician fresh out of school.** Bricolage Grotesque is a deliberately *imperfect* grotesque — irregular ascenders and descenders, slightly off-key proportions. It reads DIY, printed, photocopied, which is the scrapbook register the whole design is chasing, without wearing a costume. It is the only face on this list whose personality comes from craft rather than from volume, which matters for someone presenting themselves as a serious young professional rather than shouting.

The two variable axes are the real argument. `wdth 75` gives a free condensed for the long Italian headings — you solve §4.2(a) inside one font file. And `opsz 12–96` means the 96px hero and the 13px folder-tab label are **optically different cuts**, not one outline scaled up and down: heavier hairlines and looser spacing at small sizes, tighter and more refined at display sizes. That is the single biggest free quality jump available on Google Fonts, and almost nobody uses it.

Azeret Mono is squarer and colder than Space Mono and carries far less baggage — right for tab labels, track durations, year stamps, and the `01 / 02 / 03` folder numbering.

**Caution.** Bricolage's quirk competes with tape, doodles and stickers — you cannot have a loud typeface *and* a loud decoration layer without the page fighting itself. Discipline: **Bricolage at display sizes only, never in running copy.** Also, `next/font/google` ships weight-only unless you declare the axes explicitly (`axes: ['opsz', 'wdth']`); forget that and you silently lose the two features you chose the face for.

#### Pairing 2 — **Anton + Public Sans + Space Mono** (the loud poster route)

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Anton** | Vernon Adams · display · `latin, latin-ext, vietnamese` · **single weight 400, no variable axes** |
| Body | **Public Sans** | USWDS / Dan Williams / Impallari / Fuenzalida · sans-serif · `latin, latin-ext, vietnamese` · axis `wght` 100–900 |
| Mono | **Space Mono** | Colophon Foundry · monospace · `latin, latin-ext, vietnamese` · static 400/700 + italics |

**Why.** Maximum volume for zero effort, and being condensed it absorbs Italian length. It reads flyposter / gig poster / record-shop window, which is genuinely on-brief for a musician in a way that a tech-startup grotesque is not. Public Sans is deliberately plain civic-service type — a good, uncompetitive foil that will never fight the display face.

**Caution.** Anton has **exactly one weight**. You cannot build a type scale from it; every level below H1 must come from Public Sans, so the system has a hard seam in the middle. Its internal leading is tight and its accents sit high — this is the pairing most likely to fail the `ÈÀÙ PERCHÉ` test, so check it first. And it is ubiquitous.

#### Pairing 3 — **Fraunces + Space Grotesk** (the editorial / musician route)

| Role | Family | Verified metadata |
|---|---|---|
| Display | **Fraunces** | Undercase Type, Phaedra Charles, Flavia Zimbardi · **serif** · `latin, latin-ext, vietnamese` · axes **`SOFT` 0–100, `WONK` 0–1, `opsz` 9–144, `wght` 100–900** |
| Body | **Space Grotesk** | Florian Karsten · sans-serif · `latin, latin-ext, vietnamese` · axis `wght` 300–700 |

**Why.** A high-contrast display *serif* inside a hard-black-keyline brutalist frame is the least-copied move available, and it reads **musician** — concert programme, record sleeve, conservatory diploma — rather than SaaS landing page. Fraunces' `WONK` axis switches on the eccentric alternates (the swashy `g`, angled terminals) and `SOFT` softens the joins; at `WONK 1, SOFT 60, wght 900` it is one of the most characterful faces on Google Fonts, full stop. It is also the pairing that best fits "fresh out of music school" without being either corporate or childish.

**Caution.** It is a serif, and thin strokes look weak next to a 4px black keyline — it must be used **heavy (700–900) and large**, never at 18px. Four axes also means a fat variable file, so declare only the axes you actually animate/use. And Space Grotesk in the body slot is the genre cliché — acceptable, because nobody notices a body face, but do not promote it to display.

#### Pairing 4 — **Archivo (whole superfamily) + Martian Mono** (the systematic route)

| Role | Family | Verified metadata |
|---|---|---|
| Display + Body | **Archivo** | Omnibus-Type · sans-serif · `latin, latin-ext, vietnamese` · axes **`wdth` 62–125, `wght` 100–900** |
| Mono | **Martian Mono** | Roman Shamin / Evil Martians · monospace · `latin, latin-ext, cyrillic, cyrillic-ext` · axes **`wdth` 75–112.5, `wght` 100–800** |

**Why.** One file covers everything from Archivo Condensed Thin to Archivo Expanded Black — including the Archivo Black that every neo-brutalist site reaches for, already inside the range. `wdth 62` is a real condensed for long Italian headings; `wdth 125` is a real expanded for a wide hero name. Smallest total font payload of the four options and the most controllable type scale. Martian Mono is very wide and very brutal — excellent for a marquee ticker strip.

**Caution.** This is the *safe* answer. Archivo is a well-mannered, slightly Swiss workhorse; on its own it reads systematic and corporate, not scrappy. **All** the personality then has to come from layout, colour blocks and the paper devices. If the decoration budget gets cut late, this pairing has nothing in reserve.

#### Optional fifth voice — handwriting for the marginalia

**Caveat** (Impallari Type · handwriting · `latin, latin-ext, cyrillic, cyrillic-ext` · axis `wght` 400–700) [VERIFIED] is the least clip-arty handwriting face on Google Fonts, and unlike most of them it is **variable**, so the annotations can vary in pressure. Rules if used: never more than ~8 words at a time, never load-bearing information, never below 18px, and keep it out of anything a screen reader needs to read carefully. Handwriting faces are measurably harder for dyslexic readers — this is decoration with a text alternative, not content.

### 4.5 Verdict on the proposed **DM Sans + Space Mono**

Verified metadata first, because DM Sans is better than its reputation:

- **DM Sans** — Colophon Foundry · sans-serif · `latin, latin-ext` · axes **`opsz` 9–40, `wght` 100–1000** [VERIFIED]
- **Space Mono** — Colophon Foundry · monospace · `latin, latin-ext, vietnamese` · static 400/700 + italics, **no variable axes** [VERIFIED]

**Verdict: competent, and too tame for "ultra neo-brutalist".** Three specific reasons, not vibes:

1. **The letterforms are drawn, not cut.** DM Sans is a geometric neo-grotesque with soft, closed, friendly terminals and near-circular bowls. Even at `wght 1000` — and it does genuinely go to 1000 — it stays affable. Ultra neo-brutalism needs a face that looks stamped or cut. DM Sans always looks *considered*, which is the opposite register.
2. **No width axis.** `opsz` + `wght` only. So the Italian-length problem (§4.2a) can only be solved by reducing `font-size`, which directly costs you the impact the whole style depends on. Every other display candidate here gives you width for free.
3. **Two faces from the same foundry that are neither a system nor a contrast.** DM Sans and Space Mono are both Colophon. They are not related enough to read as a superfamily, and not different enough to read as a deliberate clash. It is the least interesting possible distance between two faces. Space Mono is also the single most over-used "we're being edgy" mono on the web, sitting right beside Space Grotesk.

**What I would actually do: keep DM Sans, demote it.** It is an excellent body face — `latin-ext`, a real `opsz` axis, superb legibility at 16–18px, and it will handle Italian body copy beautifully. Make it the **body**, put a face with a voice in the display slot (Bricolage Grotesque or Fraunces), and swap Space Mono for **Azeret Mono** (colder, squarer, far less common) — or **DM Mono** if you specifically want the mono to sit inside the DM system.

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

- `subsets: ['latin', 'latin-ext']` — omit `latin-ext` and accented Italian glyphs fall back mid-word.
- Non-`wght` variable axes must be listed in `axes` or they are dropped from the build.
- `next/font/google` downloads and self-hosts at build time, so **there is no runtime request to Google** — worth stating on the legals page, because it means fonts create no third-party data transfer and no consent obligation.
- Keep `adjustFontFallback` on (default) and preload only the display face. With a hero this large, a mismatched fallback metric is a very visible CLS hit.

---

## 5. Photography in a neo-brutalist system

*(Research pending.)*

---

## 6. Motion vocabulary

*(Research pending.)*

---

## Reference table

| Site | URL | Why it matters | What to steal |
|---|---|---|---|
| *(pending)* | | | |

---

## Recommendations

*(Pending.)*

---

## Open questions

*(Pending.)*
