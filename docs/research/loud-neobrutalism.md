# Loud neo-brutalism / new-ugly — live site survey

**Status:** Complete.
**Date:** 2026-09-04
**Purpose:** Reference research for the Anna Milazzo landing page. The client sent four
reference comps (Robin / Valor / Xova / Sound Wave). This document finds real, currently
shipped sites in the same idiom, measures their design tokens from the live CSS, and
catalogues the devices in enough detail to rebuild them.

## Method and honesty notes

- Every site listed here was **actually loaded** in a headless browser at 1440x900 and
  measured by walking the DOM: background colour weighted by painted area, border widths
  and colours, `box-shadow` strings, border radii, font families and the largest rendered
  text on the page. Nothing here is recalled from memory.
- Screenshots were not available in this environment (the browser pane does not composite
  frames), so **colour readings are from computed styles, not from pixels**. That means
  colour delivered via background images, SVG fills or canvas is under-counted. Where a
  site is largely image-driven the numbers say so and I flag it.
- `% saturated` = share of total painted background area whose colour has HSV saturation
  above 0.25. It is the closest measurable proxy for "how much of the page is coloured
  surface vs neutral ground". Anything above ~35% reads as a genuinely colour-led page.
- Dribbble and Pinterest block scraping and were not used. Awwwards, Godly, Land-book and
  Lapa Ninja were fetchable.

---

## 1. The sites

### Music industry — the target category

#### 1.1 Seabass Vinyl — vinyl pressing plant, Scotland
`https://seabassvinyl.com/` (Awwwards Honorable Mention, studio: Studio Form)

The single most directly transferable reference in the whole survey: an actual
music-manufacturing business, colour-forward, and unmistakably professional.

Measured tokens:

| token | value |
|---|---|
| ground | `#F3F2EF` warm off-white — 41.8% of painted area |
| hues | 6 + black: acid yellow `#ECFB5C` (9.9%), slate `#798591` (9.8%), tan `#E3D6C9` (5.2%), orange `#EC673D` (1.7%), deep teal `#1E4857` (1.0%), cyan `#4DABC4` (0.8%) |
| black | `#000` 14.9% + near-black `#151515` 4.6% |
| coloured surface | **13.4% saturated** — colour is deployed as punctuation, not as ground |
| borders | 1px only (`1px #000`, `1px rgba(0,0,0,.5)`) — no thick keylines |
| shadows | **none at all** |
| radii | 30px pills, 50% circles |
| display face | Eurostile, uppercase, hero at **124.6px / line-height 1.0** |
| body face | Forma Neretta |
| page | 8272px tall, contains a marquee |

What it proves: you can run acid yellow and orange against a warm neutral and stay
credible **because the coloured area stays under ~15%** and the type does the shouting.
Eurostile at 124px uppercase with `line-height: 1` is the whole personality. There are no
offset shadows and no 3px keylines anywhere — this is colour-led, not neo-brutalist, and it
is the more "expensive" register of the two.

#### 1.2 Poolsuite — internet radio / music brand
`https://poolsuite.net/` (formerly poolside.fm; poolside.fm 301s here)

Music-specific and playful, but in the retro-computing corner rather than neo-brutalism.

| token | value |
|---|---|
| palette | `--primary:#f7d5d5` dusty pink, `--secondary:#faf1e8` cream, `--tertiary:#faf5c6` pale yellow, `--secondary-button:#afe5dd` mint — pastel, 4 hues, none saturated (0.0% by the >0.25 test) |
| borders | 1px black, 10 elements |
| shadows | inset bevel stacks — `inset 1px 1px 0 #fff, inset 0 0 0 1px rgba(0,0,0,.2), inset 0 -11px 0 rgba(0,0,0,.2)` — i.e. faked 3D chrome, not offset drop shadows |
| radii | 4px / 6px / 2px — tiny |
| faces | Pixolde (pixel display), ChiKareGo2 (pixel), Everyday, Ishmeria; largest text only 32px |
| motion | 52 animated elements, `flashing-dots`, `ping` |

Relevant device: **pixel display face + pastel + 1px keyline** — the REF A "ROBIN in a
pixel slab" move, executed by a real music brand. But note Poolsuite never goes big with
type (32px max) because its whole conceit is a desktop UI. Don't copy the restraint on
type; do copy the pixel-face-as-brand-voice idea.

#### 1.3 Stones Throw Records — label, Los Angeles
`https://www.stonesthrow.com/`

A famous, credible independent label. Measured, it is almost the opposite of the comps —
useful as the "how little you can get away with" bound.

| token | value |
|---|---|
| ground | `#F9F9F9` 43.8%, black 24.3%, white 5.7% |
| single accent | **orange `#FF8900`, 16.7% of painted area** — one hue, that's it |
| borders | 1px orange (36 uses), 1px black (14) — the orange keyline is the whole brand device |
| shadows | none |
| face | General Sans Variable, weights 400/500/600; largest text only 36px |

Lesson: Stones Throw buys credibility with exactly **one saturated hue used as a keyline
colour**, which is a cheap and very durable move. It is also, frankly, a bit dull. The comps
want the opposite end. Knowing where the floor is helps calibrate the ceiling.

#### 1.4 C2C Festival — Turin, Italy
`https://clubtoclub.it/`

Italian, music, and famous — but it is in the **cold** brutalist branch, not the loud one.

| token | value |
|---|---|
| palette | white 79.7%, black 20.1%. One stray green `#1CC691`. **0.0% saturated surface** |
| face | Metodo Black (weight 900), uppercase, nav items at **80px** |
| borders | none |
| shadows | one soft `0 8px 48px rgba(0,0,0,.15)` |
| radii | 32px / 64px |

Worth recording because it is the default register for European electronic-music festivals:
monochrome, enormous grotesque, no ornament. Anna Milazzo's brief deliberately rejects this.
Naming it explicitly is useful — it is what the loud direction is *not*.

#### 1.5 Le Guess Who? — festival, Utrecht
`https://leguesswho.com/`

| token | value |
|---|---|
| palette | black 85.8% / white 14.2%. Zero colour on the landing view. |
| face | Neue Montreal Squeezed, weight 600 |
| borders | 2px white on two elements |

Same cold branch as C2C. Confirms the pattern rather than adding to it.

---

### Loud idiom — measured exemplars (non-music, but the tokens transfer)

#### 1.6 Feastables — MrBeast's chocolate brand
`https://feastables.com/`

The purest live example of the REF B / REF C register found in this survey, and the one
whose numbers you should copy.

| token | value |
|---|---|
| ground | cyan `#72E2FF` at **84.2% of painted area** — a full-bleed saturated ground, not an accent |
| hues | 7: `#72E2FF`, `#15CCFF`, `#58DCFF` (three cyan steps), cream `#F2EBE0`, magenta `#FF2F9F`, lime `#CDFC18`, purple `#67318F` |
| coloured surface | **91.6% saturated** |
| borders | `3px #000` (35 uses) and `4px #000` (15 uses) — a **two-step keyline scale**, plus 3px/4px white for keylines on dark |
| shadows | mostly `0 0 0 0` placeholders plus a soft `0 3px 16px rgba(0,0,0,.25)` — note: **Feastables does not use hard offset shadows** |
| radii | 6px, 8px, 16px, 9999px — four steps |
| display | Kanit 900, uppercase, hero at **300px with line-height 195px (0.65)** |
| motion | 42 animated elements: `scrolling` 22.7s (marquee), `float` 5s, `wiggle` 2s, `spin` 1s, `textShadowGrowDesktop` 5s |
| page | 7603px |

Two things to steal:
1. **The three-step cyan.** `#15CCFF / #58DCFF / #72E2FF` are the same hue at three
   lightnesses. Sections alternate between them, so the page reads as varied without ever
   introducing a second hue at ground scale. The saturated accents (magenta, lime, purple)
   only ever appear at badge/sticker size. This is how you get "loud" without "chaotic".
2. **line-height 0.65 at 300px.** The display type is set tighter than its own cap height
   band. This one number does more for the "expensive" read than any ornament on the page.

#### 1.7 Curry Cafe — Indian restaurant
`https://curry.cafe/`

| token | value |
|---|---|
| hues | **only 3 + white**: yellow `#EFEA45` (77.9%), orange `#FF6C2C` (12.5%), green `#40AC49` (0.4%) |
| coloured surface | **90.8% saturated** |
| borders | `4px #FF6C2C` (11 uses), `12px #EFEA45` (1), `2px #FF6C2C` (1) — **the keyline is orange, not black** |
| shadows | **none** |
| radii | one 20px |
| type | geometriaExtraBold uppercase 100.8px / letter-spacing 2px; second display cut at 57.6px / **letter-spacing 8px**; body in `archiveMono` and `akkuratBoldItalic` |
| motion | `tickerRight` 25s and `tickerLeft` 25s — **two marquees running in opposite directions** |
| texture | noise/grain present |
| page | 7029px |

The important lesson: three hues is enough. Curry Cafe is at least as loud as Feastables on
half the palette, because it commits — one hue owns 78% of the page and the second is used
only for keylines and type. And its keylines being *orange on yellow* rather than black is
the more sophisticated move: black keylines are the default, so they read as the template.

#### 1.8 Gumroad — creator commerce (the original poster child)
`https://gumroad.com/`

Worth measuring precisely because Gumroad **is the site everyone cites as neo-brutalism, and
it has quietly abandoned the style.** What is actually shipped today:

| token | value |
|---|---|
| ground | `#F4F4F0` off-white 53.8% + white 41.8% |
| accents | black 2.3%, yellow `#FFC900` 1.9%, chartreuse `#F1F333`, red `#DC341E`, pink `#FF90E8` — all under 2% |
| coloured surface | **2.1% saturated** |
| borders | 1px only. `1px oklch(0.872 0.01 258)` (102 uses), `1px #000` (20) |
| shadows | **none** |
| radii | pill (`9999px`, 123 uses), 4px, 16px, 24px |
| type | ABC Favorit; oversized numeral **`$2,193,086` at 192px / line-height 172.8px (0.9) / letter-spacing -0.4px**; headings 96px and 72px |
| motion | `marquee` 60s, `parallax-scroll` |

So the two devices Gumroad kept from its loud era are exactly the two that survive contact
with a grown-up brand: **the oversized numeral** and **the marquee**. It dropped the 4px
borders, the hard shadows and the pastel blocks. That is a strong signal about which devices
have durable value and which read as of-the-moment.

### More music-industry sites, measured

#### 1.9 Boiler Room — live-broadcast music platform
`https://boilerroom.tv/`

| token | value |
|---|---|
| palette | black 61.1%, `#131313` 26.6%, grey 8.9%, white 0.9%; traces of green `#53BD5B` and yellow `#FFE704` |
| coloured surface | **1.8% saturated** |
| borders | `1px #333` (35), `1px #fff` (28) — hairlines only |
| radii | 2px |
| type | Univers 400/700; **largest text on the page is 24px** |
| motion | 128 animated elements, all `skeletonPulse` / `fadein` / `lightPulse` — loading states, not decoration |

Boiler Room is one of the loudest brands in music and its site is a black grid with 24px
Univers. This is the dominant pattern in music: **the brand's colour lives in the artwork
and the poster, and the site is the neutral vitrine that holds it.** Any loud direction has
to consciously beat this convention, which means the loudness must look like a decision.

#### 1.10 Refuge Worldwide — community radio station, Berlin
`https://refugeworldwide.com/`

**The best single music-industry precedent in this survey for a loud page that stays
credible.** A real, working radio station and record label, and the page is 43% pure red.

| token | value |
|---|---|
| ground | pure red `#FF0000` at **42.7% of painted area**, black 19.5%, a 10%-black scrim 34.2% |
| hues | 3: red `#FF0000`, green `#08C900` (2.7%), orange `#FF9300` (keyline only) |
| coloured surface | **45.5% saturated** |
| borders | `1px #000` (34 uses), `2px #000` (12), `2px #FF9300` (1) — **thin**, not 3-4px |
| shadows | `0 2px 0 #000` on 6 elements, `0 2px 0 #FF9300` on 1 — a hard shadow that is **2px, downward only, no x-offset** |
| radii | `9999px` pills, 41 uses, and nothing else |
| display face | **bely-display, a serif** — headlines at 36px / line-height 40px |
| body face | Visuelt, weights 300 and 500 |
| page | 2898px — short |

Three moves worth stealing verbatim:

1. **Pure `#FF0000`, no apology, at ground scale.** Not a tasteful vermilion — the raw
   sRGB primary. Committing to a primary reads as a decision; a mixed-down "brand red"
   reads as a compromise.
2. **The hard shadow is `0 2px 0`, not `4px 4px 0`.** No x-offset, small y-offset. It reads
   as a printed keyline / letterpress bite rather than as the neo-brutalism template
   default. This is the single most transferable "how not to look like a Figma kit" detail
   in the whole survey.
3. **A serif for headlines on a screaming red ground.** The colour does the shouting and
   the typeface does the credibility. Every amateur version of this style reaches for a
   fat geometric sans and ends up looking like a children's app.

#### 1.11 Lowlands — festival, Netherlands
`https://lowlands.nl/`

| token | value |
|---|---|
| ground | lilac `#C2ADCA` at **97.7% of painted area** — one non-neutral colour owns the entire page |
| other | white 1.6%, black 0.6%, navy `#1B1464` |
| coloured surface | 0.0% by the >0.25-saturation test — **the metric fails here**: lilac is only 0.14 saturated but is unmistakably a colour ground. Read it as "97.7% coloured, low chroma" |
| borders | `1px #000`, 3 uses. Effectively none |
| shadows | soft only (`0 2px 10px -3px #999`) |
| radii | 50px, 25px pills |
| display face | **`LL25 ColorBender` — a bespoke variable display face commissioned for the 2025 edition and named after it**; workhorse is Bruta Condensed (Plau), UI in Averta |
| page | 15303px |

The device to note is not on the page, it's in the font stack: Lowlands **commissions a new
display cut every edition**. That is how a festival stays loud year after year without the
identity going stale — the ornament budget goes into one bespoke typeface rather than into
scattered stickers. For a single musician this is out of budget, but the principle scales
down: **spend the whole personality budget on one custom thing, not on ten stock ones.**

#### 1.12 Kappa FuturFestival — festival, Turin, Italy
`https://www.kappafuturfestival.it/`

| token | value |
|---|---|
| palette | white 96.2%, `#F7F7F7` 2.8%, black 0.2%. Colour arrives only in photography |
| borders | 1px translucent greys |
| radii | 20px (31), 8px (26), 99px (19), 32px (7) |
| face | **Suisse Int'l** only, weights 300/400/500/700 |
| hero | 80px / **line-height 72px (0.9) / letter-spacing -3px**, uppercase |
| page | 7739px, contains a marquee |

An Italian dance festival at real scale, and its site is white with Suisse Int'l. Recorded
here as the Italian-market baseline that a loud direction has to justify itself against.


#### 1.13 GT Maru — typeface specimen site, Grilli Type
`https://gt-maru.com/`

Not music, but **the most expensive-looking site in this survey and the best proof of the
"restraint inside loudness" thesis.**

| token | value |
|---|---|
| ground | white 49.9% / blue `#0068FF` **49.8%** — an exact half-and-half split |
| accent hues | 8, all at **0.0% of area**: `#FF9400`, `#00BF3A`, `#83BBFF`, `#FA97FF`, `#FF8080`, `#FFC800`, `#05CF9C`, `#FFFF55` |
| coloured surface | 50.1% |
| borders | **`3px #000` and nothing else.** One token, 10 uses. No 1px, no 2px, no 4px |
| shadows | **none** |
| radii | 10px (10 uses), 30px (1) |
| display | GT Maru Mega at **288px / line-height 224.6px (0.78)**; GT Maru at 230.4px with **letter-spacing −14.5px (−0.063em)** |
| emoji | ships **GT Maru Emoji** and **GT Maru Emoji BW** — a bespoke emoji typeface matched to the text face |
| motion | 53 animated elements; the drifting `cloud` animations run at **65s, 78s, 92s, 103s and 109s** durations; only `dot` is fast (1.3s) |
| page | 5400px |

Five things here are the whole difference between expensive and cheap:

1. **One border token.** `3px #000`, everywhere, nothing else. Not a 1/2/3/4px scale.
2. **Zero shadows.** The page is loud and has no drop shadows at all.
3. **Eight accent hues that occupy no area.** They exist only as small marks. The page reads
   as many-coloured while being structurally two-coloured.
4. **Motion measured in minutes.** 65–109 second drifts. Slow motion reads as atmosphere;
   2–5 second loops read as a loading spinner.
5. **A matched emoji font.** REF A puts emoji inline in the headline. Doing that with the
   system emoji font drops a glossy Apple 3D blob into your flat design and instantly
   cheapens it. Grilli Type solved it by drawing their own. The budget version is to draw
   two or three flat SVG marks and use those instead of real emoji.

#### 1.14 neobrutalism.com — the component kit everyone ships
`https://neobrutalism.com/`

**Measure this one to know exactly what to avoid.** These are the default token values that
make a site legible as "downloaded the kit":

```css
--background: #fff7e8;   /* the cream */
--primary:    #ffdc58;   /* the yellow */
--border:     #000;
--radius:     0;
--chart-1:    #c4a1ff;   /* lavender */
--chart-2:    #01ffcc;   /* mint */
--chart-3:    #e7f192;   /* pale lime */
--chart-5:    #ff30cd;   /* magenta */
```

| token | value |
|---|---|
| borders | **`2px #000` used 423 times.** One width for everything |
| shadows | `2px 2px 0 #000` (115 uses) and `4px 4px 0 #000` (111 uses) |
| type | Space Grotesk 700, uppercase, hero 60px / lh 58.8px / ls −1.5px |
| coloured surface | 9.9% — the kit is mostly cream and white |
| motion | `hero-marquee` at **270s**, `hero-bob` 7s, `hero-blink` 9s |

The fingerprint to avoid is the **combination**: cream `#fff7e8` + yellow `#ffdc58` +
`2px solid #000` + `4px 4px 0 #000` + Space Grotesk + pastel lavender/mint chips. Any one of
those is fine. All of them together is the template, and anyone who has looked at a design
gallery in the last three years will recognise it in under a second.

Note in fairness: their marquee runs at 270 seconds. That is the correct instinct and worth
copying even though the rest is not.

#### 1.15 Dour Festival — festival, Belgium
`https://www.dourfestival.eu/en`

| token | value |
|---|---|
| palette | near-black `#181918` 72.6%, off-white `#E2E1DD` 26.9%, dusty rose `#C98093`, magenta `#FF10CF` |
| borders | `3px #C98093` (1), `2px #C98093` (1) — a **rose keyline, used twice on the whole page** |
| display | `Alfabet Extra Bold` at 80px / line-height 80px (1.0), uppercase |
| motion | `marquee_infinite` at **100s** and **`rainbowColors` at 7s** — a hue-cycling animation |
| page | 3038px |

The device worth stealing is `rainbowColors`: **one element cycles through the whole palette
on a 7-second loop.** It gives you the "many hues" read from a single element without
scattering colour across the layout, and it is four lines of CSS.

#### 1.16 Lydia Amaruch — designer portfolio
`https://lydiaamaruch.com/`

| token | value |
|---|---|
| hero | **340px / line-height 270px (0.794)**, uppercase, custom webfont |
| palette | white 52.5% / `#0F0F0F` 13.1% — monochrome |
| borders | `2px #fff`, 3 uses |
| rotation | 12 elements at exactly **−90deg** (vertical running text) |
| texture | noise/grain present |

Included for one number: **340px at line-height 0.79.** Together with Feastables (300px /
0.65) and GT Maru (288px / 0.78) that gives a firm bracket: display type in this idiom sits
at **280–340px on a 1440 viewport with line-height between 0.65 and 0.80.**

#### 1.17 Rush Hour — record shop, distributor and label, Amsterdam
`https://www.rushhour.nl/`

| token | value |
|---|---|
| palette | `#FAFAFA` 65.2%, white 25.1%, black 4.8%. **0.0% saturated** |
| borders | `1px #ddd` (19), `2px #FAFAFA` (18) |
| type | Titillium Web + FuturaStd Heavy; **largest text 24.5px** |

#### 1.18 Sub Pop Records — label, Seattle
`https://www.subpop.com/`

| token | value |
|---|---|
| palette | white 60.2%, `#F1F2F2` 37.5%. **0.0% saturated** |
| type | **adobe-caslon-pro and arno-pro — serifs**; largest text 24px |
| radii | 100px pills (8), 3px (5) |

Sub Pop's brand voice is famously jokey and its website is Caslon on white at 24px. Rush
Hour is a grey e-commerce grid. Between them, Boiler Room, Stones Throw, C2C, Le Guess Who?
and Kappa Futur, **seven of the nine established music businesses measured here run neutral
or monochrome sites.** That is the convention the brief is breaking, and it is worth being
explicit that it is a deliberate break rather than an oversight.

#### 1.19 Oatly (partial — measurement blocked)
`https://www.oatly.com/en-gb`

Measured behind a cookie scrim, so the colour census is unusable — I did not click the
consent banner. Two readings survive and are worth keeping: Oatly ships **`border: 8px
solid #fff`** (thick *white* keylines, 5 uses) and a bespoke display face, **Margo Pro**, in
weights 400/500/600/700/900. A thick white keyline on a coloured photo is the inverse of the
black-keyline default and looks markedly less templated.

---

## 2. Device catalogue

Everything below was seen running on at least one measured site, or is reconstructed from
the client's four comps with the parameters the measured sites imply.

### 2.1 Marquee strip
**Seen on:** Feastables (`scrolling` 22.7s), Curry Cafe (`tickerLeft` + `tickerRight`, 25s
each), Gumroad (`marquee` 60s), Dour (`marquee_infinite` 100s), neobrutalism.com
(`hero-marquee` 270s), Seabass Vinyl, Kappa Futur.

The single most universal device in the idiom — it appeared on 7 of the sites measured.

Build: duplicate the track content twice, translate the wrapper by −50%, `will-change:
transform`, and wrap it in `@media (prefers-reduced-motion: reduce) { animation: none }`.

```css
.marquee { overflow: hidden; border-block: 3px solid var(--ink); background: var(--acid); }
.marquee__track { display: flex; gap: 2rem; width: max-content;
  animation: slide 60s linear infinite; }
@keyframes slide { to { transform: translateX(-50%); } }
```

**Parameters that matter.** Duration is the whole game. The measured range is 22.7s
(Feastables) to 270s (the kit). Under ~30 seconds it reads as an alert banner and pulls the
eye away from everything else; at 60–100 seconds it reads as a texture the eye can ignore.
**Set 60s minimum for a full-width strip.** Separators are the second decision: Feastables
and Xova (REF C) use a repeated mark (a star, a bullet) between phrases; a bare
comma-separated list looks like a keyword-stuffed SEO footer.

Curry Cafe's two-directional pairing — one strip scrolling left above a strip scrolling
right, both at 25s — is a cheap way to get a lot of energy out of one component, and it is
the version I would use once on the page and never twice.

### 2.2 Four-point star / sparkle
**In the comps:** REF B (magenta four-point star, purple and violet sparkles), REF C (purple
sparkles scattered across sections).

Not present as a live measured device on any of the sites I loaded, which is itself
informative — **the sparkle is the most Figma-ish element in the reference set** and the
sites that look expensive do not use it.

Build: a single path, no library.

```html
<svg viewBox="0 0 100 100" width="48" aria-hidden="true">
  <path d="M50 0 C55 40 60 45 100 50 C60 55 55 60 50 100 C45 60 40 55 0 50 C40 45 45 40 50 0Z"
        fill="currentColor"/>
</svg>
```

The cubic control points are what separate a good four-point star from a clip-art one. Pull
the control points **toward the centre** (as above, at 40/45 of 100) and the arms get a
concave whip that looks drawn. Leave them at the midpoint and you get the generic
"sparkle emoji" silhouette that ships in every icon set.

**Worth it here?** Sparingly. Two, maybe three on the whole page, all the same size, all the
same hue, never rotated at random angles. Scattering eight of them at six sizes is the
clearest single tell of an amateur execution of this style.

### 2.3 Blob shapes
**In the comps:** REF D (giant purple and yellow circles carrying "200+" and "120+").
**Seen live:** neobrutalism.com ships `border-radius: 48% 55%` and `53% 49%` on two
elements — the standard organic-blob trick.

Build, in order of increasing quality:
1. `border-radius: 48% 52% 61% 39% / 45% 51% 49% 55%` — the eight-value form. Free, but
   every blob generated this way has the same lumpy family resemblance.
2. A hand-drawn SVG path. Better, because the curve can have a deliberate asymmetry.
3. **A plain circle.** Honestly the strongest option for the oversized-number use, because
   a perfect circle next to very bold type reads as a design decision, whereas a lumpy blob
   reads as a filter.

**Worth it here?** The circle version, yes — it is the container for the oversized numeral
(2.7) and that pairing is proven. The organic lumpy blob, no.

### 2.4 Concentric arcs / rainbow
**In the comps:** REF B (rainbow concentric arcs in the corner).
**Seen live:** nothing measured used them. Dour's `rainbowColors` 7s hue-cycle is the same
idea expressed as motion instead of geometry.

Build as nested `<circle>` with `stroke` and no fill, clipped by the section:

```html
<svg viewBox="0 0 200 100" width="240" aria-hidden="true">
  <g fill="none" stroke-width="14">
    <circle cx="0" cy="100" r="40" stroke="var(--c1)"/>
    <circle cx="0" cy="100" r="54" stroke="var(--c2)"/>
    <circle cx="0" cy="100" r="68" stroke="var(--c3)"/>
  </g>
</svg>
```

**Parameters that matter.** The stroke width must equal the gap between radii (here 14 and
14) so the arcs read as a solid printed rainbow rather than as stripes with air between
them. Anchor the centre **outside the viewport corner** so only a quadrant shows — a full
rainbow arc floating in the middle of a section is a 1970s clip-art motif.

### 2.5 Ribbon / flowing wave
**In the comps:** REF D — the big multicolour ribbon with vinyl records embedded in it. This
is the signature of the music reference and the hardest device in the set.

Build: one SVG, several stacked paths sharing a common spine.

```html
<svg viewBox="0 0 1440 620" preserveAspectRatio="none" aria-hidden="true">
  <path d="M-40 380 C 260 180, 520 520, 820 300 S 1240 120, 1480 260"
        fill="none" stroke="var(--orange)" stroke-width="96" stroke-linecap="round"/>
  <path d="M-40 424 C 260 224, 520 564, 820 344 S 1240 164, 1480 304"
        fill="none" stroke="var(--green)"  stroke-width="96" stroke-linecap="round"/>
  <!-- …purple, yellow… each offset +44 on y -->
</svg>
```

Draw it as **stroked paths, not filled shapes.** One spine, copied and translated on y by
slightly less than the stroke width, gives you a parallel ribbon with clean joins for free;
trying to draw a filled ribbon by hand produces pinched corners at every inflection.

Then punch the vinyl records in with a `<clipPath>` or simply place `<circle>` elements over
the ribbon at points along the same path, so they sit *on* the ribbon rather than near it.

**Worth it here?** This is the one big-ticket ornament I would actually build for a musician
site, because it does double duty: it is the decoration *and* it is the visual metaphor for
sound. But it must be one continuous gesture across the full bleed. A ribbon that starts and
stops inside a padded container looks like a sticker of a ribbon.

### 2.6 Sticker badges
**In the comps:** REF A (mint / yellow pastel labels with black keylines around the name).
**Seen live:** Roze Bunker (offset-shadowed blocks at 2/5/12px), Feastables (3px and 4px
black keylines on small pills), Refuge Worldwide (`9999px` pills, 41 of them).

Build:

```css
.sticker {
  display: inline-block;
  padding: .35em .9em;
  background: var(--mint);
  border: 2px solid var(--ink);
  border-radius: 999px;              /* or 0 — pick one and never mix */
  box-shadow: 0 2px 0 var(--ink);    /* Refuge Worldwide's value, not 4px 4px */
  transform: rotate(-2.5deg);
}
```

**Parameters that matter.**
- **Rotation must be a small closed set**, e.g. `-3deg, -1.5deg, 1.5deg, 3deg`, assigned in
  a repeating cycle. Random per-element rotation is the amateur tell; a rhythm reads as
  hand-placed.
- **Never rotate more than about 4 degrees.** Past that it stops reading as a stuck label
  and starts reading as a CSS transform.
- **All stickers in a group share one border width and one shadow offset.** Roze Bunker
  varies border width by *element size* (12px on the big block, 2px on the small one), not
  at random within a group.

### 2.7 Oversized numerals
**In the comps:** REF D ("200+" and "120+" in giant circles).
**Seen live:** Gumroad, `$2,193,086` at **192px / line-height 172.8px (0.9) / letter-spacing
−0.4px**. This is the device Gumroad kept when it dropped everything else.

Build: it is just type. The three things that make it work:
1. **Tabular figures off, optical size on.** `font-variant-numeric: proportional-nums` — at
   192px the tabular gaps in `1` and `2` become visible holes.
2. **Negative letter-spacing that scales.** Gumroad uses −0.4px at 192px; GT Maru uses
   −14.5px at 230px (−0.063em). Set it in `em`, not `px`, so it survives the responsive
   ramp.
3. **The suffix is a separate, much smaller element.** "200" at 200px and "+" at 60px,
   baseline-aligned, is the difference between a designed stat and a big number.

**Worth it here?** Yes, and it is the highest-value device on this list for a musician:
release count, years playing, cities toured, minutes of music. It gives the page a factual
spine, which is exactly what stops a colourful site reading as a toy.

### 2.8 Ticket / perforated edges
**In the comps:** REF A (skill tags with perforated ticket edges).

Build with a repeating radial gradient as a mask, not with a border image:

```css
.ticket {
  --notch: 8px;
  background: var(--yellow);
  border: 2px solid var(--ink);
  mask-image:
    radial-gradient(circle var(--notch) at left  50%, transparent 98%, #000 100%),
    radial-gradient(circle var(--notch) at right 50%, transparent 98%, #000 100%);
  mask-composite: intersect;
}
```

Two half-circle notches on the left and right edges is the whole effect. A full row of
perforation dots along an edge needs `repeating-radial-gradient` and, in practice, always
ends up misaligned at some viewport width.

**Worth it here?** Only if the site actually sells tickets or the content is genuinely a
list of dates. The ticket edge is semantic — using it on skill tags, as REF A does, is
decoration pretending to be meaning, and it reads as such. On a gig-dates section for a
musician it is perfect.

### 2.9 Diagonal section split
**In the comps:** REF C (hard diagonal between the white and green sections).

Build with `clip-path` on the lower section, and give the upper section matching bottom
padding so content never lands in the wedge:

```css
.section--diagonal {
  clip-path: polygon(0 6vw, 100% 0, 100% 100%, 0 100%);
  margin-top: -6vw;
  padding-top: calc(6vw + 4rem);
}
```

**Parameters that matter.** Express the rise in `vw`, not `px` or `%` — a percentage-based
diagonal changes angle as the section's height changes, so the same split is steep on a tall
section and nearly flat on a short one. Use **one angle for the whole site**. Two different
diagonal angles on one page is the fastest way to make a layout look assembled from
templates.

### 2.10 Bento grid
**In the comps:** REF C (photo bento with black keylines and a magenta logo tile).

Build with explicit named areas rather than auto-placement, so the composition is authored:

```css
.bento { display: grid; gap: 3px; grid-template-columns: repeat(4, 1fr);
  grid-template-areas: "a a b c" "a a d d" "e f f d"; }
```

**Parameters that matter.** In this idiom the gap should be **the same value as the keyline
width, or zero**. Feastables uses 3px and 4px keylines; a 3px gap between 3px-keylined tiles
reads as a drawn grid. A 24px gap between keylined tiles reads as a card list, which is the
generic outcome.

### 2.11 Cut-out photography on colour
**In the comps:** REF B (black-and-white cut-out portrait on a yellow block).
**Seen live:** none of the measured sites applied a CSS `grayscale()` filter to any image —
where the effect appears, it is baked into the asset.

That is the correct way to do it. `filter: grayscale(1)` on a colour photo produces a muddy,
low-contrast grey because it maps luminance directly. A properly prepared cut-out is
**converted with a channel mix that lifts skin off the background, then contrast-pushed so
the darks go to near-black and the highlights blow slightly.** On a saturated ground the
photo needs *more* contrast than it would on white, not less.

The cut-out itself: a real alpha matte, not a `border-radius` circle crop. The whole point of
the device is that the subject's silhouette — hair, a raised hand, the neck of a guitar —
breaks the edge of the colour block behind it.

**Worth it here?** For a musician, yes, strongly. It is the one device that makes the person
the subject of the page rather than an inhabitant of a grid, and it is the cheapest way to
make a photograph look art-directed rather than uploaded.

### 2.12 Notebook / graph-paper ground
**In the comps:** REF A (lined paper), REF D (cream graph paper).

Build with gradients — no image asset, no HTTP request, scales to any viewport:

```css
/* lined paper */
background-image: linear-gradient(to bottom, transparent 31px, var(--rule) 31px, var(--rule) 32px);
background-size: 100% 32px;

/* graph paper */
background-image:
  linear-gradient(to right,  var(--rule) 1px, transparent 1px),
  linear-gradient(to bottom, var(--rule) 1px, transparent 1px);
background-size: 24px 24px;
```

**Parameters that matter.** The rule colour must be very close to the ground — around 6–10%
contrast. `#EDEAE0` rules on `#FAF7F0` cream. The instant the grid is legible as a grid from
across the room, the page looks like a wireframe. And the ruled line spacing should be an
exact multiple of the body line-height, so the text sits *on* the rules; text floating
between rules is the detail that makes it look like a background image someone dropped in.

### 2.13 Hard offset shadow
The signature move of the idiom, and the measured values disagree sharply:

| site | value |
|---|---|
| Refuge Worldwide (music) | `0 2px 0 #000` |
| Roze Bunker | `2px 2px 0`, `5px 5px 0`, `12px 0 0` |
| neobrutalism.com (kit) | `2px 2px 0`, `4px 4px 0` |
| Feastables | **none** |
| GT Maru | **none** |
| Curry Cafe | **none** |
| Seabass Vinyl (music) | **none** |
| Gumroad | **none** |

Six of the loud sites measured ship **zero hard offset shadows**. The device is far less
universal than its reputation. `4px 4px 0 #000` in particular is the kit default and is the
most template-legible value in the whole style.

If you want the effect, Refuge Worldwide's `0 2px 0` is the better token: no x-offset, small
y-offset. It reads as a printing registration bite rather than as a Figma drop shadow. Roze
Bunker's `12px 0 0` — a large offset in *one* direction only — is the other good answer.

### 2.14 Black keyline
Measured widths, in order of how templated they read:

- `2px #000` used 423 times (neobrutalism.com) — the kit
- `3px #000` used 35× and `4px #000` used 15× (Feastables) — a two-step scale, works
- `3px #000` used 10×, and **nothing else** (GT Maru) — one token, best-looking result here
- `2/4/6/12px #000` scaled to element size (Roze Bunker) — also works, needs discipline
- `4px #FF6C2C` — **an orange keyline on yellow** (Curry Cafe) — the most distinctive
- `8px #fff` — a thick white keyline (Oatly) — the inverse move, also distinctive

The finding: **the width matters less than whether there is a rule for it.** One token, or a
token that scales with element size, both look authored. A grab-bag of 1/2/3/4px does not.
And the colour of the keyline is a free opportunity — everyone defaults to black.

### 2.15 Hue-cycling
**Seen live:** Dour Festival, `rainbowColors` on a 7s loop.

```css
@keyframes hueCycle {
  0%   { color: var(--orange); }
  25%  { color: var(--green); }
  50%  { color: var(--purple); }
  75%  { color: var(--yellow); }
  100% { color: var(--orange); }
}
```

Step between named palette colours, do **not** animate `filter: hue-rotate()` — hue-rotate
walks through every hue in between, including ones not in your palette, and it desaturates
unpredictably. Stepping between tokens keeps the page inside its own colour set.

### 2.16 Taped polaroids, folder tabs
**In the comps:** REF A (taped polaroids with print margins; overlapping folder tabs).

The polaroid: a white frame with an asymmetric bottom margin (`padding: 12px 12px 48px`),
`rotate` from the small closed set, and a "tape" element — a translucent, slightly warm
rectangle at ~35% opacity with a 1px lighter edge, rotated against the photo's rotation so
the two angles disagree. Tape that is parallel to the photo edge does not read as tape.

The folder tab: a `::before` on the card, positioned above it, with
`border-radius: 8px 8px 0 0`, the same keyline, and `z-index` ordering so earlier tabs sit
behind later ones. The detail that sells it is that the active tab's bottom keyline is
**removed** so the tab and the card body become one continuous shape.

---

## 3. How a loud site stays credible for a working musician

This is the actual question, so let me answer it with the measurements rather than with
adjectives.

**Start from the fact that the convention is the opposite.** Of the nine established music
businesses I measured — Stones Throw, Sub Pop, Rush Hour, Boiler Room, C2C, Le Guess Who?,
Kappa FuturFestival, Lowlands, Refuge Worldwide — **seven run neutral, monochrome or nearly
monochrome sites**, with the largest text on the page frequently under 40px. The house style
for music on the web is a black or white vitrine that holds the artwork. Anna Milazzo's
brief breaks that, and the break only works if it reads as authored.

The three sites that break it and survive — **Refuge Worldwide, Lowlands, Seabass Vinyl** —
share four things, and none of the four is an ornament.

**1. The colour is one decision, not a palette.**
Refuge Worldwide is `#FF0000` — the raw sRGB primary — over 43% of the page, with two
supporting hues that together occupy 3%. Lowlands is one lilac over 97.7%. Seabass is a warm
off-white with acid yellow at 10%. None of them is "five to seven hues" in the sense of five
to seven *grounds*. They are **one ground plus a small kit of marks.** Feastables, the
loudest site measured, does the same thing with three lightnesses of a single cyan.

The failure mode the comps invite is a page where section 1 is blue, section 2 is green,
section 3 is pink. That reads as a template with a colour picker. One ground colour, held
across the whole page, with the other hues confined to badge-scale elements, reads as an
identity.

**2. The typography is doing the work, and it is set tight.**
Measured hero settings: Seabass Eurostile 124.6px / lh 1.0; Feastables Kanit 900 300px /
lh 0.65; GT Maru 288px / lh 0.78; Lydia Amaruch 340px / lh 0.79; Kappa Futur 80px / lh 0.9,
ls −3px; C2C Metodo 900 80px / lh 1.0.

Every one of these sets line-height at or below 1.0, most well below. A colourful page with
display type at `line-height: 1.2` looks like a website; the same page at 0.75 looks like a
poster. For a musician that distinction is the whole credibility argument, because gig
posters and record sleeves are the visual language the audience already trusts.

**3. Something is unmistakably custom.**
Lowlands commissions a display face per edition (`LL25 ColorBender`). Oatly has Margo Pro.
Roze Bunker has a face literally named `rozebunker`. Grilli Type drew a matched emoji font.
Even Refuge Worldwide's choice of `bely-display`, a serif, on a screaming red ground is a
decision nobody arrives at by accident.

If the ornament budget goes into ten stock stickers and eight sparkles, the page looks
assembled. If it goes into **one thing that could not have come from a kit** — a real
custom-lettered wordmark, a drawn ribbon, a bespoke set of marks — the same amount of effort
reads as art direction. For Anna Milazzo, that one thing should probably be the wordmark and
the ribbon, and everything else should be restrained around them.

**4. There is hard information on the page.**
Gumroad's `$2,193,086` at 192px. Seabass's specifications and price lists. Refuge Worldwide's
schedule. The oversized numeral works because it is *true*, and its size is proportional to
how much it matters. A loud page carrying real facts — release count, tour dates, credits,
label, the actual names of the studios and the players — reads as a professional's site that
happens to be colourful. A loud page carrying only mood and adjectives reads as a template
demo, no matter how good the ornament is.

**The specific answer for a working musician.** Keep the colour to one committed ground plus
a small kit. Set the display face very large and very tight. Put the person in the page as a
properly cut-out, contrast-pushed photograph rather than as a rounded-corner headshot. Let
the page carry facts — discography with years, venues with dates, credits with real names.
And put the audio somewhere unmissable, because a musician's site that makes you hunt for
the music has failed regardless of how it looks.

---

## 4. The line between confident and amateur

Specific and opinionated, as asked.

**1. Border widths: one token or a size-linked scale. Never a grab-bag.**
GT Maru: `3px #000`, ten times, nothing else — the best-looking page in the survey. Roze
Bunker: 2/4/6/12px, where the width tracks the element's size. Both read as authored. A page
with 1px here, 2px there and 4px somewhere else reads as someone adjusting values until each
element individually looked OK.

**2. `4px 4px 0 #000` is the tell.**
It is the kit default (111 uses on neobrutalism.com). Six of the loud sites measured ship no
hard shadow at all. If you want one, use `0 2px 0` (Refuge Worldwide) or a large single-axis
offset like `12px 0 0` (Roze Bunker). The 45-degree 4px offset is the visual equivalent of a
default Bootstrap button.

**3. The cream-and-yellow palette is a fingerprint.**
`#fff7e8` ground + `#ffdc58` primary + lavender `#c4a1ff` + mint `#01ffcc` + magenta
`#ff30cd` + Space Grotesk. That exact set is the shipped default of the most popular kit.
Using any one of those colours is fine. Using three of them together with a 2px black border
is instantly recognisable.

**4. Line-height above 1.0 on display type.**
The measured range on good pages is 0.65–0.90. This is the highest-leverage single number on
the whole page and it costs nothing.

**5. Animation duration.**
GT Maru's decorative drifts run at 65–109 seconds. neobrutalism.com's marquee runs at 270s.
Feastables' fastest marquee is 22.7s and that is the bottom of the credible range. Anything
decorative on a 2–5 second loop reads as a loading state or a banner ad. Fast motion is for
feedback — hover, press, reveal. Slow motion is for atmosphere. Mixing them up is the most
common execution error in this style.

**6. Rotation.**
Small closed set (−3, −1.5, 1.5, 3 degrees), cycled. Never `Math.random()`. Never above about
4 degrees. Randomised rotation is visible as randomness within about two seconds of looking
at a page, and it makes the layout feel like it was shaken rather than composed.

**7. Ornament count.**
The comps describe a lot of marks: sparkles, arcs, blobs, flowers, arrows, stars,
sticker labels. The live sites that look expensive use **two or three ornament types
total**, repeated, at one or two sizes. GT Maru has eight accent hues and they occupy 0.0%
of the page's area. Ornament density is where this style dies: past roughly four distinct
decorative shapes on one page, the eye stops reading them as a system and starts reading
them as stock art.

**8. Emoji.**
REF A puts emoji inline in the headline. With the system emoji font this drops a glossy 3D
Apple gradient into a flat, keylined design and it looks wrong in a way that is hard to
name but impossible to miss. Grilli Type solved it by drawing a bespoke emoji face. The
affordable answer is to draw two or three flat SVG marks in the page's own palette and use
those. Do not use real emoji in display type on a page with black keylines.

**9. Grayscale by filter.**
`filter: grayscale(1)` on a colour photograph produces mud. The cut-out photography in these
comps needs to be prepared as an asset: channel-mixed, contrast-pushed, with a real alpha
matte so the silhouette breaks the colour block behind it. This is the difference between
"black and white photo on yellow" and "cut-out on yellow", and it is very visible.

**10. Everything keylined.**
The comps say "black keylines on everything". The measured sites do not do this. Feastables
keylines its cards and pills, not its sections. GT Maru keylines ten elements on a
5400px page. Keylining every element flattens the hierarchy — if the hero card, the body
paragraph, the image, the badge and the footer all have the same 2px black rule, nothing is
foreground. Keyline the things that are meant to feel like objects; leave the things that
are meant to feel like ground alone.

**11. The tell that separates the whole class.**
Expensive versions of this style are **loud in one or two dimensions and disciplined in all
the others.** GT Maru: enormous colour commitment, enormous type — one border token, zero
shadows, ten radii values reduced to two. Curry Cafe: 91% saturated surface — three hues,
no shadows, one keyline colour. Feastables: full-bleed cyan and 300px type — one hue family,
two border widths.

Amateur versions are loud in every dimension at once: many hues, many border widths, many
radii, many shadow offsets, many ornament types, many rotation angles, fast motion. The
style has no built-in restraint, so the restraint has to be imported deliberately, and the
place to import it is everywhere except the one or two things you have chosen to shout with.

---

## 5. Suggested starting tokens for Anna Milazzo

Not a design, just the bracket the measurements imply.

```css
:root {
  /* one committed ground + a small kit of marks */
  --ground:  /* one hue, held across the whole page, 40–95% of painted area */;
  --ink:     #0E0E0E;   /* near-black, not #000 — #000 is the kit's default */
  --mark-1: ; --mark-2: ; --mark-3: ;   /* badge-scale only, together under 5% of area */

  /* one keyline token, or two that track element size */
  --rule: 3px;

  /* if a hard shadow is used at all */
  --lift: 0 2px 0 var(--ink);

  /* display type */
  --display-size: clamp(4rem, 20vw, 300px);
  --display-lh: 0.78;
  --display-ls: -0.04em;

  /* motion */
  --marquee-duration: 72s;
  --drift-duration: 90s;
  --feedback-duration: 180ms;

  /* rotation set, cycled — never random */
  --tilt-a: -3deg; --tilt-b: -1.5deg; --tilt-c: 1.5deg; --tilt-d: 3deg;
}
```

**Devices I would actually build**, ranked by return on effort for a musician:
1. Oversized numerals with a real fact behind each (proven: Gumroad).
2. One full-bleed marquee at 60s+ with a repeated mark as separator (proven on 7 sites).
3. Cut-out photography, properly matted, on the ground colour.
4. One continuous ribbon across the full bleed with records embedded (REF D's signature).
5. Sticker badges, one border width, four cycled rotations.
6. Ticket edges — **only** on the gig-dates section, where they mean something.

**Devices I would drop:** scattered four-point sparkles, organic lumpy blobs, concentric
rainbow arcs, `4px 4px 0 #000`, real emoji in display type, and more than one diagonal angle.
