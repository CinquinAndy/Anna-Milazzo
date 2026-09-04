'use client'

import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { BAYER, endianPacker, mix, resolveToken } from '@/lib/canvas/dither'
import { resample } from '@/lib/player/peaks'

/**
 * The rail inside a Folder: the track drawn as a histogram, built by the playhead.
 *
 * The horizontal axis is TIME, start to finish. Every bar says two measured things about
 * the moment it stands for — its HEIGHT is how loud the track is there, and its COLOUR is
 * where that sound sits in the spectrum, green for bass through to magenta for the bright
 * end. Both come from the file itself, measured once when it was uploaded; nothing here is
 * authored or random.
 *
 * Ahead of the playhead the bars are drawn low and grey: the shape of the piece is legible,
 * so a Recruiter can see where it swells before pressing anything, but it is plainly not
 * yet played. As the playhead reaches each bar it grows to its true height and takes its
 * colour, so the histogram assembles itself while the music runs.
 *
 * A canvas at one pixel per cell, scaled up with `image-rendering: pixelated` — the hero's
 * field, drawn small. That is the only way to carry ordered dithering, and it costs one
 * 32-bit write per cell rather than a DOM node per bar restyled twenty times a second.
 *
 * Decoration, drawn under the real control: the transparent range input above owns every
 * pointer and key event, and the elapsed time beside it is what actually reports position.
 * Delete this and the player still works.
 */

/** CSS pixels per cell. The rail is short, so half the hero's cell keeps rows for the edge. */
const CELL = 4

/** Cells across one bar and its gutter. */
const BAR_CELLS = 4
const GAP_CELLS = 2

/** How many cells a bar's lit top dithers away over. */
const EDGE_SOFTNESS = 3

/** Redraws a second while playing. */
const FPS = 30

/**
 * How much of its true height an unplayed bar is drawn at.
 *
 * Not zero. A rail that is empty until you press play hides the shape of the piece and,
 * worse, hides that it is a control you can drag into. Low enough that arriving at full
 * height is unmistakably an event.
 */
const GHOST = 0.45

/**
 * How fast a bar grows once the playhead reaches it, per frame.
 *
 * About a third of a second at the frame rate above — long enough to read as growth rather
 * than as a state flip, short enough that the bar is at its true height well before the
 * playhead has left it.
 */
const GROWTH_PER_FRAME = 0.1

export function SongVisualiser({
	songId,
	peaks,
	tone,
}: {
	songId: string
	/** How loud the track is over its length. The height of every bar. */
	peaks: readonly number[] | null
	/** Where its energy sits in the spectrum over its length. The colour of every bar. */
	tone: readonly number[] | null
}) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const { trackPlayhead } = useAudioEngine()

	// Read through refs so the loop never closes over a stale prop and never has to be torn
	// down and rebuilt mid-track.
	const peaksRef = useRef(peaks)
	peaksRef.current = peaks
	const toneRef = useRef(tone)
	toneRef.current = tone

	useEffect(() => {
		const canvas = canvasRef.current
		if (canvas === null) {
			return
		}
		const context = canvas.getContext('2d', { alpha: false })
		if (context === null) {
			return
		}
		const host = canvas.parentElement ?? canvas

		// The rail's own ground, so the canvas sits in the Folder's paper rather than on a
		// panel of its own.
		const back = resolveToken(host, '--card')
		const ink = resolveToken(host, '--ink')
		const pack = endianPacker()
		const backWord = pack(back)
		// Unplayed: the ground carried a little way toward the ink. Present, plainly inert,
		// and never competing with the colour of a bar that has been played.
		const ghostWord = pack(mix(back, ink, 0.3))
		// Green, yellow, orange, magenta: bass to bright. Straight from the palette — over
		// paper these need their saturation, where over the hero's blue they were softened
		// toward it.
		const RAMP = (['--spring', '--lemon', '--accent', '--magenta'] as const).map(token =>
			pack(resolveToken(host, token))
		)
		// The playhead itself, drawn over everything so it survives a tall bar.
		const markWord = pack(ink)

		let width = 0
		let height = 0
		let image: ImageData | null = null
		let words: Uint32Array | null = null
		let bars = 0
		let heights: number[] = []
		let colours: number[] = []
		/** 0 while a bar is still ahead of the playhead, 1 once it has finished growing. */
		let grown = new Float64Array(0)

		/** How many bars the rail has room for, and this track's readings folded onto them. */
		const layout = () => {
			bars = Math.max(1, Math.floor((width + GAP_CELLS) / (BAR_CELLS + GAP_CELLS)))
			const storedPeaks = peaksRef.current
			const storedTone = toneRef.current
			heights = storedPeaks === null || storedPeaks.length === 0 ? [] : resample(storedPeaks, bars)
			if (storedTone === null || storedTone.length === 0) {
				colours = []
			} else {
				// Not `resample`: that folds in quadrature, which is right for loudness and
				// wrong for a position in the spectrum. A stretch of bass followed by a stretch
				// of treble averages to the middle, which is what it sounds like.
				const folded = Array.from({ length: bars }, (_, bar) => {
					const from = Math.floor((bar * storedTone.length) / bars)
					const to = Math.max(from + 1, Math.floor(((bar + 1) * storedTone.length) / bars))
					let sum = 0
					for (let i = from; i < to && i < storedTone.length; i++) {
						sum += storedTone[i] ?? 0
					}
					return sum / (to - from)
				})
				// Stretched across the track's OWN range of timbre, the same way its loudness
				// already is. No piece uses the whole spectrum: measured on these tracks the
				// centroid moves within a band perhaps thirty points wide, and read absolutely
				// that lands every bar on one or two ramp colours. Stretched, the difference
				// between this track's darkest and brightest moment is the difference between
				// the ends of the ramp — which is what the colour is for.
				const lowest = Math.min(...folded)
				const highest = Math.max(...folded)
				const span = highest - lowest
				colours = folded.map(value => (span < 1 ? 50 : ((value - lowest) / span) * 100))
			}
			grown = new Float64Array(bars)
		}

		const measure = () => {
			const rect = canvas.getBoundingClientRect()
			const nextWidth = Math.max(1, Math.round(rect.width / CELL))
			const nextHeight = Math.max(1, Math.round(rect.height / CELL))
			if (nextWidth === width && nextHeight === height) {
				return false
			}
			width = nextWidth
			height = nextHeight
			canvas.width = width
			canvas.height = height
			image = context.createImageData(width, height)
			words = new Uint32Array(image.data.buffer)
			layout()
			return true
		}

		const draw = (progress: number) => {
			if (image === null || words === null || heights.length === 0) {
				return
			}
			const pitch = BAR_CELLS + GAP_CELLS
			const margin = Math.floor((width - (bars * pitch - GAP_CELLS)) / 2)
			const mark = Math.round(progress * (width - 1))

			words.fill(backWord)

			for (let bar = 0; bar < bars; bar++) {
				const full = Math.max(0, Math.min(1, (heights[bar] ?? 0) / 100))
				const lift = grown[bar] as number
				// Grown from its ghost to its true height, never from nothing: the bar keeps
				// its place in the shape the whole way up.
				const level = full * (GHOST + (1 - GHOST) * lift)
				const top = height - level * height
				const from = margin + bar * pitch

				// Colour by timbre, not by height. Height is already saying how loud this
				// moment is, and a colour that repeats it says nothing new.
				const stop = (Math.max(0, Math.min(100, colours[bar] ?? 50)) / 100) * (RAMP.length - 1)
				const lower = Math.min(RAMP.length - 1, stop | 0)
				const upper = Math.min(RAMP.length - 1, lower + 1)

				for (let cell = 0; cell < BAR_CELLS; cell++) {
					const x = from + cell
					if (x < 0 || x >= width) {
						continue
					}
					for (let y = height - 1; y >= 0; y--) {
						if (y < top) {
							// Above the bar but inside its soft top: the matrix decides. Without
							// this, flat-topped bars read as a spreadsheet chart.
							const fade = (top - y) / EDGE_SOFTNESS
							if (fade >= 1 || fade > 1 - ((BAYER[y & 7] as unknown as number[])[x & 7] ?? 0) / 64) {
								break
							}
						}
						if (lift <= 0.001) {
							words[y * width + x] = ghostWord
							continue
						}
						// A second, OFFSET read of the matrix. Reusing the threshold that decided
						// lit-or-not correlates the two — a lit cell is one with a low threshold,
						// so every blend leans to the lower stop and the ramp bands.
						const blend = ((BAYER[(y + 4) & 7] as unknown as number[])[(x + 2) & 7] ?? 0) / 64
						const pick = stop - lower > blend ? upper : lower
						// Dithered back toward the ghost while it is still growing, so a bar
						// arrives at its colour rather than switching to it.
						words[y * width + x] = (lift > blend ? RAMP[pick] : ghostWord) ?? backWord
					}
				}
			}

			if (progress > 0) {
				for (let y = 0; y < height; y++) {
					words[y * width + mark] = markWord
				}
			}
			context.putImageData(image, 0, 0)
		}

		/** Moves every bar one frame toward grown-or-not for this playhead position. */
		const advance = (progress: number, instant: boolean) => {
			for (let bar = 0; bar < bars; bar++) {
				// Strictly past, not at: `>=` is true for the first bar at a progress of zero, so
				// the rail sat at rest with one bar already grown and coloured.
				const reached = progress * bars > bar
				const current = grown[bar] as number
				if (instant) {
					grown[bar] = reached ? 1 : 0
				} else if (reached) {
					grown[bar] = Math.min(1, current + GROWTH_PER_FRAME)
				} else {
					// Scrubbed backwards: the bars beyond the playhead give their colour back,
					// and quickly, because a scrub should not leave a trail behind it.
					grown[bar] = Math.max(0, current - GROWTH_PER_FRAME * 3)
				}
			}
		}

		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

		measure()
		advance(0, true)
		draw(0)

		const observer = new ResizeObserver(() => {
			if (measure()) {
				advance(lastProgress, true)
				draw(lastProgress)
			}
		})
		observer.observe(canvas)

		let last = 0
		let lastProgress = 0

		const unsubscribe = trackPlayhead((runningId, fraction, _seconds, running) => {
			const mine = runningId === songId
			const progress = mine ? fraction : 0

			if (!mine) {
				// Another Song has the floor, or nothing does. Only redraw when something
				// actually changed, so twenty rails are not all repainting every frame while
				// one of them plays.
				if (lastProgress !== 0) {
					lastProgress = 0
					advance(0, true)
					draw(0)
				}
				return
			}

			// Motion here is decoration and is declared, not overridden: under reduced motion
			// the bars are simply at their height for this position, with no growth. Not
			// running covers pause, end and failure — one final call arrives, and holding that
			// frame keeps the two halves of the transport agreeing with each other.
			if (still || !running) {
				lastProgress = progress
				advance(progress, true)
				draw(progress)
				return
			}

			const now = performance.now()
			if (now - last < 1000 / FPS) {
				return
			}
			last = now
			lastProgress = progress
			advance(progress, false)
			draw(progress)
		})

		return () => {
			unsubscribe()
			observer.disconnect()
		}
	}, [trackPlayhead, songId])

	return <canvas ref={canvasRef} className="playhead-canvas" data-visualiser={songId} />
}
