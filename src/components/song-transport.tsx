'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { BAR_PHRASE } from '@/lib/player/bars'
import { formatRunningTime, isPlaying, type PlayableSong } from '@/lib/player/controller'
import { barCountFor, DEFAULT_BAR_COUNT, resample, toBars } from '@/lib/player/peaks'

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
	peaks,
	playLabel,
	pauseLabel,
	seekLabel,
}: {
	song: PlayableSong
	/** This track's own loudness, measured on upload. Null when the decode failed. */
	peaks: readonly number[] | null
	playLabel: string
	pauseLabel: string
	seekLabel: string
}) {
	const { state, send, trackProgress, trackSeek, trackElapsed } = useAudioEngine()
	const seekRef = useRef<HTMLInputElement | null>(null)
	const barsRef = useRef<HTMLDivElement | null>(null)
	const running = isPlaying(state, song.id)

	// How many bars the rail can hold. The server has measured nothing, so it renders the
	// default and the first frame on the client corrects it — a state update after mount,
	// not a hydration mismatch.
	const [barCount, setBarCount] = useState(DEFAULT_BAR_COUNT)
	useEffect(() => {
		const row = barsRef.current
		if (row === null) {
			return
		}
		const observer = new ResizeObserver(entries => {
			// The row's own content box, so the keyline and padding come from the stylesheet
			// rather than from constants here that would drift the moment the CSS changed.
			const width = entries[0]?.contentRect.width ?? 0
			setBarCount(current => {
				const next = barCountFor(width)
				return next === current ? current : next
			})
		})
		observer.observe(row)
		return () => observer.disconnect()
	}, [])

	const bars = useMemo(() => {
		if (peaks !== null && peaks.length > 0) {
			return toBars(peaks, barCount)
		}
		// No measurement for this track. The authored phrase still reads as audio, and is
		// resampled to the same count so a narrow rail is never a truncated one.
		return resample(
			BAR_PHRASE.map(bar => bar.height),
			barCount
		).map((height, index) => ({ id: `f${index}`, height }))
	}, [peaks, barCount])

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
				{/* This track's own loudness, measured from the file when it was uploaded and
				    stored on the record — so drawing it costs no download and no decode here.
				    Two identical rows of bars, the upper one clipped to the playhead: the thing
				    that fills is the same shape as the thing behind it, and the fill costs one
				    composited clip-path per frame rather than a re-layout. */}
				<div
					ref={registerProgress}
					className="playhead-blocks"
					data-progress={song.id}
					aria-hidden="true"
					style={{ '--playhead': 0 } as React.CSSProperties}
				>
					<div ref={barsRef} className="playhead-bars">
						{bars.map(bar => (
							<span
								key={`${song.id}-bar-${bar.id}`}
								className="playhead-bar"
								style={{ '--bar': `${bar.height.toFixed(1)}%` } as React.CSSProperties}
							/>
						))}
					</div>
					<div className="playhead-fill">
						<div className="playhead-bars">
							{bars.map(bar => (
								<span
									key={`${song.id}-fill-${bar.id}`}
									className="playhead-bar"
									style={{ '--bar': `${bar.height.toFixed(1)}%` } as React.CSSProperties}
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
