import { ImageResponse } from 'next/og'
import { OgCard } from '@/components/og-card'
import { isLocale, type Locale } from '@/lib/locale'
import { OG_FONTS } from '@/lib/og/fonts'
import { getHome } from '@/lib/payload/get-home'
import { SITE_DOMAIN } from '@/lib/site'

/**
 * The card that stands in for the site anywhere a link is unfurled.
 *
 * Every word on it comes from Payload (ADR-0003), so the card says whatever Anna is
 * currently saying about herself rather than a caption written once in a component. It is
 * generated at build time, one per locale, because none of it depends on the request.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const localeOf = (lang: string): Locale => (isLocale(lang) ? lang : 'it')

export async function generateImageMetadata({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const home = await getHome(localeOf(lang))
	const name = home.hero?.name ?? 'Anna Milazzo'

	// The alt text is the card read aloud, because that is what it is for.
	return [
		{
			id: 'card',
			size,
			contentType,
			alt: [name, home.hero?.tagline].filter(Boolean).join('. '),
		},
	]
}

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
	const { lang } = await params
	const home = await getHome(localeOf(lang))

	// Every discipline, in Anna's order. The card's row takes as many as it can hold and
	// stops, because how many fit depends on the language and on what she has written.
	const disciplines = (home.skills?.entries ?? []).map(entry => entry.name).filter(Boolean)

	return new ImageResponse(
		<OgCard
			name={home.hero?.name ?? 'Anna Milazzo'}
			tagline={home.hero?.tagline ?? ''}
			disciplines={disciplines}
			domain={SITE_DOMAIN}
		/>,
		{ ...size, fonts: OG_FONTS }
	)
}
