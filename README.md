# Anna Milazzo

A bilingual portfolio for the composer and sound designer Anna Milazzo. Italian is the
default language and English sits under `/en`; there are three pages (the landing
page, contact, and legals) and every word of them is editable in the CMS.

Next.js 16 with Payload 3 running inside the same application, Postgres for content,
Cloudflare R2 for media and audio, Bun for scripts.

---

## Requirements

- Bun ≥ 1.3
- Node ≥ 20.9, the Payload CLI runs on Node, not Bun, because Bun's runtime cannot
  evaluate the lexical editor
- A Postgres database
- `ffmpeg`, only if you regenerate the placeholder audio

## Getting started

```bash
cp .env.example .env   # then fill it in; PAYLOAD_SECRET via: openssl rand -base64 32
bun install
bun run migrate
bun run dev
```

The portfolio is at http://localhost:3000 and the Payload admin at
http://localhost:3000/admin, where the first visit offers to create the first user.

`bun run seed` fills a NEW database with the placeholder content, five works, the
timeline, every string on the page in both languages.

**It refuses to run without being told to.** The site is live on this database, and the
seed replaces every global outright, so running it would overwrite whatever Anna has since
written in the panel and put the placeholder text back. There are no drafts and no
versions, so nothing could be restored. If you are genuinely filling a new environment:

```bash
SEED_OVERWRITE_LIVE_CONTENT=yes bun run seed
```

## Environment

| Variable | What it is for |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `S3_*`, `R2_PUBLIC_URL` | The R2 bucket, and the public domain in front of it |
| `PAYLOAD_SECRET` | Signs Payload's tokens |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` | Contact form delivery |
| `TURNSTILE_*`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Contact form anti-bot |
| `CONTACT_DELIVERY` | `log` writes messages to the log instead of sending them |

Media and audio are served straight from `R2_PUBLIC_URL`, never proxied through Next: R2
egress is free and supports `Range`, and the application must not be the bandwidth
bottleneck for a page whose point is playing audio.

> **A caching note.** Cloudflare caches that domain at the edge and ignores client
> `Cache-Control`. Replacing a file under the same name leaves visitors on the old one until
> the cache expires or is purged, worth knowing before Anna re-uploads a track.

---

## How the content works

Every string on the site comes from Payload ([ADR-0003](docs/adr/0003-all-copy-lives-in-payload.md)).
There is no copy in the components; a heading with no value in the CMS renders nothing
rather than a placeholder.

`title` and `story` on a Song are `text` and `textarea` rather than rich text on purpose:
Payload falls an empty string back to the default locale only for those two types. A Song
Anna has not translated yet shows its Italian story under `/en` instead of a blank.

## The audio pipeline

The distinctive part of this codebase. When a track is uploaded, it is decoded once on the
server and measured twice:

- **`peaks`**, 128 RMS readings, the waveform each Song's rail draws.
- **`tone`**, 128 spectral-centroid readings, which give every bar in that rail its colour:
  green where the sound is low, magenta where it is bright.

Both are stored on the audio record and travel with the page, so the rail is correct on the
first frame and costs the visitor no download and no decode.

This is done on the server because it cannot be done in the browser, and that was
established by measurement rather than by assumption: the bucket domain sends no
`access-control-allow-origin`, so a cross-origin media element taints the Web Audio graph
and an analyser returns silence, while adding `crossorigin="anonymous"` makes the fetch
fail outright. On top of that the page owns exactly one `<audio>` element
([ADR-0007](docs/adr/0007-audio-playback-architecture.md)) and `createMediaElementSource`
permanently reroutes whatever it is given.

The FFT is written in-repo (`src/lib/player/fft.ts`) rather than installed, and a test
holds it against a direct DFT.

## Design

Neo-brutalist, and the rules are load-bearing rather than decorative: flat fills, a black
keyline on every edge, hard zero-blur shadows, and a fixed palette on a hue lattice
generated from Anna's own colours. There is no dark mode, and a test fails the build if one
appears ([ADR-0004](docs/adr/0004-no-dark-mode.md)).

Motion is quantised with `steps()` rather than eased, except where it depicts something
physical. Every loop is declared inside `@media (prefers-reduced-motion: no-preference)` and
never switched off afterwards, the usual `0.001ms` override does not stop scroll-driven
animations.

There is no component library, no `cn()`, no icon package and no motion library. Animation
is CSS or one hand-written animation frame loop; icons are drawn as SVG in the file that
uses them.

---

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Development server |
| `bun run build` / `bun run start` | Production build, then serve it |
| `bun run lint` | Biome, check-only |
| `bun run check` / `bun run format` | Biome, writing fixes / formatting only |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run test` | Vitest, `src/tests/**/*.test.ts` |
| `bun run test:e2e` | Playwright, `e2e/**/*.spec.ts`, needs a build first |
| `bun run validate` | The gate: lint, typecheck, unit tests, build, e2e |
| `bun run migrate` | Apply pending migrations |
| `bun run migrate:create <name>` | Generate a migration from the current Payload config |
| `bun run migrate:status` | What has run and what has not |
| `bun run seed` | Fill a NEW database with placeholder content. Refuses without `SEED_OVERWRITE_LIVE_CONTENT=yes`, because it would overwrite the live site |
| `bun run generate:types` | Rewrite `src/payload-types.ts` |
| `bun run generate:importmap` | Rewrite the admin import map |

Two generators produce the committed placeholder assets and are run by hand, never by a
build:

| Script | What it does |
| --- | --- |
| `bun run src/seed/make-fixtures.ts` | The five placeholder tracks. Needs `ffmpeg` |
| `bun run src/seed/make-covers.ts` | The five placeholder sleeves. Uses `sharp` |

Both are deterministic: a regenerated asset that differed from the committed one would be a
binary diff nobody could review.

Migrations are deliberately their own script, run neither by `build` nor by `start`, so a
deployment pipeline can call them at the point it chooses. `push` is off, schema changes
always travel as a committed migration.

## Testing

Unit tests cover the parts with real logic: the player's state machine, the audio analysis,
the timeline's period parsing, the locale rules. End-to-end tests drive the built site and
assert behaviour the unit tests cannot see, that the rail is drawn from each track's own
audio, that nothing overlaps the story at any width, that the page never scrolls sideways,
that focus is visible on every control.

Several checks measure pixels rather than reading code: contrast is read back off a
screenshot with the type hidden, and overflow is measured at seven widths. That has caught
defects reading the source did not.

## Deployment

Self-hosted on Coolify. There is deliberately no Dockerfile and no `output: 'standalone'`, the deployment shape is the operator's to choose, and this repository does not assume one.
Run `bun run migrate` before starting the new build.

## Where the decisions are written down

- [`CONTEXT.md`](CONTEXT.md), the domain language: what a Song, a Folder, a Recruiter mean here
- [`docs/adr/`](docs/adr/), the decisions that would otherwise be re-argued
- [`docs/research/`](docs/research/), primary-source research behind the visual direction
- `.scratch/portfolio-v1/`, the original spec and tickets
