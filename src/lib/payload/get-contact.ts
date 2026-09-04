import type { Locale } from '@/lib/locale'
import { payloadClient } from './client'

/** Every word on the contact page, including the form's own labels. */
export async function getContact(locale: Locale) {
	const payload = await payloadClient()
	return payload.findGlobal({ slug: 'contact', locale, depth: 0 })
}
