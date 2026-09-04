'use client'

import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'

/**
 * A spectrum of bars, ordered-dithered to chunky square pixels, behind the hero.
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
 *
 * The bar heights are authored rather than measured. Prior research on this project was
 * explicit that a real FFT is a downgrade here — on a mastered track every band moves
 * together, so the honest version reads as one lump rising and falling, where a few sines at
 * different rates read as a spectrum. What the audio actually contributes is whether it is
 * playing at all, which is the only thing a viewer can check.
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
/** Cells across one bar and its gap: 3 lit, 1 empty. At an 8px cell that is a 32px pitch —
 *  eight keylines — so the bars land on the same rhythm as every border on the page. */
const BAR_CELLS = 3
const BAR_PITCH = 4
/** How many cells the top of a bar takes to dissolve. This is the whole difference between
 *  a dithered field and a bar chart: cut the bars off flat and it is a chart. */
const BAR_SOFTNESS = 7
/** Deliberately low. The page's motion is quantised, and a field stepping at 20fps reads as
 *  sequenced rather than as a smooth gradient sliding about. */
const FPS = 20
/** The tallest a bar may ever stand, as a fraction of the field. See heightOf. */
const BAR_CEILING = 0.42

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

/**
 * Resolves a palette token to sRGB by borrowing the host's own cascade.
 *
 * A hidden span is attached inside the field, given `color: var(--token)`, read, and thrown
 * away. Custom properties are inherited, so the span sees the same values the page does —
 * and going through a real element is what makes the browser resolve the oklch rather than
 * handing back the literal `var(...)` a direct getPropertyValue would return.
 */
function resolveToken(host: HTMLElement, token: string): Rgb {
	const probe = document.createElement('span')
	probe.style.cssText = `position:absolute;width:0;height:0;overflow:hidden;color:var(${token})`
	host.appendChild(probe)
	const colour = readColour(probe)
	probe.remove()
	return colour
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
		/**
		 * The hovered bar lights like a level meter: green at the foot, through yellow, to
		 * orange as it climbs.
		 *
		 * None of those three can carry white text — 1.64:1, 1.43:1 and 2.08:1 — so the ramp
		 * is confined to the bottom of the field, below where any copy sits. Above that
		 * ceiling a hovered bar keeps the ordinary dark fill, which is also what a real meter
		 * looks like above its level.
		 */
		const host = canvas.parentElement ?? canvas
		// Green, yellow, orange, red — the order every level meter has used since they had needles.
		const RAMP = [
			resolveToken(host, '--spring'),
			resolveToken(host, '--lemon'),
			resolveToken(host, '--accent'),
			resolveToken(host, '--magenta'),
		].map(colour => pack(colour) >>> 0)

		let width = 0
		let height = 0
		let image: ImageData | null = null
		let words: Uint32Array | null = null
		// Per-column terms, rebuilt once a frame instead of once a cell.
		/** One entry per bar: how many cells tall it stands this frame. */
		let tops = new Float32Array(0)
		let bars = 0

		const measure = () => {
			const rect = canvas.getBoundingClientRect()
			width = Math.max(1, Math.ceil(rect.width / CELL))
			height = Math.max(1, Math.ceil(rect.height / CELL))
			canvas.width = width
			canvas.height = height
			image = context.createImageData(width, height)
			words = new Uint32Array(image.data.buffer)
			bars = Math.ceil(width / BAR_PITCH)
			tops = new Float32Array(bars)
		}

		/**
		 * Three sines per bar at unrelated rates, offset by the bar's own index so neighbours
		 * never rise together. A single shared curve would give a wave travelling along the
		 * row — which is what this replaced.
		 */
		const heightOf = (bar: number, time: number, energy: number) => {
			const swing =
				Math.sin(time * 1.7 + bar * 0.53) * 0.5 +
				Math.sin(time * 2.6 - bar * 0.31) * 0.31 +
				Math.sin(time * 1.1 + bar * 0.87) * 0.19
			// The floor matters as much as the ceiling. The field spans the whole section and
			// the keyboard covers roughly its bottom eighth, so a bar shorter than that is
			// invisible however lively it is; the base starts clear of it.
			const reach = 0.16 + energy * 0.06
			const raw = (0.2 + reach * (0.5 + swing * 0.5)) * height
			// Clamped, not merely tuned. The meter ramp runs to the top of every bar, and none
			// of its colours can carry white text, so a bar that reached the copy would break
			// it. Measured across nine viewports, the lowest type sitting directly on the blue
			// is at 46.0% of the field height from its foot — 1600x900 is the worst case — so
			// the ceiling is 42% and the invariant survives anyone re-tuning the sines above.
			return Math.max(0, Math.min(raw, height * BAR_CEILING))
		}

		/**
		 * Cheap because a bar's height depends on its column and the clock, never on the row:
		 * the sines run once per bar per frame — fifty of them at 200 cells wide — and the
		 * inner loop is a subtraction and a compare. The wave field this replaced needed three
		 * transcendentals per cell until it was rewritten separably; this needs none at all.
		 */
		const draw = (time: number, energy: number, hoverBar = -1) => {
			if (image === null || words === null) {
				return
			}
			const drift = time * (0.55 + energy * 0.9)

			for (let bar = 0; bar < bars; bar++) {
				tops[bar] = heightOf(bar, drift, energy)
			}

			for (let y = 0; y < height; y++) {
				const rowBayer = BAYER[y & 7] as unknown as number[]
				const fromFoot = height - 1 - y
				const row = y * width

				for (let x = 0; x < width; x++) {
					// The gap column between bars. Leaving it empty is what makes them bars.
					if (x % BAR_PITCH >= BAR_CELLS) {
						words[row + x] = backWord
						continue
					}
					// Solid deep inside the bar, dissolving over the last few cells of its
					// crown. A hard cut here would be a chart; the dissolve is what keeps it
					// reading as one dithered surface.
					const bar = (x / BAR_PITCH) | 0
					const top = tops[bar] ?? 0
					const level = (top - fromFoot) / BAR_SOFTNESS
					const threshold = ((rowBayer[x & 7] ?? 0) + 0.5) / 64
					if (level <= threshold) {
						words[row + x] = backWord
						continue
					}
					if (bar !== hoverBar) {
						words[row + x] = frontWord
						continue
					}
					// Position within the bar, so a short bar still runs the whole ramp.
					const climb = top > 0 ? fromFoot / top : 0
					const stop = climb * (RAMP.length - 1)
					const lower = Math.min(RAMP.length - 1, stop | 0)
					// The step between two ramp colours is DITHERED, not interpolated. Blending
					// in RGB would smooth the ramp by inventing hundreds of colours, inside a
					// component whose whole premise is that there are only a few — the gradient
					// would come out smooth and the image would stop being dithered. Letting the
					// matrix choose between the two neighbouring stops reads just as smooth and
					// adds no colour at all, which is what ordered dithering exists to do.
					//
					// A second, offset read of the matrix. Reusing the threshold that decided
					// on/off would correlate the two — a lit cell is one with a low threshold, so
					// every blend would lean toward the lower stop and the ramp would band.
					const blend = ((BAYER[(y + 4) & 7] as unknown as number[])[(x + 2) & 7] ?? 0) / 64
					const pick = stop - lower > blend ? Math.min(RAMP.length - 1, lower + 1) : lower
					words[row + x] = RAMP[pick] ?? frontWord
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
		// -1 is "no bar", which is also the state when the pointer leaves the box.
		let hovered = -1
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
			draw(clock, energy, hovered)
		}
		frame = requestAnimationFrame(tick)

		// Listened for on the window rather than on the canvas: the field is pointer-events
		// none — it has to be, or it would swallow clicks meant for the buttons over it — so
		// it never receives a pointer event of its own. The rect test does the hit detection
		// that pointer-events would otherwise have done.
		const onPointer = (event: PointerEvent) => {
			const rect = canvas.getBoundingClientRect()
			const inside =
				event.clientX >= rect.left &&
				event.clientX <= rect.right &&
				event.clientY >= rect.top &&
				event.clientY <= rect.bottom
			hovered =
				inside && rect.width > 0 ? Math.floor((((event.clientX - rect.left) / rect.width) * width) / BAR_PITCH) : -1
		}
		const onPointerLeave = () => {
			hovered = -1
		}
		window.addEventListener('pointermove', onPointer, { passive: true })
		document.addEventListener('pointerleave', onPointerLeave)

		const observer = new IntersectionObserver(entries => {
			visible = entries[0]?.isIntersecting ?? true
		})
		observer.observe(canvas)

		// ResizeObserver, not window.resize: the hero's height also changes when fonts load,
		// when the sticky header wraps to a second row, and when the copy reflows between
		// locales — none of which fire a window resize.
		const resizer = new ResizeObserver(() => {
			measure()
			draw(clock, energy, hovered)
		})
		resizer.observe(canvas)

		return () => {
			cancelAnimationFrame(frame)
			observer.disconnect()
			resizer.disconnect()
			window.removeEventListener('pointermove', onPointer)
			document.removeEventListener('pointerleave', onPointerLeave)
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
