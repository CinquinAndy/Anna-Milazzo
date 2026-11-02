'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A video that costs the page nothing until somebody asks for it.
 *
 * Closed, this is a button and nothing else: no `<iframe>`, no thumbnail from the
 * provider's servers, not one request to YouTube or Vimeo. Pressing it swaps the button for
 * the player. That order is the whole design. An embed on load would put a third party's
 * code and cookies on every visit of a page that, by ADR-0010, runs none, and would need the
 * consent banner that decision exists to avoid. A visitor who presses play has asked for
 * the provider's player, and is given it, in YouTube's privacy-enhanced mode or with
 * Vimeo's do-not-track flag, from an address built by `parseVideo` from a validated id.
 * See ADR-0013.
 *
 * The player is sandboxed as well: it may run its own scripts and open its own links, and
 * has no business with the page around it.
 */
export function SongVideo({
	embedUrl,
	watchUrl,
	title,
	label,
}: {
	embedUrl: string
	watchUrl: string
	/** The song's title: what the control is about, since a page can hold several. */
	title: string
	label: string
}) {
	const [playing, setPlaying] = useState(false)
	const frame = useRef<HTMLIFrameElement>(null)

	// The button that was pressed is gone once the player is there. Keyboard focus would fall
	// back to the page; it goes to the player, which is where the reader is.
	useEffect(() => {
		if (playing) {
			frame.current?.focus()
		}
	}, [playing])

	return (
		<div className="song-video" data-song-video>
			{playing ? (
				<iframe
					ref={frame}
					className="song-video-frame"
					src={embedUrl}
					title={`${label}: ${title}`}
					allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
					referrerPolicy="strict-origin-when-cross-origin"
					sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
				/>
			) : (
				<button
					type="button"
					className="song-video-start"
					aria-label={`${label}: ${title}`}
					onClick={() => setPlaying(true)}
				>
					<span className="song-video-play" aria-hidden="true" />
					<span>{label}</span>
				</button>
			)}
			{/* Without JavaScript the button does nothing, so the address it would have loaded
			    is offered as a plain link instead. */}
			<noscript>
				<a href={watchUrl} className="song-video-start" rel="noreferrer noopener" target="_blank">
					{label}
				</a>
			</noscript>
		</div>
	)
}
