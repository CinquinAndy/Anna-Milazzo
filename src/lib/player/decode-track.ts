import { PEAK_RESOLUTION, summarise } from '@/lib/player/peaks'
import { analyseSpectrum, toneOf } from '@/lib/player/spectrum'

/**
 * Reads an MP3's amplitude, on the server, once.
 *
 * Server-side and at upload time is the only place this can honestly happen. ADR-0007
 * rules out the two browser routes: `createMediaElementSource` can be called once per
 * element and permanently reroutes that element's output, and the page owns exactly one
 * `<audio>`; fetching each track a second time to decode it is blocked outright, because
 * the bucket's public domain sends no `access-control-allow-origin` — measured, not
 * assumed. Even with CORS opened it would mean every visitor downloading every track
 * before hearing one.
 *
 * Measuring here costs one decode per upload and nothing at all per visit, and the
 * waveform is correct on first paint rather than appearing a few seconds in.
 *
 * The decoder is a WASM build of mpg123 with no native binary behind it, so this adds
 * nothing to the deployment — which matters, because the client builds this himself
 * without a Dockerfile.
 */
export type TrackAnalysis = {
	/** How loud the track is, moment by moment. The height of every bar. */
	peaks: readonly number[]
	/** Where its energy sits in the spectrum, moment by moment. The colour of every bar. */
	tone: readonly number[]
}

/**
 * Decodes once and measures twice.
 *
 * One decode for both, because decoding is by far the expensive half — measured on the real
 * tracks the spectral analysis itself takes 13 to 37 ms, which is nothing beside pulling a
 * few megabytes of MP3 through a WASM decoder.
 */
export async function readTrack(mp3: Uint8Array): Promise<TrackAnalysis | null> {
	// Imported at call time so an upload of a cover image, or simply booting the admin,
	// never pays to instantiate a WASM module.
	const { MPEGDecoder } = await import('mpg123-decoder')
	const decoder = new MPEGDecoder()
	await decoder.ready

	try {
		const { channelData, samplesDecoded, sampleRate } = await decoder.decode(mp3)
		if (samplesDecoded <= 0 || sampleRate <= 0 || channelData.length === 0) {
			return null
		}
		// The full spectrum is computed and then folded away. Keeping it would be around
		// 40 KB gzipped for a three-minute track — more than the rest of the landing page,
		// and needing its own request — where one centroid per bucket costs what the
		// waveform costs and travels with the page.
		const spectrum = analyseSpectrum(channelData, samplesDecoded, sampleRate)
		return {
			peaks: summarise(channelData, samplesDecoded, PEAK_RESOLUTION),
			tone: spectrum === null ? [] : toneOf(spectrum, PEAK_RESOLUTION),
		}
	} finally {
		decoder.free()
	}
}
