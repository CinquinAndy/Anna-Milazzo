# Payload + Next.js i18n + Coolify — primary-source research

Research date: **2026-09-03**. All version numbers verified against the npm registry and the
payloadcms/payload repo at tag `v3.88.0` on that date.

---

## Summary

1. **Payload is at v3.88.0** (published 2026-08-11), with `4.0.0-canary.31` in flight (2026-09-02) — build on v3 ([source](https://registry.npmjs.org/payload)).
2. **Payload runs *inside* your Next.js app**, not as a separate service — it installs as a `(payload)` route group under `src/app/` plus a `withPayload()` wrapper in `next.config` ([source](https://github.com/payloadcms/payload/tree/v3.88.0/templates/blank)).
3. **Next.js version is not free choice.** `@payloadcms/next@3.88.0` pins `next` to `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0` — Next 15.5.x, 16.0.x, 16.1.x and 16.2.0–16.2.5 are all **excluded** ([source](https://registry.npmjs.org/@payloadcms/next)).
4. **Pin `next@16.3.4`** (latest, 2026-08-31): it satisfies Payload's range *and* clears two critical RCE advisories that affect everything `<16.3.3` ([source](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)). Payload's own blank template still pins `16.3.0` — do not copy that.
5. **Payload has two separate i18n systems**: `localization` (content data, per-field `localized: true`) and `i18n` (admin panel chrome). They are configured independently and the docs draw the line explicitly ([source](https://payloadcms.com/docs/configuration/localization)).
6. **Payload localization is field-level, not document-level** — a `localized: true` field stores an object keyed by locale, and you read one locale with `payload.find({ locale: 'fr' })` / `?locale=fr` ([source](https://payloadcms.com/docs/configuration/localization)).
7. **French admin UI ships in the box** — `@payloadcms/translations/languages/fr` is one of 45 bundled languages at v3.88.0 ([source](https://github.com/payloadcms/payload/tree/v3.88.0/packages/translations/src/languages)).
8. **Next.js's own i18n docs recommend hand-rolled dictionaries + `[lang]` + `proxy.ts`**, with `next/root-params` (new in 16.3.0) as the way to read the locale without prop-drilling — no library required ([source](https://nextjs.org/docs/app/guides/internationalization)).
9. **`middleware.ts` is renamed `proxy.ts` in Next 16** and deprecated under the old name — anything you read about "next-intl middleware" needs translating ([source](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)).
10. **The `(payload)` + `[lang]` route-group collision is solvable** via Next's documented multiple-root-layouts pattern; the only hard requirement is that the proxy matcher exclude `/admin` and `/api` ([source](https://nextjs.org/docs/app/api-reference/functions/next-root-params#multiple-root-layouts)).
11. **Local-disk media on Coolify needs an explicit persistent volume**; Payload's default `staticDir` is a folder relative to your config, which lives inside the container filesystem and is wiped on redeploy ([source](https://coolify.io/docs/knowledge-base/persistent-storage)).
12. **Coolify's own Next.js example is booby-trapped**: it ships a standalone-output Dockerfile with a `next.config.mjs` that never sets `output: 'standalone'` ([source](https://github.com/coollabsio/coolify-examples/tree/main/nextjs/ssr)).

---

## 1. PayloadCMS current version and Next.js integration

### Versions (verified 2026-09-03)

| Package | Version | Published |
|---|---|---|
| `payload` | **3.88.0** | 2026-08-11 ([source](https://registry.npmjs.org/payload)) |
| `payload` (canary) | 4.0.0-canary.31 | 2026-09-02 ([source](https://registry.npmjs.org/payload)) |
| `@payloadcms/next` | 3.88.0 | 2026-08-11 ([source](https://registry.npmjs.org/@payloadcms/next)) |
| `next` | **16.3.4** | 2026-08-31 ([source](https://registry.npmjs.org/next)) |
| `react` | 19.2.8 | 2026-07-21 ([source](https://registry.npmjs.org/react)) |

`payload@3.88.0` declares `engines.node: "^18.20.2 || >=20.9.0"` ([source](https://registry.npmjs.org/payload)); the install docs state Node **20.9.0+** ([source](https://payloadcms.com/docs/getting-started/installation)).

### Does it run in the same Next app?

Yes — this is the defining change in Payload 3. The docs put it plainly: *"Payload runs fully in Next.js, so the [Next.js build process] is used for building Payload"* ([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/production/deployment.mdx)). There is no separate Express server, no separate port, no separate deploy target. One container, one process.

### The `(payload)` route group pattern

From the `v3.88.0` blank template ([source](https://github.com/payloadcms/payload/tree/v3.88.0/templates/blank)):

```
src/
  app/
    (frontend)/
      layout.tsx          # root layout #1  (your site)
      page.tsx
      styles.css
    (payload)/
      layout.tsx          # root layout #2  (admin chrome) — GENERATED
      custom.css
      admin/
        [[...segments]]/
          page.tsx        # GENERATED
          not-found.tsx   # GENERATED
        importMap.js      # GENERATED by `payload generate:importmap`
      api/
        [...slug]/route.ts        # GENERATED — REST
        graphql/route.ts          # GENERATED
        graphql-playground/route.ts
  collections/
  payload.config.ts
```

Every file marked GENERATED carries the header
`/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */ /* DO NOT MODIFY IT ... */`.
`(payload)/layout.tsx` is a full root layout — it renders Payload's `RootLayout` and wires a
`'use server'` `handleServerFunctions` bridge ([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/src/app/(payload)/layout.tsx)).

**This means the app has two root layouts and no `app/layout.tsx`** — the documented Next.js
"multiple root layouts" pattern: *"remove the top-level `layout.js` file, and add a `layout.js` file
inside each route group... The `<html>` and `<body>` tags need to be added to each root layout"*
([source](https://nextjs.org/docs/app/getting-started/project-structure#creating-multiple-root-layouts)).
That fact drives everything in §3.

### Install into an existing Next app

```bash
pnpm i payload @payloadcms/next
pnpm i @payloadcms/richtext-lexical sharp graphql      # optional but effectively required
pnpm i @payloadcms/db-postgres                          # or db-mongodb / db-sqlite
```

Then copy the Payload files from the Blank Template into `/app`, wrap the Next config, and create
`payload.config.ts` at the project root ([source](https://payloadcms.com/docs/getting-started/installation)).

`next.config.ts` from the template ([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/next.config.ts)):

```ts
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: { localPatterns: [{ pathname: '/api/media/file/**' }] },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: { root: path.resolve(dirname) },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
```

Note the config carries **both** a `webpack` key and a `turbopack` key — Next 16 defaults to
Turbopack, and the `webpack` block is there for the fallback path.

### Next.js compatibility — the important part

`@payloadcms/next@3.88.0` peer dependencies ([source](https://registry.npmjs.org/@payloadcms/next)):

```json
{
  "next": ">=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.6 <17.0.0",
  "graphql": "^16.8.1",
  "payload": "3.88.0"
}
```

Two things to notice. First, `payload` is pinned to the **exact** matching version — Payload
packages must be upgraded in lockstep. Second, the `next` range is a set of security-patched
windows, not a normal semver range. **Next 15.5.x is excluded entirely**, as are 16.0.x, 16.1.x and
16.2.0–16.2.5.

How the range evolved ([source](https://registry.npmjs.org/@payloadcms/next)):

| `@payloadcms/next` | Date | `next` peer range |
|---|---|---|
| 3.7.0 | 2024-12-13 | `^15.0.0` |
| 3.70.0 | 2026-01-05 | `^15.4.10` |
| 3.73.0 | 2026-01-23 | `^15.4.10 \|\| >=16.1.1-canary.35 <16.2.0 \|\| ^16.2.0` ← Next 16 first admitted |
| 3.76.0 | 2026-02-09 | narrowed to the security-window form |
| 3.85.0 | 2026-05-26 | `... \|\| >=16.2.6 <17.0.0` ← current |
| 4.0.0-canary.0 | 2026-06-04 | `>=16.2.6 <17.0.0` — Next 16 **only** |

Historical context, now superseded: in discussion #14544 (against v3.63.0) a Payload collaborator
wrote *"We don't guarantee Next.js 16 support yet, which is why we haven't bumped the peer
dependency requirement"* ([source](https://github.com/payloadcms/payload/discussions/14544)). That
was resolved in 3.73.0. Any blog post or Stack Overflow answer telling you to downgrade to Next 15
or to `--force` past a peer warning is stale.

### Known incompatibility with the newest Next.js / React

**Next 16.3.4 is fine.** It sits inside `>=16.2.6 <17.0.0`. React 19.2.x is what the template uses.

**But the template's own pin is unsafe.** `templates/blank/package.json` at `v3.88.0` pins
`next: 16.3.0` and `react: 19.2.6`
([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/package.json)). Two
critical advisories published 2026-08-25 cover Next `< 16.3.3`:

- GHSA-2xp9-vwfh-vxw4 — *"Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used"*, vulnerable `< 16.3.3` ([source](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4))
- GHSA-p293-qw3h-jr36 — *"Unauthenticated Remote Code Execution on windows-hosted servers"*, vulnerable `>= 16.0 < 16.3.3` ([source](https://github.com/advisories/GHSA-p293-qw3h-jr36))

Also relevant to this project specifically: GHSA-6gpp-xcg3-4w24, *"Middleware / Proxy bypass in App
Router applications using Turbopack and single locale"*, high severity, vulnerable `>= 16.0.0 <
16.2.11` ([source](https://github.com/advisories/GHSA-6gpp-xcg3-4w24)). A locale-routing proxy is
exactly the shape of app that bug bites.

→ **Pin `next@16.3.4`, not the template's 16.3.0.**

---

## 2. Payload localization

The docs draw the distinction in one sentence: localization *"is similar to I18n, but instead of
managing translations for your application's interface, you are managing translations for the data
itself"* ([source](https://payloadcms.com/docs/configuration/localization)).

### A. Content localization (`localization` config)

```ts
import { buildConfig } from 'payload'

export default buildConfig({
  localization: {
    locales: ['en', 'fr'],   // required
    defaultLocale: 'en',     // required
    fallback: true,          // defaults to true
  },
})
```

Or with full locale objects ([source](https://payloadcms.com/docs/configuration/localization)):

```ts
localization: {
  locales: [
    { label: 'English', code: 'en' },
    { label: 'Français', code: 'fr' },
  ],
  defaultLocale: 'en',
  fallback: true,
}
```

| Option | What the docs say |
|---|---|
| `locales` | Array of supported languages. Strings or locale objects. *"The locale codes do not need to be in any specific format."* Common patterns are ISO 639 two-letter or `en-US`-style four-letter codes. |
| `defaultLocale` | Required, must match one of the codes. *"By default, if no locale is specified, documents will be returned in this locale."* |
| `fallback` | Boolean, **true by default**. *"If a document is requested in a locale, but a field does not have a localized value corresponding to the requested locale, then if this property is enabled, the document will automatically fall back to the fallback locale value."* |
| `filterAvailableLocales` | Server-side `async ({ req, locales }) => locales` — filters what appears in the admin locale selector. Aimed at multi-tenant setups. Note the caveat: *"the filtering happens at the root level of the application and its result is not calculated every time you navigate to a new page"*, so you may need `router.refresh`. |

Locale object keys: `code` (required), `label` (string, or an object keyed by i18n language),
`rtl` (boolean), `fallbackLocale` (a code or array of codes)
([source](https://payloadcms.com/docs/configuration/localization)).

### Localization is per-FIELD, not per-document

> *"Payload Localization works on a **field** level—not a document level."*
> ([source](https://payloadcms.com/docs/configuration/localization))

```js
{
  name: 'title',
  type: 'text',
  localized: true,
}
```

> *"With the above configuration, the `title` field will now be saved in the database as an object of
> all locales instead of a single string."*

All named field types support `localized`, including `array` and `blocks`. Two warnings from the docs
worth carrying forward:

- Localizing a container field localizes *everything* inside it: *"if you have a page layout using a blocks field type, you have the choice of either localizing the full layout... or only certain fields within the layout."*
- **Toggling `localized` on existing data is destructive**: *"the data structure in the document will change for this field and so existing data for this field will be lost."* Decide EN/FR field-by-field before entering content.

### Querying a specific locale

**Local API** (what you'll use from Server Components) ([source](https://payloadcms.com/docs/configuration/localization)):

```js
const posts = await payload.find({
  collection: 'posts',
  locale: 'fr',
  fallbackLocale: false,
})
```

`fallbackLocale` accepts a valid locale, an array of locales, or `'null'` / `'false'` / `false` / `'none'`.

Getting a Payload instance inside a Server Component ([source](https://payloadcms.com/docs/local-api/overview)):

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
```

The docs note the Local API *"is incredibly powerful when used in React Server Components"* because
there is no network hop — and that `overrideAccess` defaults to **true** in the Local API, i.e.
access control is skipped by default. For a public landing page that's convenient but worth knowing.

**REST** ([source](https://payloadcms.com/docs/configuration/localization)):

```
fetch('https://localhost:3000/api/pages?locale=fr&fallback-locale=none')
```

`?fallback-locale=` accepts a valid locale or `'null'`, `'false'`, `'none'`.
Routes: `/api/{collection-slug}` for collections, `/api/globals/{global-slug}` for globals
([source](https://payloadcms.com/docs/rest-api/overview)).

**GraphQL** ([source](https://payloadcms.com/docs/configuration/localization)):

```graphql
query {
  Posts(locale: fr, fallbackLocale: none) {
    docs { title }
  }
}
```

> *"In GraphQL, specifying the locale at the top level of a query will automatically apply it
> throughout all nested relationship fields."*

**All locales at once:** pass `'all'` or `'*'` as the locale in REST or Local API and *"field values
come back as the full objects keyed for each locale instead of the single, translated value"*. This
is the escape hatch if you ever want to render both languages from one fetch.

### B. Admin UI i18n (`i18n` config)

Separate package, separate config key ([source](https://payloadcms.com/docs/configuration/i18n)):

```bash
pnpm install @payloadcms/translations
```

```ts
import { buildConfig } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { fr } from '@payloadcms/translations/languages/fr'

export default buildConfig({
  i18n: {
    supportedLanguages: { en, fr },
    fallbackLanguage: 'en', // default
  },
})
```

- The admin panel is *"translated in over 30 languages and counting"*. At `v3.88.0` there are **45** language files, `fr.ts` among them ([source](https://github.com/payloadcms/payload/tree/v3.88.0/packages/translations/src/languages)).
- *"Languages are automatically detected based on the request. If no language is detected, or if the user's language is not yet supported by your application, English will be chosen."*
- Docs warn: *"It's best to only support the languages that you need so that the bundled JavaScript is kept to a minimum."*
- `i18n.translations` lets you override or extend strings, including with `{{variable}}` interpolation.
- **Project translations**: collection/global/field labels can themselves be objects keyed by language:

```ts
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: { en: 'Article', fr: 'Article' },
  },
}
```

Note this is the *admin* language key (`i18n`), not the content locale — easy to confuse.

### C. Also available

**Globals** are the natural fit for a landing page's editable fields — *"the primary way to structure
singletons in Payload, such as a header navigation, site-wide banner alerts, or app-wide localized
strings"* ([source](https://payloadcms.com/docs/configuration/globals)). Read via
`payload.findGlobal({ slug, locale })`; REST is `GET /api/globals/{slug}`. Globals support
`localized: true` on their fields the same as collections.

**Localized draft status** exists but is explicitly beta: `experimental.localizeStatus: true` plus
`versions.drafts.localizeStatus: true`, and the docs flag it *"experimental and currently in beta,
you may encounter some limitations or bugs"* ([source](https://payloadcms.com/docs/configuration/localization)). Skip it for a landing page.

---

## 3. Next.js App Router i18n for the non-CMS copy

### What the official docs recommend today

The Next.js i18n guide (doc version 16.3.4, last updated 2026-06-10) recommends a **no-library**
approach ([source](https://nextjs.org/docs/app/guides/internationalization)):

1. **Negotiate the locale in `proxy.js`** using `@formatjs/intl-localematcher` + `negotiator`:

```js
// proxy.js
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

let headers = { 'accept-language': 'en-US,en;q=0.5' }
let languages = new Negotiator({ headers }).languages()
let locales = ['en-US', 'nl-NL', 'nl']
match(languages, locales, 'en-US') // -> 'en-US'
```

2. **Redirect un-prefixed paths**:

```js
export function proxy(request) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return
  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = { matcher: ['/((?!_next).*)'] }
```

3. **Nest everything under `app/[lang]/`**: *"ensure all special files inside `app/` are nested under `app/[lang]`."*

4. **Dictionaries** — plain JSON + a `server-only` loader:

```ts
// app/[lang]/dictionaries.ts
import { lang } from 'next/root-params'
import { notFound } from 'next/navigation'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  fr: () => import('./dictionaries/fr.json').then((m) => m.default),
}

export const hasLocale = (locale: string): locale is Locale => locale in dictionaries

export const getDictionary = async () => {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return dictionaries[locale]()
}
```

> *"Because all layouts and pages in the `app/` directory default to Server Components, we do not need
> to worry about the size of the translation files affecting our client-side JavaScript bundle size."*

5. **`generateStaticParams`** for static rendering:

```tsx
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }]
}
```

The guide lists `next-intl`, `next-international`, `next-i18n-router`, `paraglide-next`, `lingui`,
`tolgee`, `next-intlayer`, `gt-next` under "Resources" — as options, not as a recommendation.

### Two Next 16 changes that invalidate most tutorials

**`middleware.ts` → `proxy.ts`.** Version history: *"`v16.0.0` — Middleware is deprecated and renamed
to Proxy. Proxy defaults to the Node.js runtime"*
([source](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)). The rationale, verbatim:
*"the term 'middleware' can often be confused with Express.js middleware."* Codemod:
`npx @next/codemod@canary middleware-to-proxy .`. The `runtime` config option is **not available** in
proxy files and setting it throws.

**`next/root-params`, introduced in v16.3.0.** Getter functions named after your dynamic segments,
callable from any Server Component ([source](https://nextjs.org/docs/app/api-reference/functions/next-root-params)):

```tsx
import { lang } from 'next/root-params'
export default async function RootLayout(props: LayoutProps<'/[lang]'>) {
  return <html lang={await lang()}><body>{props.children}</body></html>
}
```

Restrictions, all explicit in the docs: Server Components only (build error in Client Components);
**not** in Server Actions; **not** in Route Handlers ("planned for a future release"); **not** inside
`unstable_cache` (throws — use `"use cache"`); kebab-case segment names like `[post-slug]` are
unsupported and error.

### next-intl / next-international

| | Version | Last publish |
|---|---|---|
| `next-intl` | **4.14.2** | 2026-09-01 ([source](https://registry.npmjs.org/next-intl)) |
| `next-international` | 1.3.1 | **2024-10-31** ([source](https://registry.npmjs.org/next-international)) |

`next-intl@4.14.2` declares `next: "^12 || ^13 || ^14 || ^15 || ^16"` — Next 16 supported.
`next-international` has not shipped in ~22 months; treat it as unmaintained for a Next 16 project. **INFERRED** from publish date alone — no deprecation notice was found.

next-intl's current App Router setup ([source](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)):

```ts
// i18n/routing.ts
import {defineRouting} from 'next-intl/routing'
export const routing = defineRouting({ locales: ['en', 'fr'], defaultLocale: 'en' })
```

```ts
// proxy.ts  (formerly middleware.ts)
import createMiddleware from 'next-intl/middleware'
import {routing} from './i18n/routing'
export default createMiddleware(routing)
export const config = { matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)' }
```

```ts
// i18n/request.ts
import * as rootParams from 'next/root-params'
import {getRequestConfig} from 'next-intl/server'
import {hasLocale} from 'next-intl'

export default getRequestConfig(async ({locale}) => {
  if (!locale) {
    const paramValue = await rootParams.locale()
    if (hasLocale(routing.locales, paramValue)) locale = paramValue
  }
  return {locale}
})
```

next-intl now routes its own static-rendering support through `next/root-params` and says of the
older `setRequestLocale` API that *"it is recommended to use `next/root-params` instead"*
([source](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)).

### Where the two systems overlap and could conflict

**Overlap 1 — two locale lists.** Payload's `localization.locales` and next-intl's (or your
dictionary's) `locales` are separate registries. Nothing keeps them in sync. Adding a third language
means editing both. **INFERRED** — no doc addresses cross-syncing; derive one from the other in code.

**Overlap 2 — proxy matcher vs `/admin` and `/api`.** Payload owns `/admin/**`, `/api/**`, and
`/api/graphql*`. A locale proxy with the naive matcher `'/((?!_next).*)'` from the Next.js guide will
redirect `/admin` → `/en/admin` and break the admin panel and the REST API. next-intl's default
matcher already excludes `api` and `_next` but **not** `admin`
([source](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing)). You must exclude
both, e.g.:

```ts
export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
```

Note the security caveat attached to matchers: *"Even when `_next/data` is excluded in a negative
matcher pattern, proxy will still be invoked for `_next/data` routes"*, and *"Server Functions... are
handled as POST requests to the route where they are used, so a Proxy matcher that excludes a path
will also skip Proxy coverage"*
([source](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)).

**Overlap 3 — route groups + root layouts.** This is the one that looks like a blocker and isn't.
The layout becomes:

```
src/app/
  (frontend)/
    [lang]/
      layout.tsx      # root layout — <html lang>, dictionaries
      page.tsx
  (payload)/
    layout.tsx        # root layout — Payload admin
    admin/…  api/…
```

Route groups are not URL segments, so `[lang]` *is* the only path segment above
`(frontend)/[lang]/layout.tsx` — it therefore qualifies as a root parameter. The docs cover exactly
this shape under "Multiple root layouts", using `app/dashboard/[id]/layout.tsx` +
`app/marketing/layout.tsx`: *"When an application has multiple root layouts with different
parameters, getter functions are typed to account for usage in any of all possible routes. A
parameter that does not exist in every root layout has the type `string | undefined`"*
([source](https://nextjs.org/docs/app/api-reference/functions/next-root-params#multiple-root-layouts)).
So `await lang()` types as `string | undefined` because `(payload)` has no `[lang]`. Handle the
`undefined` branch; nothing else breaks. **INFERRED** that this composes cleanly with Payload
specifically — Payload's docs do not discuss it, but the Next.js semantics are unambiguous.

**Overlap 4 — admin language vs site locale.** Payload's `i18n` picks the admin chrome language from
the request / user preference; your proxy picks the site locale from the URL prefix. They are
independent and *should* stay independent — an editor can browse the FR site while using the EN
admin. Community reports describe conflicts when people try to unify them
([source](https://github.com/payloadcms/payload/discussions/4004)). Don't.

---

## 4. Payload self-hosting requirements

### Database adapters

Three official adapters ([source](https://payloadcms.com/docs/database/overview)):

| Adapter | Package | Requires | Notes |
|---|---|---|---|
| MongoDB | `@payloadcms/db-mongodb` | Mongoose | No migrations required. What the blank template uses. |
| Postgres | `@payloadcms/db-postgres` | Drizzle + node-postgres | Migrations required in production. |
| SQLite | `@payloadcms/db-sqlite` | Drizzle + libSQL | Migrations required. Point Field not supported. |

> *"Migrations: Required for relational databases (Postgres, SQLite) but not for MongoDB."*
> ([source](https://payloadcms.com/docs/database/overview))

**Postgres** ([source](https://payloadcms.com/docs/database/postgres)):

```ts
db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URL },
})
```

Key options: `schemaName` (default `public`, marked **experimental**), `idType` (`'serial'` or
`'uuid'`), `push`, `migrationDir`. On `push`: it *"automatically pushes changes you make to your
Payload Config"* to the DB, is **enabled by default but only functions in development**, and should
not be mixed with manual migration commands. For non-dev environments you must run migrations.

Relevant to EN/FR: localized fields create **extra tables**, named via `localesSuffix` (default
`_locales`); relationships use `_rels`, versions use `_v`
([source](https://payloadcms.com/docs/database/postgres)).

**SQLite** ([source](https://payloadcms.com/docs/database/sqlite)):

```ts
db: sqliteAdapter({
  client: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN, // for remote/Turso
  },
})
```

Uses *"Drizzle ORM and `libSQL`"*. Options: `push`, `migrationDir`, `idType` (`'number'` | `'uuid'`),
`wal` (write-ahead logging), `blocksAsJSON`, `autoIncrement`. The docs do **not** explicitly document
a local `file:` path form for `client.url` — that's a libSQL convention, not a Payload-documented one.
**INFERRED / verify before committing.**

Also documented, less relevant here: Payload works with *"any Postgres database or MongoDB-compatible
database including AWS DocumentDB or Azure Cosmos DB"*, with `compatibilityOptions.cosmosdb` presets
and a warning that Cosmos *"is not fully compatible"*
([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/production/deployment.mdx)).

### File / media storage

**Local disk is the default.** `upload.staticDir` is *"The folder directory to use to store media in.
Can be either an absolute path or relative to the directory that contains your config. Defaults to
your collection slug"*
([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/upload/overview.mdx)).

**What breaks on ephemeral containers** — the docs are blunt
([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/production/deployment.mdx)):

> *"Some cloud app hosts such as Heroku use `ephemeral` file systems, which means that any files
> uploaded to your server only last until the server restarts or shuts down... your uploads will
> accidentally disappear without any way to get them back."*

> **Warning:** *"If you rely on Payload's Upload functionality, make sure you either use a host with a
> persistent filesystem or have an integration with a third-party file host like Amazon S3."*

Providers listed as ephemeral: Heroku, DigitalOcean Apps. Persistent: DigitalOcean Droplets, Amazon
EC2, "many other more traditional web hosts". **A Coolify container on a VPS is ephemeral per
deploy unless you attach a volume** — the image is rebuilt and replaced on every push. **INFERRED**
from Coolify's build model; see §5.

**Storage adapters** ([source](https://payloadcms.com/docs/upload/storage-adapters)):
`@payloadcms/storage-s3`, `-azure`, `-gcs`, `-vercel-blob`, `-uploadthing`, `-r2`. Enabling one
*"will automatically set `disableLocalStorage` to `true`"* for the configured collections.

```ts
import { s3Storage } from '@payloadcms/storage-s3'

plugins: [
  s3Storage({
    collections: { media: true },
    bucket: process.env.S3_BUCKET,
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      region: process.env.S3_REGION,
    },
  }),
]
```

The S3 adapter is S3-API based, so any S3-compatible endpoint (Hetzner, Scaleway, Backblaze B2,
MinIO, DO Spaces) works via `config.endpoint` — that's the AWS SDK `S3ClientConfig`, which the docs
pass through, though they only show `credentials` and `region`. **INFERRED.**

The docs also suggest the pragmatic split: *"For local development, it might be handy to simply store
uploads on your own computer, and then when it comes to production, simply enable the plugin for the
cloud storage vendor of your choice."*

### Mandatory environment variables

The blank template's `.env.example` is exactly two lines
([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/.env.example)):

```
DATABASE_URL=mongodb://127.0.0.1/your-database-name
PAYLOAD_SECRET=YOUR_SECRET_HERE
```

> ⚠️ It is **`DATABASE_URL`**, not `DATABASE_URI`. *"Out of the box, Payload templates pass the
> `process.env.DATABASE_URL` environment variable to its database adapters"*
> ([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/production/deployment.mdx)).

The deployment page names three: *"like `PAYLOAD_SECRET`, `PAYLOAD_CONFIG_PATH`, and `DATABASE_URL`
if needed."* In a Payload 3 / Next setup the config is imported through the `@payload-config`
tsconfig alias (see `(payload)/layout.tsx`), so `PAYLOAD_CONFIG_PATH` is a carry-over and generally
unnecessary. **INFERRED.**

On the secret: *"This property should be impossible to guess and extremely difficult for brute-force
attacks to crack. Make sure your Production `secret` is a long, complex string."*

`NEXT_PUBLIC_SERVER_URL` is **not** in the blank template's `.env.example`. Payload has a `serverURL`
config option instead. If you need an absolute origin (sitemap, OG images, `Link` canonicals) you add
that variable yourself — and because it is `NEXT_PUBLIC_`, it is inlined at **build** time, which
matters for Coolify (§5). **INFERRED.**

Other production notes from the deployment doc: enable secure cookies behind SSL; *"double and
triple-check"* access control, since *"by default, all Access Control functions require that a user
is successfully logged in"*; and see `building-without-a-db-connection` if your build must run
without DB access ([source](https://github.com/payloadcms/payload/blob/v3.88.0/docs/production/deployment.mdx)).

### Official Docker setup

Yes — `templates/blank/Dockerfile` and `templates/blank/docker-compose.yml` ship in the repo, and the
deployment doc reproduces the Dockerfile as *"an example of a multi-stage docker build of Payload for
production."*

The one hard requirement, stated twice:

> *"In your Next.js config, set the `output` property `standalone`."*
> ```js
> // next.config.js
> const nextConfig = { output: 'standalone' }
> ```

The Dockerfile at `v3.88.0` is the vercel/next.js `with-docker` example, base
`node:22.17.0-alpine`, three stages (`deps` → `builder` → `runner`), non-root `nextjs:nodejs` user
(uid/gid 1001), and
([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/Dockerfile)):

```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD HOSTNAME="0.0.0.0" node server.js
```

> ⚠️ The template's own `next.config.ts` does **not** set `output: 'standalone'`
> ([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/next.config.ts)) —
> the Dockerfile's leading comment says *"To use this Dockerfile, you have to set `output:
> 'standalone'` in your next.config.mjs file."* You must add it.

The `docker-compose.yml` is dev-oriented (mounts the source, runs `pnpm dev`, ships a Mongo service
with a commented-out Postgres). Its note: *"Ensure your DATABASE_URL uses 'mongo' as the hostname ie.
mongodb://mongo/my-db-name"*
([source](https://github.com/payloadcms/payload/blob/v3.88.0/templates/blank/docker-compose.yml)).

---

## 5. Coolify deployment

### Build packs

Four, and *"Coolify deploys every application as a Docker container"*
([source](https://coolify.io/docs/applications/build-packs)):

- **Nixpacks** — auto-generates a Dockerfile from your repo. The default selection.
- **Static** — Nginx-served static output.
- **Dockerfile** — your own. *"complete control over how your application is built and deployed"* ([source](https://coolify.io/docs/applications/build-packs/dockerfile)).
- **Docker Compose** — multi-service.

The Next.js page documents both paths ([source](https://coolify.io/docs/applications/nextjs)):

> **Deploy with Nixpacks — Server build (NodeJS):** *"Set `Build Pack` to `nixpacks`."* That is the
> entire instruction.
>
> **Deploy with Dockerfile:** *"If you are having problems with Nixpacks or want more control over the
> building stage, you can use a Dockerfile."* Prerequisites: *"1. Set `Ports Exposes` field to `3000`.
> 2. Create a `Dockerfile` in the root of your project and copy the content from the official NextJS
> Repository. 3. Set the Build Pack to `Dockerfile`."*

For Dockerfile builds the base directory is configurable (`/` for root, a subfolder for monorepos)
and the default exposed port is 3000 ([source](https://coolify.io/docs/applications/build-packs/dockerfile)).

**Recommendation for this project: Dockerfile.** Payload's own production Dockerfile already exists,
it handles standalone output, and it sidesteps Nixpacks having to guess a Node version and a
package manager for a pnpm + sharp + Payload build. **INFERRED** — Coolify's docs express no
preference beyond "if you are having problems with Nixpacks."

### The standalone-output gotcha

Coolify's docs do **not** discuss `output: 'standalone'` at all. Worse, Coolify's own example
repo contradicts itself: `nextjs/ssr/Dockerfile` is the standalone multi-stage build that ends in
`CMD HOSTNAME="0.0.0.0" node server.js` and copies `/app/.next/standalone`, while the sibling
`nextjs/ssr/next.config.mjs` is:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

— no `output` key ([source](https://github.com/coollabsio/coolify-examples/tree/main/nextjs/ssr)).
Following that example verbatim produces a build where `.next/standalone` never exists and the
`COPY` fails. Set `output: 'standalone'` in `next.config.ts` yourself.

Related: `HOSTNAME="0.0.0.0"` in the CMD is not optional in a container, and Coolify's predefined
`HOST` variable *"defaults to `0.0.0.0`"*
([source](https://coolify.io/docs/knowledge-base/environment-variables)).

### Environment variables — build vs runtime

Coolify models this explicitly ([source](https://coolify.io/docs/knowledge-base/environment-variables)):

> *"Every environment variable has two independent flags that control **when** it is available:
> **Build Variable** and **Runtime Variable**. Both are enabled by default."*

| Configuration | Build phase | Running container |
|---|---|---|
| Build + Runtime (default) | Available | Available |
| Build only | Available | Not available |
| Runtime only | Not available | Available |

> *"Build variables are injected during the image build process. For **Dockerfile** deployments, they
> are added as `ARG` instructions. For **Docker Compose** and **Nixpacks/Buildpack** deployments, they
> are passed via `--env-file`."*

> *"After the build completes, Coolify writes a `.env` file containing all runtime-enabled variables,
> which is loaded by Docker Compose via the `env_file` directive at container start."*

Practical mapping for this project:

- `NEXT_PUBLIC_*` → must be **Build** enabled (Next inlines them at build time).
- `PAYLOAD_SECRET`, `DATABASE_URL`, S3 keys → **Runtime**; disable Build unless the build genuinely needs a DB connection (and see Payload's `building-without-a-db-connection` guide if it does).
- Secrets: *"By default, build variables are passed as `--build-arg` values. These values get recorded in the image metadata."* Enable **Use Docker Build Secrets** (BuildKit, Docker 18.09+) for anything sensitive that must exist at build time — Coolify rewrites `RUN` instructions with `--mount=type=secret` for you, and *"Secrets are never embedded in image layers and are not visible in `docker history`."*
- Shared variables exist at three tiers: `{{team.NODE_ENV}}`, `{{project.NODE_ENV}}`, `{{environment.NODE_ENV}}`.
- Predefined: `SOURCE_COMMIT`, `COOLIFY_URL`, `COOLIFY_FQDN`, `PORT` (first exposed port), `HOST`.
- A `Literal` checkbox disables `$VAR` interpolation — needed if `PAYLOAD_SECRET` or a DB password contains `$`.
- A **Developer view** takes a pasted `.env` blob; locked secrets and multiline values can't be edited there.

Note on caching: *"Coolify generates a `COOLIFY_BUILD_SECRETS_HASH` from all secret values. Docker
build cache is preserved when your secrets haven't changed."* And `SOURCE_COMMIT` *"is excluded by
default to preserve Docker's build cache"* ([source](https://coolify.io/docs/applications/build-packs/dockerfile)).

### Persistent volumes

Needed only if media stays on local disk ([source](https://coolify.io/docs/knowledge-base/persistent-storage)).

Two kinds on a Docker Engine destination:

- **Volume** — define a `Name` and a `Destination Path`. *"To prevent storage overlapping between resources, Coolify automatically adds the resource's UUID to the volume name."*
- **Bind Mount** — define `Name`, `Source Path` (on the host), `Destination Path`. *"No docker volume created in this case."*

The caveat that decides your path layout:

> **Caution:** *"The base directory inside the container is `/app`. So if you need to store your files
> under `storage` directory, you need to define `/app/storage` as the destination path."*

And: *"Share file between more than one container? **NOT RECOMMENDED.** If you mount the same file to
more than one container, you will need to make sure that the proper file locking mechanism is
implemented."*

For a Payload media collection with `staticDir: 'media'` resolved relative to the config directory,
the container path under the standalone Dockerfile's `WORKDIR /app` needs to line up with the mount
point. Set `staticDir` to an absolute path (e.g. `/app/media`) and mount the volume there rather
than relying on relative resolution through the standalone output tree. **INFERRED** — neither
Payload nor Coolify documents this combination.

### Databases

Coolify runs one-click databases as separate resources on the same server; Payload then talks to them
over the internal Docker network. Not separately documented for the Payload case. **INFERRED.**

---

## Decisions this forces

1. **Postgres vs SQLite vs MongoDB.** Mongo needs no migrations and is what the template ships; Postgres/SQLite need a migration step in the deploy pipeline (`push` is dev-only). SQLite is a single file — cheapest, but then the *database itself* also needs the persistent volume, making the volume non-optional.
2. **Payload locales vs a dictionary for static copy.** Everything through Payload (`localized: true` on every string, editor changes copy without a deploy) vs a `dictionaries/en.json` + `fr.json` pair for chrome and Payload only for the handful of real content fields. The second is smaller and matches "it's a landing page"; the first means no hardcoded English anywhere.
3. **next-intl vs hand-rolled dictionaries.** next-intl@4.14.2 is maintained and Next-16-aware, but adds a second locale registry, a `proxy.ts`, and an `i18n/request.ts` to keep in sync with Payload. The Next.js docs' own dictionary pattern is ~30 lines. For two locales and one page, the library may not earn its keep. (`next-international` is out — 22 months stale.)
4. **Locale codes: `en`/`fr` vs `en-US`/`fr-FR`.** Payload says codes can be anything; Next's `Accept-Language` matcher works better with proper BCP-47. Whatever you pick has to be identical in `localization.locales`, the `[lang]` values, and `generateStaticParams`.
5. **Local disk + Coolify volume vs S3-compatible storage.** Volume = zero extra services, but the app is now pinned to one server and backups are your problem. S3 adapter = one more credential set and a bucket, but the container stays stateless and redeploys can't lose media. For a musician's landing page with maybe a dozen images, the volume is defensible.
6. **Dockerfile vs Nixpacks build pack.** Dockerfile = Payload's own known-good multi-stage build, explicit Node version, explicit `output: 'standalone'`. Nixpacks = one dropdown, but Coolify's guidance for it is literally one sentence and you inherit its Node/pnpm detection.
7. **`(frontend)/[lang]/` vs a locale cookie with no URL prefix.** Prefixed URLs are what Next documents, are shareable, and index separately for SEO; a cookie avoids the proxy entirely and keeps `/` as the only route. Prefixed is the safer default but commits you to the proxy-matcher exclusions.
8. **Redirect vs render at `/`.** With everything under `[lang]`, `/` has no page. Either the proxy redirects on `Accept-Language`, or you add a static `/` that renders the default locale. Affects whether the site can be fully statically rendered.
9. **Where French *admin chrome* matters.** If the musician edits her own content, add `i18n.supportedLanguages: { en, fr }`. If you're the only editor, skip it and keep the bundle smaller (the docs explicitly advise supporting only what you need).
10. **Whether media goes through Payload at all.** If the handful of images are just committed to `public/`, §4's storage question and §5's volume question both evaporate, and Payload handles only text and links.
11. **Next.js version pinning policy.** Payload pins `payload`↔`@payloadcms/next` exactly and constrains `next` to narrow security windows. Either pin `next` exactly and bump deliberately, or accept that a routine `pnpm update` can land you outside the supported range.

---

## Open questions / not found

- **Coolify + Next.js standalone is undocumented.** The Coolify Next.js page says nothing about `output: 'standalone'`, persistent storage, env-var timing, or the ISR/`.next/cache` directory. Its own example repo actively contradicts its Dockerfile. Everything in §5 connecting these is assembled from the generic Coolify pages plus the Next/Payload Dockerfiles.
- **Nobody documents Payload + a locale-routing proxy together.** The `(payload)` route group and `[lang]` root param demonstrably compose per Next.js's multiple-root-layouts semantics, but no Payload or Next doc shows the combination. Worth a spike before committing.
- **SQLite local file path.** `@payloadcms/db-sqlite` docs show `client.url` from an env var and mention `authToken` for remote, but never state whether `file:./payload.db` is supported. A libSQL convention, not a documented Payload one.
- **Why `next@15.5.x` is excluded outright** from Payload's peer range. The excluded set (15.5.x, 16.0.x, 16.1.x, 16.2.0–16.2.5) doesn't line up cleanly with any single published advisory's patched versions. No Payload changelog entry explaining it was found.
- **`payload build` vs `next build`.** The `main`-branch template's build script is `payload build`; at `v3.88.0` it is `next build`. This looks like a Payload 4 change but no doc for it was found. Use `next build` on v3.
- **S3-compatible `endpoint` config.** The storage-s3 docs only show `credentials` and `region`. Passing `config.endpoint` for Hetzner/Backblaze/MinIO is standard AWS-SDK usage and near-certainly works, but is not shown in Payload's docs.
- **Coolify Docker-network hostname for a one-click database.** Not documented on the pages reviewed; determine from the Coolify UI at provisioning time.
- **`filterAvailableLocales` interaction with a public frontend.** It only filters the admin selector; whether/how it should mirror the site's available locales is unaddressed.
- **`next/root-params` in Route Handlers** is unsupported ("planned for a future release"), which matters if you ever add a locale-aware sitemap or OG-image route.
