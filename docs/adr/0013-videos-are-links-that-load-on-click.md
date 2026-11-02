# Videos are links to YouTube or Vimeo, and load only when somebody presses play

A Song can carry a video. Anna pastes a YouTube or Vimeo link into the admin; the page shows
a button, and the provider's player exists only after it is pressed. Until then the page
has made no request to either service, holds no frame and shows no thumbnail.

Recorded because it adds a third party to a site whose rule, enforced by
`e2e/third-party.spec.ts`, is to have almost none, and because the order of the two steps is
the entire reason it is acceptable.

## Why a link and not a file

Asked of Andy on 2026-11-02, who chose it. A video file is hundreds of megabytes through
the admin's upload, onto a bucket and out of it to every visitor, for a site whose reader
is a Recruiter on a phone. The platforms exist to serve exactly that, and Anna's work
already lives on them.

## Why not an embed on load

An `<iframe>` on load puts YouTube's code, and its storage, on every visit of a page that
by ADR-0010 runs one first-party-hosted tracker and sets no cookie. That would need the
consent banner ADR-0010 exists to avoid. A visitor who presses play has asked for the
provider's player and gets it, and the consent is the press.

So before the press: no iframe, no script, no request, and no thumbnail either (a
thumbnail is a request to `i.ytimg.com`, which is the same disclosure with a picture).
`e2e/song-video.spec.ts` fails if the page contacts either provider before a press.

## What gets embedded

Never the string Anna typed. `src/lib/video.ts` reads the link, keeps the provider and the
id, validates the id against that provider's shape, and builds the address itself:

- YouTube from `www.youtube-nocookie.com/embed/<id>`, its privacy-enhanced mode;
- Vimeo from `player.vimeo.com/video/<id>` with `dnt=1`, plus the hash an unlisted video
  needs if it has the shape Vimeo issues.

A link that is not recognised is refused by the admin when she saves it, and ignored by the
page if it got in some other way. Look-alike hosts, `javascript:` and `data:` addresses and
paths that climb out of `/embed/` are all tests.

The frame is sandboxed (scripts, same-origin for the player's own storage, presentation,
popups) with no top navigation and no forms, with `referrerpolicy="strict-origin-when-cross-origin"`
and only the permissions a player needs. Checked against the real players, not only
against stand-ins.

## What this does not claim

YouTube's no-cookie mode defers its storage until play, it does not abolish it, and
Vimeo's `dnt` is a request. After the press, the visitor is on the provider's terms, and the
legal notice says so in both languages. The claim of the rest of the site, no cookie and no
banner, is true of every page that nobody has pressed play on, and that is what is tested.

## Not done

No start offset (`t=90s`), no captions parameter, no autoplay without a press, and no
video on a timeline entry: asked about, and not wanted yet.
