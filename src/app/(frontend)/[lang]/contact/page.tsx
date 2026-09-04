import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact-form'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { getContact } from '@/lib/payload/get-contact'
import { getSettings } from '@/lib/payload/get-settings'

const PATH = '/contact'

function localeOf(lang: string): Locale {
	return isLocale(lang) ? lang : 'it'
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
	const { lang } = await params
	const copy = await getContact(localeOf(lang))

	return {
		title: copy.heading ?? 'Contatti',
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

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale = localeOf(lang)
	const [copy, settings] = await Promise.all([getContact(locale), getSettings(locale)])

	return (
		<>
			<SiteHeader path={PATH} locale={locale} />
			<main className="min-h-[60vh] bg-spring px-5 py-14 text-spring-foreground sm:px-8 md:py-20">
				<div className="shell">
					<h1 className="font-display uppercase [font-stretch:88%]">{copy.heading}</h1>
					{copy.intro ? <p className="mt-4 max-w-prose font-sans text-lg">{copy.intro}</p> : null}
					<ContactForm copy={copy} locale={locale} />
				</div>
			</main>
			<SiteFooter settings={settings} locale={locale} />
		</>
	)
}
