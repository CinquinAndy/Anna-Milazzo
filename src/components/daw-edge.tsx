'use client'

import { useEffect, useRef } from 'react'

/**
 * The mark at the end of the visible strip, and the fallback that makes it appear on the
 * engines that cannot ask the question in CSS.
 *
 * The mark's presence is a `@container scroll-state(scrollable: inline-end)` query, which
 * Chromium answers and Firefox and Safari drop, leaving the base `opacity: 0`. On iOS the
 * scrollbar is an overlay that stays invisible until touched, so at 375, with three
 * quarters of the arrangement past the right edge and two of the five lanes rendering as
 * empty track, an iPhone reader was given nothing at all to say the strip moves. Empty
 * lanes are only acceptable because this mark is there.
 *
 * So the same condition is also published as `data-more` on the scroller, and the
 * stylesheet turns the mark on for either. Where the query works it decides before this
 * ever runs; where it does not, this does. Nothing about the drawing changes.
 */
export function DawEdge() {
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => {
		const strip = ref.current?.closest('.daw')
		if (!(strip instanceof HTMLElement)) {
			return
		}

		// A pixel of tolerance: a fractional scrollWidth on a fractional device pixel ratio
		// leaves a scroller a hair short of its own end, which would leave the mark drawn
		// over an arrangement that has nothing left to show.
		const publish = () => {
			const more = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1
			strip.dataset.more = String(more)
		}

		publish()
		strip.addEventListener('scroll', publish, { passive: true })
		const observer = new ResizeObserver(publish)
		observer.observe(strip)
		return () => {
			strip.removeEventListener('scroll', publish)
			observer.disconnect()
		}
	}, [])

	return (
		<span className="daw-edge" aria-hidden="true" ref={ref}>
			<span className="daw-edge-mark">
				<span className="daw-edge-arrow" />
			</span>
		</span>
	)
}
