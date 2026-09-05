import { describe, expect, it, vi } from 'vitest'
import { type ContactCollaborators, type ContactMessage, sendContactMessage } from '@/lib/contact/send-contact-message'

const MESSAGE: ContactMessage = {
	name: 'Giulia Ferrari',
	email: 'giulia@example.com',
	message: 'Cerco musica per un cortometraggio. Possiamo parlarne?',
	token: 'a-token-from-turnstile',
}

/** Both collaborators faked at the boundary, so no test reaches the network. */
function collaborators(overrides: Partial<ContactCollaborators> = {}) {
	return {
		verifyToken: vi.fn(async () => true),
		deliver: vi.fn(async () => true),
		...overrides,
	}
}

describe('a message that gets through', () => {
	it('reports it was sent', async () => {
		const fakes = collaborators()

		await expect(sendContactMessage(MESSAGE, fakes)).resolves.toEqual({ outcome: 'sent' })
	})

	it('verifies the token before delivering anything', async () => {
		const order: string[] = []
		const fakes = collaborators({
			verifyToken: vi.fn(async () => {
				order.push('verify')
				return true
			}),
			deliver: vi.fn(async () => {
				order.push('deliver')
				return true
			}),
		})

		await sendContactMessage(MESSAGE, fakes)

		// A bot that never has to solve anything is not blocked by anything.
		expect(order).toEqual(['verify', 'deliver'])
	})

	it('passes the Recruiter’s own words through untouched', async () => {
		const fakes = collaborators()

		await sendContactMessage(MESSAGE, fakes)

		expect(fakes.deliver).toHaveBeenCalledWith(MESSAGE)
	})
})

describe('a message Turnstile rejects', () => {
	it('is not delivered', async () => {
		const fakes = collaborators({ verifyToken: vi.fn(async () => false) })

		await expect(sendContactMessage(MESSAGE, fakes)).resolves.toEqual({ outcome: 'rejected' })
		expect(fakes.deliver).not.toHaveBeenCalled()
	})

	it('is rejected when the verification itself throws', async () => {
		const fakes = collaborators({
			verifyToken: vi.fn(async () => {
				throw new Error('Cloudflare is down')
			}),
		})

		// Failing open would make the outage an open form.
		await expect(sendContactMessage(MESSAGE, fakes)).resolves.toEqual({ outcome: 'rejected' })
		expect(fakes.deliver).not.toHaveBeenCalled()
	})
})

describe('a message that passes the check but cannot be delivered', () => {
	it('reports a failure rather than a success', async () => {
		const fakes = collaborators({ deliver: vi.fn(async () => false) })

		await expect(sendContactMessage(MESSAGE, fakes)).resolves.toEqual({ outcome: 'failed' })
	})

	it('reports a failure when delivery throws', async () => {
		const fakes = collaborators({
			deliver: vi.fn(async () => {
				throw new Error('Resend is down')
			}),
		})

		await expect(sendContactMessage(MESSAGE, fakes)).resolves.toEqual({ outcome: 'failed' })
	})
})

describe('a message that cannot be answered', () => {
	it('names the empty fields and sends nothing', async () => {
		const fakes = collaborators()

		const result = await sendContactMessage({ name: '  ', email: '', message: '\n', token: '' }, fakes)

		expect(result).toEqual({ outcome: 'invalid', fields: ['name', 'email', 'message', 'token'] })
		expect(fakes.verifyToken).not.toHaveBeenCalled()
		expect(fakes.deliver).not.toHaveBeenCalled()
	})

	it('names an address that could not receive a reply', async () => {
		const fakes = collaborators()

		const result = await sendContactMessage({ ...MESSAGE, email: 'giulia@example' }, fakes)

		expect(result).toEqual({ outcome: 'invalid', fields: ['email'] })
		expect(fakes.deliver).not.toHaveBeenCalled()
	})

	it('treats a missing token as something to fix, not as a rejection', async () => {
		const fakes = collaborators()

		// The widget never ran, usually JavaScript, not a bot.
		const result = await sendContactMessage({ ...MESSAGE, token: '' }, fakes)

		expect(result).toEqual({ outcome: 'invalid', fields: ['token'] })
	})
})
