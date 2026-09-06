import Link from 'next/link'
import { LOCALES, type Locale, localeHref } from '@/lib/locale'

const LOCALE_NAMES: Record<Locale, string> = {
	it: 'Italiano',
	en: 'English',
}

/**
 * The same two words at two characters.
 *
 * The full names are 186px together, which is what pushed the phone bar into a third row
 * and kept it wrapped up to 866px. The codes are 92px and fit beside the wordmark. They
 * are shown to the eye only: every control keeps the full name as its accessible name, so
 * nothing is abbreviated for a screen reader.
 */
const LOCALE_CODES: Record<Locale, string> = {
	it: 'IT',
	en: 'EN',
}

/**
 * Switches the Portfolio between Italian and English, landing on the same page.
 *
 * The current path arrives as a prop rather than from `usePathname`. Under the proxy's
 * rewrite, a prerendered page reads the rewritten path, `/it/contact` rather than
 * `/contact`, and a switch built on it would link to `/en/it/contact`. Being told the
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
								{/* `aria-label` needs a role that supports naming and a span has none, so the
								    full name is carried as text only a screen reader reads. */}
								<LocaleLabel locale={candidate} />
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
								<LocaleLabel locale={candidate} />
							</Link>
						)}
					</li>
				))}
			</ul>
		</nav>
	)
}

/**
 * Both spellings, one shown at a time by width. Rendered rather than swapped in
 * JavaScript so the bar never changes size after hydration, and hidden from assistive
 * technology because the control already carries the full name in `aria-label`.
 */
function LocaleLabel({ locale }: { locale: Locale }) {
	return (
		<>
			{/* The code is decoration: it is the short spelling of the name beside it. */}
			<span aria-hidden="true" className="lg:hidden">
				{LOCALE_CODES[locale]}
			</span>
			{/* The name is the label at every width. Below lg it is read but not drawn, so
			    the control is never announced as two letters, and `sr-only` rather than
			    `aria-label` because a span carries no role that supports naming. */}
			<span className="sr-only lg:not-sr-only">{LOCALE_NAMES[locale]}</span>
		</>
	)
}
