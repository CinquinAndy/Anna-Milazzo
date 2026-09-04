import type { Locale } from '@/lib/locale'
import { payloadClient } from './client'

/** Every Song, in the order Anna set. */
export async function getSongs(locale: Locale) {
	const payload = await payloadClient()
	const { docs } = await payload.find({
		collection: 'songs',
		locale,
		sort: 'order',
		pagination: false,
		// Deep enough to reach the cover and track URLs.
		depth: 2,
	})
	return docs
}
