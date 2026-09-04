import { LanguageSwitch } from '@/components/language-switch'
import { isLocale, type Locale } from '@/lib/locale'

/** The landing page. Its copy moves into Payload in ticket 06. */
export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale: Locale = isLocale(lang) ? lang : 'it'

	return (
		<main>
			<LanguageSwitch path="/" locale={locale} />
			<h1>Anna Milazzo</h1>
			<p>{locale === 'it' ? 'Compositrice e sound designer.' : 'Composer and sound designer.'}</p>
		</main>
	)
}
