import { describe, expect, it } from 'vitest'
import { hannWindow, transform } from '@/lib/player/fft'

/** The direct O(n²) definition. Slow, obvious, and the thing the fast one must agree with. */
function naiveDft(samples: readonly number[]) {
	const size = samples.length
	return Array.from({ length: size }, (_, k) => {
		let re = 0
		let im = 0
		for (let t = 0; t < size; t++) {
			const angle = (-2 * Math.PI * k * t) / size
			re += (samples[t] ?? 0) * Math.cos(angle)
			im += (samples[t] ?? 0) * Math.sin(angle)
		}
		return [re, im] as const
	})
}

function run(samples: readonly number[]) {
	const re = Float64Array.from(samples)
	const im = new Float64Array(samples.length)
	transform(re, im)
	return { re, im }
}

describe('transform', () => {
	it('agrees with a direct DFT, which is the only claim that matters', () => {
		for (const size of [8, 16, 64, 256]) {
			const samples = Array.from({ length: size }, (_, i) => Math.sin(i * 0.37) * 0.8 + Math.cos(i * 1.13) * 0.3)
			const reference = naiveDft(samples)
			const { re, im } = run(samples)
			let worst = 0
			for (let k = 0; k < size; k++) {
				const [wantRe, wantIm] = reference[k] ?? [0, 0]
				worst = Math.max(worst, Math.abs((re[k] ?? 0) - wantRe), Math.abs((im[k] ?? 0) - wantIm))
			}
			expect(worst, `n=${size}`).toBeLessThan(1e-9)
		}
	})

	it('puts a tone sitting exactly on a bin into that bin and nowhere else', () => {
		const size = 1024
		const bin = 64
		const samples = Array.from({ length: size }, (_, i) => Math.sin((2 * Math.PI * bin * i) / size))
		const { re, im } = run(samples)
		const magnitudes = Array.from({ length: size / 2 }, (_, k) => Math.hypot(re[k] ?? 0, im[k] ?? 0))

		expect(magnitudes[bin]).toBeCloseTo(size / 2, 6)
		const leakage = magnitudes.filter((_, k) => k !== bin).reduce((most, value) => Math.max(most, value), 0)
		expect(leakage, 'a pure tone leaked into its neighbours').toBeLessThan(1e-9)
	})

	it('reports a constant signal as bin zero alone', () => {
		const { re, im } = run(Array.from({ length: 32 }, () => 0.5))
		expect(re[0]).toBeCloseTo(16, 9)
		for (let k = 1; k < 32; k++) {
			expect(Math.hypot(re[k] ?? 0, im[k] ?? 0), `bin ${k}`).toBeLessThan(1e-9)
		}
	})

	it('refuses a length it cannot halve, rather than returning nonsense', () => {
		expect(() => run(Array.from({ length: 100 }, () => 0))).toThrow(/power of two/)
		expect(() => run([1])).toThrow(/power of two/)
	})

	it('refuses mismatched halves', () => {
		expect(() => transform(new Float64Array(8), new Float64Array(4))).toThrow(/same length/)
	})
})

describe('hannWindow', () => {
	it('starts and ends at zero, which is the whole point of a window', () => {
		const window = hannWindow(64)
		expect(window[0]).toBeCloseTo(0, 12)
		expect(window[63]).toBeCloseTo(0, 12)
	})

	it('peaks at one in the middle', () => {
		expect(Math.max(...hannWindow(65))).toBeCloseTo(1, 12)
	})

	it('keeps an off-centre tone from smearing across the spectrum', () => {
		// A tone halfway between two bins is the worst case for a rectangular window.
		const size = 512
		const samples = Array.from({ length: size }, (_, i) => Math.sin((2 * Math.PI * 40.5 * i) / size))
		const window = hannWindow(size)

		const bare = run(samples)
		const tapered = run(samples.map((value, i) => value * (window[i] ?? 0)))

		// Energy far from the tone: how much the leakage pollutes the rest of the spectrum.
		const spill = ({ re, im }: { re: Float64Array; im: Float64Array }) => {
			let sum = 0
			for (let k = 0; k < size / 2; k++) {
				if (Math.abs(k - 40.5) > 6) {
					sum += Math.hypot(re[k] ?? 0, im[k] ?? 0)
				}
			}
			return sum
		}

		expect(spill(tapered), 'the window did not reduce spectral leakage').toBeLessThan(spill(bare) / 10)
	})
})
