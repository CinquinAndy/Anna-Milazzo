import Link from 'next/link'
import { LanguageSwitch } from '@/components/language-switch'
import { type Locale, localeHref } from '@/lib/locale'

export type NavLink = { label: string; href: string }

/**
 * The chrome at the top of every page: the wordmark, a way into the two sections worth
 * jumping to, a way to contact, and a way to the other language.
 *
 * The labels are not new CMS fields. They are the section headings Anna already writes —
 * so the nav cannot drift out of step with what it points at, and it is already bilingual.
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

	return (
		<header className="sticky top-0 z-50 border-b-brutal border-border bg-paper px-4 py-3 sm:px-6" data-site-header>
			<div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2">
				{/* The wordmark is a filled pill, so the bar has one anchor point that does not
				    move between pages. It is a link even on the landing page: pressing it
				    returns to the top, which is what a wordmark is for. */}
				<Link href={home} className="nav-pill nav-pill-mark" data-nav-home>
					Anna Milazzo
				</Link>

				{nav.length > 0 ? (
					<nav aria-label="Sections" className="hidden flex-wrap items-center gap-2 sm:flex">
						{nav.map(link => (
							<a key={link.href} href={link.href} className="nav-pill">
								{link.label}
							</a>
						))}
					</nav>
				) : null}

				{/* Its own row below 640px. Pushed right by ms-auto with nowrap pills it overflowed
				    the viewport by 66px at 375px — the contact label is long in Italian and the
				    language switch sits after it. */}
				<div className="flex w-full flex-wrap items-center gap-2 sm:ms-auto sm:w-auto sm:gap-3">
					{contact ? (
						<Link
							href={contact.href}
							className="nav-pill nav-pill-cta"
							aria-current={path === '/contact' ? 'page' : undefined}
							data-nav-contact
						>
							{contact.label}
						</Link>
					) : null}
					<LanguageSwitch path={path} locale={locale} />
				</div>
			</div>
		</header>
	)
}
