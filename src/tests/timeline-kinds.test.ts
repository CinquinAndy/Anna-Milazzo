import { describe, expect, it } from 'vitest'
import { LOCALES } from '@/lib/locale'
import { DEFAULT_KIND, KIND_FILLS, KIND_LABELS, kindOf, TIMELINE_COPY, TIMELINE_KINDS } from '@/lib/timeline/kinds'

describe('timeline kinds', () => {
	it('reads each stored value as itself', () => {
		for (const kind of TIMELINE_KINDS) {
			expect(kindOf(kind)).toBe(kind)
		}
	})

	it('reads a missing or unknown value as an experience, never as a crash', () => {
		// A row written before the field existed holds null, and a value renamed in the CMS
		// later must not take the whole arrangement down with it.
		for (const value of [null, undefined, '', 'degrees', 'DEGREE', 'constructor']) {
			expect(kindOf(value)).toBe(DEFAULT_KIND)
		}
		expect(DEFAULT_KIND).toBe('experience')
	})

	it('gives every kind a word in both languages and a fill of its own', () => {
		for (const kind of TIMELINE_KINDS) {
			for (const locale of LOCALES) {
				expect(KIND_LABELS[kind][locale].trim(), `${kind} in ${locale}`).not.toBe('')
			}
		}
		// Two kinds sharing a colour would make the colour mean nothing again.
		expect(new Set(TIMELINE_KINDS.map(kind => KIND_FILLS[kind])).size).toBe(TIMELINE_KINDS.length)
	})

	it('has the words of both controls in both languages', () => {
		for (const locale of LOCALES) {
			expect(TIMELINE_COPY[locale].expand).not.toBe('')
			expect(TIMELINE_COPY[locale].collapse).not.toBe('')
		}
	})
})
