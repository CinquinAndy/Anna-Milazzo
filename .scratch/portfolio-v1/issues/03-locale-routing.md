# 03: Locale routing

**What to build:** The Portfolio answers in Italian at the root and in English under
`/en`, a Recruiter can switch between them without losing their place, and nothing about
this breaks the Payload admin.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `/` serves Italian and `/en` serves English; the locale codes are `it` and `en`, with `it` as default
- [ ] Unprefixed paths are rewritten onto the Italian tree; `/en/*` passes through untouched
- [ ] The rewrite explicitly excludes the admin panel, the API, framework internals and static assets — the admin panel still loads and functions
- [ ] A language switch on any page lands on the same page in the other language, not on the home page
- [ ] URL segments are not translated
- [ ] The document language attribute matches the served locale
- [ ] Playwright covers: Italian at the root, English under the prefix, the switch preserving the page, and the admin panel still reachable
