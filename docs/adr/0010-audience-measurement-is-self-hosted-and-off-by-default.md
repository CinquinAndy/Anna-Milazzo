# Audience measurement is self-hosted, and off unless a build is told otherwise

The site loads two scripts from `umami.wadefade.fr`: Umami's session recorder and its
tracker. This is the only code on the site that comes from another origin apart from
Cloudflare Turnstile, and it is a deliberate exception to the rule
`e2e/third-party.spec.ts` exists to enforce.

Recorded because the rule it bends was written down on purpose, and because the page that
tells visitors what happens to their data said the opposite until this landed.

## Why it is allowed when tweakcn's preview script is not

The objection to a third-party script tag is not that it is remote, it is that nobody
controls it: it is not in the lockfile, Renovate cannot see it, and whoever serves it can
change what it executes between one visitor and the next, with full access to the page.

Umami answers the last clause and only the last clause. The instance is Andy's own server,
not a vendor's, so there is no third party deciding what that code does and no analytics
company receiving what visitors do here. Everything else about a script tag is still true
of it, which is why the two scripts are named in one place and asserted from both sides
rather than simply permitted.

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
- **Both states are asserted.** A configured build must declare exactly those two scripts,
  in that order, each with the id and `defer`; an unconfigured one must not mention the
  host even inert. One of the two test groups always runs, so the suite states what it
  expects rather than going quiet.
- **The contact form is marked `data-replay-block`.** Umami's default mask level already
  hides input values, but that is a setting on a server this repository does not control,
  and the legal notice promises that what someone types into the form is not recorded. A
  promise in a legal notice does not get to rest on a remote default. The instance's
  replay Block selector must be set to `[data-replay-block]`; `.env.example` says so next
  to the variable.
- **Changing what is measured changes the legal notice.** ADR-0003 puts every string in
  Payload, so the notice is content and not code: it cannot be kept correct by a test. The
  seed text is the reference wording, and the live text has to be edited in the admin to
  match. The claim "no analytics" was true for the whole life of this site before now, and
  shipping the script without touching that sentence would have made the page lie.

## What was left open

Cookieless page counting and session replay are not the same question under the GDPR and
the ePrivacy directive: the CNIL's exemption for strictly necessary audience measurement is
written for the former and does not obviously cover recording how an individual moves
through a page. That judgement is the controller's to make, not this repository's. If the
answer is that replay needs consent and no consent flow is wanted, the fix is one entry in
`umamiScripts`: drop `recorder.js` and keep `script.js`, and the aggregate figures survive
intact.
