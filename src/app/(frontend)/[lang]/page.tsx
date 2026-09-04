import type { Metadata } from 'next'
import Link from 'next/link'
import { About } from '@/components/about'
import { Hero } from '@/components/hero'
import { Ornament } from '@/components/ornament'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Skills } from '@/components/skills'
import { SongStack } from '@/components/song-stack'
import { Timeline } from '@/components/timeline'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { getHome } from '@/lib/payload/get-home'
import { getSettings } from '@/lib/payload/get-settings'
import { getSongs } from '@/lib/payload/get-songs'

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
	const [home, songs, settings] = await Promise.all([getHome(locale), getSongs(locale), getSettings(locale)])

	return (
		<>
			<SiteHeader path="/" locale={locale} />

			<main>
				<Hero hero={home.hero} />
				<About about={home.about} />
				<Skills skills={home.skills} />
				<SongStack songs={songs} labels={home.songs} />
				<Timeline timeline={home.timeline} scrollLabel={home.timeline?.scrollLabel ?? ''} />

				{/* The route to contact. The destination exists now, so the button can. */}
				<section data-enter className="relative px-5 py-14 sm:px-8 md:py-20">
					<Ornament kind="asterisk" rotation={11} className="top-10 right-6 h-9 w-9 sm:right-12 sm:h-12 sm:w-12" />
					<div className="mx-auto flex max-w-6xl flex-col items-start gap-6">
						<h2 className="font-display uppercase [font-stretch:88%]">{home.contactCta?.heading}</h2>
						{home.contactCta?.body ? <p className="max-w-prose font-sans text-lg">{home.contactCta.body}</p> : null}
						<Link href={localeHref('/contact', locale)} className="control control-accent" data-contact-cta>
							{home.contactCta?.buttonLabel}
						</Link>
					</div>
				</section>
			</main>
			<SiteFooter settings={settings} locale={locale} />
		</>
	)
}
