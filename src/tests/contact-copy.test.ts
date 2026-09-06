import type { Field } from 'payload'
import { describe, expect, it } from 'vitest'
import { Contact } from '@/globals/contact'
import { SEED_CONTACT, SEED_SETTINGS } from '@/seed/content'

/**
 * Every field the contact page renders, as a dotted path.
 *
 * ADR-0003 says no copy lives in a component, and the way that rule fails is not with a
 * hardcoded string somebody notices in review: it is with a field quietly renamed, the page
 * rendering nothing, and nobody seeing the gap because an absent value renders nothing by
 * design. This list is the page's side of that contract.
 */
const RENDERED = [
	'heading',
	'intro',
	'form.heading',
	'form.requiredNote',
	'form.nameLabel',
	'form.emailLabel',
	'form.messageLabel',
	'form.submitLabel',
	'form.sendingLabel',
	'form.checkNote',
	'form.missingNote',
	'form.emailNote',
	'form.privacyNote',
	'outcome.success',
	'outcome.failure',
	'outcome.invalid',
	'brief.heading',
	'brief.intro',
	'brief.points.text',
	'practical.heading',
	'practical.entries.term',
	'practical.entries.value',
	'direct.heading',
	'direct.note',
	'direct.elsewhereHeading',
] as const

type Named = Field & { name?: string; fields?: Field[]; localized?: boolean; label?: unknown }

/** Walks groups and arrays into a flat map of path to field. */
function flatten(fields: Field[], prefix = ''): Map<string, Named> {
	const found = new Map<string, Named>()
	for (const field of fields as Named[]) {
		if (field.name === undefined) {
			continue
		}
		const path = prefix === '' ? field.name : `${prefix}.${field.name}`
		found.set(path, field)
		if (field.fields !== undefined) {
			for (const [key, value] of flatten(field.fields, path)) {
				found.set(key, value)
			}
		}
	}
	return found
}

const FIELDS = flatten(Contact.fields)

describe('the contact page has somewhere to get every word from', () => {
	it('declares every field the page renders', () => {
		for (const path of RENDERED) {
			expect(FIELDS.has(path), `the page renders ${path} and the CMS does not offer it`).toBe(true)
		}
	})

	it('lets Anna write every one of them in both languages', () => {
		for (const path of RENDERED) {
			const field = FIELDS.get(path)
			expect(field?.localized, `${path} can only ever be written once, in one language`).toBe(true)
		}
	})

	it('keeps the arrays themselves unlocalized, which is what row identity depends on', () => {
		// The seed writes Italian, reads the row ids back and writes English carrying them. A
		// localized array would give each locale its own rows, and the round trip would be
		// matching ids that do not correspond.
		for (const path of ['brief.points', 'practical.entries']) {
			const field = FIELDS.get(path)
			expect(field?.type, `${path} is not an array`).toBe('array')
			expect(field?.localized, `${path} is localized, so the two locales hold different rows`).not.toBe(true)
		}
	})

	it('names every field in both languages, because the admin is bilingual too', () => {
		for (const [path, field] of FIELDS) {
			const label = field.label as { en?: string; it?: string } | undefined
			if (label === undefined) {
				continue
			}
			expect(label.en, `${path} has no English label`).toBeTruthy()
			expect(label.it, `${path} has no Italian label`).toBeTruthy()
		}
	})
})

describe('the details Anna gave for the live site', () => {
	it('carries her real address, and nothing that looks like a placeholder', () => {
		expect(SEED_SETTINGS.contactEmail).toBe('annamil012002n2@gmail.com')
		const serialised = JSON.stringify(SEED_SETTINGS)
		expect(serialised, 'a placeholder survived into the seeded settings').not.toMatch(/example\.com|placeholder/i)
	})

	it('links to her profiles without the share tracking they arrived with', () => {
		for (const locale of ['it', 'en'] as const) {
			for (const link of SEED_SETTINGS[locale].socialLinks) {
				// An `stkn` share token is tied to the account that made it, and the `utm_*`
				// pair would report every visitor as having arrived from Anna's own phone.
				expect(link.url, `${link.label} carries a query string`).not.toMatch(/[?&](stkn|utm_[a-z]+)=/)
			}
			const urls = SEED_SETTINGS[locale].socialLinks.map(link => link.url)
			expect(urls).toContain('https://www.instagram.com/imannasound')
			expect(urls).toContain('https://www.linkedin.com/in/anna-milazzo-118b413b7')
			expect(urls).toContain(`mailto:${SEED_SETTINGS.contactEmail}`)
		}
	})

	it('says where she actually is, in both languages', () => {
		for (const locale of ['it', 'en'] as const) {
			const where = SEED_CONTACT[locale].practical.entries.find(entry => /dove sono|where i am/i.test(entry.term))
			expect(where?.value, `no location fact in ${locale}`).toMatch(/Palermo/)
		}
	})
})
