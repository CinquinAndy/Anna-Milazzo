import type { Metadata } from 'next'
import { About } from '@/components/about'
import { ContactCta } from '@/components/contact-cta'
import { Hero } from '@/components/hero'
import { Marquee } from '@/components/marquee'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Skills } from '@/components/skills'
import { SongStack } from '@/components/song-stack'
import { Timeline } from '@/components/timeline'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { siteNav } from '@/lib/nav'
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
	const siteName = home.hero?.name ?? ''

	return (
		<>
			<SiteHeader
				path="/"
				locale={locale}
				nav={[
					...(home.songs?.heading ? [{ label: home.songs.heading, href: '#ascolta' }] : []),
					...(home.timeline?.heading ? [{ label: home.timeline.heading, href: '#percorso' }] : []),
				]}
				contact={
					home.contactCta?.buttonLabel
						? { label: home.contactCta.buttonLabel, href: localeHref('/contact', locale) }
						: undefined
				}
			/>

			<main>
				<Hero
					hero={home.hero}
					listenLabel={home.songs?.heading ?? undefined}
					contactLabel={home.contactCta?.buttonLabel ?? undefined}
					contactHref={localeHref('/contact', locale)}
				/>
				<About about={home.about} />
				<Skills skills={home.skills} />
				<Marquee skills={home.skills} />
				<SongStack songs={songs} labels={home.songs} />
				<Timeline timeline={home.timeline} scrollLabel={home.timeline?.scrollLabel ?? ''} />

				<ContactCta cta={home.contactCta} locale={locale} />
			</main>
			<SiteFooter settings={settings} locale={locale} nav={siteNav(home, locale, siteName)} siteName={siteName} />
		</>
	)
}
