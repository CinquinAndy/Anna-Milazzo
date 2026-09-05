# 01: Scaffold the project

**What to build:** A running local project. `bun run dev` serves a page, the Payload admin
opens and accepts a login, a migration has been generated and applied against the real
Postgres, and the validate script passes clean.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Next.js is pinned to exactly `16.3.4`; `payload` and every `@payloadcms/*` package sit on the same `3.88.x` version as each other
- [x] Payload runs inside the Next app under its own route group; the admin panel loads and a first user can be created
- [x] Postgres is the database adapter, pointed at `DATABASE_URL`; a migration has been generated, committed and applied, `push` is not used outside dev
- [x] Migrations run from their own named script, separate from build and start
- [x] TypeScript is strict; Biome handles both lint and format; Bun is the package manager
- [x] Vitest and Playwright are installed and each runs one trivial passing test, establishing where tests live
- [x] A single validate script runs lint, typecheck, tests and build, and is green
- [x] `.env.example` lists every variable the app reads, with no values

## Comments

Scaffolded and validated locally. `bun run validate` is green: Biome, `tsc --noEmit`,
Vitest, `next build`, Playwright.

**Versions.** `next` is pinned to exactly `16.3.4`. `payload`, `@payloadcms/next`,
`@payloadcms/db-postgres`, `@payloadcms/richtext-lexical` and `@payloadcms/ui` are all
pinned to `3.88.0` and must move together. `graphql` is held at `16.14.2` because
`@payloadcms/next` peers on `^16.8.1` and 17 is out. TypeScript is `6.0.3`, not the `7.0.2`
on the `latest` tag, 7 is the native rewrite and nothing in this stack is proven against
it yet.

**Migrations, not push.** `postgresAdapter` is configured with `push: false` rather than
the default dev-only push. Payload's docs warn against mixing push with manual migrations,
and dev here points at the same real Postgres, so migrations are the only path to a schema
change in every environment. `20260903_232844_initial` is committed and applied; the
database holds `users`, `users_sessions` and Payload's six bookkeeping tables.

**Where tests live.** Vitest at `src/tests/**/*.test.ts`, Node environment, no jsdom,
because the spec's only unit-test subjects are the player controller and
`sendContactMessage`, and presentational components are covered through real routes.
Playwright at `e2e/**/*.spec.ts`.

**Playwright runs on port 3111, and never reuses a running server.** On the usual dev
port an unrelated project's dev server answered and the smoke test asserted against the
wrong application. Reuse is off entirely as well: a `next start` left over from an earlier
build would let the gate pass against code no longer on disk.

**Deliberate omissions.** No `output: 'standalone'`, that is a Dockerfile commitment and
the deployment shape is undecided. No CSS: the theme layer is ticket 02. No `[lang]`
segment and a hardcoded `<html lang="it">`: locale routing is ticket 03. No `media` or
`audio` collections: those are tickets 04 and 05, so `next.config.ts` carries no
`images.localPatterns` yet. The frontend metadata is the site's name only, real copy lives
in Payload (ADR-0003) and arrives with ticket 06.

**Payload's GraphQL routes were dropped.** The blank template ships `api/graphql` and
`api/graphql-playground`; neither the spec nor any ticket asks for GraphQL, and the
playground is a public introspection surface with no purpose here. All reads go through the
Local API. The `graphql` package stays because `payload` peers on it. Re-adding the routes
later is a copy from the template.

**Adaptations to the Payload blank template.** The template's `custom.scss` became
`custom.css`, because the template imports Sass without depending on `sass`.
`tsconfig.json` drops `noUnusedLocals`/`noUnusedParameters`, they fire on Payload's
generated migration files, which are not ours to edit; Biome's `noUnusedVariables` and
`noUnusedImports` cover our own source instead. `baseUrl` is gone too: TypeScript 6
deprecates it, and `paths` resolves relative to the config without it. `allowJs` stays
`true` against the strictness recorded in `docs/research/andy-stack.md`, because the
generated `admin/importMap.js` is a real `.js` file that `(payload)/layout.tsx` imports.
The template's `webpack` block is kept: Next 16 builds with Turbopack and never consults
it, but it is what makes `--webpack` work if Turbopack ever has to be backed out of, and
Payload is exactly the kind of dependency that forces that.

**Script names follow `docs/research/andy-stack.md`:** `lint` is check-only (`biome ci .`),
`check` writes fixes, `format` formats. The five Payload CLI scripts delegate to the one
`payload` script rather than repeating its `NODE_OPTIONS`.

**`next dev` appends a block to `CLAUDE.md`** and re-adds it on every run. Committed as-is
per its own note, rather than fighting it with `agentRules: false`.

**Needs a human.** `.env` had `PAYLOAD_SECRET` empty; a local secret was generated into it
(`.env` is gitignored). First-user creation and login were both exercised against the
running admin panel and the throwaway account was then deleted, so no credential is written
down anywhere and `/admin` again offers to create the first user. Andy makes his own.
