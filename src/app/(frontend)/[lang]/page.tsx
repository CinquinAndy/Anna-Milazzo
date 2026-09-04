import type { Metadata } from 'next'
import { About } from '@/components/about'
import { Hero } from '@/components/hero'
import { LanguageSwitch } from '@/components/language-switch'
import { Skills } from '@/components/skills'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { getHome } from '@/lib/payload/get-home'

function localeOf(lang: string): Locale {
	return isLocale(lang) ? lang : 'it'
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const home = await getHome(localeOf(lang))

	return {
		title: home.hero?.name ?? 'Anna Milazzo',
		description: home.hero?.tagline ?? '',
		// Tells a search engine these are one page in two languages rather than two pages.
		alternates: {
			canonical: localeHref('/', localeOf(lang)),
			languages: {
				it: localeHref('/', 'it'),
				en: localeHref('/', 'en'),
				'x-default': localeHref('/', 'it'),
			},
		},
	}
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale = localeOf(lang)
	const home = await getHome(locale)

	return (
		<>
			<header className="border-b-brutal border-border px-5 py-4 sm:px-8">
				<div className="mx-auto flex max-w-6xl justify-end">
					<LanguageSwitch path="/" locale={locale} />
				</div>
			</header>

			<main>
				<Hero hero={home.hero} />
				<About about={home.about} />
				<Skills skills={home.skills} />
			</main>
		</>
	)
}
