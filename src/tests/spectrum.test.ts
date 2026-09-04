import { describe, expect, it } from 'vitest'
import { analyseSpectrum, bandEdges, bandRanges, SPECTRUM_BANDS, sampleAt, toneOf } from '@/lib/player/spectrum'

const RATE = 44100

/** A steady tone, long enough to fill several analysis windows. */
function tone(hz: number, seconds = 2, amplitude = 0.5) {
	const count = Math.floor(RATE * seconds)
	return Float32Array.from({ length: count }, (_, i) => Math.sin((2 * Math.PI * hz * i) / RATE) * amplitude)
}

/** Which band covers this frequency, under the default edges. */
function bandOf(hz: number, bands = SPECTRUM_BANDS) {
	const edges = bandEdges(bands)
	for (let i = 0; i < bands; i++) {
		if (hz >= (edges[i] as number) && hz < (edges[i + 1] as number)) {
			return i
		}
	}
	return bands - 1
}

/** The mean reading of one band across the whole track. */
function meanOf(data: readonly number[], bands: number, band: number) {
	const frames = Math.floor(data.length / bands)
	let sum = 0
	for (let f = 0; f < frames; f++) {
		sum += data[f * bands + band] ?? 0
	}
	return sum / frames
}

/** The analysis, or a failed test — never a silent undefined. */
function analysed(channels: readonly Float32Array[], sampleCount: number, rate = RATE) {
	const result = analyseSpectrum(channels, sampleCount, rate)
	if (result === null) {
		throw new Error('the analysis returned nothing for input that should have been measurable')
	}
	return result
}

describe('bandEdges', () => {
	it('spans the range asked for, in order', () => {
		const edges = bandEdges(20, 40, 16000)
		expect(edges).toHaveLength(21)
		expect(edges[0]).toBeCloseTo(40, 6)
		expect(edges[20]).toBeCloseTo(16000, 3)
		for (let i = 1; i < edges.length; i++) {
			expect(edges[i]).toBeGreaterThan(edges[i - 1] as number)
		}
	})

	it('gives the low octaves more bands than a logarithmic scale would', () => {
		// Mel is nearly linear below 1 kHz. Half the range in Hz terms sits low down, which is
		// where the melody is — and is what keeps the bottom bands more than one bin wide.
		const edges = bandEdges(20, 40, 16000)
		const belowOneK = edges.filter(hz => hz < 1000).length
		expect(belowOneK).toBeGreaterThanOrEqual(6)
	})
})

describe('bandRanges', () => {
	it('never hands a band an empty bin range', () => {
		for (const bands of [12, 20, 24, 32]) {
			for (const [from, to] of bandRanges(bands, 2048, RATE)) {
				expect(to, `${bands} bands`).toBeGreaterThan(from)
			}
		}
	})

	it('keeps the lowest band several bins wide, so it cannot flicker', () => {
		// One bin in the bottom band is the classic spectrum-analyser failure: it jitters on
		// noise while everything above it moves smoothly.
		const [first] = bandRanges(SPECTRUM_BANDS, 2048, RATE)
		expect((first as readonly [number, number])[1] - (first as readonly [number, number])[0]).toBeGreaterThanOrEqual(3)
	})

	it('never reads past the usable half of the transform', () => {
		for (const [, to] of bandRanges(SPECTRUM_BANDS, 2048, RATE)) {
			expect(to).toBeLessThanOrEqual(1024)
		}
	})
})

describe('analyseSpectrum', () => {
	it('lights the band a tone belongs to and leaves distant bands dark', () => {
		const { bands, data } = analysed([tone(300)], RATE * 2)

		const here = bandOf(300)
		const faraway = bandOf(9000)
		expect(meanOf(data, bands, here), 'the tone did not light its own band').toBeGreaterThan(60)
		expect(meanOf(data, bands, faraway), 'a band with no content was drawn as active').toBeLessThan(5)
	})

	it('moves the energy when the frequency moves, which is what makes it a spectrum', () => {
		const low = analysed([tone(200)], RATE * 2)
		const high = analysed([tone(5000)], RATE * 2)

		expect(meanOf(low.data, low.bands, bandOf(200))).toBeGreaterThan(60)
		expect(meanOf(high.data, high.bands, bandOf(200))).toBeLessThan(5)
		expect(meanOf(high.data, high.bands, bandOf(5000))).toBeGreaterThan(60)
	})

	it('refuses to animate a band the track has nothing in', () => {
		// Digital silence in every band above the tone. Without the silence guard, per-band
		// normalisation would stretch each empty band's own noise to full height and draw a
		// busy bar for a frequency that is not there.
		const { bands, data } = analysed([tone(250)], RATE * 2)
		const empty = [bandOf(7000), bandOf(11000), bandOf(15000)]
		for (const band of empty) {
			expect(meanOf(data, bands, band), `band ${band} was invented`).toBeLessThan(2)
		}
	})

	it('draws a quiet take like a loud one, as the waveform already does', () => {
		const loud = analysed([tone(400, 2, 0.9)], RATE * 2)
		const quiet = analysed([tone(400, 2, 0.02)], RATE * 2)
		expect(meanOf(quiet.data, quiet.bands, bandOf(400))).toBeCloseTo(meanOf(loud.data, loud.bands, bandOf(400)), 0)
	})

	it('sums channels, so a hard-panned part is still measured', () => {
		const silent = new Float32Array(RATE * 2)
		const { bands, data } = analysed([tone(600), silent], RATE * 2)
		expect(meanOf(data, bands, bandOf(600))).toBeGreaterThan(60)
	})

	it('produces one reading per band per frame, at the rate it claims', () => {
		const result = analysed([tone(300, 4)], RATE * 4)
		const frames = result.data.length / result.bands
		expect(Number.isInteger(frames)).toBe(true)
		// Four seconds at twelve frames a second, less the one window that does not fit.
		expect(frames).toBeGreaterThan(40)
		expect(frames).toBeLessThanOrEqual(49)
	})

	it('has nothing to say about a clip shorter than one window', () => {
		expect(analyseSpectrum([new Float32Array(512)], 512, RATE)).toBeNull()
		expect(analyseSpectrum([], 0, RATE)).toBeNull()
	})

	it('reports true silence as silence everywhere', () => {
		const { bands, data } = analysed([new Float32Array(RATE * 2)], RATE * 2)
		for (let band = 0; band < bands; band++) {
			expect(meanOf(data, bands, band), `band ${band}`).toBe(0)
		}
	})
})

describe('sampleAt', () => {
	const spectrum = { bands: 2, fps: 10, data: [0, 100, 100, 0] }

	it('returns the stored frame exactly on a frame boundary', () => {
		expect(sampleAt(spectrum, 0)).toEqual([0, 100])
		expect(sampleAt(spectrum, 0.1)).toEqual([100, 0])
	})

	it('interpolates between frames, so twelve a second do not step at sixty', () => {
		expect(sampleAt(spectrum, 0.05)).toEqual([50, 50])
	})

	it('holds at the ends rather than running off them', () => {
		expect(sampleAt(spectrum, -5)).toEqual([0, 100])
		expect(sampleAt(spectrum, 999)).toEqual([100, 0])
	})

	it('has nothing to say about an empty spectrum', () => {
		expect(sampleAt({ bands: 4, fps: 12, data: [] }, 1)).toEqual([])
	})
})

describe('toneOf', () => {
	/** A spectrum whose energy sits entirely in one band. */
	const only = (band: number, bands = 20, frames = 8) => ({
		bands,
		fps: 12,
		data: Array.from({ length: frames * bands }, (_, i) => (i % bands === band ? 100 : 0)),
	})

	it('reads bass as low and treble as high', () => {
		const [bass] = toneOf(only(1), 1)
		const [treble] = toneOf(only(18), 1)
		expect(bass).toBeLessThan(15)
		expect(treble).toBeGreaterThan(85)
	})

	it('puts energy split across the spectrum in the middle', () => {
		const bands = 20
		const data = Array.from({ length: 8 * bands }, (_, i) => (i % bands === 0 || i % bands === bands - 1 ? 100 : 0))
		const [centre] = toneOf({ bands, fps: 12, data }, 1)
		expect(centre).toBeGreaterThan(40)
		expect(centre).toBeLessThan(60)
	})

	it('follows the timbre as it moves through the track', () => {
		const bands = 20
		// Bass for the first half, treble for the second.
		const data: number[] = []
		for (let frame = 0; frame < 8; frame++) {
			for (let band = 0; band < bands; band++) {
				data.push(band === (frame < 4 ? 1 : 18) ? 100 : 0)
			}
		}
		const tone = toneOf({ bands, fps: 12, data }, 2)
		expect(tone[0]).toBeLessThan(15)
		expect(tone[1]).toBeGreaterThan(85)
	})

	it('gives a rest the timbre of the phrase around it', () => {
		const bands = 20
		// Bass, then silence, then bass again. The quiet stretch has no centroid of its own,
		// and inventing one put a differently coloured bar in the middle of a phrase.
		const data: number[] = []
		for (let frame = 0; frame < 9; frame++) {
			for (let band = 0; band < bands; band++) {
				data.push(frame >= 3 && frame < 6 ? 0 : band === 1 ? 100 : 0)
			}
		}
		const tone = toneOf({ bands, fps: 12, data }, 3)
		expect(tone[1], 'the rest was given a colour of its own').toBe(tone[0])
	})

	it('takes the timbre that follows when the track opens on silence', () => {
		const bands = 20
		const data: number[] = []
		for (let frame = 0; frame < 6; frame++) {
			for (let band = 0; band < bands; band++) {
				data.push(frame < 3 ? 0 : band === 17 ? 100 : 0)
			}
		}
		const tone = toneOf({ bands, fps: 12, data }, 2)
		expect(tone[0]).toBe(tone[1])
		expect(tone[0]).toBeGreaterThan(85)
	})

	it('calls a wholly silent track the middle, having nothing else to go on', () => {
		const bands = 20
		const [quiet] = toneOf({ bands, fps: 12, data: Array.from({ length: 4 * bands }, () => 0) }, 1)
		expect(quiet).toBe(50)
	})

	it('returns one reading per bucket asked for', () => {
		for (const buckets of [16, 32, 128]) {
			expect(toneOf(only(5), buckets)).toHaveLength(buckets)
		}
	})

	it('has nothing to say about an empty spectrum', () => {
		expect(toneOf({ bands: 20, fps: 12, data: [] }, 32)).toEqual([])
	})
})
