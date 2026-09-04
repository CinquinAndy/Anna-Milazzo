# Loud neo-brutalism / new-ugly — live site survey

**Status:** IN PROGRESS — written incrementally as sites are loaded and measured.
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

_(survey continuing)_

---

## 2. Device catalogue

_(populated below)_

---

## 3. Confident vs amateur

_(populated below)_
