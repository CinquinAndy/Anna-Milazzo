import type { Locale } from '@/lib/locale'
import { payloadClient } from './client'

/** Site-wide chrome: contact address, links elsewhere, the legals link label. */
export async function getSettings(locale: Locale) {
	const payload = await payloadClient()
	return payload.findGlobal({ slug: 'settings', locale, depth: 1 })
}
