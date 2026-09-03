# 12: Motion

**What to build:** One signature movement applied consistently across the whole Portfolio,
so the site feels mechanical and deliberate rather than decorated.

**Blocked by:** 06, 07, 09

**Status:** ready-for-agent

- [ ] Hovering an interactive surface lifts it slightly and grows its shadow; pressing translates it into the shadow and collapses it, at around 90ms with an ease-out curve
- [ ] The same rule applies to every button, Folder and link surface — no element has its own bespoke movement
- [ ] Section entrances are a hard arrival: opacity plus a short translate, staggered per section rather than per element
- [ ] There are no magnetic buttons, no custom cursor, no preloader and no parallax
- [ ] Entrances, loops and any scroll-driven effect are declared inside a reduced-motion-safe query from the start, not disabled by an override afterwards
- [ ] With reduced motion requested, the site is fully usable and nothing moves except the sub-100ms press feedback
- [ ] Motion never gates access to content — anything animated in is present and readable if the animation never runs
