'use client'

import { type CSSProperties, type ReactNode, useEffect, useId, useRef, useState } from 'react'

/**
 * One clip of the arrangement, and the way to read the rest of it.
 *
 * A clip is as tall as its lane and as wide as the years it covers, so a one-year
 * certificate with a two-line title in the CMS is a box far too small for what Anna wrote
 * in it. The text used to be cut at the bottom edge and that was the end of it: there was
 * no way to read the rest. Now the clip says so, with a fade and a button, and the button
 * opens the clip to its full height.
 *
 * The button is drawn only when there is something to open. Measuring is what decides, and
 * it can only happen in the browser, so the server renders every clip closed and without
 * the button, which is also exactly what a reader without JavaScript gets. The text is in
 * the page either way: this never hides anything from a screen reader, it only changes how
 * much of it the box shows.
 *
 * `children` is the clip's own markup, rendered by the Server Component that owns the data.
 */
export function TimelineClip({
	className,
	style,
	title,
	expandLabel,
	collapseLabel,
	children,
}: {
	className: string
	style: CSSProperties
	/** The entry's title, spoken after the button's label (which stays the start of the name) so nine "Read more" are not nine of the same. */
	title: string
	expandLabel: string
	collapseLabel: string
	children: ReactNode
}) {
	const bodyId = useId()
	const body = useRef<HTMLDivElement>(null)
	const [open, setOpen] = useState(false)
	const [clipped, setClipped] = useState(false)

	// Measured while closed only: open, nothing overflows, which would say "nothing to open"
	// about the clip the reader has just opened. `clipped` keeps its last answer meanwhile.
	useEffect(() => {
		const element = body.current
		if (open || element === null) {
			return
		}

		const measure = () => setClipped(element.scrollHeight > element.clientHeight + 1)
		measure()

		// The box is a fixed size, so it is the width that changes how the text wraps, and a
		// web font arriving changes it without the box moving at all. Both are asked about.
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		void document.fonts?.ready.then(measure)

		return () => observer.disconnect()
	}, [open])

	return (
		<div className={className} style={style} data-open={open}>
			<div className="daw-clip-body" id={bodyId} ref={body} data-clipped={clipped && !open}>
				{children}
			</div>
			{clipped || open ? (
				<button
					type="button"
					className="daw-clip-toggle"
					aria-label={`${open ? collapseLabel : expandLabel}: ${title}`}
					aria-expanded={open}
					aria-controls={bodyId}
					onClick={() => setOpen(value => !value)}
				>
					{open ? collapseLabel : expandLabel}
				</button>
			) : null}
		</div>
	)
}
