# 04: Content model

**What to build:** Everything on the Portfolio is editable in Payload, in both languages,
and a seed fills it with convincing fake content so every later ticket has something real
to render.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A `songs` collection holds a localized title and story, a cover image, an audio track, an optional platform link, an explicit sort order, and a duration in seconds stored on the record
- [ ] A `media` collection accepts images and an `audio` collection accepts audio files
- [ ] Globals cover the home page, the contact page, the legals page and site settings; every text field on them is localized — no copy is hardcoded in the app
- [ ] Localization is configured before any content is saved, since switching a field to localized afterwards destroys its data
- [ ] English falls back to Italian rather than rendering empty
- [ ] The Payload admin interface is available in Italian as well as English
- [ ] A seed script populates several Songs with fake Italian and English content, a timeline, skills and all page copy — including at least one Song with no English story and one with no platform link
- [ ] Migrations for the new schema are generated and committed
