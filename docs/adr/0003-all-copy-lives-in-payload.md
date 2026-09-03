# All editorial copy lives in Payload, in both locales

Every word on the Portfolio — section headings, the about text, button labels, the
footer, not only Song content — is a localized Payload field. There are no JSON
dictionaries. We write the first version of every string so the copy is good; Anna edits
phrases and paragraphs afterwards, in Italian and English, without a deploy.

Recorded because the conventional split is the opposite: chrome in dictionaries, content
in the CMS. Consequences we accept: the site cannot render without the database, the
Payload schema grows to cover things that are really design decisions, and a missing
English value must fall back rather than render blank. Note that switching a field to
`localized` after data exists destroys that field's data, so this had to be decided
before the first save.
