import { hannWindow, transform } from '@/lib/player/fft'

/**
 * A track's frequency content over time, measured once and replayed later.
 *
 * WHY THIS IS MEASURED AHEAD OF TIME rather than by a live AnalyserNode, which is the
 * obvious way to build a visualiser: it cannot be done here, and that was established by
 * measurement rather than by reading. The audio is served from a bucket domain that sends
 * no `access-control-allow-origin`, and a cross-origin media element that is not
 * CORS-approved taints the Web Audio graph — `getByteFrequencyData` returned all zeros for
 * a full second while the element was demonstrably playing. Adding `crossorigin="anonymous"`
 * does not fix it; the fetch is then rejected outright and there is no audio at all. On top
 * of that ADR-0007 gives the page exactly one `<audio>` element, and
 * `createMediaElementSource` can be called once per element and permanently reroutes its
 * output — so the live route would put all playback behind a graph that returns silence.
 *
 * Measuring on upload costs one analysis per track and nothing per visit, works on iOS,
 * and gives the visualiser real data before the first frame instead of a second in.
 */

/** Bars drawn, and therefore bands measured. */
export const SPECTRUM_BANDS = 20

/**
 * Frames stored per second of audio.
 *
 * Well under the screen refresh on purpose. A real analyser smooths heavily anyway — the
 * Web Audio default is a 0.8 smoothing constant, roughly a 100 ms time constant — so
 * twelve measurements a second carry every motion the eye can follow, and the player
 * interpolates between them. Raising this multiplies the stored size for movement nobody
 * can see.
 */
export const SPECTRUM_FPS = 12

/**
 * 46 ms of audio at 44.1 kHz, and 21.5 Hz per bin.
 *
 * The trade is the usual one: a longer window resolves frequency better and time worse. At
 * 1024 the lowest bands would collapse to one bin each and flicker; at 4096 a drum hit
 * smears across 93 ms and the display goes soft.
 */
const FFT_SIZE = 2048

/** Below 40 Hz is rumble no laptop reproduces; above 16 kHz is nothing anyone will hear. */
const LOW_HZ = 40
const HIGH_HZ = 16000

/**
 * How far below its own peak a band is drawn as empty.
 *
 * Measured on real content, band peaks span about 52 dB from the quietest band to the
 * loudest. A window near that keeps a quiet band legible without stretching its noise
 * floor across the whole bar.
 */
const BAND_WINDOW_DB = 45

/**
 * A band whose loudest moment never reaches this is silence, and is drawn as silence.
 *
 * This guard is the difference between a visualiser and a fabrication. Normalising each
 * band against its own peak is what lets a quiet band show its shape, but applied without
 * a floor it would take a digitally empty band — whose peak is its own noise — and stretch
 * that noise to full height, drawing a busy bar for a frequency the track does not contain.
 * Below −90 dBFS, under the noise floor of 16-bit audio, nothing is drawn.
 */
const SILENCE_DB = -90

/** Hz to mel, and back. */
const toMel = (hz: number) => 2595 * Math.log10(1 + hz / 700)
const fromMel = (mel: number) => 700 * (10 ** (mel / 2595) - 1)

/**
 * The band edges, in Hz.
 *
 * Mel-spaced rather than linear or purely logarithmic. Linear spacing puts almost every
 * band above 5 kHz, where music has little to say, and leaves the octaves that carry the
 * melody sharing one bar. Pure log spacing goes too far the other way and starves the
 * lowest bands, which then hold a single bin each and flicker. Mel is linear below about
 * 1 kHz and logarithmic above, which is both how hearing works and what keeps the bottom
 * bands several bins wide.
 */
export function bandEdges(count: number, lowHz = LOW_HZ, highHz = HIGH_HZ) {
	const low = toMel(lowHz)
	const high = toMel(highHz)
	return Array.from({ length: count + 1 }, (_, index) => fromMel(low + ((high - low) * index) / count))
}

/** The half-open bin range each band covers, never empty. */
export function bandRanges(count: number, fftSize: number, sampleRate: number, lowHz = LOW_HZ, highHz = HIGH_HZ) {
	const edges = bandEdges(count, lowHz, highHz)
	// Bin 0 is the DC offset, which is not a frequency anyone hears.
	const binOf = (hz: number) => Math.min(fftSize / 2 - 1, Math.max(1, Math.round((hz * fftSize) / sampleRate)))
	return Array.from({ length: count }, (_, index) => {
		const from = binOf(edges[index] as number)
		return [from, Math.max(from + 1, binOf(edges[index + 1] as number))] as const
	})
}

export type Spectrum = {
	/** Bands per frame. */
	bands: number
	/** Frames per second of audio. */
	fps: number
	/** `frames * bands` readings 0–100, frame-major. */
	data: number[]
}

/**
 * Measures decoded samples into a spectrum.
 *
 * Each band is normalised against its OWN loudest moment rather than against the track's,
 * which is the decision that makes the display legible. Music falls away steeply with
 * frequency: measured on real content the quietest band peaks about 52 dB under the
 * loudest, so a single global scale leaves everything above the low mids permanently dark.
 * The cost is that the picture shows each band's own dynamics rather than the balance
 * between bands, and that is the right trade for something whose job is to move with the
 * music. The silence guard above is what stops that choice becoming a lie.
 */
export function analyseSpectrum(
	channels: readonly Float32Array[],
	sampleCount: number,
	sampleRate: number,
	bands = SPECTRUM_BANDS,
	fps = SPECTRUM_FPS
): Spectrum | null {
	if (channels.length === 0 || sampleCount < FFT_SIZE || sampleRate <= 0 || bands <= 0 || fps <= 0) {
		return null
	}

	const hop = Math.max(1, Math.round(sampleRate / fps))
	const frameCount = Math.floor((sampleCount - FFT_SIZE) / hop) + 1
	const ranges = bandRanges(bands, FFT_SIZE, sampleRate)
	const window = hannWindow(FFT_SIZE)
	const re = new Float64Array(FFT_SIZE)
	const im = new Float64Array(FFT_SIZE)

	// Decibels first, because the normalisation needs each band's peak across the whole
	// track before any reading can be scaled.
	const decibels = new Float64Array(frameCount * bands)
	const peaks = new Float64Array(bands).fill(Number.NEGATIVE_INFINITY)

	for (let frame = 0; frame < frameCount; frame++) {
		const start = frame * hop
		for (let i = 0; i < FFT_SIZE; i++) {
			let mono = 0
			for (const channel of channels) {
				mono += channel[start + i] ?? 0
			}
			re[i] = (mono / channels.length) * (window[i] as number)
			im[i] = 0
		}
		transform(re, im)

		for (let band = 0; band < bands; band++) {
			const [from, to] = ranges[band] as readonly [number, number]
			let energy = 0
			for (let bin = from; bin < to; bin++) {
				energy += (re[bin] as number) ** 2 + (im[bin] as number) ** 2
			}
			// Divided by the bin count so a wide band is not louder merely for being wide,
			// and by half the window so the scale does not move with FFT_SIZE.
			const magnitude = Math.sqrt(energy / (to - from)) / (FFT_SIZE / 2)
			const db = 20 * Math.log10(Math.max(magnitude, 1e-10))
			decibels[frame * bands + band] = db
			if (db > (peaks[band] as number)) {
				peaks[band] = db
			}
		}
	}

	const data: number[] = new Array(frameCount * bands)
	for (let frame = 0; frame < frameCount; frame++) {
		for (let band = 0; band < bands; band++) {
			const peak = peaks[band] as number
			const index = frame * bands + band
			if (peak < SILENCE_DB) {
				data[index] = 0
				continue
			}
			const floor = peak - BAND_WINDOW_DB
			const level = ((decibels[index] as number) - floor) / BAND_WINDOW_DB
			data[index] = Math.max(0, Math.min(100, Math.round(level * 100)))
		}
	}

	return { bands, fps, data }
}

/**
 * The track's TIMBRE over time: for each of `buckets` slices, where its energy sits in the
 * spectrum, 0 (all bass) to 100 (all treble).
 *
 * This is what survives of the full analysis. Storing every frame of every band is around
 * 40 KB gzipped for a three-minute track, which is more than the rest of the landing page
 * and would have to be fetched separately; folding it to one number per slice costs the
 * same as the waveform beside it — a few hundred bytes — and travels with the page.
 *
 * The number is the energy-weighted mean band index, the spectral centroid. It is what
 * separates a bass passage from a bright one, so a waveform drawn with height for loudness
 * can carry colour for timbre and say two true things at once rather than one twice.
 *
 * Loudness is deliberately not folded in here: a quiet passage still has a timbre, and the
 * height of the bar already reports how loud it is.
 */
export function toneOf(spectrum: Spectrum, buckets: number) {
	const { bands, data } = spectrum
	const frameCount = Math.floor(data.length / bands)
	if (frameCount === 0 || buckets <= 0 || bands < 2) {
		return []
	}

	const out: (number | null)[] = []
	for (let bucket = 0; bucket < buckets; bucket++) {
		const from = Math.floor((bucket * frameCount) / buckets)
		const to = Math.max(from + 1, Math.floor(((bucket + 1) * frameCount) / buckets))
		let weighted = 0
		let total = 0
		for (let frame = from; frame < to && frame < frameCount; frame++) {
			for (let band = 0; band < bands; band++) {
				const reading = data[frame * bands + band] ?? 0
				weighted += reading * band
				total += reading
			}
		}
		// Silence has no centroid at all. Left as null here and filled in below, because any
		// fixed answer is a colour the track does not have — reporting the middle put a
		// magenta bar at the head of every file whose first moment was quiet.
		out.push(total <= 0 ? null : Math.round((weighted / total / (bands - 1)) * 100))
	}

	// Silent stretches take the timbre around them: a rest inside a phrase belongs to that
	// phrase, and drawing it as a different colour says something about it that is not true.
	let last: number | null = null
	for (let i = 0; i < out.length; i++) {
		if (out[i] === null) {
			out[i] = last
		} else {
			last = out[i] as number
		}
	}
	let next: number | null = null
	for (let i = out.length - 1; i >= 0; i--) {
		if (out[i] === null) {
			out[i] = next
		} else {
			next = out[i] as number
		}
	}
	// A track with no energy anywhere. Nothing to say, so say the middle once.
	return out.map(value => value ?? 50)
}

/**
 * The reading for every band at a moment in the track, interpolated between stored frames.
 *
 * Linear rather than nearest, because twelve frames a second shown at sixty would otherwise
 * step visibly — the bars would move in five-frame jumps, which reads as a dropped frame
 * rather than as a decision.
 */
export function sampleAt(spectrum: Spectrum, seconds: number) {
	const { bands, fps, data } = spectrum
	const frameCount = Math.floor(data.length / bands)
	if (frameCount === 0) {
		return []
	}

	const position = Math.max(0, Math.min(frameCount - 1, seconds * fps))
	const lower = Math.floor(position)
	const upper = Math.min(frameCount - 1, lower + 1)
	const blend = position - lower

	return Array.from({ length: bands }, (_, band) => {
		const from = data[lower * bands + band] ?? 0
		const to = data[upper * bands + band] ?? 0
		return from + (to - from) * blend
	})
}
