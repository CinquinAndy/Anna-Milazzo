import Link from 'next/link'
import { LOCALES, type Locale, localeHref } from '@/lib/locale'

const LOCALE_NAMES: Record<Locale, string> = {
	it: 'Italiano',
	en: 'English',
}

/**
 * Switches the Portfolio between Italian and English, landing on the same page.
 *
 * The current path arrives as a prop rather than from `usePathname`. Under the proxy's
 * rewrite, a prerendered page reads the rewritten path — `/it/contact` rather than
 * `/contact` — and a switch built on it would link to `/en/it/contact`. Being told the
 * path keeps this a Server Component with no client JavaScript and no hydration risk.
 *
 * @param path   the locale-free canonical path of the current page: `/`, `/contact`, `/legal`
 * @param locale the locale currently being served
 */
export function LanguageSwitch({ path, locale }: { path: string; locale: Locale }) {
	return (
		<nav aria-label={locale === 'it' ? 'Lingua' : 'Language'} data-language-switch>
			<ul className="flex items-center gap-2">
				{LOCALES.map(candidate => (
					<li key={candidate}>
						{candidate === locale ? (
							<span
								aria-current="true"
								lang={candidate}
								className="inline-flex border-2 border-border bg-foreground px-3 py-2 font-mono text-xs text-background uppercase"
							>
								{LOCALE_NAMES[candidate]}
							</span>
						) : (
							<Link
								href={localeHref(path, candidate)}
								hrefLang={candidate}
								lang={candidate}
								// inline-flex, not inline: an inline box's padding and border do not
								// contribute to its line box, so the focus ring would be painted
								// over whatever sits behind the header rather than on the paper.
								className="inline-flex border-2 border-border bg-card px-3 py-2 font-mono text-xs uppercase"
							>
								{LOCALE_NAMES[candidate]}
							</Link>
						)}
					</li>
				))}
			</ul>
		</nav>
	)
}
