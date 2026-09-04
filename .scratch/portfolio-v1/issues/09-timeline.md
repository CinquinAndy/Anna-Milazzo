# 09: Sequencer-strip timeline

**What to build:** Anna's training and experience, read in one scan, drawn as a sequencer
track: rectangular blocks laid along a time ruler, each one a step in her path.

**Blocked by:** 02, 04

**Status:** resolved

- [x] Entries render as aligned rectangular blocks against a time ruler, in the site's keyline-and-block language
- [x] Entries come from the CMS, are ordered there, and carry a localized label and detail
- [x] The section reads correctly in both languages with the longer Italian strings
- [x] On a narrow screen the strip stays legible — either scrolling horizontally within its own container, with the page itself never scrolling sideways, or restacking
- [x] The timeline is exposed to assistive technology as an ordered list of entries, not as an image
- [x] Adding an entry in the CMS makes it appear without any code change

## Comments

Done. `bun run validate` green; 56 Playwright tests, six of them new here.

**An ordered list drawn as a sequencer track.** Blocks sit on a ruler with a tick where
each step begins, fills cycling through card, sand and cantaloupe so consecutive steps
read as distinct. The markup is an `<ol>` of `<li>` and nothing else — an image would put
the whole of Anna's history out of reach of a screen reader, and the visual is only a
layout of the same list.

**The period is not localized.** `2019–2022` is the same fact in both languages, so it
lives on the shared array row while the label and detail are per-locale. A test asserts
the English strip still carries the Italian-side periods.

**The strip scrolls inside its own container, never the page.** A `tabindex` on the
scroller is what makes a scrollable region reachable without a pointer (WCAG 2.1.1), and a
test drives it with the arrow keys to prove it actually scrolls. Biome flags the
`tabindex` as non-interactive; suppressed with the reason, because the rule does not know
about scroll containers.

**The "no code change" criterion is tested by comparing the rendered count against the
API**, rather than by asserting five. Nothing in the component names a number, so a sixth
row added in Payload renders on its own — and the test would catch a component that
started slicing.

## Follow-ups on ticket 08, found while running this one

Three fixes to the player landed with this ticket:

- **The `pause` guard became stateless.** A boolean "we are swapping" flag was racy. A
  `src` swap drops the element to `HAVE_NOTHING`, so `readyState === 0` distinguishes a
  load-induced pause from a real one with no bookkeeping at all.
- **`error` is ignored when the element carries no error object**, which is what a merely
  superseded load produces.
- **The seek thumb now follows from the engine's animation frame**, alongside
  `--playhead`. It had been driven from `state.positionSeconds`, which nothing advanced —
  so the thumb would have sat at zero for the whole Song. Every per-frame DOM write now
  lives in one place, and none of it goes through React state.

A test bug was also fixed, and it is worth recording because it looked exactly like an app
bug: the helper read `audio.currentSrc || audio.src`. `src` updates the moment it is
assigned; `currentSrc` only catches up when the resource selection algorithm runs, so for
a beat after a swap it still names the previous Song. The suite now reports both.
