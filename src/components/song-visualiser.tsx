'use client'

import { useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { endianPacker, mix, type Rgb, resolveToken, threshold } from '@/lib/canvas/dither'
import { BAR_FLOOR, resample } from '@/lib/player/peaks'

/**
 * The rail inside a Folder: the track drawn as a histogram, built by the playhead.
 *
 * The horizontal axis is TIME, start to finish. Every bar says two measured things about
 * the moment it stands for — its HEIGHT is how loud the track is there, and its COLOUR is
 * where that sound sits in the spectrum, green for bass through to magenta for the bright
 * end. Both come from the file itself, measured once when it was uploaded; nothing here is
 * authored or random.
 *
 * Ahead of the playhead the bars are low and grey: the shape of the piece is legible, so a
 * Recruiter can see where it swells before pressing anything, but it is plainly not yet
 * played. As the playhead reaches each bar it grows to its true height and takes its colour,
 * so the histogram assembles itself while the music runs, and stays assembled when the
 * track ends.
 *
 * A canvas at one pixel per cell, scaled up with `image-rendering: pixelated` — the hero's
 * field, drawn small. That is the only way to carry ordered dithering, and it costs one
 * 32-bit write per cell rather than a DOM node per bar restyled thirty times a second.
 *
 * Decoration, drawn under the real control: the transparent range input above owns every
 * pointer and key event, and the elapsed time beside it is what actually reports position.
 * Delete this and the player still works.
 */

/** CSS pixels per cell. The rail is short, so half the hero's cell keeps rows for the edge. */
const CELL = 4

/**
 * Bar and gutter, in cells, at a comfortable width and at a cramped one.
 *
 * Below the threshold the bars halve rather than the COUNT halving. At a 6-cell pitch a
 * 768px layout had room for ten bars — ten columns is a bar chart, not a waveform, and it
 * throws away 92% of the 128 readings the record stores.
 */
const WIDE = { bar: 4, gap: 2 }
const NARROW = { bar: 2, gap: 1 }
const NARROW_BELOW_CELLS = 120

/** Cells held clear at each end of the rail. */
const EDGE_MARGIN = 1

/**
 * Cells held clear at the TOP.
 *
 * Without it a bar at full height starts in row 0, where it fuses with the rail's own 4px
 * keyline: a third of the bars on one track were flat against the border, so loud and
 * loudest looked the same and the dithered top edge was never drawn at all.
 */
const CEILING_CELLS = 2

/** How many cells a bar's lit top dithers away over. */
const EDGE_SOFTNESS = 2

/** Redraws a second while playing. */
const FPS = 30

/**
 * How many colours the timbre ramp is expanded to.
 *
 * Four palette hues stepped straight gave four flat bands. Twenty-one was still ~15% of the
 * distance between two anchors per step, which chequers as two plainly different colours at
 * a 4px cell. Sixty-one cuts each step to about a twentieth of a gap, and the whole table is
 * built once at mount for roughly two kilobytes.
 */
const RAMP_STEPS = 61

/**
 * Buckets the colour is computed at, once per track.
 *
 * FIXED, and deliberately not the number of bars. Deriving the reference from however many
 * bars a viewport happens to fit made the same track render fourteen distinct hues at
 * 1440px and eight identical gold bars at 768px, where the percentile span collapsed and
 * every bar fell back to the middle of the ramp. A track has one timbre curve; the width of
 * the window is not part of it.
 */
const TONE_BUCKETS = 64

/** Buckets either side of each one that its colour is averaged with, on that fixed grid. */
const SMOOTH_BUCKETS = 2

/**
 * The narrowest range of timbre a track is allowed to be stretched across.
 *
 * In raw centroid points. Without a floor, a piece that barely changes colour has its own
 * measurement noise amplified into the full ramp — the stretch divides by the span, and a
 * span near zero turns a flat track into confetti.
 */
const TONE_SPAN_FLOOR = 6

/**
 * A reading below this is silence, and has no timbre to report.
 *
 * A spectral centroid is undefined without signal. One track's stored tail is eight buckets
 * of `1`, and read as data they anchored the bottom of the whole ramp — so the only bars
 * that reached green were the ones where the music had stopped.
 */
const AUDIBLE = 10

/**
 * The curve from a stored reading to a drawn height.
 *
 * Below one, so quiet passages are lifted. Gentler than it was, because the floor below now
 * does that job at the quiet end rather than the gamma doing it on top of a reading that is
 * already normalised against a percentile.
 */
const HEIGHT_GAMMA = 0.75

/**
 * How much of its true height an unplayed bar is drawn at.
 *
 * Not zero, and not high. A rail that is empty until you press play hides the shape of the
 * piece and hides that it is a control you can drag into. But this is also the growth's
 * headroom: measured at 0.70 the tallest bar went from 0.95 of the rail to 1.00 when the
 * playhead reached it, a five percent change nobody can see, and the whole idea of the
 * component stopped reading. The resting silhouette is made legible by WEIGHT below rather
 * than by height here.
 */
const GHOST = 0.55

/** How fast a bar grows once the playhead reaches it, per frame. */
const GROWTH_PER_FRAME = 0.1

/** Past this, the track has effectively finished and its finished picture is kept. */
const COMPLETE = 0.98

/** How far the foot of a bar is carried toward the ink, for weight at the base. */
const FOOT_SHADE = 0.22

/**
 * Steps in that shading.
 *
 * Two: one flat fill standing on one flat plinth. Eight steps across a tall bar drew eight
 * visible horizontal bands — a vertical gradient inside a design specified as flat fills,
 * and it made a tall bar's foot darker than a short bar's, so the baseline read ragged.
 */
const SHADE_STEPS = 2

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
		const dust = resolveToken(host, '--dust')
		const pack = endianPacker()
		const backWord = pack(back)
		// Unplayed: the ground carried a little way toward the ink. Present, plainly inert,
		// and never competing with the colour of a bar that has been played.
		// Carried further toward the ink than it looks like it needs to be. The resting shape
		// has to be legible without stealing the height that arriving at full size depends on,
		// so presence comes from tone here and the growth keeps its whole range.
		const ghostWord = pack(mix(back, ink, 0.42))
		// Green, yellow, orange, magenta: bass to bright. Straight from the palette — over
		// paper these need their saturation, where over the hero's blue they were softened
		// toward it. Four, not five: adding grape moved the middle of the ramp to magenta and
		// half the rail came out purple, against a rule this project has held from the start
		// — the loudest colour is rationed, and a bar only reaches it at a piece's brightest.
		const ANCHORS = (['--spring', '--lemon', '--accent', '--magenta'] as const).map(token => resolveToken(host, token))
		/** The anchors expanded into a long ramp, each step flat with a plinth under it. */
		const RAMP: Uint32Array[] = []
		for (let step = 0; step < RAMP_STEPS; step++) {
			const along = (step / (RAMP_STEPS - 1)) * (ANCHORS.length - 1)
			const lower = Math.min(ANCHORS.length - 1, Math.floor(along))
			const upper = Math.min(ANCHORS.length - 1, lower + 1)
			const hue = mix(ANCHORS[lower] as Rgb, ANCHORS[upper] as Rgb, along - lower)
			const shades = new Uint32Array(SHADE_STEPS)
			for (let shade = 0; shade < SHADE_STEPS; shade++) {
				shades[shade] = pack(mix(hue, ink, FOOT_SHADE * (1 - shade / (SHADE_STEPS - 1))))
			}
			RAMP.push(shades)
		}
		// The playhead, drawn over everything so it survives a tall bar.
		const markWord = pack(ink)
		// The axis. Behind the playhead it is ink, ahead of it dust, so the rule itself
		// reports progress instead of being the same line on both sides of the marker.
		const passedWord = pack(mix(back, ink, 0.85))
		const aheadWord = pack(dust)

		let width = 0
		let height = 0
		let image: ImageData | null = null
		let words: Uint32Array | null = null
		let bars = 0
		let barCells = WIDE.bar
		let pitch = WIDE.bar + WIDE.gap
		let margin = EDGE_MARGIN
		let heights: number[] = []
		let colours: number[] = []
		/** 0 while a bar is still ahead of the playhead, 1 once it has finished growing. */
		let grown = new Float64Array(0)

		/**
		 * The track's colour curve, computed once and independent of any width.
		 *
		 * Returns `TONE_BUCKETS` readings, 0–100, already stretched across the track's own
		 * range of timbre. Everything width-dependent happens after this.
		 */
		const toneCurve = () => {
			const storedTone = toneRef.current
			const storedPeaks = peaksRef.current
			if (storedTone === null || storedTone.length === 0) {
				return []
			}

			// Fold to the fixed grid, and drop what is not audible: a centroid taken from
			// silence is not a reading, it is whatever the noise floor happened to be.
			const folded: (number | null)[] = []
			for (let bucket = 0; bucket < TONE_BUCKETS; bucket++) {
				const from = Math.floor((bucket * storedTone.length) / TONE_BUCKETS)
				const to = Math.max(from + 1, Math.floor(((bucket + 1) * storedTone.length) / TONE_BUCKETS))
				let sum = 0
				let counted = 0
				for (let i = from; i < to && i < storedTone.length; i++) {
					const loud = storedPeaks?.[Math.min(i, (storedPeaks?.length ?? 1) - 1)] ?? 100
					if (loud >= AUDIBLE) {
						sum += storedTone[i] ?? 0
						counted++
					}
				}
				folded.push(counted === 0 ? null : sum / counted)
			}

			// Silent buckets take the nearest audible neighbour, forwards then backwards.
			let last: number | null = null
			for (let i = 0; i < folded.length; i++) {
				if (folded[i] === null) {
					folded[i] = last
				} else {
					last = folded[i] as number
				}
			}
			let next: number | null = null
			for (let i = folded.length - 1; i >= 0; i--) {
				if (folded[i] === null) {
					folded[i] = next
				} else {
					next = folded[i] as number
				}
			}
			const audible = folded.map(value => value ?? 50)

			// Smoothed on the fixed grid, so the window is a fixed slice of the TRACK rather
			// than of the viewport. Timbre moves gradually in music; the bucket-to-bucket
			// jitter is one note's attack against the last one's decay.
			const smoothed = audible.map((_, bucket) => {
				let sum = 0
				let counted = 0
				for (let near = bucket - SMOOTH_BUCKETS; near <= bucket + SMOOTH_BUCKETS; near++) {
					const value = audible[near]
					if (value !== undefined) {
						sum += value
						counted++
					}
				}
				return sum / Math.max(1, counted)
			})

			// Fitted between percentiles rather than extremes: two outlying buckets — one
			// note's attack, one moment of near-silence — were setting the whole scale. The
			// span is floored so a track that barely changes colour is not amplified into
			// confetti, and centred so a narrow track sits in the middle of the ramp rather
			// than being pushed to one end.
			const sorted = [...smoothed].sort((a, b) => a - b)
			const low = sorted[Math.floor(sorted.length * 0.1)] ?? 0
			const high = sorted[Math.floor(sorted.length * 0.9)] ?? 100
			const span = Math.max(high - low, TONE_SPAN_FLOOR)
			const floor = (low + high) / 2 - span / 2
			return smoothed.map(value => Math.max(0, Math.min(100, ((value - floor) / span) * 100)))
		}

		let curve = toneCurve()

		/** How many bars the rail has room for, and this track's readings folded onto them. */
		const layout = () => {
			const shape = width < NARROW_BELOW_CELLS ? NARROW : WIDE
			barCells = shape.bar
			pitch = shape.bar + shape.gap
			bars = Math.max(1, Math.floor((width - 2 * EDGE_MARGIN + shape.gap) / pitch))
			margin = Math.max(EDGE_MARGIN, Math.floor((width - (bars * pitch - shape.gap)) / 2))

			const storedPeaks = peaksRef.current
			heights = storedPeaks === null || storedPeaks.length === 0 ? [] : resample(storedPeaks, bars)
			// The colour curve is already normalised; folding it to the bars is a plain mean.
			colours =
				curve.length === 0
					? []
					: Array.from({ length: bars }, (_, bar) => {
							const from = Math.floor((bar * curve.length) / bars)
							const to = Math.max(from + 1, Math.floor(((bar + 1) * curve.length) / bars))
							let sum = 0
							for (let i = from; i < to && i < curve.length; i++) {
								sum += curve[i] ?? 50
							}
							return sum / (to - from)
						})
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

		/** The cell the playhead stands on, in the bars' own coordinates. */
		const markAt = (progress: number) => margin + Math.round(progress * (bars * pitch - (pitch - barCells)))

		const draw = (progress: number) => {
			if (image === null || words === null) {
				return
			}
			// Painted before anything can return early: the context is opaque, so an unpainted
			// canvas is a black rectangle sitting inside the card rather than nothing at all.
			words.fill(backWord)
			const mark = Math.max(0, Math.min(width - 1, markAt(progress)))
			const floorRow = height - 2

			if (heights.length > 0) {
				for (let bar = 0; bar < bars; bar++) {
					const reading = BAR_FLOOR / 100 + (1 - BAR_FLOOR / 100) * Math.max(0, Math.min(1, (heights[bar] ?? 0) / 100))
					const full = reading ** HEIGHT_GAMMA
					const lift = grown[bar] as number
					// Grown from its ghost to its true height, never from nothing: the bar keeps
					// its place in the shape the whole way up.
					const level = full * (GHOST + (1 - GHOST) * lift)
					// Held clear of the top keyline, so a bar at full height still has a drawn
					// edge rather than fusing with the border.
					const top = CEILING_CELLS + (floorRow - CEILING_CELLS) * (1 - level)
					const foot = floorRow - 1
					const reach = Math.max(1, foot - top)
					const from = margin + bar * pitch

					// Colour by timbre, not by height. Height already says how loud this moment
					// is, and a colour that repeats it says nothing new.
					const stop = (Math.max(0, Math.min(100, colours[bar] ?? 50)) / 100) * (RAMP.length - 1)
					const lower = Math.min(RAMP.length - 1, stop | 0)
					const upper = Math.min(RAMP.length - 1, lower + 1)

					for (let cell = 0; cell < barCells; cell++) {
						const x = from + cell
						if (x < 0 || x >= width) {
							continue
						}
						for (let y = foot; y >= 0; y--) {
							if (y < top) {
								// Above the bar but inside its soft top: the matrix decides. Phased
								// by bar, because a 6-cell pitch against an 8-periodic matrix gives
								// only four phases — so bars of equal height wore an identical
								// two-notch cap and the row read as crenellation.
								const fade = (top - y) / EDGE_SOFTNESS
								if (fade >= 1 || fade > 1 - threshold(x + bar * 3, y)) {
									break
								}
							}
							if (lift <= 0.001) {
								words[y * width + x] = ghostWord
								continue
							}
							// A second, OFFSET read of the matrix. Reusing the threshold that
							// decided lit-or-not correlates the two — a lit cell is one with a low
							// threshold, so every blend leans to the lower stop and the ramp bands.
							const blend = threshold(x, y, 2, 4)
							const hue = RAMP[stop - lower > blend ? upper : lower]
							const shade = Math.min(SHADE_STEPS - 1, Math.round(((foot - y) / reach) * (SHADE_STEPS - 1)))
							// Dithered back toward the ghost while it is still growing, so a bar
							// arrives at its colour rather than switching to it.
							words[y * width + x] = (lift > blend ? hue?.[shade] : ghostWord) ?? backWord
						}
					}
				}
			}

			// The axis the bars stand on, one cell clear of the keyline so it reads as a rule
			// rather than as a thickening of the border, and split at the playhead so it
			// reports progress on its own.
			for (let x = 0; x < width; x++) {
				words[floorRow * width + x] = x <= mark ? passedWord : aheadWord
			}

			// The playhead: a column held clear of both keylines, with a cap, so it reads as a
			// marker rather than as one more black bar or as a divider joining the borders.
			//
			// Not drawn at all before anything has played. Parked at the left edge it is ink
			// at the head of the rail, which is the shape of the complaint that started this —
			// "la première barre est toujours affichée" — and no marker is the honest answer
			// when there is no position to mark. The bars are lit from the same coordinate
			// either way, so this hides nothing.
			if (progress > 0) {
				for (let y = CEILING_CELLS; y <= floorRow; y++) {
					words[y * width + mark] = markWord
				}
				for (let x = mark - 1; x <= mark + 1; x++) {
					if (x >= 0 && x < width) {
						words[CEILING_CELLS * width + x] = markWord
						words[(CEILING_CELLS - 1) * width + x] = markWord
					}
				}
			}
			context.putImageData(image, 0, 0)
		}

		/** Moves every bar one frame toward grown-or-not for this playhead position. */
		const advance = (progress: number, instant: boolean) => {
			const mark = markAt(progress)
			for (let bar = 0; bar < bars; bar++) {
				// Lit off the SAME quantity the marker is drawn from, at the bar's centre.
				// Computing it from `progress * bars` instead put the black line up to four
				// cells away from the colour boundary it is supposed to be.
				const reached = mark >= margin + bar * pitch + barCells / 2
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

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
		let still = reducedMotion.matches
		const onMotionChange = () => {
			still = reducedMotion.matches
		}
		reducedMotion.addEventListener('change', onMotionChange)

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

			if (!mine) {
				// Another Song has the floor, or nothing does. Only redraw when something
				// actually changed, so twenty rails are not all repainting every frame while
				// one of them plays.
				if (lastProgress !== 0) {
					lastProgress = 0
					curve = toneCurve()
					advance(0, true)
					draw(0)
				}
				return
			}

			if (!running) {
				// One final call arrives on pause, on end and on failure. The reducer resets the
				// position to zero when a track ENDS, which would throw away every coloured cell
				// at the exact moment the picture finished assembling — so a track that got to
				// the end keeps its finished histogram until something else is pressed.
				if (lastProgress > COMPLETE && fraction === 0) {
					advance(1, true)
					draw(1)
					return
				}
				lastProgress = fraction
				advance(fraction, true)
				draw(fraction)
				return
			}

			// The throttle covers reduced motion too. Skipping it there meant a visitor who
			// asked for LESS motion got the paint work at the animation-frame rate instead of
			// at thirty a second — measured, more than twice as many repaints.
			const now = performance.now()
			if (now - last < 1000 / FPS) {
				return
			}
			last = now
			lastProgress = fraction
			advance(fraction, still)
			draw(fraction)
		})

		return () => {
			unsubscribe()
			observer.disconnect()
			reducedMotion.removeEventListener('change', onMotionChange)
		}
	}, [trackPlayhead, songId])

	return <canvas ref={canvasRef} className="playhead-canvas" data-visualiser={songId} />
}
