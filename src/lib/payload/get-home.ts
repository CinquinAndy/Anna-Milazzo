import type { Locale } from '@/lib/locale'
import { payloadClient } from './client'

/**
 * Every word on the landing page, in `locale`.
 *
 * No `fallbackLocale` is passed, so Payload uses the default — English falls back to
 * Italian rather than rendering blank (ADR-0003).
 */
export async function getHome(locale: Locale) {
	const payload = await payloadClient()
	return payload.findGlobal({ slug: 'home', locale, depth: 2 })
}
