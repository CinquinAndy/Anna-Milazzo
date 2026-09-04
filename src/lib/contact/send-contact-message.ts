/**
 * The outbound boundary for the contact form, and one of the three seams the spec names.
 *
 * Turnstile verification and email delivery both sit behind this one function and arrive
 * as parameters, so tests never reach the network and the two collaborators can be faked
 * at the edge rather than intercepted somewhere inside.
 *
 * Nothing is persisted (ADR-0005). Storing submissions would make the Portfolio a
 * controller of personal data — a retention period, an erasure path and a much longer
 * privacy notice — for a form that will see a few messages a month.
 */

export type ContactMessage = {
	name: string
	email: string
	message: string
	/** The token Turnstile put in the form. Absent when the widget never ran. */
	token: string
}

export type ContactField = 'name' | 'email' | 'message' | 'token'

export type ContactResult =
	| { outcome: 'sent' }
	/** The Recruiter can fix these: something is missing or the address is malformed. */
	| { outcome: 'invalid'; fields: ContactField[] }
	/** Turnstile said no, or delivery failed. Either way, not their fault to fix. */
	| { outcome: 'rejected' }
	| { outcome: 'failed' }

export type ContactCollaborators = {
	/** Asks Cloudflare whether the token is real. */
	verifyToken: (token: string) => Promise<boolean>
	/** Hands the message to the mail provider. Resolves false if it would not take it. */
	deliver: (message: ContactMessage) => Promise<boolean>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Everything a Recruiter could get wrong, checked before anything leaves the server. */
export function validate(message: ContactMessage): ContactField[] {
	const invalid: ContactField[] = []
	if (message.name.trim().length === 0) {
		invalid.push('name')
	}
	if (!EMAIL.test(message.email.trim())) {
		invalid.push('email')
	}
	if (message.message.trim().length === 0) {
		invalid.push('message')
	}
	if (message.token.trim().length === 0) {
		invalid.push('token')
	}
	return invalid
}

export async function sendContactMessage(
	message: ContactMessage,
	{ verifyToken, deliver }: ContactCollaborators
): Promise<ContactResult> {
	const invalid = validate(message)
	if (invalid.length > 0) {
		// Nothing is verified and nothing is sent for a message that cannot be answered.
		return { outcome: 'invalid', fields: invalid }
	}

	// Verification first, always: a bot that never has to solve anything is not blocked
	// by anything.
	const verified = await verifyToken(message.token).catch(() => false)
	if (!verified) {
		return { outcome: 'rejected' }
	}

	const delivered = await deliver(message).catch(() => false)
	return delivered ? { outcome: 'sent' } : { outcome: 'failed' }
}
