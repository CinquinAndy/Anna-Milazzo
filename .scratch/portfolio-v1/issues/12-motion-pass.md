# 12: Motion

**What to build:** One signature movement applied consistently across the whole Portfolio,
so the site feels mechanical and deliberate rather than decorated.

**Blocked by:** 06, 07, 09

**Status:** resolved

- [x] Hovering an interactive surface lifts it slightly and grows its shadow; pressing translates it into the shadow and collapses it, at around 90ms with an ease-out curve
- [x] The same rule applies to every button, Folder and link surface, no element has its own bespoke movement
- [x] Section entrances are a hard arrival: opacity plus a short translate, staggered per section rather than per element
- [x] There are no magnetic buttons, no custom cursor, no preloader and no parallax
- [x] Entrances, loops and any scroll-driven effect are declared inside a reduced-motion-safe query from the start, not disabled by an override afterwards
- [x] With reduced motion requested, the site is fully usable and nothing moves except the sub-100ms press feedback
- [x] Motion never gates access to content, anything animated in is present and readable if the animation never runs

## Comments

Done. `bun run validate` green: 37 Vitest, 82 Playwright, seven of them new here.

**One move, everywhere.** Hover lifts by 2px and grows the shadow; press translates 6px
into the shadow and collapses it to nothing. 90ms, `ease-out`. The Folder now carries the
same rule as every control rather than a lift of its own, which is the point of the
criterion, not an incidental tidy-up. A test reads the computed transition off every
`.control` on the page and requires all of them to agree.

**`ease-out`, not `ease-in-out`, and named properties, not `all`.** A symmetric curve
accelerates the object *away* from a press, which is backwards for something meant to feel
stamped; the canonical neo-brutalist component library ships Tailwind's default
`cubic-bezier(0.4, 0, 0.2, 1)` at 150–200ms with `transition-property: all`, which is what
you get by typing `transition` rather than by deciding anything. The test asserts against
`all` explicitly, because it will happily animate layout and turn every future style change
into an accidental animation.

**The Folder's hover is behind `@media (hover: hover)`.** On a touch screen `:hover` sticks
after a tap, and the Folder would simply stay lifted.

**Entrances are declared inside `prefers-reduced-motion: no-preference` from the start,
and a test proves it by walking the stylesheet** rather than by checking the effect. This
is the one place where the usual approach silently fails: the familiar
`animation-duration: 0.001ms` override does not stop a scroll-driven animation, so an
entrance disabled that way would still move for someone who asked it not to.

**Nothing is animated *in*, the base state is the final state.** `[data-enter]` carries no
opacity and no transform of its own; the entrance only exists as a scroll-driven animation
inside the guarded block. A section is therefore present and readable when the animation
never runs: with reduced motion, in a browser without `animation-timeline: view()`, or
before the stylesheet arrives. Two tests cover that, one asserting nothing animates under
reduced motion, one asserting every section is fully opaque and its headings visible.

**Staggered per section, never per element**, and a test asserts no `[data-enter]` is
nested inside another, so the rule cannot quietly become per-element later.

**The four bans are tested as absences**: no `cursor: none`, no
`background-attachment: fixed`, no preloader element, and no magnetic behaviour anywhere, magnetism is smooth and organic and contradicts the mechanical-press metaphor the whole
style rests on.
