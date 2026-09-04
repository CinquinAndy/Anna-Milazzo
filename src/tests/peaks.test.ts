import { describe, expect, it } from 'vitest'
import { barCountFor, DEFAULT_BAR_COUNT, PEAK_RESOLUTION, resample, summarise, toBars } from '@/lib/player/peaks'

/** A constant-amplitude channel, so the expected RMS is known exactly. */
function tone(sampleCount: number, amplitude: number) {
	return Float32Array.from({ length: sampleCount }, (_, index) => (index % 2 === 0 ? amplitude : -amplitude))
}

describe('summarise', () => {
	it('returns one reading per bucket', () => {
		expect(summarise([tone(4096, 0.5)], 4096, 32)).toHaveLength(32)
	})

	it('normalises against the track, so a quiet take draws like a loud one', () => {
		const loud = summarise([tone(4096, 0.9)], 4096, 16)
		const quiet = summarise([tone(4096, 0.02)], 4096, 16)
		expect(quiet).toEqual(loud)
	})

	it('reads a loud half as louder than a quiet half', () => {
		const samples = new Float32Array(4096)
		samples.set(tone(2048, 1), 0)
		samples.set(tone(2048, 0.25), 2048)
		const readings = summarise([samples], 4096, 2)
		expect(readings[0]).toBe(100)
		expect(readings[1]).toBe(25)
	})

	it('sums channels to mono, so a hard-panned part is still measured', () => {
		const silent = new Float32Array(2048)
		const readings = summarise([tone(2048, 1), silent], 2048, 1)
		expect(readings[0]).toBe(100)
	})

	it('reports silence as silence rather than dividing by zero', () => {
		expect(summarise([new Float32Array(2048)], 2048, 8)).toEqual(Array.from({ length: 8 }, () => 0))
	})

	it('has nothing to say about no audio', () => {
		expect(summarise([], 0, 8)).toEqual([])
	})
})

describe('resample', () => {
	it('lets a transient dominate the bucket it falls in', () => {
		const peaks = [10, 10, 10, 100, 10, 10, 10, 10]
		const folded = resample(peaks, 4)
		expect(folded[1]).toBe(100)
		// And every quiet bucket stays far below it rather than being dragged up.
		expect(Math.max(folded[0] ?? 0, folded[2] ?? 0, folded[3] ?? 0)).toBeLessThan(25)
	})

	it('does not turn a mostly-quiet track into a solid block when it folds hard', () => {
		// The failure this replaced: folding by maximum put the median bar at 99.
		const peaks = Array.from({ length: 128 }, (_, index) => (index % 32 === 0 ? 100 : 20))
		const folded = resample(peaks, 16)
		const median = [...folded].sort((a, b) => a - b)[8] ?? 0
		expect(median).toBeLessThan(80)
	})

	it('sends the loudest bar to the top whatever the width', () => {
		const peaks = Array.from({ length: 128 }, (_, index) => (index === 60 ? 100 : 30))
		for (const count of [20, 44, 83]) {
			expect(Math.max(...resample(peaks, count)), `${count} bars`).toBe(100)
		}
	})

	it('returns the count asked for, at every width the rail is drawn at', () => {
		const peaks = Array.from({ length: PEAK_RESOLUTION }, (_, index) => index)
		for (const count of [16, 24, 44, 72, 96]) {
			expect(resample(peaks, count)).toHaveLength(count)
		}
	})

	it('repeats rather than interpolates when asked for more than it stores', () => {
		expect(resample([0, 100], 4)).toEqual([0, 0, 100, 100])
	})

	it('has nothing to say about an empty phrase', () => {
		expect(resample([], 44)).toEqual([])
	})
})

describe('toBars', () => {
	it('lifts silence clear of the floor so the rail still reads as a control', () => {
		const [bar] = toBars([0], 1)
		expect(bar?.height).toBeGreaterThan(0)
	})

	it('sends the loudest reading to the top of the rail', () => {
		const [bar] = toBars([100], 1)
		expect(bar?.height).toBe(100)
	})

	it('keeps quiet and loud apart instead of clamping both to the floor', () => {
		const [quiet, loud] = toBars([5, 40], 2)
		expect(loud?.height).toBeGreaterThan((quiet?.height ?? 0) + 10)
	})

	it('gives every bar its own identity', () => {
		const ids = toBars(
			Array.from({ length: 44 }, () => 50),
			44
		).map(bar => bar.id)
		expect(new Set(ids).size).toBe(44)
	})
})

describe('barCountFor', () => {
	it('never asks for more bars than the keylines leave room for', () => {
		// Measured rail widths, narrowest viewport to widest.
		for (const width of [215, 254, 280, 336, 432, 688, 1008]) {
			const count = barCountFor(width)
			const needed = count * 4 + (count - 1) * 2 + 6
			expect(needed, `${count} bars in ${width}px`).toBeLessThanOrEqual(width)
		}
	})

	it('draws more of the track where there is room for more', () => {
		expect(barCountFor(1008)).toBeGreaterThan(barCountFor(336))
	})

	it('falls back to the server count when it has measured nothing', () => {
		expect(barCountFor(0)).toBe(DEFAULT_BAR_COUNT)
	})
})
