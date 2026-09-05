# 11: The ornament layer

**What to build:** The layer that makes the Portfolio hers rather than a template, tape,
stickers, doodled arrows, asterisks, hand-drawn underlines, placed across the landing page
as composition.

**Blocked by:** 06, 07

**Status:** resolved

- [x] Ornament is placed deliberately per section rather than applied by a repeating rule; no two instances share the same rotation
- [x] Lime appears only here, never as a fill behind type, never on a control
- [x] Ornament elements are siblings that overflow their containers rather than children clipped by them
- [x] Every decorative element is hidden from assistive technology and none of them carries meaning that exists nowhere else
- [x] Rotation is static; nothing in this layer animates
- [x] Ornament never overlaps a control or a tap target, and never reduces text contrast below its section's baseline
- [x] The page still reads correctly with every ornament removed, the layer is additive, never load-bearing

**Note:** this is the least-researched part of the build. No shipped sites using this
device were found, so the design notes are a hypothesis drawn from client references
rather than established practice. Expect more than one attempt, and show it to Andy early.

## Comments

Done, with the caveat the ticket itself raises. `bun run validate` green: 37 Vitest, 75
Playwright, nine of them new here.

**Six ornaments, placed one at a time.** An asterisk on the hero block, an arrow in the
about margin, a hand-drawn underline below the skills heading, a cross beside the Folder
stack, a blob at the head of the timeline, an asterisk by the route to contact. Each
placement passes its own angle, `-13, 7, -2, 19, -24, 11`, and a test asserts they are
all distinct and none is zero. A shared angle is what makes an ornament layer read as a
repeated component instead of composition.

**Every criterion is a test, and two of them found real problems.**

- The underline sat 12px below the skills heading and its box was clipping the glyph
  rects. Moved clear. The criterion is about contrast rather than overlap, but keeping
  ornament off type is what makes the contrast question moot, so the test enforces the
  stricter rule.
- The test originally compared ornament boxes against text *elements*' boxes, which
  flagged five false positives: a `max-w-prose` paragraph's box spans the column even
  though its glyphs do not, and the margin is exactly where this layer is meant to live.
  It measures the text's own `Range` rects now.

**The load-bearing test is the removal one.** It records the page's text, headings and
controls, deletes every `[data-ornament]` from the DOM, and requires all three to be
unchanged. That is what keeps the layer additive: if anything readable or operable ever
migrates into it, the test fails.

**Lime is confined here**, and the test proves it by walking every element outside the
ornaments and failing on any that paints lime as a background or carries lime type.

**Ornaments are `pointer-events: none` siblings that overflow their sections**, never
children of a clipping container, a test checks no ornament's parent clips. They are kept
out of Folders deliberately: `.folder` carries a `filter`, which creates a containing block
and would drag the ornament into the Folder's own drop shadow.

**Needs Andy's eye, and the ticket predicted it.** This is the least-researched part of the
build, no shipped precedent was found, and the design notes are a hypothesis from two
client reference images. What is here is defensible and correct against every stated rule,
but "correct" and "right" are different questions for a decorative layer. The arrow beside
the about text in particular points at nothing in particular. Expect at least one more
pass once someone has looked at it.
