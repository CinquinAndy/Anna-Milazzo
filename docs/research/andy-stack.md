# Andy's stack, research notes

Research date: 2026-09-03. All sources below were fetched directly (HTTP 200, no auth wall).

**Important framing up front.** The requested page, [`/course/javascript-frameworks-training/final-project-practice/my-stack`](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack), loads fine, but it is **not a versioned stack specification**. It is a categorised, annotated *tool shelf* ("This section gathers the tools and libraries I use!") with **zero version numbers anywhere on the page** and no project-structure, i18n, or Docker prescriptions. Page metadata in the RSC payload gives `createdAt: 2025-12-08T12:55:45Z`, `publishedAt: 2025-12-08T12:55:48Z`, `updatedAt: 2025-12-08T12:58:09Z` ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

So the versions in this document come from a **second, harder primary source**: his own public repos, including the four he explicitly names on the sibling "Last chance" page as reference implementations to copy from ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/last-chance)). Where a claim comes from a repo rather than the course page, that is stated.

---

## Summary

The default stack, as actually built (repo evidence) and as taught (course evidence):

- **Framework:** Next.js **App Router**, currently **16.2.x–16.3.x** in his newest repos (`next: 16.3.4` in `nature-paysage-laheux` and `next-aram-buff-debuff`; `16.2.11` in `IsabelleCinquin`; `16.2.6` in `PortefolioV6` and `beswib`). Older/frozen projects sit on `15.5.x`. React **19.2.x** throughout. ([source](https://raw.githubusercontent.com/CinquinAndy/nature-paysage-laheux/main/package.json), [source](https://raw.githubusercontent.com/For-Hives/beswib/main/package.json))
- **Language:** TypeScript, strict. `5.9.3` is the common pin; two bleeding-edge repos are on `6.0.2` / `6.0.3`. ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/package.json))
- **Package manager:** **Bun** is the current default (`"packageManager": "bun@1.3.14"` in four separate repos). pnpm appears in older/CI-bound projects. ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/package.json))
- **Lint + format:** **Biome** (single tool, replaces ESLint + Prettier). Versions `2.4.x`–`2.5.x`. Legacy repos still on ESLint 9 + Prettier 3. ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/biome.json))
- **Styling:** **Tailwind CSS v4** (`4.2.2`–`4.3.3`), CSS-first config via `@import "tailwindcss"` in `globals.css`, `@tailwindcss/postcss`. Component layer is **shadcn/ui** (`style: "new-york"`, `baseColor: "zinc"`, `iconLibrary: "lucide"`) on Radix primitives, plus `clsx` + `tailwind-merge` via a `cn()` helper and `class-variance-authority`. ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/components.json))
- **Data layer:** two branches. **Payload CMS 3.8x** embedded in the same Next.js app (`(payload)` route group) over **Postgres** + **S3** for content sites; **PocketBase** for app-shaped projects. Prisma appears only in the older ForVoyez SaaS. ([source](https://raw.githubusercontent.com/CinquinAndy/IsabelleCinquin/main/package.json))
- **Auth:** **Clerk** (`@clerk/nextjs 6.39.3`) in production apps; Better Auth named as the preferred *custom* option on the course page. ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack))
- **Testing:** **Vitest** for unit/integration, **Playwright** for E2E/visual regression. He calls Playwright "the very best for me". Most small sites have no tests at all. ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/package.json))
- **Deploy:** **Coolify on a self-hosted VPS** (Netcup/Contabo/OVH), not Vercel. Build via **Nixpacks**, not Dockerfiles. GitHub Actions → Coolify deploy webhook on `v*.*.*` tags. ([source](https://andy-cinquin.com/course/javascript-frameworks-training/deploy-javascript-application/deploying-an-application))
- **Structure:** `src/` root, `src/app/[locale]/` App Router, colocated `locales.json` per route, `src/components/{ui,sections,global}/`, `src/lib/`, `src/hooks/`, `src/services/`, `src/models/`, `src/actions/`, `@/*` → `./src/*`. **kebab-case filenames** enforced by lint. ([source](https://github.com/For-Hives/beswib))

---

## Framework and version

**Course page:** the my-stack page names **no framework at all**, Next.js is not even in its link list. Framework advice lives on the sibling React chapter instead ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

On that sibling page he is unambiguous: *"Once you have some mastery of React, I **STRONGLY ADVISE** you to move on to a meta-framework"* and calls Next.js **"The Boss of Meta-Frameworks"**. He shows `npx create-next-app@latest` and an `app/` directory tree labelled `# 🆕 App Router (Next.js 13+)`, so App Router, not Pages Router ([source](https://andy-cinquin.com/course/javascript-frameworks-training/complete-react-training/react-nextjs-meta-frameworks)). Astro and Remix are named as acceptable alternatives on that same page; Astro appears nowhere in his actual repos.

**Repo evidence (versions, note these move fast, all read 2026-09-03):**

| Repo | `next` | `react` | Notes |
|---|---|---|---|
| `nature-paysage-laheux` | `16.3.4` | `19.2.8` | Payload site, named as reference ([source](https://raw.githubusercontent.com/CinquinAndy/nature-paysage-laheux/main/package.json)) |
| `next-aram-buff-debuff` | `16.3.4` | `19.2.8` | ([source](https://raw.githubusercontent.com/CinquinAndy/next-aram-buff-debuff/main/package.json)) |
| `IsabelleCinquin` | `16.2.11` | `19.2.7` | ([source](https://raw.githubusercontent.com/CinquinAndy/IsabelleCinquin/main/package.json)) |
| `PortefolioV6` (his own site) | `16.2.6` | `19.2.6` | ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/package.json)) |
| `beswib` | `16.2.6` | `19.2.6` | flagship OSS reference ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/package.json)) |
| `interview-job` | `16.2.10` | `19.2.7` | ([source](https://raw.githubusercontent.com/CinquinAndy/interview-job/main/package.json)) |
| `MaevaSiteV2` | `15.5.22` | `19.2.8` | named as reference, on 15.x ([source](https://raw.githubusercontent.com/CinquinAndy/MaevaSiteV2/main/package.json)) |
| `test-b3` (his student starter template) | `15.5.20` | `19.2.7` | ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/package.json)) |
| `esperancem` | `15.5.20` | `19.2.7` | ([source](https://raw.githubusercontent.com/CinquinAndy/esperancem/main/package.json)) |
| `ForVoyez` | `15.5.18` | `19.2.6` | older SaaS ([source](https://raw.githubusercontent.com/For-Hives/ForVoyez/main/package.json)) |

**Read:** Next 16 + React 19 is the live default; Next 15 is what's left in place on projects he hasn't touched recently. Renovate keeps versions pinned exactly (no `^` ranges on most deps) and bumps them ([source](https://github.com/CinquinAndy/IsabelleCinquin), `renovate.json` present).

Dev server: `next dev --turbopack` in `beswib`, `esperancem`, `next-aram-buff-debuff`; `next dev --turbo` in `PortefolioV6`; plain `next dev` in the Payload sites and the student template ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/package.json)).

---

## Language and tooling

**TypeScript.** Course page lists no version ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)). Repos pin `typescript: 5.9.3` most commonly; `PortefolioV6` and `nature-paysage-laheux` are on `6.0.2` / `6.0.3` ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/package.json)).

His **student starter template's `tsconfig.json`** is the clearest statement of what he considers correct strictness, and it is a file students are forbidden to modify:

```jsonc
"strict": true,
"noUncheckedIndexedAccess": true,
"exactOptionalPropertyTypes": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitOverride": true,
"forceConsistentCasingInFileNames": true,
"allowJs": false,
"target": "ES2022",
"moduleResolution": "bundler",
"paths": { "@/*": ["./src/*"] }
```

([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/tsconfig.json))

**Package manager.** The course page on package managers is descriptive only, it lists npm/yarn/pnpm/bun/deno and then teaches `npm init` / `npm install`, stating "npm is the default package manager for node.js" without picking a favourite ([source](https://andy-cinquin.com/course/javascript-frameworks-training/advanced-javascript-concepts/package-managers)). The grading rubric only requires "correct use of a **Package manager** (npm, Yarn)" ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations)).

In practice he has moved to **Bun**: `"packageManager": "bun@1.3.14"` in `test-b3`, `PortefolioV6`, `esperancem`, `MaevaSiteV2`; `bun@1.3.6` in `interview-job` and `devfortress`; `bun@1.3.4` in `IsabelleCinquin`. His student template README says *"Prérequis : bun (>= 1.3) et Node.js >= 20"* and every documented command is `bun dev` / `bun run build` ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/README.md)). `beswib` and `ForVoyez` still use pnpm (their CI is pnpm-based) ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/.github/workflows/build-test.yml)).

Node engines: `>=20.0.0` most often, `>=22.21.0` in `IsabelleCinquin`, `>=22.0.0` in `next-aram-buff-debuff`; CI runs Node `24.x` ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/.github/workflows/build-test.yml)).

**Linter / formatter, Biome.** The my-stack page lists all three and marks the direction of travel: *"Biome - Alternative to Prettier + ESLint (looks like it's going to be insane!)"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

His actual Biome config (student template, the strict variant) sets:

- `formatter.indentStyle: "tab"`, `indentWidth: 2`, `lineWidth: 120`, `lineEnding: "lf"`
- `javascript.formatter`: `quoteStyle: "single"`, `jsxQuoteStyle: "double"`, `semicolons: "asNeeded"`, `trailingCommas: "es5"`, `arrowParentheses: "asNeeded"`, `quoteProperties: "asNeeded"`, `bracketSpacing: true`
- `assist.actions.source.organizeImports: "on"`
- `linter.domains: { next: "recommended", react: "recommended" }`
- errors on: `noExplicitAny`, `noConsole`, `noNonNullAssertion`, `noArrayIndexKey`, `useExhaustiveDependencies`, `noUnusedVariables`, `noUnusedImports`, `noDangerouslySetInnerHtml`, `useUniqueElementIds`
- `noExcessiveCognitiveComplexity` capped at **15**
- **`useFilenamingConvention` → `kebab-case`, `strictCase: true`**

([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/biome.json))

The **same formatter block appears verbatim** in `beswib`'s `biome.json`, but with the linter deliberately loosened for real work: `useExhaustiveDependencies: "off"`, `noNonNullAssertion: "off"`, `noDangerouslySetInnerHtml: "off"`, `noArrayIndexKey: "warn"` ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/biome.json)). So: **the formatting rules are constant across his projects; the lint strictness is dialled up for teaching and down for shipping.**

**Legacy ESLint + Prettier.** The course's code-quality chapter still teaches ESLint + Prettier and publishes *"my personal Prettier configuration"*, which is the exact same style Biome now enforces: `useTabs: true`, `tabWidth: 2`, `singleQuote: true`, `jsxSingleQuote: false`, `semi: false`, `printWidth: 120`, `trailingComma: 'es5'`, `arrowParens: 'avoid'`, `bracketSpacing: true`, `quoteProps: 'as-needed'`, plus `plugins: ['prettier-plugin-tailwindcss']` ([source](https://andy-cinquin.com/course/javascript-frameworks-training/javascript-code-quality/linters-formatters-eslint-prettier)).

His stated reasons on that page: *"useTabs: true - Tabs adapt to everyone's indentation preferences"*, *"semi: false - Less visual noise, modern JS"*, *"printWidth: 120 - Modern screens allow longer lines"*, *"trailingComma: 'es5' - Facilitates Git diffs"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/javascript-code-quality/linters-formatters-eslint-prettier)).

His ESLint config on the same page is heavy on `eslint-plugin-perfectionist` for **import sorting by line-length descending**, with `internalPattern` groups `@/app/*`, `@/components/*`, `@/lib/*`, `@/models/*`, `@/services/*`, `@/constants/*`, which is also the folder taxonomy he actually uses in `beswib`. He turns *off* `react-hooks/exhaustive-deps` ("Disabled because sometimes too strict") and `jsx-a11y/alt-text`, and turns *on* `@typescript-eslint/strict-boolean-expressions`, `prefer-nullish-coalescing`, `no-explicit-any`, and the `no-unsafe-*` family ([source](https://andy-cinquin.com/course/javascript-frameworks-training/javascript-code-quality/linters-formatters-eslint-prettier)).

**Git hooks.** my-stack lists Husky ("execution of git hooks, scripts when pushing/committing") and Renovate ("automatic dependency updates") ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)). `renovate.json` is present in `beswib`, `IsabelleCinquin`, `nature-paysage-laheux`. Husky + lint-staged only survive in the ESLint-era repos (`ForVoyez`, `esperancem`), the Biome repos dropped them.

**Standard npm scripts.** Consistent across Biome repos: `check` = `biome check --write .`, `lint` = `biome check .` (or `biome ci .`), `format` = `biome format --write .`, `tsc`/`typecheck` = `tsc --noEmit`. The student template adds a single gate: `"validate": "biome ci . && tsc --noEmit && next build"` ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/package.json)).

---

## Styling

**Course page.** Tailwind is flagged as his own preference: *"TailwindCSS - Utility-first CSS framework (my favorite too)"*. Component libraries listed, with shadcn first and explicitly favoured: *"Shadcn UI - Re-usable components -> my favorite design"*, then 21st.dev, ReactBits, Aceternity, Tailwind UI ("paid Tailwind library"), Headless UI ("great utility library!"), Radix UI ("likewise, great utility library!"), Chakra UI. Icons: Lucide ("lots of icons") and Font Awesome. Image pipeline: Sharp and `cwebp` ("ultra-modern format to DRASTICALLY reduce image size"). **No versions given.** ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack))

The dedicated CSS-frameworks chapter is neutral history, Bootstrap → flexbox/grid → "Today, one of the most used and most popular is Tailwind CSS", then a long neutral list, closing with *"It's all a matter of taste"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/advanced-javascript-concepts/css-frameworks)).

**Repo evidence:**

- **Tailwind v4**, versions `4.2.2` (PortefolioV6) → `4.3.0` (beswib) → `4.3.2` (test-b3, interview-job) → `4.3.3` (nature-paysage-laheux, MaevaSiteV2, next-aram-buff-debuff). Always paired with `@tailwindcss/postcss` and a `postcss.config.mjs`; no `tailwind.config.js` anywhere.
- CSS-first entry point: the student template's entire `src/app/globals.css` is one line, `@import "tailwindcss";` ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/src/app/globals.css)).
- **shadcn/ui config** (`components.json`) present in *every* app repo checked, beswib, PortefolioV6, IsabelleCinquin, nature-paysage-laheux, MaevaSiteV2, next-aram-buff-debuff, interview-job. beswib's: `style: "new-york"`, `rsc: true`, `tsx: true`, `baseColor: "zinc"`, `cssVariables: true`, no prefix, css at `src/app/globals.css`, aliases `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`, `iconLibrary: "lucide"` ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/components.json)).
- Companion utilities in nearly every repo: `clsx`, `tailwind-merge`, `class-variance-authority`, `tw-animate-css`, `@tailwindcss/typography`, `lucide-react`, `sonner` (toasts), `next-themes`.
- Animation: `framer-motion` / `motion` `12.x` everywhere; `gsap` + `@gsap/react` and `three` + `@react-three/fiber`/`drei` in the showcase sites. my-stack rates Rive as *"premium banger animation ++++++"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

**INFERRED:** the "component library" answer is *shadcn/ui copied into `src/components/ui/`, new-york style, zinc base, Lucide icons, Radix underneath*, inferred from the identical `components.json` across seven repos rather than from a stated rule.

---

## Data layer / CMS / ORM / database

**Course page** lists, without ranking: Prisma ("TypeScript ORM"), Pocketbase ("Open-source Backend-as-a-Service (CMS) -> API in 5s"), Strapi ("Headless CMS -> API in 5s"), Payload CMS ("TypeScript-first CMS (integrated with NextJS) -> API in 5s"), Apollo ("GraphQL platform"). State/fetching: Zustand ("Lightweight state management"), TanStack Query / Router ("incredible"), TanStack Table. Validation: Zod ("advanced data validation, good practice") and Valibot ("very nice too"). URL state: Nuqs ("to be used for mirroring `useState` in a page's parameters"). Dates: Luxon. ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack))

**The stated rule** is on the grading page, and it's a real opinion, not a list:

> "either you make the api by hand, and in this case, we go on nest, adonis, hono, fastify, express... **Or we go on a CMS which will allow us to make the api in a few seconds, (very very very useful when we do a CRUD, so without mathematical calculations or complicated business logic, if it's just data processing, I advise you to start on that)**, in this case, we go on Strapi, Payload, Directus, Pocketbase, at your choice! (they are all good!)"

([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations))

**Repo evidence, two clear patterns:**

1. **Payload CMS inside the Next.js app** (his current default for content/marketing sites). `payload` + `@payloadcms/next` + `@payloadcms/ui` + `@payloadcms/richtext-lexical` + `@payloadcms/db-postgres` + `@payloadcms/storage-s3`, all version-locked together at **`3.85.1`** (IsabelleCinquin), **`3.86.0`** (MaevaSiteV2), **`3.88.0`** (nature-paysage-laheux). Database is **PostgreSQL**; media on **S3-compatible storage** (his my-stack page says his object storage is Cloudflare R2). Scripts `payload generate:types` and `payload generate:importmap` are standard. Schema lives in `src/collections/*.ts` + `src/globals/*.ts`, config at `src/payload.config.ts`, generated types at `src/payload-types.ts`, SQL migrations checked into `src/migrations/`. ([source](https://raw.githubusercontent.com/CinquinAndy/IsabelleCinquin/main/package.json), [source](https://github.com/CinquinAndy/IsabelleCinquin))
2. **PocketBase** for app-shaped projects, `pocketbase 0.26.9` in `beswib` and `esperancem`, `0.26.8` in `interview-job`. He describes beswib to students as "Nextjs + Pocketbase + Paypal" ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/last-chance)).

**Prisma** appears in exactly one repo, the older `ForVoyez` SaaS (`prisma`/`@prisma/client 6.19.3`, with `prisma migrate deploy` in the container entrypoint) ([source](https://raw.githubusercontent.com/For-Hives/ForVoyez/main/package.json)). **Strapi** backs his own portfolio site's content (`api-PortefolioV6`, "The API for the content of my portefolio ~ internationalization & data"), consumed by `PortefolioV6` over ISR ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/CLAUDE.md)).

**Validation in practice:** `zod 4.x` in PortefolioV6, ForVoyez, interview-job; `valibot 1.4.x` in beswib and interview-job. Both, not one.

**Data access shape** (beswib, his flagship): a `src/services/*.services.ts` layer (18 files: `bib.services.ts`, `paypal.services.ts`, `user.services.ts`, …), typed domain objects in `src/models/*.model.ts`, constants in `src/constants/*.constant.ts`, Server Actions colocated as `actions.ts` next to the route that uses them ([source](https://github.com/For-Hives/beswib)).

**Caching:** his portfolio uses ISR with `revalidate = 60` on all content pages, tagged fetches, and an on-demand `/api/revalidate` endpoint driven by Strapi webhooks, cache tags `courses`, `articles`, `realisations`, `content-website`, `strapi-content` ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/CLAUDE.md)). The Payload sites carry the same pattern via `src/hooks/revalidation.ts` + `src/app/api/revalidate/route.ts`.

---

## Testing

**Course page (my-stack), verbatim:** Playwright, *"End-to-end testing (the very best for me)"*; Cypress, "E2E testing framework"; Lighthouse; Unlighthouse ("lots of Lighthouse scans on lots of pages at once"); IBM Accessibility Checker ("super-unknown banger!"); Wappalyzer ("checks the technologies of a site/app") ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

**The testing chapter itself is generic and neutral**, test pyramid, Jest and Cypress code samples, Jest/Cypress/Playwright config examples, an 80% coverage threshold example, a Jest/Cypress CI workflow. It presents Vitest merely as "Fast alternative to Jest (Vite compatible)" and does not state a personal preference ([source](https://andy-cinquin.com/course/javascript-frameworks-training/introduction-to-testing/javascript-testing-strategies)). **Do not read the Jest examples there as his stack**, Jest appears in none of his repos.

**Repo evidence:**

- `beswib`: `vitest 4.1.6` + `@vitest/ui` + `jsdom` + `@vitejs/plugin-react`, `vitest.config.mjs`, tests in `src/tests/{actions,components,constants,lib,mocks,security,services}` with `src/tests/setup.ts`. Scripts `test`, `test:run`, `test:coverage`. No Playwright. ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/package.json))
- `ForVoyez`: both, `vitest 3.2.4` + `@vitest/coverage-v8` + `@testing-library/react` + `vitest-mock-extended` for unit, **and** `@playwright/test 1.60.0` with `test:e2e` split into general / subscribed / premium suites. ([source](https://raw.githubusercontent.com/For-Hives/ForVoyez/main/package.json))
- `PortefolioV6`: Playwright used specifically for **visual regression**, `test:visual`, `test:visual:update`, `test:visual:generate-baselines`, `--update-snapshots`, plus per-area greps (`Blog Pages`, `Portfolio`, `Legal Pages`). Unit tests run on the **Bun test runner**: `"test:unit": "bun test tests/unit"`, `"test:api": "bun test tests/integration"`. ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/package.json))
- `MaevaSiteV2`: `@playwright/test 1.62.1` installed, no test script wired.
- `IsabelleCinquin`, `nature-paysage-laheux`, `test-b3`, `interview-job`, `esperancem`: **no test framework at all.** MaevaSiteV2's CLAUDE.md states plainly: *"There are currently no automated tests configured in this project. When adding tests: Consider using Vitest"* ([source](https://raw.githubusercontent.com/CinquinAndy/MaevaSiteV2/main/CLAUDE.md)).

**Honest read:** testing is Vitest + Playwright when it exists, and it frequently doesn't. Small client sites ship untested; the marketplace app (`beswib`) and the SaaS (`ForVoyez`) are the ones with real suites. The grading rubric awards **zero explicit points for tests** ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations)).

---

## Deployment, hosting, Docker

**The rule, stated twice.** Deployment chapter: *"A whole host of ways to deploy exist. Vercel, Netlify, Railway, a VPS, a server at home... No matter the method, all are good if they meet your needs. **Personally, I advise you to use a VPS at Contabo/Netcup/Ovh etc. And go for a clean installation of Coolify** and get a domain name from ovh/cloudflare in the process"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/deploy-javascript-application/deploying-an-application)).

Repeated on the grading page: *"we put in prod / pre-prod, we deploy that, in a system that will quickly deploy! (ex: coolify // dokploy // vercel) … in study, **I strongly advise you a coolify / dokploy on a VPS on your side** if you want to learn to put something in prod"*, linking his own tutorial `https://andy-cinquin.fr/blog/installation-netcup-vps-coolify` ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations)).

**my-stack infrastructure section:** Coolify ("Self-hosted PaaS alternative to Vercel/Netlify"), Dokploy ("Open-source PaaS with Docker"), Homer (dashboard), **Cloudflare DNS** ("my domain names are on Cloudflare"), **Cloudflare R2** ("S3-compatible storage (free up to 15GB) -> we put our Coolify saves and everything else on it… very cheap storage"), Cloudflare Tunnel ("expose your localhost to the web, very useful for using webhooks"), Ngrok, Svix. Monitoring: Sentry, Umami ("Google Analytics but better!"), Metabase ("Give a great dashboard for salespeople so they can check DB data without bothering the devs! (a real banger)"), Uptime Kuma, BetterUptime, LogRocket. Secrets: Infisical ("allows for `.env` rotation… without having to copy/paste `.env` files… super useful for teams!"), Vaultwarden. Security: CrowdSec ("alternative to fail2ban"). ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack))

**Docker, the actual answer: he mostly doesn't write Dockerfiles.** I checked `Dockerfile`, `docker-compose.yml` and `nixpacks.toml` across `PortefolioV6`, `IsabelleCinquin`, `nature-paysage-laheux`, `MaevaSiteV2`, `esperancem`, `next-aram-buff-debuff`, `interview-job`, `beswib`, `ForVoyez`:

- **No `Dockerfile` and no `docker-compose.yml` in any of the nine except `ForVoyez`.**
- `IsabelleCinquin` has a **`nixpacks.toml`**, commented `# Nixpacks configuration for Coolify deployment`, Coolify builds the image itself from Nixpacks:
  ```toml
  [phases.setup]
  nixPkgs = ["...", "bun"]
  [phases.install]
  cmds = ["bun install --frozen-lockfile"]
  [phases.build]
  cmds = ["bun run build"]
  [start]
  cmd = "bun run start"
  ```
  ([source](https://raw.githubusercontent.com/CinquinAndy/IsabelleCinquin/main/nixpacks.toml))
- `ForVoyez` is the one hand-written Dockerfile: multi-stage `node:22-slim` base, corepack + pnpm, separate `/tmp/dev` and `/tmp/prod` dependency layers with `--frozen-lockfile --ignore-scripts`, `pnpm run prisma:generate && pnpm run build`, final stage copies `.next`, `public`, `src`, `package.json`, `prisma`, `EXPOSE 3000`, `ENTRYPOINT ["pnpm","run","launch"]` where `launch` = `prisma generate && prisma migrate deploy && next start` ([source](https://raw.githubusercontent.com/For-Hives/ForVoyez/main/Dockerfile)).

**CI/CD** (beswib, the only repo with workflows):

- `build-test.yml`, on every PR: checkout → Node `24.x` → pnpm 10.11.01 frozen-lockfile → `pnpm tsc` → `pnpm lint` → `pnpm test:run` → `pnpm build`. Secrets injected as env (Clerk, PocketBase, PayPal). ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/.github/workflows/build-test.yml))
- `deploy-prod.yml`, triggered on **`v*.*.*` git tags**: derive version from tag → `npm version --no-git-tag-version` → commit `⬆️VERSION⬆️ ❇️x.y.z❇️` → force-push to main → **`curl` a `COOLIFY_WEBHOOK` with a `COOLIFY_TOKEN` bearer** to trigger the deploy. ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/.github/workflows/deploy-prod.yml))

**Observability wiring:** beswib has `@sentry/nextjs 10.53.1` with `instrumentation.ts`, `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `withSentryConfig` wrapping `next.config.ts` with `tunnelRoute: '/monitoring'` (to dodge ad-blockers), `widenClientFileUpload: true`, `disableLogger: true` ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/next.config.ts)). Umami is loaded on his own course site (`umami.wadefade.fr/script.js`, self-hosted) ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations)).

---

## Project structure, folder layout, naming conventions

**Nothing on the my-stack page.** The prescriptions live in three other places.

**1. What he tells students (course).** The Next.js chapter shows a `create-next-app`-shaped tree with `app/`, `public/`, `components/`, `next.config.js`, annotating `app/` as "🆕 App Router (Next.js 13+)" ([source](https://andy-cinquin.com/course/javascript-frameworks-training/complete-react-training/react-nextjs-meta-frameworks)). The grading page says pick an architecture explicitly and let the framework lead: *"we start by choosing which file architecture, and which software architecture… often the chosen framework will give us good practices on that… For example, Nextjs directly offers you a way to organize your files and organize your thoughts, which you can easily find in the doc"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations)). The architecture chapter's closing "Golden rule 💡" is *"Start simple. Evolve according to real needs, not imagined needs"*, with named anti-patterns Big Ball of Mud, Golden Hammer, Over-Engineering, Premature Optimization ([source](https://andy-cinquin.com/course/javascript-frameworks-training/software-architecture-javascript/software-architectures-practical-guide)).

**2. His student starter template's enforced skeleton:**

```
src/
├── app/          # App Router (layout, page, styles globaux)
├── components/   # Vos composants, à vous de structurer
├── hooks/        # Vos custom hooks, on s'attend à en trouver ici
└── lib/
    └── mock-api.ts
```

([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/README.md))

**3. What his real apps look like.** `beswib` (`src/` root, App Router):

```
src/
├── app/[locale]/…          # every route under a locale segment
│   └── <route>/{page.tsx, actions.ts, locales.json, opengraph-image.tsx, loading.tsx}
├── components/{ui,global,landing,marketplace,dashboard,admin,auth,blog,
│               contact,emails,icons,legals,profile,providers,seo,waitlist,bits,OG}/
├── constants/*.constant.ts
├── guard/adminGuard.ts
├── hooks/use*.ts
├── lib/{i18n,seo,og,services,transformers,validation,generation}/ + utils.ts
├── middleware.ts
├── models/*.model.ts
├── services/*.services.ts
├── tests/{actions,components,constants,lib,mocks,security,services}/
└── types/*.ts
```

([source](https://github.com/For-Hives/beswib))

Payload sites use route groups instead: `src/app/(frontend)/…` and `src/app/(payload)/{admin,api}/…`, plus `src/collections/`, `src/globals/`, `src/fields/`, `src/actions/`, `src/emails/`, `src/migrations/`, `src/lib/payload/get-*.ts`, `src/payload.config.ts`, `src/payload-types.ts` ([source](https://github.com/CinquinAndy/IsabelleCinquin), [source](https://github.com/CinquinAndy/nature-paysage-laheux)).

**Naming conventions, evidenced:**

- **Files: kebab-case**, lint-enforced (`useFilenamingConvention` → `filenameCases: ["kebab-case"]`, `strictCase: true`) in the student template ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/biome.json)). His own repos follow it for components (`hero-section.tsx`, `modern-contact-form.tsx`) but **not** for Payload collections/globals (`Users.ts`, `Homepage.ts`) or beswib's client components (`SellerDashboardClient.tsx`), the rule is enforced on students more strictly than on himself.
- **Suffix taxonomy:** `*.model.ts`, `*.services.ts`, `*.constant.ts`, `*Client.tsx` for the client half of a server page, `locales.json` for colocated translations.
- **Import alias:** `@/*` → `./src/*`, universally.
- **Code and commits in English**, UI copy in the product's language: *"Le code, les commits et les noms de variables sont en anglais ; les textes visibles à l'écran suivent la maquette"* ([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/README.md)).
- **Branch:** `main` (Biome's `vcs.defaultBranch: "main"`); MaevaSiteV2 is the noted exception on `master` ([source](https://raw.githubusercontent.com/CinquinAndy/MaevaSiteV2/main/CLAUDE.md)).
- `.vscode/settings.json` + `.vscode/extensions.json` are committed in the template and the Payload sites.

---

## i18n / internationalisation

**The my-stack page says nothing about i18n whatsoever**, no library, no section, no link ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)). Neither does any other course page I fetched. This is a genuine gap between what he teaches and what he builds.

**What he actually does, two different approaches:**

**A. `beswib`, hand-rolled, colocated JSON, no i18n library.** Routes live under `src/app/[locale]/`. Each route folder carries its own `locales.json` (`blog/locales.json`, `dashboard/seller/locales.json`, `legals/terms/locales.json`, …), and shared component folders do too (`src/components/landing/hero/locales.json`, `src/components/global/locales.json`). Infrastructure sits in `src/lib/i18n/`, `config.ts`, `dictionary.ts`, `locale.ts`, `globalLocales.json`, `translations/validation.ts`, plus `clerk/localization.ts` and `clerk/theme.ts` for localising the Clerk widgets. Locale negotiation via `@formatjs/intl-localematcher` + `negotiator` in `src/middleware.ts`, with `src/hooks/useLocale.ts`, `src/app/[locale]/actions/locale.ts` and a `LocaleSynchronizer.tsx` client component. SEO strings get their own `src/lib/seo/constants/seo-locales.json` + `seo-translations.ts`. ([source](https://github.com/For-Hives/beswib)) Its README still lists *"Multi-language support (FR/EN/ES)"* as an unchecked TODO, so the plumbing predates full coverage ([source](https://raw.githubusercontent.com/For-Hives/beswib/main/README.md)).

**B. `PortefolioV6`, library-based, domain-driven.** `i18next 25.10.10` + `next-i18n-router 5.5.8`, locales `['fr','en']`, and, distinctively, *"Default locale determined by domain via middleware"* (French on the main domain, English on the alternate) rather than by path prefix. Routes still live under `src/app/[locale]/`. ([source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/CLAUDE.md), [source](https://raw.githubusercontent.com/CinquinAndy/PortefolioV6/main/package.json))

The single-market client sites (IsabelleCinquin, MaevaSiteV2, nature-paysage-laheux) have **no i18n at all**, French only, no `[locale]` segment ([source](https://github.com/CinquinAndy/nature-paysage-laheux)).

**INFERRED:** the `src/app/[locale]/` + colocated `locales.json` pattern is his current preference for anything multilingual, since it is the one in his flagship OSS project and needs no library. Not stated as a rule anywhere.

---

## Opinions he states as rules

Direct quotes, all from pages I fetched.

**On process order (grading page, the longest set of rules on the site):**

- *"we start from the functional, we display the important elements, we connect the back and the front, we set up the important bricks, and then we focus on the design and the details. **(not before)**"*
- *"**We do the design, and the animations at the end, and not before**, the main thing is that it works!"*
- *"THEN, we debug, we add tests. THEN, we put in prod / pre-prod"*
- *"after all that, we monitor, we measure, we watch, we add tests, we debug, and we refine. **And only from there we can start the optimizations, not before!**"*
- Wireframe before mockup before code: *"we do blocking, a bit like for video games"* (Balsamiq / wireframe.cc / Excalidraw), then moodboard, then Figma if you're not confident, *"in 99% of the cases, we will start on a mockup"*.
- On CMS-vs-hand-rolled-API: *"if it's just data processing, I advise you to start on that"* (i.e. use a CMS).

([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations))

**On architecture:** *"Start simple. Evolve according to real needs, not imagined needs."* And on microservices: *"ONLY if it has a business interest and the layers can be strongly decoupled. If you cut a Microservice and the app doesn't start, the Microservice isn't working!"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/software-architecture-javascript/software-architectures-practical-guide))

**On meta-frameworks:** *"I STRONGLY ADVISE you to move on to a meta-framework"*; React + Vite is titled *"Not Enough for Production"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/complete-react-training/react-nextjs-meta-frameworks)).

**On deployment:** *"Personally, I advise you to use a VPS at Contabo/Netcup/Ovh etc. And go for a clean installation of Coolify"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/deploy-javascript-application/deploying-an-application)).

**Graded requirements (these function as hard rules for his students):**

- **Architecture and Structure, 2 pts**, *"clear organization of files and folders, and **separation of responsibilities** (each module or component has a unique and defined role)"*
- **Error Handling, 1 pt**, *"mechanisms to handle errors (e.g. `Try/Catch`), and **systematic validation of user inputs**"*
- **Basic Performance, 1 pt**, *"absence of **memory leaks**"*
- **`.env` + runnable, 2 pts**, *"You must provide all your environment variables… I must be able to easily launch the application without having to spend time debugging it"*
- **Git and Versioning, 1 pt**, *"**coherent commit history**, **explicit and clear** commit messages, appropriate frequency and granularity of commits (small, logical, and regular changes)"*
- **Code Quality, 1 pt**, *"**readability**… clear **naming**… respecting style **conventions**"*
- **Technical Documentation, 1 pt**, *"a complete **README** (installation, launch, functionalities)"*
- **Written Justification of Choice**, *"often in a `framework.md` type document"*
- **Basic Security, 1 pt**, *"**Validation** and **Sanitization** of data"*
- **UX/UI, 2 pts**, *"**Ergonomics**, **responsive** design… and **accessibility**"*
- Blunt: *"code that doesn't work = no points"*

([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations))

**From his student starter template README**, the sharpest engineering rules he has written down:

- *"`bun run validate` doit passer sans aucune erreur"* (= `biome ci . && tsc --noEmit && next build`), *"C'est la première commande lancée à la correction."*
- *"composants courts et ciblés, logique extraite dans des **custom hooks** réutilisables… **Un composant monolithique de 300 lignes est éliminatoire.**"*
- *"**cleanup functions systématiques dans les `useEffect`** (timers, listeners, abort). Aucune fuite mémoire, aucune stale closure."*
- *"usage pertinent de `useRef` (focus, scroll), `createPortal` si nécessaire"*
- *"états de chargement visibles, annulation ou ignorance des réponses obsolètes (**race conditions**)"*
- *"**Immutabilité** : aucun état muté directement."*
- Config files are frozen: modifying `biome.json`, `tsconfig.json`, `next.config.ts` or the mock API = **0** on the technical portion.
- *"aucune librairie de composants tout faits : pas de `cmdk`, `sonner`, `react-toastify`, `react-select`, `downshift`, `headlessui`, `radix`"* (exam constraint, not a general rule, he uses all of these in production).
- *"Du code généré sans être compris ne passera pas `bun run validate`."*

([source](https://raw.githubusercontent.com/CinquinAndy/test-b3/main/README.md))

**On AI:** *"Although I don't mind the use of AI, I would ask you, on the small exercises, to **avoid using it too much**. The main objective is to **understand the code** you are writing."* Followed by advice to write *"complete system prompts"* and a link to Anthropic's prompt-engineering docs ([source](https://andy-cinquin.com/course/javascript-frameworks-training/javascript-frameworks-introduction/preparation-tools-required)).

**On always running the checker:** *"Always run `pnpm check` before committing to ensure code quality."* ([source](https://raw.githubusercontent.com/CinquinAndy/MaevaSiteV2/main/CLAUDE.md))

**Tools he singles out as personal favourites on my-stack** (his exact wording): Shadcn UI *"my favorite design"*; TailwindCSS *"(my favorite too)"*; Better Auth *"THE BEST solution for custom in-app auth"*; Clerk *"My little darling"*; Playwright *"(the very best for me)"*; Biome *"(looks like it's going to be insane!)"*; Rive *"premium banger animation ++++++"*; Metabase *"(a real banger)"*; IBM Accessibility Checker *"super-unknown banger!"*; Umami *"Google Analytics but better!"*; Obsidian *"My note-taking tool!"*; TanStack Query/Router *"incredible"*; Bruno, *"save directly to files, making API usage versionable! (shareable tests)"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

**His own tech-watch method**, stated as a rule on the same page: search `"Awesome <library> Github"`; *"If you have any doubt, type 'what's the best framework js, reddit'… you see the hardcore version of each extreme"*; *"I love 'Roadmap.sh'"*; `app.daily.dev` for monitoring ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack)).

---

## Reference repos he explicitly points students at

From the "Last chance" page: *"All my personal projects are open source ;) you can check the code directly!"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/last-chance))

| Repo | His description | Verified stack |
|---|---|---|
| [For-Hives/beswib](https://github.com/For-Hives/beswib) | "Blog + Marketplace Platform, Nextjs + Pocketbase + Paypal" | Next 16.2.6, React 19.2.6, Tailwind 4.3.0, Biome 2.4.15, PocketBase, Clerk, PayPal, Sentry, Vitest, pnpm, `src/app/[locale]/` |
| [For-Hives/ForVoyez](https://github.com/For-Hives/ForVoyez) | "SaaS without CMS, nextjs front+back" | Next 15.5.18, Prisma 6.19.3, Clerk, LemonSqueezy, ESLint+Prettier+Husky, Vitest + Playwright, hand-written Dockerfile |
| [CinquinAndy/nature-paysage-laheux](https://github.com/CinquinAndy/nature-paysage-laheux) | "Payload + Nextjs (Nextjs front, Nextjs back but Payload…)" | Next 16.3.4, Payload 3.88.0, Postgres, S3, Tailwind 4.3.3, Biome 2.5.11 |
| [CinquinAndy/MaevaSiteV2](https://github.com/CinquinAndy/MaevaSiteV2) | same | Next 15.5.22, Payload 3.86.0, Postgres, S3, GSAP, R3F, pnpm |

Not linked from the course but highly relevant: **[CinquinAndy/test-b3](https://github.com/CinquinAndy/test-b3)**, his only GitHub *template* repo (`is_template: true`), a B3 exam starter kit. It is the closest thing to a canonical minimal starter he has published, and its frozen `biome.json` / `tsconfig.json` / `next.config.ts` are the tightest statement of his baseline. Also **[CinquinAndy/PortefolioV6](https://github.com/CinquinAndy/PortefolioV6)**, the source of `andy-cinquin.com` itself ("My portefolio - NextJS - Biome - TS etc."), i18n + Strapi + ISR.

GitHub profile: [github.com/CinquinAndy](https://github.com/CinquinAndy), bio *"Software Engineer at @wildlifela… & Entrepreneur"*, 82 repos ([source](https://api.github.com/users/CinquinAndy/repos)). The username `Ancieus` in the brief does not exist; the correct handle is `CinquinAndy`, confirmed from the footer of [andy-cinquin.com](https://andy-cinquin.com/).

---

## Dating and drift

- The my-stack lesson was **created and last edited 2025-12-08** ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/my-stack), RSC payload).
- The course itself: *"This course was written in October 2025 for a course in France, in Nantes, at L'EPSI, a computer engineering school"* ([source](https://andy-cinquin.com/course/javascript-frameworks-training/final-project-practice/final-project-grading-expectations), RSC payload of the course intro).
- Package versions above were read on **2026-09-03** and will drift, Renovate is active on several repos. The *shape* (Next App Router + TS + Bun + Biome + Tailwind 4 + shadcn + Payload-or-PocketBase + Coolify) has been stable across the whole set.
- Language note: course pages are machine-translated from French originals at `andy-cinquin.fr` (the French my-stack page is `.../projet-final-formation/ma-stack`). Quoted English wording is the site's own translation, not mine.

---

## Open questions / not found

- **The my-stack page states no versions at all.** Every version number in this document comes from repo `package.json` files read on 2026-09-03, not from his own prose. If you need "what he claims", the answer is: an unversioned tool list.
- **No Next.js version, App Router statement, i18n mention, folder layout, or Docker guidance appears on the my-stack page.** All of that was reconstructed from sibling course pages and repos.
- **No canonical `create-andy-app` starter exists.** `test-b3` is a deliberately empty exam kit (no UI, no component library allowed), not a general-purpose template. There is no public repo that represents "the default stack" as a single scaffold.
- **npm vs Bun is unresolved in the teaching material.** The course teaches npm and the rubric names "npm, Yarn"; his repos are Bun (and pnpm in CI). He never writes down that he switched.
- **Vitest is never endorsed in prose.** The testing chapter teaches Jest; Jest appears in zero repos. The Vitest preference is repo-only evidence.
- **Biome vs ESLint is mid-migration.** The code-quality chapter still teaches ESLint + Prettier in full detail and only footnotes Biome; new repos are Biome-only. No page states the switch.
- **State management is underdetermined.** Zustand and TanStack Query are both praised on my-stack, but `@tanstack/react-query` appears only in `beswib` and Zustand in only three repos. Most sites use Server Components + Server Actions and no client state library. Reading this as "the default" would be **INFERRED** and weakly supported.
- **Better Auth is endorsed but unused.** Called "THE BEST solution for custom in-app auth" on my-stack; it appears in none of the repos I checked, all of which use Clerk. Same for Strapi (endorsed, only used by his own legacy portfolio API), Apollo/GraphQL (endorsed, unused as a client), Infisical, n8n, Postiz.
- **`docs/` conventions, commit-message format, and PR process:** not documented anywhere public. The rubric asks for "explicit and clear" commit messages but gives no format (no Conventional Commits evidence). The one automated commit format seen is beswib's release bot: `⬆️VERSION⬆️ ❇️x.y.z❇️`.
- **Attachments not retrieved.** `ressources.tar.gz` (2.8 KB) on the grading and subject pages, and `Stratégie de tests, tests.pdf` on the testing page, were not downloaded, they may contain further specifics.
- **French originals not diffed.** I read the `/en/` translations. The `andy-cinquin.fr` French pages could differ in nuance; I did not compare them.
- **Blog posts not read.** He links `andy-cinquin.fr/blog/installation-netcup-vps-coolify` and a three-part "comment-creer-un-produit" series as his deployment and product-process references. Those are on the `.fr` domain and were out of scope here; they likely contain the concrete Coolify/VPS setup he prescribes.
