# 06: Hero, about and skills

**What to build:** The top of the landing page. A Recruiter arriving cold learns whose
site this is, sees Anna, reads what she does, and sees the skills she claims — in either
language, all of it from the CMS.

**Blocked by:** 02, 03, 04

**Status:** resolved

- [x] The hero carries Anna's name typographically, a short positioning line, and her portrait
- [x] The portrait is treated as a hard-bordered element with an offset shadow, sitting on a colour block
- [x] An about section and a set of skill tags render below the hero
- [x] Every string comes from Payload; nothing readable is hardcoded
- [x] The whole section renders correctly in both Italian and English, laid out so the longer Italian strings do not break the composition
- [x] The layout holds from 375px to a wide desktop, with no horizontal scroll at any width
- [x] Heading levels descend in order and the portrait has meaningful alternative text drawn from the CMS
- [x] Playwright covers the hero rendering seeded content in both locales

## Comments

Done. `bun run validate` green; 29 Playwright tests across the suite, ten of them new.

**Images are plain `<img>`, not `next/image`.** Routing them through Next's optimiser
would put the app back in the path of the very bytes ticket 05 took it out of, and the
`/_next/image` endpoint is a proxy by another name. Width and height come from the Payload
record so nothing shifts as it loads, and the hero portrait is `fetchpriority="high"`. A
test asserts the `src` contains neither `/api/` nor `/_next/image`.

**Laid out to the Italian string.** The tagline is 74 characters in Italian against 62 in
English, and the hero is composed at the longer one. The name is set at
`font-stretch: 85%` — the `wdth` axis is what buys that back, and it is the reason
ADR-0008 picked Bricolage.

**Three widths are tested, and the test is stricter than "no horizontal scroll".** A
document can stop scrolling sideways because something above the offender clips it, so the
test also walks every element and fails on any box extending past the viewport. That
catches the overflow the criterion is really about.

**Heading order is asserted structurally**, not by eye: exactly one `h1`, starting at
`h1`, and no level jumping by more than one. It will keep holding as tickets 07, 09 and 10
add sections.

**`hreflang` landed here** rather than in ticket 03, as flagged at the time.
`metadata.alternates.languages` now publishes the `it` / `en` / `x-default` triple, which
is the mechanism that tells a search engine the two URLs are one page in two languages —
the other half of the argument for the `/it/*` redirect.

**The language switch became `inline-flex`.** As an inline box its padding and border did
not contribute to its line box, so the focus ring's 2px offset was painted over whatever
sat behind the header rather than on the paper it was measured against.

**Not in this ticket:** the route to contact at the foot of the landing page. The copy for
it is already seeded on the `home` global as `contactCta`, but the destination page is
ticket 10, and a button to a 404 is worse than no button.
