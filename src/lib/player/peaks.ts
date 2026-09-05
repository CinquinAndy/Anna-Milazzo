import type { Bar } from '@/lib/player/bars'

/**
 * A track's own amplitude, reduced to a small array of numbers.
 *
 * This is the measuring half of the waveform; nothing here decodes anything or touches a
 * network. It takes samples that somebody else has already decoded and answers two
 * questions: what to store per track, and what to draw at a given width.
 *
 * Why RMS rather than peak. Measured on the five real tracks, peak amplitude puts the
 * median bucket at 0.83–0.98 of full scale with a dozen buckets pinned at exactly 1.0 —
 * a mastered track is loud nearly everywhere, so a peak reading draws a brick. RMS on the
 * same files lands the median at 0.63–0.76 with a floor around 0.07, which is the dynamic
 * range that makes a row of bars read as music rather than as a progress bar.
 */

/**
 * How many buckets are stored per track.
 *
 * Above what any width draws, so the display always downsamples and never invents detail
 * it does not have. 128 numbers is roughly 400 bytes of JSON — small enough to travel with
 * the page, which is the whole reason this is measured once on the server instead of in
 * every visitor's browser.
 */
export const PEAK_RESOLUTION = 128

/**
 * The shortest bar drawn, as a percentage of the rail.
 *
 * A silent passage still has to look like part of a control. At zero the rail would appear
 * to end wherever the track goes quiet, and the seek input spans the whole rail whatever
 * the audio does.
 */
export const BAR_FLOOR = 8

/**
 * Reduces decoded samples to `resolution` loudness readings, each 0–100.
 *
 * Normalised against the track's own loudest bucket rather than full scale, so a quietly
 * recorded piece draws the same shape a loud one does. That is a deliberate choice about
 * what the diagram is for: it shows the shape of THIS track, not how it compares to
 * another. The alternative — absolute scale — makes Anna's quieter studies look broken.
 */
export function summarise(channels: readonly Float32Array[], sampleCount: number, resolution = PEAK_RESOLUTION) {
	if (channels.length === 0 || sampleCount <= 0 || resolution <= 0) {
		return []
	}

	const readings: number[] = []
	for (let bucket = 0; bucket < resolution; bucket++) {
		const from = Math.floor((bucket * sampleCount) / resolution)
		const to = Math.max(from + 1, Math.floor(((bucket + 1) * sampleCount) / resolution))
		let energy = 0
		let counted = 0
		for (let index = from; index < to && index < sampleCount; index++) {
			// Channels are summed to mono first. Measuring one channel would miss anything
			// panned to the other, which in a stereo mix is a real part of the track.
			let mono = 0
			for (const channel of channels) {
				mono += channel[index] ?? 0
			}
			mono /= channels.length
			energy += mono * mono
			counted++
		}
		readings.push(counted === 0 ? 0 : Math.sqrt(energy / counted))
	}

	return normalise(readings)
}

/**
 * How far down the sorted readings the top of the scale is set.
 *
 * NOT the maximum. One transient is enough to flatten a whole track against it: measured on
 * a real file whose first bucket held a downbeat four times louder than anything after it,
 * every other bar came out under a quarter height and the waveform read as empty with a
 * spike. A click, a cough or a cymbal in Anna's own recording would do the same.
 *
 * Reading against a high percentile instead means the loud passages still reach the top —
 * anything above the reference simply clamps — while the body of the track uses the scale it
 * deserves. At 128 readings this is the sixth loudest.
 */
const HEADROOM_PERCENTILE = 0.95

/** Scales readings to 0–100 against a high percentile, clamped. */
function normalise(readings: readonly number[]) {
	const sorted = [...readings].sort((a, b) => a - b)
	const reference = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * HEADROOM_PERCENTILE))] ?? 0
	if (reference <= 0) {
		// Either silence, or a track so nearly silent that only its loudest moment registers.
		const loudest = Math.max(...readings)
		return loudest <= 0 ? readings.map(() => 0) : readings.map(r => Math.round((r / loudest) * 100))
	}
	return readings.map(reading => Math.min(100, Math.round((reading / reference) * 100)))
}

/**
 * Redraws a stored phrase at `count` buckets.
 *
 * Readings are combined in quadrature, which is how loudness actually adds: each reading is
 * an RMS, and the RMS of a span is the root of the mean of its squares, not the mean and
 * not the largest.
 *
 * Taking the largest was the first attempt and it failed at exactly the width it mattered
 * at. Measured on the real tracks, folding 128 readings down to the 20 bars a phone has
 * room for put the MEDIAN bar at 99 and sent 14 of 20 past 95 — the diagram became a solid
 * block. Quadrature keeps the loud passages loud without dragging the quiet ones up with
 * them, and squaring still lets one loud reading dominate its bucket, so a transient is
 * felt rather than averaged away.
 *
 * The result is renormalised because the fold lowers every reading a little, and the
 * loudest moment of a track should touch the top of the rail at any width.
 *
 * Windows can only be empty when asked for more buckets than are stored, and then the
 * nearest reading stands in — no interpolation, because inventing intermediate values would
 * draw detail the measurement does not contain.
 */
export function resample(peaks: readonly number[], count: number) {
	if (peaks.length === 0 || count <= 0) {
		return []
	}

	const folded: number[] = []
	for (let bucket = 0; bucket < count; bucket++) {
		const from = Math.floor((bucket * peaks.length) / count)
		const to = Math.floor(((bucket + 1) * peaks.length) / count)
		if (to <= from) {
			folded.push(peaks[Math.min(from, peaks.length - 1)] ?? 0)
			continue
		}
		let energy = 0
		for (let index = from; index < to; index++) {
			const reading = peaks[index] ?? 0
			energy += reading * reading
		}
		folded.push(Math.sqrt(energy / (to - from)))
	}

	return normalise(folded)
}

/**
 * How many bars fit in a rail `width` pixels across.
 *
 * The rail used to draw a fixed 44 bars and hide whatever did not fit: measured, 9 of them
 * fell off the end at 375px. With an authored phrase that was cosmetic. With a waveform it
 * is a lie, because the last fifth of the track would be invisible while the playhead still
 * travels the full width — so the count follows the width instead.
 *
 * The lower bound is what the geometry allows: every bar carries two 2px keylines that
 * cannot shrink, plus a 2px gap, so a bar can never be narrower than 6px of rail.
 */
export function barCountFor(width: number) {
	const PITCH = 12
	const MINIMUM = 20
	const MAXIMUM = 96
	if (!Number.isFinite(width) || width <= 0) {
		return DEFAULT_BAR_COUNT
	}
	const affordable = Math.floor((width - 6) / 6)
	return Math.max(Math.min(MINIMUM, affordable), Math.min(Math.round(width / PITCH), MAXIMUM, affordable))
}

/** What the server renders before any width has been measured. */
export const DEFAULT_BAR_COUNT = 44

/**
 * The bars to draw for a track at a given width, keyed by position.
 *
 * Readings are lifted clear of the floor rather than clamped to it, so the distance
 * between a quiet bucket and a loud one survives the mapping instead of being flattened at
 * the bottom of the scale.
 */
export function toBars(peaks: readonly number[], count: number): readonly Bar[] {
	return resample(peaks, count).map((reading, index) => ({
		id: `p${index}`,
		height: BAR_FLOOR + (reading / 100) * (100 - BAR_FLOOR),
	}))
}
