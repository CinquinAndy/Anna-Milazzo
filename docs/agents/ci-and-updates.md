# The gate, and what merges itself

Two things live together here: a continuous integration workflow that runs the same checks
`bun run validate` runs locally, and a Renovate configuration that lets some dependency
updates merge themselves once that workflow is green. The second is only safe because of
the first, so read them in that order.

## What runs on every pull request

`.github/workflows/ci.yml`, three jobs, ordered by how quickly they tell you something is
wrong.

**check** is the linter, the types and the unit tests. No database, no browser, under a
minute. Note that `bun run lint` is `biome ci`, which enables rules `biome check` does not:
running the convenient command by hand is how four errors accumulated before this existed.

**verify** is the real thing. A Postgres container, the migrations, the seed, a production
build, and the end-to-end suite against it.

**render** answers the question the other two cannot: *did the page change?* It builds the
pull request, fingerprints what the browser computes for every element, checks out the
merge base, reinstalls, builds that, fingerprints it too, and compares. See below.

### What CI does not have, on purpose

No `S3_*`. Without those four values `src/lib/storage.ts` skips the bucket and Payload
writes uploads to local disk, so a pull request never puts Anna's fixtures into the real
bucket. `src/tests/storage.test.ts` fails if that ever becomes unconditional again.

The Turnstile pair in the workflow is Cloudflare's published always-passes test key. It is
not a secret, and it is what makes the contact form's success path deterministic without
holding a real key in a public repository.

`SEED_OVERWRITE_LIVE_CONTENT=yes` appears only in CI. The seed refuses everywhere else,
because the database this repository is normally pointed at is the live one.

## The render comparison

`scripts/render-fingerprint.mjs` walks every element on six routes at nine viewports and
hashes its full computed style plus its box. `scripts/render-diff.mjs` compares two of
those files.

It is stronger than a screenshot, because it sees what does not paint: `overflow: clip`
against `hidden`, `container-type`, `z-index`, `overscroll-behavior`, every value that
decides what happens tomorrow rather than what is on screen today.

Three things had to be true before it was worth anything, and each cost a round to find:

- **It must be exactly reproducible.** Two runs of an unchanged tree now produce identical
  files, 17,946 elements, zero differing rows, which is why the tolerance is zero.
- **It must not hang.** The first version waited for every image to load, and an image
  below the fold that is lazily loaded never fires either event, so a run took twenty
  minutes instead of two and a half. The wait is raced against a timer now.
- **It must be anchored on the page, not the framework.** Walking from `body` counted the
  scripts, meta tags, route announcer and `<div hidden>` streaming markers Next injects in
  an order and a number that vary between runs, which renumbered every sibling and reported
  the whole page as changed. The walk starts at `header`, `main` and `footer`.

It is also proved to catch something: changing `--border-brutal` from 4px to 5px moves all
17,946 rows, because every element inherits the token.

The comparison fails the run only for `renovate[bot]`. A person changing the design on
purpose gets the report without the red cross.

## Turning Renovate on

Two steps, both on GitHub, both yours:

1. Install the Renovate app on the repository, at <https://github.com/apps/renovate>. It is
   free for public repositories, and `renovate.json` is already here, so nothing else is
   needed. Renovate opens a "Configure Renovate" pull request first; merging it is what
   starts everything.
2. **Protect `main` and mark the checks required**, in Settings, Branches. Require
   `Lint, types, unit tests`, `Build and end-to-end` and `Did the page change`. Without
   this, GitHub's auto-merge merges as soon as it is asked rather than when the checks
   pass, and the whole arrangement is decoration.

## What merges itself, and what does not

| | |
|---|---|
| Merges itself | Toolchain patch and minor: biome, vitest, playwright, typescript, the type packages. They cannot change what a visitor sees, only whether the gate is honest about it, and the gate runs on the same pull request. |
| Merges itself | Runtime patch, behind the render comparison. |
| Merges itself | The monthly lockfile refresh. |
| Waits for you | Every major, labelled `major`. |
| Waits for you | `payload` and the five `@payloadcms/*` packages, grouped, because a Payload minor can carry a schema change, which needs a migration rather than a merge. |
| Waits for you | `next`, labelled `needs a read`. This project pins it, the framework's own agent notes warn that its APIs move, and a bump can change how every page renders. |
| Waits for you | `sharp`, which compiles native binaries per platform. |

Security advisories ignore the schedule and open immediately.

The dependency dashboard is an issue in the repository listing everything waiting, whether
it has a pull request open or not.

## When a bot's pull request goes red

Read which job failed.

`check` or `verify`: the update broke something a test already covers. The failing test
names it.

`render`: the update changed the page. The job summary says how many elements moved and on
which routes, and the two fingerprints are attached as an artifact. Download both and diff
them to see exactly which properties changed. A dependency that changes the render is not
automatically wrong, but it is never something to merge without looking.
