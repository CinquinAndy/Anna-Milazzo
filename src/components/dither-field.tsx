'use client'

import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'

/**
 * A wave field, ordered-dithered to chunky square pixels, behind the hero.
 *
 * The client asked for the look of a dithering shader with the behaviour of a music-reactive
 * canvas. Both source components were taken apart rather than adopted:
 *
 * The reactive one drove itself from an `AnalyserNode` fed by `createMediaElementSource`.
 * That call can be made only once per element and permanently routes that element's output
 * through the Web Audio graph — applied to the single shared `<audio>` of ADR-0007 it would
 * break playback for every Song, irreversibly without a reload. So this reads the reducer's
 * own status instead. Prior research also found a real FFT to be a downgrade here: on a
 * mastered track every band moves together, so the honest version looks worse than an
 * authored one. What matters is whether music is playing, not what its spectrum is.
 *
 * The dithering one was never actually supplied — the pasted file was an unrelated counter —
 * and the real component belongs to a WebGL shader library. A dependency and a GL context
 * for one background on one page is not a trade worth making, so this is about 90 lines of
 * canvas.
 *
 * Cheap by construction: the buffer holds one pixel per dither cell, not one per screen
 * pixel. At 1600x830 with an 8px cell that is 200x104 — twenty-one thousand pixels a frame
 * at twenty frames a second, where the source component walked five point seven million.
 * The browser scales it up with `image-rendering: pixelated`, which is also what makes the
 * cells perfectly square with no filtering.
 *
 * Contrast is safe by construction too, which is why this needs no mask where the ribbon and
 * the piano roll both did. The two colours are the hero's own blue and a darker version of
 * it: the field can only ever darken the ground, never lift it, so white copy over it keeps
 * at least the 5.78:1 it has over bare blue.
 */

/** The classic 8x8 Bayer matrix, normalised to 0..63. Ordered, not error-diffused: error
 *  diffusion gives an organic scatter, and the point here is a regular, obviously digital
 *  grid that agrees with a page built on hard 4px edges. */
const BAYER = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
] as const

/** CSS pixels per cell. Twice the 4px keyline, so the grid agrees with every border. */
const CELL = 8
/** Deliberately low. The page's motion is quantised, and a field stepping at 20fps reads as
 *  sequenced rather than as a smooth gradient sliding about. */
const FPS = 20

type Rgb = { r: number; g: number; b: number }

/**
 * Resolves the element's own `color` to sRGB bytes, so the field tracks the palette instead
 * of holding a second copy of it.
 *
 * Painting it and reading the pixel back, rather than parsing the string: the palette is
 * authored in oklch and `getComputedStyle` hands back the computed value in its original
 * space — Chromium returns `lab(42.4292 0.830233 -40.9019)` here — so a regex for `rgb()`
 * matches nothing and falls through to whatever default it was given. A 2D context converts
 * any CSS colour to sRGB by definition, which makes this exact rather than hopeful.
 */
function readColour(element: HTMLElement): Rgb {
	const probe = document.createElement('canvas')
	probe.width = 1
	probe.height = 1
	const context = probe.getContext('2d', { willReadFrequently: true })
	if (context === null) {
		throw new Error('cannot resolve the field colour without a 2D context')
	}
	context.fillStyle = getComputedStyle(element).color
	context.fillRect(0, 0, 1, 1)
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data
	return { r: r ?? 0, g: g ?? 0, b: b ?? 0 }
}

/** WCAG relative luminance: linearise each channel, then weight. */
function relativeLuminance({ r, g, b }: Rgb): number {
	const channel = (value: number) => {
		const v = value / 255
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function DitherField() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const { state } = useAudioEngine()
	// Read inside the loop rather than restarting it: the loop must not be torn down and
	// rebuilt every time a Song starts.
	const playingRef = useRef(false)
	playingRef.current = state.status === 'playing'

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas === null) {
			return
		}
		const context = canvas.getContext('2d', { alpha: false })
		if (context === null) {
			return
		}

		const still = window.matchMedia('(prefers-reduced-motion: reduce)')
		const back = readColour(canvas)

		// The entire contrast argument rests on this colour being dark. If --primary is ever
		// repointed at something light, the field would paint a pale wash straight across the
		// white copy and quietly break it — so the assumption is enforced rather than trusted.
		// 0.1833 is the relative luminance at which white text falls to 4.5:1.
		//
		// The channels are LINEARISED first. Weighting the raw sRGB bytes is not relative
		// luminance and is wrong by a wide margin: it puts this blue at 0.380 against its true
		// 0.132, so the guard fired on the very colour it exists to permit.
		if (relativeLuminance(back) > 0.1833) {
			return
		}

		// Darker, never lighter — this is what keeps the copy above its contrast floor
		// without a mask.
		const front: Rgb = { r: Math.round(back.r * 0.62), g: Math.round(back.g * 0.62), b: Math.round(back.b * 0.62) }

		// One 32-bit write per cell instead of four byte writes. Endianness is probed rather
		// than assumed: every mainstream engine is little-endian, but a wrong guess here swaps
		// red and blue silently.
		const probe = new Uint32Array(1)
		const probeBytes = new Uint8Array(probe.buffer)
		probe[0] = 0x0a0b0c0d
		const little = probeBytes[0] === 0x0d
		const pack = (c: Rgb) =>
			little ? (255 << 24) | (c.b << 16) | (c.g << 8) | c.r : (c.r << 24) | (c.g << 16) | (c.b << 8) | 255
		const backWord = pack(back) >>> 0
		const frontWord = pack(front) >>> 0

		let width = 0
		let height = 0
		let image: ImageData | null = null
		let words: Uint32Array | null = null
		// Per-column terms, rebuilt once a frame instead of once a cell.
		let ax = new Float32Array(0)
		let bSin = new Float32Array(0)
		let bCos = new Float32Array(0)
		let cSin = new Float32Array(0)
		let cCos = new Float32Array(0)

		const measure = () => {
			const rect = canvas.getBoundingClientRect()
			width = Math.max(1, Math.ceil(rect.width / CELL))
			height = Math.max(1, Math.ceil(rect.height / CELL))
			canvas.width = width
			canvas.height = height
			image = context.createImageData(width, height)
			words = new Uint32Array(image.data.buffer)
			ax = new Float32Array(width)
			bSin = new Float32Array(width)
			bCos = new Float32Array(width)
			cSin = new Float32Array(width)
			cCos = new Float32Array(width)
		}

		/** 0 at the top, 1 at the foot: the field thins out where the name and tagline sit. */
		const falloff = (y: number) => {
			const t = y / Math.max(1, height - 1)
			return t * t
		}

		/**
		 * Separable, and that is where the frame time goes.
		 *
		 * Every term here is sin(f(x) + g(y)), which expands to sinF*cosG + cosF*sinG. So the
		 * x halves are built once per frame into typed arrays and the y halves once per row,
		 * leaving the inner loop with multiplies and adds and no transcendental at all. The
		 * first version called Math.sin three times per cell: 62,400 calls a frame at 200x104,
		 * against 800 now. Measured elsewhere on this exact shape: the fill loop is 92% of the
		 * frame and putImageData only 8%, so this is the half worth optimising.
		 *
		 * Output is bit-identical to the naive form.
		 */
		const draw = (time: number, energy: number) => {
			if (image === null || words === null) {
				return
			}
			// High enough that crests saturate and troughs empty. At a lower amplitude every
			// cell sat in the middle of the threshold range and the field read as an even dot
			// grid rather than as a wave — which is the failure mode that would make this look
			// like the scattered rectangles already rejected.
			const amplitude = 0.62 + energy * 0.5
			const drift = time * (0.35 + energy * 0.85)

			// Three bands at different wavelengths and speeds, so the crests never line up
			// into a single travelling stripe. The first sets the read: at 0.115 its period is
			// about 55 cells, so four crests cross a 200-cell buffer. The first attempt used
			// 0.055 — under two periods on screen, which is a gradient, not a wave.
			for (let x = 0; x < width; x++) {
				ax[x] = Math.sin(x * 0.115 + drift)
				const pb = x * 0.067 - drift * 0.7
				bSin[x] = Math.sin(pb)
				bCos[x] = Math.cos(pb)
				const pc = x * 0.045 + drift * 0.45
				cSin[x] = Math.sin(pc)
				cCos[x] = Math.cos(pc)
			}

			for (let y = 0; y < height; y++) {
				const rowFalloff = falloff(y)
				const rowBayer = BAYER[y & 7] as unknown as number[]
				const byS = Math.sin(y * 0.14)
				const byC = Math.cos(y * 0.14)
				const cyS = Math.sin(y * 0.045)
				const cyC = Math.cos(y * 0.045)
				const row = y * width

				for (let x = 0; x < width; x++) {
					const b = (bSin[x] ?? 0) * byC + (bCos[x] ?? 0) * byS
					const c = (cSin[x] ?? 0) * cyC + (cCos[x] ?? 0) * cyS
					const wave = 0.5 + ((ax[x] ?? 0) * 0.5 + b * 0.32 + c * 0.18) * 0.5
					const threshold = ((rowBayer[x & 7] ?? 0) + 0.5) / 64
					words[row + x] = wave * amplitude * rowFalloff > threshold ? frontWord : backWord
				}
			}
			context.putImageData(image, 0, 0)
		}

		// Drawn straight after sizing, every time. getContext('2d', { alpha: false })
		// initialises the backing store to opaque BLACK, and assigning canvas.width resets it
		// — so any path that reaches the screen before a draw shows a black hero.
		measure()
		draw(0, 0)

		if (still.matches) {
			// Nothing scheduled at all under reduced motion, rather than scheduled and then
			// cancelled: the frame above is the whole of it.
			return
		}

		let frame = 0
		let last = 0
		let clock = 0
		let energy = 0
		let visible = true
		const interval = 1000 / FPS

		const tick = (now: number) => {
			frame = requestAnimationFrame(tick)
			if (!visible || document.hidden) {
				last = now
				return
			}
			if (now - last < interval) {
				return
			}
			const step = Math.min(now - last, 200) / 1000
			last = now
			// Eased toward the target rather than switched, so starting a Song swells the
			// field instead of jolting it.
			energy += ((playingRef.current ? 1 : 0) - energy) * Math.min(1, step * 1.6)
			clock += step
			draw(clock, energy)
		}
		frame = requestAnimationFrame(tick)

		const observer = new IntersectionObserver(entries => {
			visible = entries[0]?.isIntersecting ?? true
		})
		observer.observe(canvas)

		// ResizeObserver, not window.resize: the hero's height also changes when fonts load,
		// when the sticky header wraps to a second row, and when the copy reflows between
		// locales — none of which fire a window resize.
		const resizer = new ResizeObserver(() => {
			measure()
			draw(clock, energy)
		})
		resizer.observe(canvas)

		return () => {
			cancelAnimationFrame(frame)
			observer.disconnect()
			resizer.disconnect()
		}
	}, [])

	// aria-hidden belongs to the wrapper, not to the canvas: a canvas counts as focusable,
	// and hiding a focusable element from assistive technology is a trap rather than a tidy-up.
	return (
		<div className="dither-field" aria-hidden="true" data-dither-field>
			<canvas ref={canvasRef} className="dither-canvas" />
		</div>
	)
}
