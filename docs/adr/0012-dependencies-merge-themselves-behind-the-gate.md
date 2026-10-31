# Dependencies merge themselves, and the gate is what makes that safe

Every update below a major version merges on its own once three checks are green, and
deploys, because Coolify deploys whatever reaches `main`. That includes `next` and the
Payload packages, which this repository used to hold back for a person to read. Majors and
0.x minors still wait.

Andy decided it on 2026-11-01, on one condition: tests behind it that he does not have to
trust on faith. This records what those tests are, because the decision looks reckless
without them and the tests look excessive without the decision.

## What a bump has to get past

1. **Lint, types, unit tests.** Including `src/tests/renovate-policy.test.ts`, which holds
   the rules of `renovate.json` as examples, and `src/tests/toolchain.test.ts`, which fails
   if the bun or Node in `package.json` and the Dockerfile ever disagree. CI builds with the
   one and Coolify builds with the other, so a bot that moves one of them is green and wrong.
2. **Build and end-to-end.** A production build against a real Postgres, the migrations
   from empty, the seed, then 330-odd tests, among them `e2e/admin.spec.ts`, which creates
   an administrator, signs out and in, and opens the landing page's form. Payload and Next
   both ship that bundle and a bump can break it without breaking a single public page; the
   first to find out would have been Anna.
3. **Did the page change.** Every element on six routes at nine viewports, fingerprinted
   on the base and on the pull request. A bot's pull request fails if one moved. Both sides
   are measured with the same browser, the head's Playwright, because the fingerprint lists
   every property the browser computes and a different Chromium changes all of them: the
   pull request that bumped Playwright reported 17,892 elements changed.
4. **The migration step at deploy** (ADR-0011). A Payload bump that needs a column the
   database lacks fails `bun run build` before an image exists, and the live site keeps
   serving the previous one.

## What watches afterwards

`.github/workflows/prod-smoke.yml` runs `scripts/prod-smoke.mjs` against the live site
every six hours and on demand: the pages, the CMS, the editor, the share card. It is the one
thing that sees the real database, bucket and domain, which nothing before the merge can.
A red run is the alarm. It does not roll anything back; Coolify keeps the previous
container only when the *build* fails.

## What still waits for a person

- Every major (`major` label).
- A 0.x minor (`needs a read`), which is a breaking change by that ecosystem's convention.
  Today that is `sharp`, which resizes and encodes every image including the share cards,
  and which the render comparison cannot see.
- Nothing in `engines`: `engines.node` is a floor, and the pin strategy once rewrote it to
  `v26.12.1`, a Node this project does not run.

## What a bump gets, that it did not before

- **A three day wait** (`minimumReleaseAge`, with `internalChecksFilter: strict` so the pull
  request is not opened early). A release that is malicious or broken is usually pulled
  inside that window, and a bot that merges on green would otherwise take it first. A
  security advisory skips the wait.
- **A validated configuration.** CI runs Renovate's own validator with `--strict`. The file
  carried `postUpdateOptions: ["bunlock"]`, a value Renovate does not allow, and the hosted
  app answers an invalid file by opening an issue and creating nothing: no update from
  22 October until this was fixed, and nothing here said so.

## What this does not do

It does not make a bump safe. It makes a bump that breaks something one of these tests can
see impossible to merge, and one that breaks something none can see visible within six
hours. The gap between those is whatever the suite does not cover, and the way to narrow it
is a test, not a rule that sends the bump back to a person.
