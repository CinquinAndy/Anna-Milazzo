'use client'

import { useEffect, useRef } from 'react'
import { endianPacker, mix, resolveToken, threshold } from '@/lib/canvas/dither'

/**
 * A slow warped field, dithered, filling whatever box it is dropped into.
 *
 * The client asked for the look of a shader card he found: a dithered pattern drifting
 * behind a call to action. The card itself could not be used, it wants a WebGL shader
 * package this project already evaluated and turned down, a `dark:` variant of every class,
 * blurs, gradients and a 48px radius, but the LOOK is the hero's own field, which is
 * already here and already ordered-dithered.
 *
 * Warped rather than banded: the horizontal phase is displaced by a slow vertical wave, so
 * the bands bend around each other instead of marching. That is the whole difference
 * between a pattern and a texture.
 *
 * The two colours are the block's own ground and a LIGHTER version of it, never a darker
 * one. Black type sits on this at 6.05:1, and anything that darkens the field takes that
 * down; lightening can only raise it, which makes the contrast safe by construction rather
 * than by measurement.
 *
 * Decoration. Hidden from assistive technology, and the block reads correctly without it.
 */

/** CSS pixels per cell. Twice the 4px keyline, so the grid agrees with every border. */
const CELL = 8

/** Redraws a second. Slower than the hero's field: this one is behind type. */
const FPS = 12

/** How far the ground is carried toward the paper. */
const LIFT = 0.24

export function DitherPanel() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

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

		const back = resolveToken(host, '--magenta')
		const paper = resolveToken(host, '--paper')
		const pack = endianPacker()
		const backWord = pack(back)
		const frontWord = pack(mix(back, paper, LIFT))

		let width = 0
		let height = 0
		let image: ImageData | null = null
		let words: Uint32Array | null = null

		const measure = () => {
			const rect = canvas.getBoundingClientRect()
			const nextWidth = Math.max(1, Math.ceil(rect.width / CELL))
			const nextHeight = Math.max(1, Math.ceil(rect.height / CELL))
			if (nextWidth === width && nextHeight === height) {
				return false
			}
			width = nextWidth
			height = nextHeight
			canvas.width = width
			canvas.height = height
			image = context.createImageData(width, height)
			words = new Uint32Array(image.data.buffer)
			return true
		}

		const draw = (time: number) => {
			if (image === null || words === null) {
				return
			}
			for (let y = 0; y < height; y++) {
				// The displacement is a function of the row alone, so it is computed once per
				// row rather than once per cell, the warp costs one sine per row, not one per
				// pixel, which is what keeps a full-width panel cheap enough to animate.
				const warp = Math.sin(y * 0.09 + time * 0.7) * 2.6 + Math.sin(y * 0.031 - time * 0.41) * 4.2
				const row = y * width
				for (let x = 0; x < width; x++) {
					const value = Math.sin((x + warp) * 0.075 + time * 0.33) * 0.5 + 0.5
					words[row + x] = value > threshold(x, y) ? frontWord : backWord
				}
			}
			context.putImageData(image, 0, 0)
		}

		measure()

		const still = window.matchMedia('(prefers-reduced-motion: reduce)')
		let frame: number | null = null
		let last = 0
		let visible = true

		const tick = (now: number) => {
			frame = requestAnimationFrame(tick)
			if (!visible || now - last < 1000 / FPS) {
				return
			}
			last = now
			draw(now / 1000)
		}

		const start = () => {
			if (frame === null && !still.matches && !document.hidden) {
				frame = requestAnimationFrame(tick)
			}
		}
		const stop = () => {
			if (frame !== null) {
				cancelAnimationFrame(frame)
				frame = null
			}
		}

		// One frame regardless, so the panel is never blank, the motion is the decoration,
		// the texture is not.
		draw(0)
		start()

		const observer = new ResizeObserver(() => {
			if (measure()) {
				draw(last / 1000)
			}
		})
		observer.observe(canvas)

		// Nothing is painted while the panel is off screen or the tab is in the background.
		const watcher = new IntersectionObserver(entries => {
			visible = entries[0]?.isIntersecting ?? true
		})
		watcher.observe(canvas)

		const onVisibility = () => {
			if (document.hidden) {
				stop()
			} else {
				start()
			}
		}
		document.addEventListener('visibilitychange', onVisibility)
		still.addEventListener('change', () => {
			if (still.matches) {
				stop()
			} else {
				start()
			}
		})

		return () => {
			stop()
			observer.disconnect()
			watcher.disconnect()
			document.removeEventListener('visibilitychange', onVisibility)
		}
	}, [])

	// `aria-hidden` on the wrapper, not on the canvas: a canvas counts as focusable, and
	// hiding a focusable element from assistive technology is its own defect.
	return (
		<div className="dither-panel" aria-hidden="true">
			<canvas ref={canvasRef} className="dither-panel-canvas" />
		</div>
	)
}
