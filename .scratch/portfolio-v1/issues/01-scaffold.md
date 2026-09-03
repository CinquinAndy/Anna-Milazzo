# 01: Scaffold the project

**What to build:** A running local project. `bun run dev` serves a page, the Payload admin
opens and accepts a login, a migration has been generated and applied against the real
Postgres, and the validate script passes clean.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Next.js is pinned to exactly `16.3.4`; `payload` and every `@payloadcms/*` package sit on the same `3.88.x` version as each other
- [ ] Payload runs inside the Next app under its own route group; the admin panel loads and a first user can be created
- [ ] Postgres is the database adapter, pointed at `DATABASE_URL`; a migration has been generated, committed and applied — `push` is not used outside dev
- [ ] Migrations run from their own named script, separate from build and start
- [ ] TypeScript is strict; Biome handles both lint and format; Bun is the package manager
- [ ] Vitest and Playwright are installed and each runs one trivial passing test, establishing where tests live
- [ ] A single validate script runs lint, typecheck, tests and build, and is green
- [ ] `.env.example` lists every variable the app reads, with no values
