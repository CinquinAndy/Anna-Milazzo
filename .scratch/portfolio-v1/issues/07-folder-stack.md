# 07: Folders and the Song stack

**What to build:** The centrepiece. Every Song appears in its own paper Folder, stacked
down the page, each showing its cover taped on, its title, its story and its platform link
when it has one. The play control is present but does nothing yet.

**Blocked by:** 02, 04

**Status:** resolved

- [x] Each Folder is a tabbed paper shape with an unbroken keyline over the whole silhouette and no seam where the tab meets the body, built with the negative-margin technique, not `clip-path`, which clips the border
- [x] The Folder's shadow is a single filter on the wrapper, not a shadow per box, so the tab/body join has no notch
- [x] Tab position alternates down the column
- [x] The cover image is taped at its top two corners with mirrored, rotated, translucent strips that overlap both the image and the ground behind it; rotation varies between instances and is never animated
- [x] Every Folder is fully visible with no overlap; on a narrow screen they are full width with a generous gap and a reduced shadow offset
- [x] Songs appear in the order set in the CMS
- [x] A Song with no platform link renders no link; a Song with no English story shows the Italian one
- [x] The stack is marked up as a list of articles, never as a tab interface, and decorative tape is hidden from assistive technology
- [x] Every tap target clears 24 by 24 pixels
- [x] Playwright covers: all seeded Songs present and in order, the missing-link case, and the fallback case

## Comments

Done. `bun run validate` green; 39 Playwright tests, ten of them new on this ticket.

**The tab is the negative-margin technique, and the test asserts the mechanism, not the
look.** The body is pulled up by exactly one keyline (`margin-block-end: -4px`), the tab
has `border-block-end: 0`, and the tab paints over the body's top border for exactly its
own width because it is opaque and sits at `z-index: 2`. The test reads all three back
from computed styles and checks the measured overlap equals the keyline width, so a future
change to `--border-brutal` that forgets the margin fails loudly rather than opening a
hairline seam nobody notices.

`clip-path` was not used and must not be: it clips the border along with the shape, and a
4px keyline is the entire point of the design.

**One `filter: drop-shadow()` on the wrapper.** A `box-shadow` per box puts a black notch
inside the silhouette where the tab meets the body, and a step where the tab's right edge
lands. The test asserts the wrapper carries a `drop-shadow` and that both children carry
`none`. The shadow offset drops from 8px to 5px below 40rem so it stays proportional and
stops eating the gutter.

**The stack does not overlap, deliberately.** The research's own verdict is that an
overlapping filing-cabinet metaphor fails at 375px on five counts, the worst being that it
puts one tap target under another. Every Folder is fully visible with a
`clamp(2.5rem, 8vw, 4rem)` gap; a test asserts no Folder's top is above the previous one's
bottom.

**Tape angles are deterministic, not random.** `Math.random()` in a Server Component
renders a different angle on the server than on the client and trips hydration; a single
shared angle reads as a repeated component, which is the tell the design brief warns
against. Angles come from a fixed table indexed by position, mirrored across the cover.

**The tape test checks the thing that makes it read as tape**, not that it exists: every
strip is rotated, uses `mix-blend-mode: multiply` so the surface below shows through, and
crosses the cover's edge. A strip wholly inside the image is a sticker, not tape, that is
the failure the client references single out, and it is now a test.

**Semantics over metaphor.** A `<ul>` of `<li>` each holding an `<article>`; the tab's
number is `aria-hidden` because it repeats nothing the heading does not carry. Tests assert
zero `role="tablist"`, `role="tab"` and `role="tabpanel"` anywhere on the page. The focus
ring is one `:focus-within` outline on the Folder rather than one per child.

**Verified visually as well as structurally**, because the seam is the kind of thing that
passes a geometry check and still looks wrong: the covers paint their true colours
(measured 231,226,210 and 198,232,107 straight off the rendered pixels), the keyline is
unbroken around tab and body, and the shadow is one silhouette.

**The play control is present and does nothing**, as the ticket asks. It carries
`data-play` with the Song's reference so ticket 08 has a handle to bind to.

## Review follow-up

**A Song Anna creates herself rendered with no player at all.** `reference` is a seed
handle, hidden from the admin and with no default, so every Song she adds through the
admin has none, and the Folder was gating the whole transport on it. Cover, title and
story rendered; the play control, progress blocks and seek slider silently did not, with
nothing to tell her why. It falls back to the record id now. The suite could not have
caught this because every selector in it is a seeded literal; a test now walks every
Folder and requires a play control on each.
