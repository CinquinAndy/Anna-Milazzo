# Scroll-driven motion resolves against the nearest scroll container

Every scroll-driven animation on this site uses `animation-timeline: view()`. `view()`
resolves against the nearest ancestor **scroll container** of the animated element, and a
section carrying `overflow: hidden` is a scroll container. Any `view()` animation inside
such a section therefore measures itself against a box that never scrolls.

Recorded because the failure is silent and looks like success. The About section carried
`overflow-hidden` to crop its decorative arcs, and a scroll-driven animation on the card
inside it computed its base value before the section and its finished value after, with no
value in between at any scroll position. There is no error, no warning, and the finished
state is the correct one, so the page looks right and the motion simply never happens.

The rule that follows:

- **Crop with `overflow: clip`, never `overflow: hidden`,** unless the box is genuinely
  meant to scroll. `clip` cuts at the same edge, creates no scroll container, and cannot be
  scrolled out of place programmatically either, which removes a second class of bug.
- **A section that must scroll cannot also host scroll-driven motion** on its children.
  The arrangement in the Timeline scrolls sideways on purpose, so nothing inside it is
  animated on a timeline; its one state change is a container query instead.
- **Measure the intermediate values, never the endpoints.** A test that asserts the start
  and finish states passes on a frozen animation. `e2e/arrival.spec.ts` walks the scroll in
  25px steps and counts the distinct positions reached.

The same section also has to be checked for the reverse mistake. Declaring motion outside
`@media (prefers-reduced-motion: no-preference)` and cancelling it afterwards with
`animation-duration: 0.001ms` does not stop a scroll-driven animation, because its progress
comes from scroll position rather than from elapsed time. All motion is declared inside the
guard, and `e2e/arrival.spec.ts` walks the CSSOM to prove it: computed style cannot tell the
two arrangements apart.
