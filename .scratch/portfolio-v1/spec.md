# Spec: Anna Milazzo Portfolio v1

**Status:** ready-for-agent

## Problem Statement

Anna Milazzo has just finished music school and has no professional presence on the web.
When someone who might hire her asks to hear her work, she has nothing to send but files
and platform links. She needs a place that presents who she is, lets a stranger listen to
what she makes within seconds of arriving, and makes contacting her obvious — in Italian
for her home market and English for everyone else. She also needs to keep it current
herself, without asking a developer every time she finishes something.

## Solution

A three-page Portfolio — landing, contact, legals — in a neo-brutalist visual language:
black keylines, hard offset shadows, square corners, flat colour blocks on a warm paper
ground, with taped-on photographs and scrapbook ornament.

The landing page carries everything a Recruiter needs: a typographic hero with Anna's
portrait, a short about, a set of skills, a vertical stack of paper **Folders** each
holding one **Song**, a sequencer-strip timeline of her training and experience, and a
route to contact. Every Song plays in the Portfolio's own player without leaving the page,
and links out to the same track on a streaming platform for anyone who wants it there.

Italian is served unprefixed at `/`; English lives under `/en`. Every word on the site,
not only Song content, is editable by Anna in Payload in both languages. We write the
first version of all of it so the copy is good; she edits from there.

## User Stories

1. As a Recruiter, I want to know within two seconds whose site this is and what they do, so that I do not have to hunt for context.
2. As a Recruiter, I want to see Anna's face, so that the person feels real rather than a list of files.
3. As a Recruiter, I want to hear a Song without clicking through to another site, so that I can judge her work immediately.
4. As a Recruiter, I want the play control to be unmistakable, so that I do not have to work out how the player works.
5. As a Recruiter, I want only one Song playing at a time, so that starting a second does not create noise.
6. As a Recruiter, I want to see how far through a Song I am, so that I know how much is left.
7. As a Recruiter, I want to scrub to a different point in a Song, so that I can skip to the part I care about.
8. As a Recruiter, I want a Song to stop at its end rather than rolling into the next, so that nothing plays that I did not ask for.
9. As a Recruiter, I want to read the story behind a Song next to the player, so that I understand the intent as well as the sound.
10. As a Recruiter, I want to see the cover image for each Song, so that the work has a visual identity.
11. As a Recruiter, I want a link to the Song on a streaming platform when one exists, so that I can save it where I already listen.
12. As a Recruiter, I want every Song visible without opening or expanding anything, so that I can see the full body of work at a glance.
13. As a Recruiter, I want to understand Anna's training and experience in one scan, so that I can place her level.
14. As a Recruiter, I want to see what skills she claims, so that I can match her to a role.
15. As a Recruiter, I want an obvious way to contact her, so that I do not have to search for an email.
16. As a Recruiter, I want to send a message from the site itself, so that I can act while I am still interested.
17. As a Recruiter, I want confirmation that my message was sent, so that I am not left wondering.
18. As a Recruiter, I want to be told clearly when my message could not be sent, so that I can try another route.
19. As an English-speaking Recruiter, I want the whole site in English, so that nothing is guessed at.
20. As an Italian Recruiter, I want the site in Italian by default, so that it reads as hers.
21. As a Recruiter, I want to switch language at any point without losing my place, so that switching is not a punishment.
22. As a Recruiter on a phone, I want every Folder fully visible and independently tappable, so that I do not fight the layout to reach a Song.
23. As a Recruiter on a phone, I want audio to work the same as on desktop, so that I can listen on the move.
24. As a Recruiter using a keyboard only, I want to reach and operate every control, so that I can use the site at all.
25. As a Recruiter using a screen reader, I want the Folder stack announced as a list of works rather than as tabs, so that the structure matches the content.
26. As a Recruiter who has switched on reduced motion, I want decorative animation suppressed, so that the site does not make me unwell.
27. As a Recruiter on a slow connection, I want the page readable before any audio loads, so that I am not waiting on media I did not request.
28. As a Recruiter, I want the legals page reachable from anywhere, so that I can see who is behind the site.
29. As Anna, I want to upload a new Song myself, so that I do not have to ask a developer.
30. As Anna, I want to write each Song's title and story in both Italian and English, so that both audiences get the real text.
31. As Anna, I want to attach a cover image to a Song, so that it looks like a release rather than a file.
32. As Anna, I want to add a platform link to a Song when it exists and leave it empty when it does not, so that the site never shows a dead link.
33. As Anna, I want to choose the order the Songs appear in, so that my strongest work is first.
34. As Anna, I want to edit the headings and paragraphs across the whole site, so that the words are mine.
35. As Anna, I want the admin interface in Italian, so that I am not editing my own site in a second language.
36. As Anna, I want to add and reorder entries on the timeline, so that it stays current as I gain experience.
37. As Anna, I want to change my skill list, so that it tracks what I actually do.
38. As Anna, I want to replace my portrait, so that the site ages with me.
39. As Anna, I want to be told if an upload is too large rather than having it silently truncated, so that I do not publish a broken track.
40. As Anna, I want a Song I have not translated yet to still render in English rather than showing a blank, so that an unfinished translation never produces an empty page.
41. As Andy, I want the site to deploy from a git push, so that shipping is not a manual ritual.
42. As Andy, I want database migrations to run as part of deployment, so that a schema change cannot reach production half-applied.
43. As Andy, I want media to live outside the container, so that a redeploy cannot destroy Anna's masters.
44. As Andy, I want audio served straight from object storage rather than through the app, so that the app is not a bandwidth bottleneck.
45. As Andy, I want contact messages to arrive in my inbox for now and to be re-pointed later by changing configuration, so that handover costs nothing.
46. As Andy, I want bots blocked from the contact form, so that the inbox stays usable.
47. As Andy, I want type checking, linting and tests to run before a deploy, so that a broken build never ships.

## Implementation Decisions

### Seams

Three, and no more. Everything else is tested through the first.

1. **The rendered route.** The primary seam. Playwright drives real routes against a
   seeded database. This covers routing, locale negotiation, Payload queries, component
   rendering and the player's observable behaviour in one place. Prefer adding coverage
   here over introducing a new seam.
2. **`sendContactMessage`.** One function at the outbound boundary. Turnstile
   verification and Resend delivery both sit behind it, so tests never reach the network.
3. **The player controller.** A framework-free state module — current Song, playing,
   position, seek — with no React and no DOM in its interface. Justified separately from
   seam 1 because the iOS constraints make its state transitions subtle, and driving them
   through a browser is slow and indirect.

### Stack

Next.js pinned to `16.3.4` exactly; Payload `3.88.x` with `payload` and `@payloadcms/*`
moved in lockstep. The version window is narrow — `@payloadcms/next` excludes Next 15.5.x,
16.0.x, 16.1.x and 16.2.0–16.2.5 — and everything below 16.3.3 carries two critical RCE
advisories. A routine dependency update can land outside the supported range, so `next` is
pinned, not ranged. TypeScript strict, Biome for lint and format, Bun as package manager,
Vitest and Playwright for tests, per the conventions in `docs/research/andy-stack.md`.

### Routing and locales

Payload runs inside the Next app under a `(payload)` route group. The frontend lives under
a `(frontend)/[lang]/` tree. `proxy.ts` — Next 16's rename of `middleware.ts` — rewrites
unprefixed paths onto the Italian tree and passes `/en/*` through untouched.

Its matcher **must** exclude `/admin`, `/api`, `/_next` and static assets. The naive
matcher in the Next.js documentation breaks the Payload admin panel; this is the single
most likely way to lose a day on this build.

Locale codes are `it` and `en`. `it` is `defaultLocale`; English falls back to Italian
silently rather than rendering empty. URL segments are not translated: `/`, `/contact`,
`/legal` and their `/en` counterparts.

### Content model

Collections:

- **`media`** — upload-enabled, images only. Cover images and Anna's portrait.
- **`audio`** — upload-enabled, `audio/mpeg` only. One full track per record.
- **`songs`** — title and story localized; relationships to one `media` cover and one
  `audio` track; an optional `platformUrl`; an explicit sort order; a duration in seconds
  stored on the record so the page never needs to load audio to render a running time.

Globals, all fields localized: **`home`** (hero, about, skills, every section heading),
**`contact`**, **`legals`**, and **`settings`** (social links, contact address).

`localized: true` is set before any content is saved. Toggling it afterwards destroys the
field's existing data, so the schema has to be right the first time.

### Storage

Postgres via `@payloadcms/db-postgres`, with migrations generated and run in deployment —
`push` is dev-only. Media and audio go to Cloudflare R2 through `@payloadcms/storage-s3`,
configured with `forcePathStyle: true`, `region: 'auto'`, no `acl` (R2 rejects
`x-amz-acl`), and `requestChecksumCalculation: 'WHEN_REQUIRED'` (R2 does not support
CRC32 full-object checksums).

Audio is served to browsers from the public custom domain in front of the bucket, never
proxied through Next: R2 egress is free, `Range` is supported on `GetObject`, and the
`r2.dev` domain is documented as rate-limited and not for production.

`proxyClientMaxBodySize` is set explicitly above the largest expected track. Its 10 MB
default does not error on overflow — it truncates the body silently, which would let Anna
upload a corrupt track and believe it worked.

### Audio playback

One `<audio preload="none">` element mounted at layout level; Folders ask it to play. See
ADR-0007 for why: iOS permits a single audio stream at a time, and twelve elements at
`preload="metadata"` fire twelve requests before any interaction.

`play()` and `src` assignment happen synchronously inside the gesture handler — nothing
awaited in between, or iOS blocks it. The playhead is written to a CSS custom property,
never to React state; `timeupdate` has no specified frequency. The seek control is a
native `<input type="range">`, styled, rather than a custom `role="slider"`. No volume
control: on iOS `volume` is not settable and always reads back as 1. Progress is drawn as
chunky decorative blocks, not a waveform.

### Contact

A server action verifies the Turnstile token, then sends through Resend. Nothing is
persisted — see ADR-0005. Sender and recipient are configuration, so re-pointing them at
Anna's own domain later is an environment change, not a code change.

### Visual system

The theme layer is `docs/design/globals.css`, copied to the app at scaffold time: blue
`--primary` carrying white type, cantaloupe `--accent` carrying black type only, warm
paper ground, `--radius: 0`, 4px keylines, hard offset shadows, blue focus outline. No
dark mode (ADR-0004).

Folder tabs use the negative-margin technique: two boxes, tab with `border-bottom: 0`,
`margin-block-end: -4px` and `z-index: 2` over an opaque body. Not `clip-path`, which
clips the border. The Folder's shadow is one `filter: drop-shadow()` on the wrapper, never
`box-shadow` per box, which notches the tab/body join. Tab position alternates down the
column. The stack is not `role="tablist"` — it is a list of articles.

Typography is Bricolage Grotesque, Instrument Sans and Azeret Mono, loaded with
`subsets: ['latin', 'latin-ext']` and `axes: ['opsz', 'wdth']` (ADR-0008). Headings floor
at `line-height: 0.9`: Italian all-caps carries diacritics above the cap height. Every
heading is checked against `ÈÀÙ PERCHÉ PIÙ CITTÀ PERÒ` at final size, and laid out to the
Italian string — short strings expand 200–300% from English.

Motion is one signature move applied consistently: hover lifts and grows the shadow, press
translates into the shadow and collapses it, around 90ms ease-out. Static rotation on tape
and stickers, never animated. Marquees, entrances and loops sit inside a
`prefers-reduced-motion: no-preference` query — declared there from the start, since the
`0.001ms` override does not stop scroll-driven animation.

### Deployment

Coolify, building from a Dockerfile rather than Nixpacks, with `output: 'standalone'` set
in `next.config`. Payload's official Dockerfile requires it and Coolify's own Next.js
example ships without it, so neither can be copied unmodified. Build-time and runtime
environment variables are flagged separately in Coolify: `NEXT_PUBLIC_*` must be
build-enabled, secrets runtime-only.

## Testing Decisions

A good test here describes what a Recruiter or Anna can observe, and nothing else. It
names Songs, Folders and locales, not components, props or hooks. It survives the whole
visual layer being rewritten, which on this project is likely.

- **Playwright, against seeded Postgres, over real routes.** The bulk of coverage. Landing
  renders each seeded Song in order; playing one and then another leaves only the second
  playing; `/` serves Italian and `/en` serves English; a Song with no English story falls
  back to Italian rather than rendering blank; a Song with no `platformUrl` shows no link;
  the language switch preserves the current page; the contact form reports success and
  failure; keyboard traversal reaches every control; the Folder stack exposes a list, not
  a tablist.
- **Vitest on the player controller.** Transitions in isolation: play, pause, switch Song
  mid-play, seek, reaching the end. Fast, and the place where the awkward cases live.
- **Vitest on `sendContactMessage`.** Turnstile rejection, Turnstile acceptance with a
  delivery failure, and the happy path. Both collaborators faked at the boundary.
- **No unit tests on presentational components.** They would encode the markup we most
  expect to change.

There is no prior art: this is the first code in the repo. These tests set the convention.

## Out of Scope

Dark mode. French. A page per Song. A downloadable CV. Real waveforms. Auto-advance
between Songs. A volume control. Persisting contact submissions. Commission checkout or
payments. A blog, a newsletter, or an events calendar. Analytics. A custom domain for the
site itself — it ships on whatever Coolify gives it, and the domain is a later change.

## Further Notes

Four things are still needed from Anna and none of them can be invented:

1. **Written confirmation that she holds distribution rights to her own masters.** ADR-0006
   depends on this assumption and it is not ours to make. Needed before launch.
2. **The portrait shot list**, in `docs/research/folder-ui-and-typography.md` §5.4. Shot 1
   determines the hero treatment, so it gates the hero's final layout.
3. **Timeline material**: school, dates, performances, collaborations, competitions.
4. **Real content**: Song titles, stories and platform links, in both languages.

The riskiest part of the build is the ornament layer — tape, stickers, doodles. The
research found no shipped sites using it, so `docs/design/tape-and-stickers.md` is written
from client references as a hypothesis, not an established technique. Build it early
rather than last: it is what makes the site hers, and it is the part most likely to need
several attempts.

Contact mail currently sends from `andy-cinquin.com` to a personal inbox. That is
deliberate for now and is configuration, not code.
