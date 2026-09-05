import type { ContactCollaborators, ContactMessage } from './send-contact-message'

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const RESEND_SEND = 'https://api.resend.com/emails'

/** Asks Cloudflare whether the token the browser produced is real. */
async function verifyTurnstile(token: string): Promise<boolean> {
	const secret = process.env.TURNSTILE_SECRET_KEY ?? ''
	if (secret === '') {
		// Refuse rather than wave everything through: a missing secret must not become an
		// open form.
		return false
	}

	const response = await fetch(TURNSTILE_VERIFY, {
		method: 'POST',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ secret, response: token }),
	})
	if (!response.ok) {
		return false
	}
	const body: unknown = await response.json()
	return typeof body === 'object' && body !== null && (body as { success?: unknown }).success === true
}

/** Hands the message to Resend. Sender and recipient are configuration, never code. */
async function deliverByEmail(message: ContactMessage): Promise<boolean> {
	const key = process.env.RESEND_API_KEY ?? ''
	const from = process.env.CONTACT_FROM_EMAIL ?? ''
	const to = process.env.CONTACT_TO_EMAIL ?? ''
	if (key === '' || from === '' || to === '') {
		return false
	}

	const response = await fetch(RESEND_SEND, {
		method: 'POST',
		headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
		body: JSON.stringify({
			from,
			to: [to],
			reply_to: message.email,
			subject: `Portfolio, messaggio da ${message.name}`,
			text: `${message.name} <${message.email}>\n\n${message.message}`,
		}),
	})
	return response.ok
}

/** Writes the message to the log instead of sending it. */
async function deliverToLog(message: ContactMessage): Promise<boolean> {
	// biome-ignore lint/suspicious/noConsole: this transport exists to print.
	console.info('[contact] message not sent (CONTACT_DELIVERY=log):', {
		name: message.name,
		email: message.email,
		length: message.message.length,
	})
	return true
}

/**
 * The real collaborators, wired from the environment.
 *
 * `CONTACT_DELIVERY=log` writes the message to the log rather than sending it, which is
 * what local development and the end-to-end tests use, the suite has to exercise the
 * success path without putting real mail in a real inbox.
 */
export function contactCollaborators(): ContactCollaborators {
	return {
		verifyToken: verifyTurnstile,
		deliver: process.env.CONTACT_DELIVERY === 'log' ? deliverToLog : deliverByEmail,
	}
}
