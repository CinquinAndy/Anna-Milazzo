# 10: Contact and legals pages

**What to build:** A Recruiter can send Anna a message from the site and knows whether it
arrived. Bots cannot. The legals page renders its content from the CMS.

**Blocked by:** 03, 04

**Status:** ready-for-agent

- [ ] The contact page carries a form whose fields and labels come from the CMS, in both languages
- [ ] Submission is gated by a Cloudflare Turnstile check that is verified server-side; a submission without a valid token is rejected
- [ ] A valid submission is delivered by email; nothing is written to the database
- [ ] Sender and recipient addresses are configuration, changeable without touching code
- [ ] A successful send shows clear confirmation; a failure says so plainly and does not lose what was typed
- [ ] The form is fully operable by keyboard, every field is labelled, and errors are announced to assistive technology
- [ ] The legals page renders its content from the CMS in both languages and is reachable from every page
- [ ] The send function is a single module at the outbound boundary, unit-tested for a rejected token, a delivery failure and the happy path, with both collaborators faked
- [ ] Playwright covers the success and failure states without sending real mail
