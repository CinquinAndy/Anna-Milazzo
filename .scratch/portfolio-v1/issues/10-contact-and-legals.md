# 10: Contact and legals pages

**What to build:** A Recruiter can send Anna a message from the site and knows whether it
arrived. Bots cannot. The legals page renders its content from the CMS.

**Blocked by:** 03, 04

**Status:** resolved

- [x] The contact page carries a form whose fields and labels come from the CMS, in both languages
- [x] Submission is gated by a Cloudflare Turnstile check that is verified server-side; a submission without a valid token is rejected
- [x] A valid submission is delivered by email; nothing is written to the database
- [x] Sender and recipient addresses are configuration, changeable without touching code
- [x] A successful send shows clear confirmation; a failure says so plainly and does not lose what was typed
- [x] The form is fully operable by keyboard, every field is labelled, and errors are announced to assistive technology
- [x] The legals page renders its content from the CMS in both languages and is reachable from every page
- [x] The send function is a single module at the outbound boundary, unit-tested for a rejected token, a delivery failure and the happy path, with both collaborators faked
- [x] Playwright covers the success and failure states without sending real mail

## Comments

Done. `bun run validate` green: 37 Vitest tests, 66 Playwright tests.

**The form was losing what the Recruiter typed, and the test caught it.** React resets an
uncontrolled form once its action completes, so a rejected submission handed back an empty
box and asked them to write it again — precisely what the criterion forbids. The fields are
controlled now. A *successful* send does clear them, deliberately: leaving the text sitting
there invites someone to send it twice.

**`sendContactMessage` is the seam the spec named.** Both collaborators arrive as
parameters, so no test reaches the network and neither is intercepted from inside. Ten
tests cover the rejected token, the failed delivery, the happy path, and the cases that
are neither — a malformed address, an empty field, a missing token.

**Verification fails closed.** A Turnstile check that throws is a rejection, not a pass,
and a missing `TURNSTILE_SECRET_KEY` refuses every submission rather than waving them
through. An outage must not become an open form. A test asserts the throwing case and that
delivery is never reached.

**Turnstile is wired against Cloudflare's published test keys**, which are in `.env` and
documented in `.env.example`. The always-passing pair means the e2e suite exercises real
server-side verification against Cloudflare rather than a stub. **Real keys are still
needed before launch** — this is configuration, not code.

**No real mail is sent.** `CONTACT_DELIVERY=log` swaps the Resend transport for one that
writes to the log, which is what local development and the suite use. Anything else sends
through Resend. Sender and recipient stay environment variables, so re-pointing them at
Anna's own domain later is a configuration change (spec, Contact).

**Nothing is persisted, and the test proves the absence** rather than trusting the code:
it asks the API for a `messages` collection and requires a 404. ADR-0005's whole argument
is that no such collection should exist.

**The legals body is the one richText field**, and it is guarded. `text` and `textarea`
fall an empty value back to Italian; richText falls back only on a missing one, so the
page checks for an empty body rather than assuming. Preflight strips paragraph rhythm and
list markers, so `.legal-prose` puts them back for that one page.

**Shared chrome landed here too** — `SiteHeader` and `SiteFooter` — because the legals link
has to be reachable from every page, and a test walks all three to check it. The landing
page's route to contact went in at the same time: the copy was already seeded in ticket 04
but a button to a 404 is worse than no button.

## Review follow-up

**After a successful send the form could no longer be typed in.** `useActionState` holds
the last outcome until the next submission, and the clear-on-sent block was conditioned on
the field values, so it ran on every render: each keystroke set state, re-rendered,
re-satisfied the condition and was wiped in the same pass. All three fields, no error, and
a page reload the only way out — on the site's one conversion point. It clears once per
result now, keyed on the result's identity.
