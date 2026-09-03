# 06: Hero, about and skills

**What to build:** The top of the landing page. A Recruiter arriving cold learns whose
site this is, sees Anna, reads what she does, and sees the skills she claims — in either
language, all of it from the CMS.

**Blocked by:** 02, 03, 04

**Status:** ready-for-agent

- [ ] The hero carries Anna's name typographically, a short positioning line, and her portrait
- [ ] The portrait is treated as a hard-bordered element with an offset shadow, sitting on a colour block
- [ ] An about section and a set of skill tags render below the hero
- [ ] Every string comes from Payload; nothing readable is hardcoded
- [ ] The whole section renders correctly in both Italian and English, laid out so the longer Italian strings do not break the composition
- [ ] The layout holds from 375px to a wide desktop, with no horizontal scroll at any width
- [ ] Heading levels descend in order and the portrait has meaningful alternative text drawn from the CMS
- [ ] Playwright covers the hero rendering seeded content in both locales
