import type { Locale } from '@/lib/locale'
import { payloadClient } from './client'

/** The legals page. */
export async function getLegals(locale: Locale) {
	const payload = await payloadClient()
	return payload.findGlobal({ slug: 'legals', locale, depth: 0 })
}
