# 03: Locale routing

**What to build:** The Portfolio answers in Italian at the root and in English under
`/en`, a Recruiter can switch between them without losing their place, and nothing about
this breaks the Payload admin.

**Blocked by:** 01

**Status:** resolved

- [x] `/` serves Italian and `/en` serves English; the locale codes are `it` and `en`, with `it` as default
- [x] Unprefixed paths are rewritten onto the Italian tree; `/en/*` passes through untouched
- [x] The rewrite explicitly excludes the admin panel, the API, framework internals and static assets — the admin panel still loads and functions
- [x] A language switch on any page lands on the same page in the other language, not on the home page
- [x] URL segments are not translated
- [x] The document language attribute matches the served locale
- [x] Playwright covers: Italian at the root, English under the prefix, the switch preserving the page, and the admin panel still reachable

## Comments

Done. `bun run validate` green; seven Playwright tests cover the ticket, two of them
guarding the Payload admin and REST API against the rewrite.

**Rewrite, not redirect.** `/` and `/contact` are rewritten onto `/it/...` so the
Recruiter's URL stays unprefixed. `/en/*` passes through untouched, since English is
already on the tree it renders from.

**`/it/*` redirects back to the unprefixed path**, 307. Without it Italian would be
published at two addresses. 307 rather than 308 deliberately: ADR-0001 says the URL shape
is expensive to reverse once indexed, and a permanent redirect is cached by browsers
indefinitely. Promote it to 308 when the shape has proven itself.

**The matcher is the load-bearing part** — `/((?!api|admin|_next|.*\\..*).*)`. Payload
owns `/admin` and `/api`, and the matcher in the Next.js i18n guide rewrites both onto the
Italian tree, which takes the admin panel down. Two e2e tests exist purely to catch a
regression here.

**The language switch is a Server Component that is told its path.** It does not call
`usePathname`. Next's own docs warn that under a rewrite a prerendered page reads the
*rewritten* pathname on the client, so a switch built on `usePathname` emits
`/en/it/contact` — and the bug only appears once a page prerenders, which is exactly when
nobody is looking. Passing `path` costs one prop per page, of which there are three
(ADR-0002), and removes the failure mode along with all client JavaScript.

**`lang` comes from `params`, not `next/root-params`.** Root-param types are emitted by
typegen, and `validate` runs typecheck *before* build, so `await lang()` would silently be
`any` at the moment it matters. `params` is plain TypeScript and needs no generated types.
Worth revisiting only if Cache Components are ever enabled, which additionally makes
`generateStaticParams` on `[lang]` a hard build requirement rather than an optimisation.

**Locale arithmetic is a pure module**, `src/lib/locale.ts` — no React, no DOM, no request.
It replaced the scaffold's placeholder unit test with seven real ones, including a
round-trip across every page and locale, and the `/enquiries` case that a naive
`startsWith('/en')` gets wrong.

**Left for later, deliberately:** `robots.txt` and `sitemap.xml` must live at `src/app/`
root rather than under `[lang]`, or the matcher's file-extension exclusion means the
unprefixed ones 404. Nothing generates them yet. Likewise `metadata.alternates.languages`
— the `hreflang` pair that tells a search engine the two URLs are one page in two
languages — belongs with ticket 06, when pages gain real metadata.
