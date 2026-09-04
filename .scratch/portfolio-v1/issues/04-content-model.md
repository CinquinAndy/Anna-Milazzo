# 04: Content model

**What to build:** Everything on the Portfolio is editable in Payload, in both languages,
and a seed fills it with convincing fake content so every later ticket has something real
to render.

**Blocked by:** 01

**Status:** resolved

- [x] A `songs` collection holds a localized title and story, a cover image, an audio track, an optional platform link, an explicit sort order, and a duration in seconds stored on the record
- [x] A `media` collection accepts images and an `audio` collection accepts audio files
- [x] Globals cover the home page, the contact page, the legals page and site settings; every text field on them is localized — no copy is hardcoded in the app
- [x] Localization is configured before any content is saved, since switching a field to localized afterwards destroys its data
- [x] English falls back to Italian rather than rendering empty
- [x] The Payload admin interface is available in Italian as well as English
- [x] A seed script populates several Songs with fake Italian and English content, a timeline, skills and all page copy — including at least one Song with no English story and one with no platform link
- [x] Migrations for the new schema are generated and committed

## Comments

Done. `bun run validate` green. Migration `20260904_004937_content_model` committed and
applied; `bun run seed` fills the database and is safe to re-run.

**Field types were chosen to make the fallback criterion true**, not by taste. Payload
falls an *empty string* back to the default locale only for `text` and `textarea`; every
other type, richText included, falls back only on `null`. A Song's `story` is therefore a
`textarea`. `legals.body` is the one richText field — it genuinely has structure — so both
languages are always written and ticket 10 must check for an empty body rather than trust
the fallback.

**Localized fields are optional on purpose.** A `required` localized field means Anna
cannot save a Song *at all* while the admin's content locale is set to English until she
has written the English. Only fields that exist independently of language — cover, track,
duration, order — are required.

**Arrays are not localized; the text inside them is.** Anna's skills and her timeline have
the same rows in the same order in both languages, only different words. Postgres bears
this out: `home_timeline_entries` holds the shared rows and `home_timeline_entries_locales`
the per-locale text.

**That design does not by itself avoid the row-id hazard, and the seed proved it.** The
first run wrote Italian and then English, and the Italian timeline labels came back
`undefined`. Payload matches an incoming array row to a stored one strictly by `id`; the
English write carried no ids, so it replaced the rows and took the Italian with them — no
error, no warning. The seed now writes Italian, reads the row ids back, and writes English
carrying them. Anything that writes a localized array from code has to do the same; the
admin is fine because it sends the ids.

**Two Payload behaviours the seed depends on, both the opposite of the obvious guess:**

- `locale: 'all'` is a *read* feature. A write with it silently discards every localized
  value — the first, virgin write appears to work and every re-run is a no-op. Globals are
  written one call per locale.
- Omitting a key does not clear a locale's value; it leaves whatever is stored. The
  untranslated Song writes `story: null` explicitly, and `platformUrl: null` likewise, or
  a Song that is meant to have no link would keep an old one forever.

**Upsert-only, never destructive, and deliberately not in `validate`.** `DATABASE_URL`
points at a shared VPS Postgres. A seed that truncates first would take Anna's work with
it the first time someone ran it against the wrong database, and putting it in the routine
gate would mean every `bun run validate` wrote fake Songs to shared infrastructure. Songs
carry a hidden unique `reference` so the seed upserts on a stable handle and tests can
select by one rather than by a title Anna is free to rewrite.

**The seed cannot run under Bun** — Bun's runtime cannot evaluate Payload's lexical
editor. `bun run seed` shells out to the Payload CLI, which runs on Node.

**The admin is Italian by default.** `fallbackLanguage: 'it'` with `supportedLanguages:
{ en, it }` — English has to be listed or it disappears entirely, since the option
replaces the built-in set rather than extending it. Verified: no header renders "Crea il
primo utente", `Accept-Language: en` or the `payload-lng=en` cookie renders "Create first
user". Content locale and admin language stay independent, which is what lets an
English-speaking editor work on the Italian content.

**Fixtures are real files, not stubs** — five MP3s of distinct lengths (18–35s, generated
with ffmpeg) and six PNGs in the palette. Real durations mean ticket 08 can test seeking
against something that actually decodes.

**Content status.** Every word is written at realistic length so the layout is judged
against text of the right size, but none of it is true. Anna's real titles, stories,
platform links, timeline and portrait are still outstanding — see the spec's Further
Notes. The Italian copy deliberately carries the accented capitals the typography has to
survive: `Perché il temporale`, `Città alle quattro`, `Più vicino del previsto`.
