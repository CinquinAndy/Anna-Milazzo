# The panel, explained to Anna

`it.md` is the one that matters: Anna is Italian and edits in Italian. `en.md` is the same
guide, written as an English document rather than translated from it.

Both were written against the schema Payload's own configuration produces, so every field
name and every button label in them is the one on her screen. If a field is added, renamed
or made required, these go stale silently, because nothing tests prose. Re-derive the
schema with a short script against `@payload-config` and diff it against the tables here.

Things they assert that are easy to break without noticing:

- The panel's sidebar reads "Songs", "Media", "Audio" and "Users" in English whatever the
  panel language is, because those collections carry no `labels` key. Add one and the
  guides are wrong.
- `order` arrives at 0 and `durationSeconds` refuses anything under 1.
- There is no email adapter, so there is no working password reset. If one is ever added,
  section 1 of both guides is wrong.
- There are no drafts and no versions. Section 2 of the English and section 3 of the
  Italian are built entirely on that.
