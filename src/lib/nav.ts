import { type Locale, localeHref } from '@/lib/locale'
import type { Home } from '@/payload-types'

export type NavLink = { label: string; href: string }

/**
 * Every page of the site, in reading order, for the foot of every page.
 *
 * Built here rather than three times over because all three pages render the same footer,
 * and a list of routes that drifts between them is how a site ends up with a page nothing
 * links to. The labels are the CMS headings the sections already carry, so renaming a
 * section in Payload renames it here too.
 *
 * The two landing sections are in-page anchors rather than routes; `SiteFooter` tells them
 * apart by the `#` and reaches for a plain anchor, since jumping within another document is
 * not a route change.
 */
export function siteNav(home: Home, locale: Locale, siteName: string): NavLink[] {
	return [
		{ label: siteName, href: localeHref('/', locale) },
		{ label: home.songs?.heading ?? '', href: `${localeHref('/', locale)}#ascolta` },
		{ label: home.timeline?.heading ?? '', href: `${localeHref('/', locale)}#percorso` },
		{ label: home.contactCta?.buttonLabel ?? '', href: localeHref('/contact', locale) },
	].filter(link => link.label !== '')
}
