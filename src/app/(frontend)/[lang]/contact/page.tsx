import type { Metadata } from 'next'
import { ContactArrival } from '@/components/contact-arrival'
import { ContactDesk } from '@/components/contact-desk'
import { ContactFacts } from '@/components/contact-facts'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { isLocale, type Locale, localeHref } from '@/lib/locale'
import { getContact } from '@/lib/payload/get-contact'
import { getHome } from '@/lib/payload/get-home'
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
	const [copy, settings, home] = await Promise.all([getContact(locale), getSettings(locale), getHome(locale)])
	const contactEmail = settings.contactEmail

	return (
		<>
			{/* The nav the header has always accepted and this page has never been given. It is
			    the route back into the work, and it is the only place `aria-current="page"` on
			    the contact pill can ever fire. */}
			<SiteHeader
				path={PATH}
				locale={locale}
				nav={[
					{ label: home.songs?.heading ?? '', href: '/#ascolta' },
					{ label: home.timeline?.heading ?? '', href: '/#percorso' },
				]}
				contact={{ label: home.contactCta?.buttonLabel ?? '', href: localeHref(PATH, locale) }}
			/>
			<main data-contact-main>
				<ContactArrival copy={copy} contactEmail={contactEmail} />
				<ContactDesk copy={copy} locale={locale} contactEmail={contactEmail} />
				<ContactFacts copy={copy} settings={settings} />
			</main>
			<SiteFooter settings={settings} locale={locale} />
		</>
	)
}
