# The Songs are filed in one Folder, one Tab each

Every Song is filed in a single Folder on the landing page. A row of numbered Tabs runs
along its top edge, one per Song, side by side; pressing one opens that Song's Sheet inside
the Folder, and only that one is shown. Anna asked for exactly this on 2026-11-05, with a
reference image: one blue folder, seven coloured tabs above it.

Recorded because it reverses two things that were decided on purpose, and the reasons for
those still look sound on their own.

## What it reverses

- **"Never a tab interface."** The old `Folder` component said a filing tab was a visual
  metaphor only, and that `role="tab"` would promise arrow keys and mutually exclusive
  panels for content that was all visible at once. That was true of a list of cards. It is
  not true any more: one Sheet is shown at a time, so this IS a tab interface, and it says
  so (tablist, tab, tabpanel, a roving tab stop, arrows, Home and End, activation as focus
  moves since every Sheet is already in the page).
- **The grid of two Folders per row and the pager (#32).** Anna said that was not what she
  meant. The Tabs reach every Song directly, so the pager went with it. Its two admin
  labels are hidden, not dropped (ADR-0011).

## Decisions inside it

- **Every Sheet is rendered on the server and stays in the document.** The closed ones are
  hidden by CSS only under `@media (scripting: enabled)`. Without JavaScript every Song is
  shown, stacked, and the Tabs are plain links to them. The roles are added after
  hydration, so a reader without the script is never told about tabs that do nothing.
- **A fragment per Song, `/#why-the-storm`.** Taken from the title in the page's
  language. It refines ADR-0002 without undoing it: a Song can now be linked to, but it is
  still not a page, has no metadata of its own and changes nothing for search engines. Not
  a query string, which would make the landing page dynamic for a value the server never
  needs. The server renders the first Tab open; the fragment is read after hydration, and
  each press replaces it rather than pushing history.
- **The audio keeps playing when another Tab is opened.** There is one audio element
  (ADR-0007) and the Sheets stay mounted, so the music does not stop because you looked at
  the next work. A small turning record on the sounding Song's Tab says where to go back to
  pause it.
- **A video is taken down when its Tab is left.** A sandboxed provider frame cannot be
  paused from outside without the provider's API, and one hidden with `display: none`
  would play on with no control left. And starting a video pauses the track.
- **Colours walk the palette in hue order**: blue, spring, lemon, magenta, grape, then
  round again. Never cantaloupe, the ground the Folder sits on. Fixed tokens, not mixes,
  so every label's contrast is a measured number (`src/tests/folder-tabs.test.ts`); the
  magenta Tab takes ink, not its white `-foreground`, which is 3.3:1.
- **The Song sits on a paper Sheet inside the coloured body**, not on the colour itself:
  the blue play control would disappear on a blue body.
- **A Song with no audio has no record.** Its cover becomes the video's screen, framed as
  film, and pressing it plays the video in the same box. The cover is Anna's upload,
  served from this site, so ADR-0013 still holds: nothing is asked of the provider before
  the press.

## Not done

No swipe between Sheets on a phone, the row of Tabs scrolls instead. No animation of the
Folder opening. No "next work" control at the foot of a Sheet: asked about by nobody yet.
