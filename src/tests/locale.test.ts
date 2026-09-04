import { describe, expect, it } from 'vitest'
import { canonicalPath, localeHref, otherLocale } from '@/lib/locale'

describe('the Portfolio URL shape', () => {
	it('serves Italian unprefixed', () => {
		expect(localeHref('/', 'it')).toBe('/')
		expect(localeHref('/contact', 'it')).toBe('/contact')
	})

	it('serves English under /en', () => {
		expect(localeHref('/', 'en')).toBe('/en')
		expect(localeHref('/contact', 'en')).toBe('/en/contact')
	})

	it('does not translate URL segments', () => {
		expect(localeHref('/legal', 'en')).toBe('/en/legal')
	})

	it('reads the canonical path back out of a public URL', () => {
		expect(canonicalPath('/')).toBe('/')
		expect(canonicalPath('/contact')).toBe('/contact')
		expect(canonicalPath('/en')).toBe('/')
		expect(canonicalPath('/en/contact')).toBe('/contact')
	})

	it('does not mistake a path that merely starts with the prefix for English', () => {
		expect(canonicalPath('/enquiries')).toBe('/enquiries')
	})

	it('round-trips every page through both locales', () => {
		for (const path of ['/', '/contact', '/legal']) {
			for (const locale of ['it', 'en'] as const) {
				expect(canonicalPath(localeHref(path, locale))).toBe(path)
			}
		}
	})

	it('switches between the only two locales', () => {
		expect(otherLocale('it')).toBe('en')
		expect(otherLocale('en')).toBe('it')
	})
})
