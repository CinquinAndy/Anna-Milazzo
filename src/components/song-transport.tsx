'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { BAR_PHRASE } from '@/lib/player/bars'
import { formatRunningTime, isPlaying, type PlayableSong } from '@/lib/player/controller'

/**
 * The transport for one Song: a square play control, one progress rail, and the elapsed
 * and total times.
 *
 * The arrangement is lifted from a 21st.dev audio player the client asked for — icon,
 * single slider, times at either end. The implementation is not: that component mounts an
 * `<audio>` per player (ADR-0007 allows exactly one on the page), seeks through a `<div>`
 * with an `onClick` (no keyboard, no ARIA), and ships shuffle/skip/repeat buttons whose
 * handlers only call `stopPropagation`.
 *
 * What it did fix, and what this keeps, is legibility: the previous transport had two
 * separate widgets for one idea — decorative blocks that could not be dragged, beside a
 * seek slider that carried no meaning — so nobody could tell which was the control. Here
 * the blocks ARE the control: the native range sits transparent on top of them, so the
 * thing you see filling is the thing you drag.
 */
export function SongTransport({
	song,
	playLabel,
	pauseLabel,
	seekLabel,
}: {
	song: PlayableSong
	playLabel: string
	pauseLabel: string
	seekLabel: string
}) {
	const { state, send, trackProgress, trackSeek, trackElapsed } = useAudioEngine()
	const seekRef = useRef<HTMLInputElement | null>(null)
	const running = isPlaying(state, song.id)

	// The seek input commits on the native `change` event, not on `input`. React's
	// `onChange` for a range IS `input`, so binding there would fire a seek on every
	// pointer move of a drag.
	useEffect(() => {
		const input = seekRef.current
		if (input === null) {
			return
		}
		const commit = () => send({ type: 'scrubbed', song, seconds: Number(input.value) })
		input.addEventListener('change', commit)
		return () => input.removeEventListener('change', commit)
	}, [send, song])

	// Every per-frame DOM write lives in the engine, which owns the animation frame. The
	// transport only says which nodes belong to which Song.
	const registerProgress = useCallback(
		(node: HTMLDivElement | null) => trackProgress(song.id, node),
		[song.id, trackProgress]
	)
	const registerSeek = useCallback(
		(node: HTMLInputElement | null) => {
			seekRef.current = node
			trackSeek(song.id, node)
		},
		[song.id, trackSeek]
	)
	const registerElapsed = useCallback(
		(node: HTMLSpanElement | null) => trackElapsed(song.id, node),
		[song.id, trackElapsed]
	)

	return (
		<div className="transport mt-6">
			<button
				type="button"
				className="transport-play"
				data-play={song.id}
				data-playing={running ? 'true' : 'false'}
				// The press handler does exactly one thing and awaits nothing: the reducer
				// runs synchronously and `play()` is called inside this same tick.
				onClick={() => send({ type: 'pressedPlay', song })}
			>
				{/* Solid shapes, not a stroked icon set. A 2px rounded stroke would read as
				    borrowed from another design system inside a 4px-keyline page. */}
				<svg className="transport-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					{running ? (
						<g>
							<rect x="5" y="3" width="5" height="18" />
							<rect x="14" y="3" width="5" height="18" />
						</g>
					) : (
						<polygon points="6,3 21,12 6,21" />
					)}
				</svg>
				{/* The label still comes from the CMS; it is announced rather than drawn,
				    because a triangle says "play" to everyone and a word only says it in two
				    languages. */}
				<span className="sr-only">{running ? pauseLabel : playLabel}</span>
			</button>

			<div className="transport-rail">
				{/* An amplitude phrase, not a waveform: a real waveform would mean downloading
				    and decoding every track to draw it (ADR-0007). Two identical rows of bars,
				    the upper one clipped to the playhead — so the thing that fills is the same
				    shape as the thing behind it, and the fill costs one composited clip-path
				    per frame rather than a re-layout. */}
				<div
					ref={registerProgress}
					className="playhead-blocks"
					data-progress={song.id}
					aria-hidden="true"
					style={{ '--playhead': 0 } as React.CSSProperties}
				>
					<div className="playhead-bars">
						{BAR_PHRASE.map(bar => (
							<span
								key={`${song.id}-bar-${bar.id}`}
								className="playhead-bar"
								style={{ '--bar': `${bar.height}%` } as React.CSSProperties}
							/>
						))}
					</div>
					<div className="playhead-fill">
						<div className="playhead-bars">
							{BAR_PHRASE.map(bar => (
								<span
									key={`${song.id}-fill-${bar.id}`}
									className="playhead-bar"
									style={{ '--bar': `${bar.height}%` } as React.CSSProperties}
								/>
							))}
						</div>
					</div>
				</div>
				{/* A styled native range, not a custom role="slider": the native control
				    already reports its value, takes arrow keys, and works with every assistive
				    technology without being reimplemented. It is transparent and covers the
				    rail, so the blocks below are what you see and this is what you drag; the
				    visible focus ring belongs to the rail. */}
				<input
					ref={registerSeek}
					type="range"
					className="playhead-seek"
					min={0}
					max={Math.floor(song.durationSeconds)}
					step={1}
					defaultValue={0}
					aria-label={seekLabel}
					data-seek={song.id}
				/>
			</div>

			<p className="transport-time">
				<span ref={registerElapsed} data-elapsed={song.id}>
					{formatRunningTime(0)}
				</span>
				<span aria-hidden="true">/</span>
				<span data-duration={song.id}>{formatRunningTime(song.durationSeconds)}</span>
			</p>
		</div>
	)
}
