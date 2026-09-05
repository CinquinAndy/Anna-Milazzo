import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'
import { ContactMessageEmail, contactMessageText } from '@/emails/contact-message'

const MESSAGE = {
	name: 'Giulia Ferrari',
	email: 'giulia@example.com',
	message: 'Cerco musica per un cortometraggio.\n\nBudget modesto ma reale.',
	token: 'turnstile-token-that-must-not-travel',
}

describe('the message Anna receives', () => {
	it('carries what was written, and who wrote it', async () => {
		const html = await render(<ContactMessageEmail message={MESSAGE} />)
		expect(html).toContain('Giulia Ferrari')
		expect(html).toContain('Cerco musica per un cortometraggio.')
		// Reachable in one press, without copying an address out of a line of text.
		expect(html).toContain('mailto:giulia@example.com')
	})

	it('escapes the part somebody else wrote', async () => {
		// The message is the one piece of untrusted input in this email. React escapes it, and
		// this is the test that fails if anybody ever reaches for dangerouslySetInnerHTML to
		// preserve line breaks.
		const html = await render(
			<ContactMessageEmail message={{ ...MESSAGE, message: '<script>alert(1)</script>', name: '<b>Giulia</b>' }} />
		)
		expect(html).not.toContain('<script>alert(1)</script>')
		expect(html).not.toContain('<b>Giulia</b>')
		expect(html).toContain('&lt;script&gt;')
	})

	it('asks a mail client for nothing it cannot have', async () => {
		const html = await render(<ContactMessageEmail message={MESSAGE} />)
		// No stylesheet, no script, no custom property: a client strips the first two and
		// understands none of the third, and anything that depends on them is invisible.
		expect(html).not.toMatch(/<link[^>]+stylesheet/i)
		expect(html).not.toMatch(/<script/i)
		expect(html).not.toContain('var(--')
	})

	it('says something useful in the inbox list before it is opened', async () => {
		const html = await render(<ContactMessageEmail message={MESSAGE} />)
		// Without preview text a client falls back to the first words of the body, which here
		// is the wordmark, and every message would preview identically.
		expect(html).toContain('Giulia Ferrari: Cerco musica')
	})

	it('sends a plain text part alongside it', () => {
		// A message with no text alternative scores worse with spam filters, and a portfolio
		// whose contact form lands in junk has no contact form.
		const text = contactMessageText(MESSAGE)
		expect(text).toContain('Giulia Ferrari')
		expect(text).toContain('giulia@example.com')
		expect(text).toContain('Cerco musica per un cortometraggio.')
		expect(text).not.toMatch(/<[a-z]/i)
	})

	it('never carries the anti-bot token', async () => {
		// The whole ContactMessage is handed to the template, token included, because that is
		// the shape the rest of the pipeline already passes around. It is a Cloudflare secret
		// that has served its purpose by the time this renders, and it has no business
		// travelling to an inbox or sitting in a mail archive.
		const html = await render(<ContactMessageEmail message={MESSAGE} />)
		expect(html).not.toContain(MESSAGE.token)
		expect(contactMessageText(MESSAGE)).not.toContain(MESSAGE.token)
	})

	it('carries no em dash, like everything else here', () => {
		expect(contactMessageText(MESSAGE).includes('—')).toBe(false)
	})
})
