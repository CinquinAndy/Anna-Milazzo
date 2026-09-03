# 02: Theme and typography

**What to build:** The visual foundation every later ticket builds on. A specimen page
proves the palette, the type scale and the shadow system render as intended, and that
Italian text survives the treatment.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The theme layer from the design folder is in place: blue primary carrying white type, cantaloupe accent carrying black type only, warm paper ground, square corners, 4px keylines, hard offset shadows with no blur, blue focus outline
- [ ] There is no dark mode and no `.dark` block anywhere
- [ ] Bricolage Grotesque, Instrument Sans and Azeret Mono load through the framework's font pipeline with the `latin-ext` subset and Bricolage's optical-size and width axes exposed
- [ ] A specimen page shows every colour token, the full heading scale, both button states and the shadow steps
- [ ] `ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ` renders at the largest heading size with no clipping of the accents
- [ ] Headings never fall below a line height of 0.9
- [ ] A visible focus indicator appears on every interactive element and is distinguishable from the element's own black keyline
