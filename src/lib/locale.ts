/**
 * The Portfolio's two locales, and the arithmetic of its URL shape.
 *
 * Italian is served unprefixed and English under `/en` (ADR-0001). Nothing in here
 * touches React, the DOM or the request, so it is safe to import from a Client
 * Component and cheap to test directly.
 */

export const LOCALES = ['it', 'en'] as const

export type Locale = (typeof LOCALES)[number]

/** Italian. Served at the root with no prefix. */
export const DEFAULT_LOCALE: Locale = 'it'

export function isLocale(value: string | undefined): value is Locale {
	return value !== undefined && (LOCALES as readonly string[]).includes(value)
}

/**
 * The public URL of `path` in `locale`.
 *
 * `path` is the locale-free canonical path, `/`, `/contact`, `/legal`. URL segments
 * are not translated, so the locale only ever adds or removes a leading prefix.
 */
export function localeHref(path: string, locale: Locale): string {
	const clean = path === '/' ? '' : path
	return locale === DEFAULT_LOCALE ? clean || '/' : `/en${clean}`
}

/**
 * The locale-free canonical path behind a public URL, the inverse of `localeHref`.
 * An unprefixed path is already canonical, because Italian carries no prefix.
 */
export function canonicalPath(pathname: string): string {
	if (pathname === '/en') {
		return '/'
	}
	return pathname.startsWith('/en/') ? pathname.slice(3) : pathname
}

/** The other locale. There are only two, so switching is a toggle. */
export function otherLocale(locale: Locale): Locale {
	return locale === 'it' ? 'en' : 'it'
}
