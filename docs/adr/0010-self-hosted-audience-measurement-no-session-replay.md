# Audience measurement is self-hosted, off by default, and does not replay sessions

The site loads one script from `umami.wadefade.fr`: Umami's tracker. It does **not** load
`recorder.js`, Umami's session replay. Apart from Cloudflare Turnstile on the contact page,
this is the only code on the site that comes from another origin, and it is a deliberate
exception to the rule `e2e/third-party.spec.ts` exists to enforce.

Recorded because the rule it bends was written down on purpose, because the page that tells
visitors what happens to their data said the opposite until this landed, and because the
absence of the second script is the whole reason there is no consent banner.

## Why the tracker is allowed when tweakcn's preview script is not

The objection to a third-party script tag is not that it is remote, it is that nobody
controls it: it is not in the lockfile, Renovate cannot see it, and whoever serves it can
change what it executes between one visitor and the next, with full access to the page.

Umami answers the last clause and only the last clause. The instance is Andy's own server,
not a vendor's, so there is no third party deciding what that code does and no analytics
company receiving what visitors do here. Everything else about a script tag is still true
of it, which is why the script is named in one place and asserted from both sides rather
than simply permitted.

## Why there is no session replay

Counting page views without a cookie and replaying how one person moved through a page are
not the same question. The CNIL's exemption from consent for strictly necessary audience
measurement is written for the former; it does not plausibly cover recording an
individual's path, clicks and scrolling. Keeping replay would therefore have meant either
a consent banner or an argument nobody here is qualified to make.

The decision is to keep the aggregate figures and drop the recording. The site asks for no
consent because there is nothing to consent to: no cookie, nothing written to the device,
no identifier that survives the visit, and no individual path stored. The legal notice says
exactly that, which only stays true as long as `recorder.js` stays out.

## What "stores nothing on your device" was checked against

The legal notice promises, in both languages, that nothing is stored on the visitor's
device. That is a claim about somebody else's code, so it was read rather than assumed: the
tracker as actually served from the instance (4,655 bytes) references `localStorage`
exactly once, and only to **read** the key `umami.disabled`, which is how a visitor opts
out. There is no `setItem`, no `removeItem`, no `document.cookie`, no `sessionStorage` and
no `indexedDB` anywhere in it.

Worth re-reading after any Umami upgrade, because the sentence in the notice depends on it:

```
curl -s https://umami.wadefade.fr/script.js | grep -oE "localStorage|sessionStorage|document\.cookie|indexedDB|setItem"
```

## The rules that follow

- **The gate is `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, and absence means absence.** With no id
  there is no script tag, no request, and nothing to allow: local development, the test
  suite and any preview deployment load nothing at all. Only production sets it. This is
  what keeps `third-party.spec.ts` strict on every pull request instead of carrying a
  permanent hole for a host that is usually not there.
- **The allowlist is derived, never written in.** `e2e/third-party.spec.ts` adds the Umami
  host to `ALLOWED` only when the build it is testing is configured to report to it. A
  hard-coded entry would have let the host through on every build forever, including the
  ones that have no business talking to it.
- **`umamiScripts` is the list, and the list is asserted.** A configured build must declare
  exactly those scripts, in order, each with the id and `defer`; an unconfigured one must
  not name the host even inert; and one test names the recorder specifically and requires
  it to be absent. Adding it back is a test failure, not a quiet change. One of the two
  test groups always runs, so the suite states what it expects rather than going quiet.
- **Changing what is measured changes the legal notice.** ADR-0003 puts every string in
  Payload, so the notice is content and not code: it cannot be kept correct by a test. The
  seed carries the reference wording and the live text has to be edited in the admin to
  match. The claim "no analytics" was true for the whole life of this site before now, and
  shipping the script without touching that sentence would have made the page lie.
- **If replay is ever wanted, it is three changes and not one.** Add `recorder.js` to
  `umamiScripts`; mark the contact form `data-replay-block` and set the instance's replay
  Block selector to `[data-replay-block]`, because the default mask level that hides input
  values is a setting on a server this repository does not control and a promise in a legal
  notice should not rest on a remote default; and rewrite the legal notice, which currently
  promises in both languages that no individual path is recorded and that nothing is stored
  on the device. The consent question comes back with it.
