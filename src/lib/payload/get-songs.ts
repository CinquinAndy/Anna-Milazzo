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
		// Everything on the audio record EXCEPT the spectrum, which is around 40 KB gzipped
		// for a three-minute track — five of those would outweigh the rest of the page. The
		// visualiser fetches it for one track, on first play.
		//
		// Written as an exclusion rather than a list of keepers on purpose: `url` on an
		// upload is computed from `filename` and `prefix`, so naming only `url` and `peaks`
		// returns a url of null, and the player silently disappears.
		populate: { audio: { spectrum: false } },
	})
	return docs
}
