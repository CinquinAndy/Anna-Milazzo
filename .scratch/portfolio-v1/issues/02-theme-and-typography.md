# 02: Theme and typography

**What to build:** The visual foundation every later ticket builds on. A specimen page
proves the palette, the type scale and the shadow system render as intended, and that
Italian text survives the treatment.

**Blocked by:** 01

**Status:** resolved

- [x] The theme layer from the design folder is in place: blue primary carrying white type, cantaloupe accent carrying black type only, warm paper ground, square corners, 4px keylines, hard offset shadows with no blur, blue focus outline
- [x] There is no dark mode and no `.dark` block anywhere
- [x] Bricolage Grotesque, Instrument Sans and Azeret Mono load through the framework's font pipeline with the `latin-ext` subset and Bricolage's optical-size and width axes exposed
- [x] A specimen page shows every colour token, the full heading scale, both button states and the shadow steps
- [x] `ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ` renders at the largest heading size with no clipping of the accents
- [x] Headings never fall below a line height of 0.9
- [x] A visible focus indicator appears on every interactive element and is distinguishable from the element's own black keyline

## Comments

Done. `bun run validate` green; nineteen Playwright tests across this ticket and 03.

**The specimen found a real bug, and it is the most valuable thing here.** A
`line-height` below 1 makes a heading's inline content area taller than its line box, so
the glyphs — and the heading's hit area with them — spill above and below its block box.
On the landing page the hero was silently swallowing clicks on the language switch above
it: `elementFromPoint` at the link's centre returned the `h1`. Every heading now carries
`padding-block: 0.16em`, which reserves the shortfall. This is also §4.2(c)'s own
mitigation for Italian capitals carrying accents above the cap height, arrived at from the
opposite direction.

**Tailwind v4.3.3**, pinned exactly, plus `postcss.config.mjs`. Biome needed
`css.parser.tailwindDirectives` or it cannot parse `@theme`, `@utility` or `@apply` — the
whole `validate` gate fails on the stylesheet without it.

**Two corrections to the theme layer as designed**, both from reading Tailwind's own
default theme rather than trusting the file's comments:

- `--radius-*: initial` clears the whole namespace before the steps are redeclared.
  Overriding only `sm`/`md`/`lg`/`xl` — which is what the design file did — leaves
  `rounded`, `rounded-xs`, `rounded-2xl`, `rounded-3xl` and `rounded-4xl` still rounding,
  against the file's own "every corner is square". A test asserts a Tailwind radius
  utility computes to `0px`.
- `--shadow-inner`, `--drop-shadow-*` and `--blur-*` are cleared for the same reason:
  Tailwind's defaults for all three are blurred, and this style has no blurred shadow.

**`@source not` on `docs` and `.scratch`.** Tailwind's scan is rooted at the project, not
at the stylesheet, and both directories are tracked and full of prose like `border-2` and
`bg-background` that would otherwise be read as class usage.

**Font wiring.** `--font-display` and friends resolve to the `next/font` variables rather
than literal family names. This matters more than it looks: Tailwind's
`--default-font-family` resolves from `--font-sans`, so a literal name there takes the
whole document off-brand rather than breaking a few utilities.

**Instrument Sans also has a `wdth` axis** (75–100) and now declares it. Azeret Mono
publishes none, and passing `axes` to it is a build error.

**A correction was written back into `docs/research/folder-ui-and-typography.md`.** Its
§4.2(b) and §4.6 both claim that omitting `latin-ext` makes Italian accents fall back
mid-word. Measured against Google's published `unicode-range` descriptors, that is wrong:
`latin` covers `U+0000-00FF`, which is every accented character Italian uses. `latin-ext`
is still requested for breadth. The note matters because the repo treats research as a
primary source, and a test written to "prove latin-ext" with Italian accents would prove
nothing.

**How the accent criterion is actually tested**, since it is the hardest one in the
ticket. Two assertions, both by decoding a screenshot with sharp and scanning rows for
ink:

1. `ÈÀÙ` and `EAU` are rendered at the same size in identical frames; the accented one
   must have ink strictly higher. Equal tops would mean the marks are missing or cut.
2. The two-line hero must keep daylight around the seam between its line boxes. Ink
   crossing the seam is expected and fine — at a line-height below 1 the second line's
   marks legitimately rise above its own line box — but an unbroken run of ink through
   the whole seam region means the lines have run together. Measured: 5px of clearance.

**The specimen is a third root layout** at `(specimen)/`, outside `[lang]`, excluded from
the proxy matcher and marked `noindex`. It is not part of the Portfolio — ADR-0002 says
three pages — and it has no locale.

**Known limit, not fixed:** the blue focus ring measures 2.78:1 against a cantaloupe
block, short of 3:1. Every focusable on the specimen therefore sits on the paper ground,
where it clears. If a control ever has to sit on cantaloupe it needs a second, lighter
stroke outside the blue one. Worth an ADR if it comes up.
