# Contact submissions are sent, never stored

The contact form validates a Cloudflare Turnstile token, sends the message through
Resend, and keeps nothing. There is no Payload collection behind it.

Recorded because the obvious improvement — "let's also save submissions so nothing is
lost" — is one someone will propose, and it is the expensive option. Storing them makes
the Portfolio a controller of personal data: a retention period, an erasure path, and a
much longer privacy notice on the legals page, all for a form that will see a few
messages a month. A transmit-only form carries far lighter obligations. The accepted
cost is that a Resend outage loses a message silently.
