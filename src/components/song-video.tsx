'use client'

import { useEffect, useRef, useState } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { useSheetOpen } from '@/components/folder'
import type { Media } from '@/payload-types'

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
 *
 * Two things follow from the Folder (ADR-0014). Leaving the Tab takes the player down again:
 * a sandboxed provider frame cannot be paused from outside without its API, and one hidden
 * with `display: none` would go on playing with no control left to stop it. And starting a
 * video pauses the track, and starting the track takes the video down, so two sounds are
 * never laid over each other.
 *
 * With a `poster`, the closed state is the Song's own cover drawn as a screen, for a Song
 * whose video is all there is to play. The cover is Anna's upload, served from this site,
 * so it is still not a request to the provider.
 */
export function SongVideo({
	embedUrl,
	watchUrl,
	title,
	label,
	poster = null,
}: {
	embedUrl: string
	watchUrl: string
	/** The song's title: what the control is about, since a page can hold several. */
	title: string
	label: string
	/** The cover, shown as the screen before the video is asked for. */
	poster?: Media | null
}) {
	const [playing, setPlaying] = useState(false)
	const frame = useRef<HTMLIFrameElement>(null)
	const open = useSheetOpen()
	const { state, send } = useAudioEngine()

	// The Tab was left: back to the closed state, which unmounts the frame and stops it.
	useEffect(() => {
		if (!open) {
			setPlaying(false)
		}
	}, [open])

	// The other half: the track started while the video was up. The frame cannot be paused
	// from here, so it is taken down, as when the Tab is left. Only on the change into
	// playing, so a press on the video that pauses a track already sounding is not undone.
	const wasPlaying = useRef(state.status === 'playing')
	useEffect(() => {
		const now = state.status === 'playing'
		if (now && !wasPlaying.current) {
			setPlaying(false)
		}
		wasPlaying.current = now
	}, [state.status])

	const start = () => {
		if (state.status === 'playing') {
			send({ type: 'pressedPause' })
		}
		setPlaying(true)
	}

	// The button that was pressed is gone once the player is there. Keyboard focus would fall
	// back to the page; it goes to the player, which is where the reader is.
	useEffect(() => {
		if (playing) {
			frame.current?.focus()
		}
	}, [playing])

	return (
		<div className={poster === null ? 'song-video' : 'song-video song-video-screen'} data-song-video>
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
				<button type="button" className="song-video-start" aria-label={`${label}: ${title}`} onClick={start}>
					{poster?.url ? (
						// biome-ignore lint/performance/noImgElement: Anna's upload, served from the bucket's own domain, as in Portrait.
						<img
							className="song-video-poster"
							src={poster.url}
							alt=""
							width={poster.width ?? undefined}
							height={poster.height ?? undefined}
							loading="lazy"
							decoding="async"
						/>
					) : null}
					<span className="song-video-cue">
						<span className="song-video-play" aria-hidden="true" />
						<span className="song-video-cue-label">{label}</span>
					</span>
				</button>
			)}
			{/* Without JavaScript the button does nothing, so the address it would have loaded
			    is offered as a plain link instead. */}
			<noscript>
				<a href={watchUrl} className="song-video-start song-video-fallback" rel="noreferrer noopener" target="_blank">
					{label}
				</a>
			</noscript>
		</div>
	)
}
