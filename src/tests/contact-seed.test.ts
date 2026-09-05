import { describe, expect, it } from 'vitest'
import { SEED_CONTACT } from '@/seed/content'

/** Every string in the seeded copy, with the path that reached it. */
function strings(value: unknown, path = ''): [string, string][] {
	if (typeof value === 'string') {
		return [[path, value]]
	}
	if (Array.isArray(value)) {
		return value.flatMap((item, index) => strings(item, `${path}[${index}]`))
	}
	if (value !== null && typeof value === 'object') {
		return Object.entries(value).flatMap(([key, item]) => strings(item, path === '' ? key : `${path}.${key}`))
	}
	return []
}

describe('the seeded contact copy', () => {
	it('writes the same rows in both languages, in the same order', () => {
		// The seed matches row ids POSITIONALLY: it writes Italian, reads the ids back and
		// writes English carrying them. A different count means the English pass replaces rows
		// rather than translating them, and the Italian goes with them. Silently.
		expect(SEED_CONTACT.en.brief.points).toHaveLength(SEED_CONTACT.it.brief.points.length)
		expect(SEED_CONTACT.en.practical.entries).toHaveLength(SEED_CONTACT.it.practical.entries.length)
	})

	it('leaves nothing blank', () => {
		for (const locale of ['it', 'en'] as const) {
			for (const [path, value] of strings(SEED_CONTACT[locale])) {
				expect(value.trim().length, `${locale}.${path} is empty`).toBeGreaterThan(0)
			}
		}
	})

	it('carries no em dash', () => {
		// They were removed from the whole repository on purpose, and seeded copy is the
		// easiest place for one to come back: it reads as prose and nothing else checks it.
		for (const locale of ['it', 'en'] as const) {
			for (const [path, value] of strings(SEED_CONTACT[locale])) {
				expect(value.includes('—'), `${locale}.${path} carries an em dash`).toBe(false)
			}
		}
	})
})
