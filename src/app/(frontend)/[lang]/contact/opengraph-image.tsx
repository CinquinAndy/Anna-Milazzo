import { ImageResponse } from 'next/og'
import { OgContactCard } from '@/components/og-contact-card'
import { isLocale, type Locale } from '@/lib/locale'
import { OG_FONTS } from '@/lib/og/fonts'
import { getContact } from '@/lib/payload/get-contact'
import { getHome } from '@/lib/payload/get-home'
import { getSettings } from '@/lib/payload/get-settings'
import { SITE_DOMAIN } from '@/lib/site'

/**
 * The contact page's own card, so a link to it unfurls as an invitation rather than as the
 * site's front page again.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const localeOf = (lang: string): Locale => (isLocale(lang) ? lang : 'it')

/**
 * The name and the role on one line.
 *
 * The tagline's first sentence is the role, and the rest of it is about the work, which
 * the page itself says at length. A card has one line to spend.
 */
function whoSheIs(name: string, tagline: string) {
	const role = tagline.split('. ')[0]?.replace(/\.$/, '') ?? ''
	return role.length > 0 ? `${name}, ${role.charAt(0).toLowerCase()}${role.slice(1)}.` : name
}

export async function generateImageMetadata({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale = localeOf(lang)
	const [contact, home, settings] = await Promise.all([getContact(locale), getHome(locale), getSettings(locale)])

	// The card read aloud, and it has to name her: "Contact. email" tells somebody hearing
	// a shared link the subject but not the person.
	return [
		{
			id: 'card',
			size,
			contentType,
			alt: [
				contact.heading,
				whoSheIs(home.hero?.name ?? 'Anna Milazzo', home.hero?.tagline ?? ''),
				settings.contactEmail,
			]
				.filter(Boolean)
				.join(' '),
		},
	]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const locale = localeOf(lang)
	const [contact, home, settings] = await Promise.all([getContact(locale), getHome(locale), getSettings(locale)])

	return new ImageResponse(
		<OgContactCard
			heading={contact.heading ?? 'Contatti'}
			who={whoSheIs(home.hero?.name ?? 'Anna Milazzo', home.hero?.tagline ?? '')}
			email={settings.contactEmail ?? ''}
			domain={SITE_DOMAIN}
		/>,
		{ ...size, fonts: OG_FONTS }
	)
}
