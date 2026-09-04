'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAudioEngine } from '@/components/audio-engine'
import { isPlaying, type PlayableSong } from '@/lib/player/controller'

/** `m:ss`, from the duration stored on the Song — no audio is loaded to work it out. */
function runningTime(seconds: number): string {
	const whole = Math.max(0, Math.floor(seconds))
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

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
	const { state, send, trackProgress, trackSeek } = useAudioEngine()
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

	return (
		<div className="mt-6 flex flex-wrap items-center gap-4">
			<button
				type="button"
				className="control control-primary"
				data-play={song.id}
				data-playing={running ? 'true' : 'false'}
				// The press handler does exactly one thing and awaits nothing: the reducer
				// runs synchronously and `play()` is called inside this same tick.
				onClick={() => send({ type: 'pressedPlay', song })}
			>
				{running ? pauseLabel : playLabel}
			</button>

			<div className="flex min-w-[12rem] flex-1 items-center gap-3">
				{/* Chunky decorative blocks, not a waveform. A real waveform would mean
				    downloading and decoding every track to draw it, and renders thin and grey
				    — which is what this visual language rejects (ADR-0007). */}
				<div
					ref={registerProgress}
					className="playhead-blocks"
					data-progress={song.id}
					aria-hidden="true"
					style={{ '--playhead': 0 } as React.CSSProperties}
				/>
				<span className="font-mono text-xs whitespace-nowrap" data-duration={song.id}>
					{runningTime(song.durationSeconds)}
				</span>
			</div>

			{/* A styled native range, not a custom role="slider": the native control already
			    reports its value, takes arrow keys, and works with every assistive
			    technology without being reimplemented. */}
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
	)
}
