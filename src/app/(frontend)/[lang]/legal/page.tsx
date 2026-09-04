import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { getLegals } from '@/lib/payload/get-legals'
import { getSettings } from '@/lib/payload/get-settings'

const PATH = '/legal'

function localeOf(lang: string): Locale {
	return isLocale(lang) ? lang : 'it'
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const copy = await getLegals(localeOf(lang))

	return {
		title: copy.heading ?? 'Note legali',
		alternates: {
			canonical: localeHref(PATH, localeOf(lang)),
			languages: {
				it: localeHref(PATH, 'it'),
				en: localeHref(PATH, 'en'),
				'x-default': localeHref(PATH, 'it'),
			},
		},
	}
}

export default async function LegalPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale = localeOf(lang)
	const [copy, settings] = await Promise.all([getLegals(locale), getSettings(locale)])

	return (
		<>
			<SiteHeader path={PATH} locale={locale} />
			<main className="px-5 py-14 sm:px-8 md:py-20">
				<div className="mx-auto max-w-6xl">
					<h1 className="font-display uppercase [font-stretch:88%]">{copy.heading}</h1>
					{/* richText, unlike text and textarea, does not fall back on an empty value —
					    only on a missing one. Both languages are seeded, and this guards the case
					    where an editor empties one rather than leaving it unwritten. */}
					{copy.body ? (
						<div className="legal-prose mt-8 max-w-prose font-sans" data-legal-body>
							<RichText data={copy.body} />
						</div>
					) : null}
				</div>
			</main>
			<SiteFooter settings={settings} locale={locale} />
		</>
	)
}
