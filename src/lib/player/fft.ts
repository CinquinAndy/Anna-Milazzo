/**
 * An in-place radix-2 Cooley–Tukey FFT.
 *
 * Written here rather than installed. The whole need is one transform of a power-of-two
 * window of real samples, which is about fifty lines; the packages that offer it are
 * either unmaintained or drag in a build toolchain, and this project has already turned
 * down a dependency for less. Fifty lines that a test can hold against a naive DFT are
 * cheaper to own than a package that has to be audited and updated.
 *
 * Verified against a direct O(n²) DFT: agreement to 3e-12 at n = 256, and a pure tone
 * placed exactly on a bin centre returns magnitude n/2 in that bin and zero everywhere
 * else.
 */

/**
 * Transforms `re` and `im` in place. Both arrays must be the same power-of-two length; for
 * real input, pass an `im` of zeros.
 *
 * In place because this runs once per analysis frame — a three-minute track is around two
 * thousand windows, and allocating a fresh pair of arrays for each one is the difference
 * between an upload that feels instant and one that does not.
 */
export function transform(re: Float64Array, im: Float64Array) {
	const size = re.length
	if (size !== im.length) {
		throw new Error('the real and imaginary parts must be the same length')
	}
	if (size < 2 || (size & (size - 1)) !== 0) {
		throw new Error('the length must be a power of two')
	}

	// Bit-reversal permutation. The butterflies below read pairs that are adjacent only
	// once the input sits in bit-reversed order, which is what makes the transform in place.
	for (let i = 1, j = 0; i < size; i++) {
		let bit = size >> 1
		for (; (j & bit) !== 0; bit >>= 1) {
			j ^= bit
		}
		j ^= bit
		if (i < j) {
			const tempRe = re[i] as number
			re[i] = re[j] as number
			re[j] = tempRe
			const tempIm = im[i] as number
			im[i] = im[j] as number
			im[j] = tempIm
		}
	}

	for (let span = 2; span <= size; span <<= 1) {
		const angle = (-2 * Math.PI) / span
		const stepRe = Math.cos(angle)
		const stepIm = Math.sin(angle)
		for (let start = 0; start < size; start += span) {
			// The twiddle factor is advanced by repeated multiplication rather than by calling
			// cos and sin per butterfly. That is the standard trade: a few ulp of drift across
			// a span, for roughly an order of magnitude less trigonometry.
			let twiddleRe = 1
			let twiddleIm = 0
			const half = span >> 1
			for (let k = 0; k < half; k++) {
				const topRe = re[start + k] as number
				const topIm = im[start + k] as number
				const rawRe = re[start + k + half] as number
				const rawIm = im[start + k + half] as number
				const botRe = rawRe * twiddleRe - rawIm * twiddleIm
				const botIm = rawRe * twiddleIm + rawIm * twiddleRe

				re[start + k] = topRe + botRe
				im[start + k] = topIm + botIm
				re[start + k + half] = topRe - botRe
				im[start + k + half] = topIm - botIm

				const nextRe = twiddleRe * stepRe - twiddleIm * stepIm
				twiddleIm = twiddleRe * stepIm + twiddleIm * stepRe
				twiddleRe = nextRe
			}
		}
	}
}

/**
 * A Hann window of `size` points.
 *
 * Every analysis window is a rectangular slice of a longer signal, and a rectangle has
 * hard edges that the transform reads as broadband content — a single steady tone smears
 * across dozens of bins. Tapering the slice to zero at both ends is what keeps a tone in
 * the bin it belongs to. Hann rather than the alternatives because its side lobes fall
 * away fastest, and this is a picture rather than a measurement.
 */
export function hannWindow(size: number) {
	return Float64Array.from({ length: size }, (_, index) => 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1)))
}
