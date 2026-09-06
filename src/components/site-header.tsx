import Link from 'next/link'
import { LanguageSwitch } from '@/components/language-switch'
import { type Locale, localeHref } from '@/lib/locale'

export type NavLink = { label: string; href: string }

/**
 * The chrome at the top of every page: the wordmark, a way into the two sections worth
 * jumping to, a way to contact, and a way to the other language.
 *
 * The labels are not new CMS fields. They are the section headings Anna already writes, * so the nav cannot drift out of step with what it points at, and it is already bilingual.
 *
 * Sticky, because on a page this tall a nav that scrolls away is decoration. Every anchor
 * target carries scroll-margin so the bar never lands on top of the heading it jumped to.
 */
export function SiteHeader({
	path,
	locale,
	nav = [],
	contact,
}: {
	path: string
	locale: Locale
	/* Explicitly `| undefined`: exactOptionalPropertyTypes is on, so a caller that computes
	 * these conditionally cannot pass the optional form without it. */
	nav?: NavLink[] | undefined
	contact?: NavLink | undefined
}) {
	const home = localeHref('/', locale)
	// On the landing page the wordmark links to the page it is already on, which the App
	// Router treats as a no-op, so pressing it did nothing on a nine-thousand-pixel page
	// where it is the only control in the bar that could go back to the top. A bare `#top`
	// fragment resolves to the body, so no element has to carry the id.

	return (
		<header className="sticky top-0 z-50 border-b-brutal border-border bg-paper px-4 py-3 sm:px-6" data-site-header>
			<div className="shell flex flex-wrap items-center gap-x-2 gap-y-2 lg:gap-x-3">
				{/* The wordmark is a filled pill, so the bar has one anchor point that does not
				    move between pages. It is a link even on the landing page: pressing it
				    returns to the top, which is what a wordmark is for. */}
				<Link href={path === '/' ? `${home}#top` : home} className="nav-pill nav-pill-mark" data-nav-home>
					Anna Milazzo
				</Link>

				{/* From md, not sm. The six pills need about 700px and the shell offers 592 at
				    640, so showing them at sm wrapped the bar into two rows all the way to
				    866px, which is a third of a landscape phone. */}
				{nav.length > 0 ? (
					<nav aria-label="Sections" className="hidden flex-wrap items-center gap-2 md:flex">
						{nav.map(link => (
							<a key={link.href} href={link.href} className="nav-pill">
								{link.label}
							</a>
						))}
					</nav>
				) : null}

				{/* The switch rides the wordmark's row, pushed right. As two-letter codes it is
				    92px, so at 320 the row is 142 + 12 + 92 of 288 and fits with room. */}
				<div className="ms-auto flex items-center gap-2 sm:gap-3">
					<LanguageSwitch path={path} locale={locale} />
				</div>

				{/* Below sm the contact pill takes the second row on its own and right-aligns
				    there, so the bar is two rows rather than three and neither row packs left
				    against empty paper. It sits after the switch in the document as well as on
				    the screen, so the focus order is the reading order. */}
				{contact ? (
					<div className="flex w-full justify-end sm:w-auto">
						<Link
							href={contact.href}
							className="nav-pill nav-pill-cta"
							aria-current={path === '/contact' ? 'page' : undefined}
							data-nav-contact
						>
							{contact.label}
						</Link>
					</div>
				) : null}
			</div>
		</header>
	)
}
