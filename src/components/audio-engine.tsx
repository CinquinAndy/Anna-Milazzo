'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
	formatRunningTime,
	initialPlayerState,
	type PlayerCommand,
	type PlayerEvent,
	type PlayerState,
	reducePlayer,
} from '@/lib/player/controller'

type Engine = {
	state: PlayerState
	send: (event: PlayerEvent) => void
	/** Registers the element whose `--playhead` should follow the running Song. */
	trackProgress: (songId: string, node: HTMLElement | null) => void
	/** Registers the seek control whose thumb should follow the running Song. */
	trackSeek: (songId: string, node: HTMLInputElement | null) => void
	/** Registers the element whose text reads the running Song's elapsed time. */
	trackElapsed: (songId: string, node: HTMLElement | null) => void
}

const AudioEngineContext = createContext<Engine | null>(null)

export function useAudioEngine(): Engine {
	const engine = useContext(AudioEngineContext)
	if (engine === null) {
		throw new Error('useAudioEngine must be used inside <AudioEngine>')
	}
	return engine
}

/**
 * The one `<audio>` element on the page, mounted at layout level.
 *
 * One element rather than one per Folder, for two reasons from ADR-0007: iOS permits a
 * single audio stream at a time, so "only one plays at once" becomes structural rather
 * than something to coordinate; and twelve elements at `preload="metadata"` would fire
 * twelve network requests before a Recruiter had asked for anything.
 */
export function AudioEngine({ children }: { children: ReactNode }) {
	const audioRef = useRef<HTMLAudioElement | null>(null)
	// The authoritative state for the synchronous path. React's own state lags a render
	// behind, and `play()` cannot wait a render.
	const stateRef = useRef<PlayerState>(initialPlayerState)
	const [state, setState] = useState<PlayerState>(initialPlayerState)
	// Set when a seek arrives before the element has metadata to seek within.
	const pendingSeekRef = useRef<number | null>(null)
	const progressNodesRef = useRef(new Map<string, HTMLElement>())
	const seekNodesRef = useRef(new Map<string, HTMLInputElement>())
	const elapsedNodesRef = useRef(new Map<string, HTMLElement>())
	const frameRef = useRef<number | null>(null)
	// `apply` needs to report a rejected play() back into the reducer, and it is defined
	// before `send` is. The ref breaks the cycle without making either depend on the other.
	const sendRef = useRef<(event: PlayerEvent) => void>(() => {})

	const writePlayhead = useCallback((songId: string | null, fraction: number, seconds: number) => {
		for (const [id, node] of progressNodesRef.current) {
			// Written to a custom property, never to React state: `timeupdate` has no
			// specified frequency and a state write per frame would re-render the whole
			// stack sixty times a second.
			node.style.setProperty('--playhead', id === songId ? String(fraction) : '0')
		}
		for (const [id, node] of seekNodesRef.current) {
			// Not while a Recruiter has hold of it: a slider whose value is rewritten
			// every frame fights the drag, and one rewritten while focused announces itself
			// continuously to a screen reader.
			if (document.activeElement === node) {
				continue
			}
			node.value = id === songId ? String(Math.floor(seconds)) : '0'
		}
		for (const [id, node] of elapsedNodesRef.current) {
			// textContent, not React state, for the same reason as the playhead: this is
			// rewritten every animation frame.
			node.textContent = formatRunningTime(id === songId ? seconds : 0)
		}
	}, [])

	const apply = useCallback((command: PlayerCommand) => {
		const element = audioRef.current
		if (element === null) {
			return
		}

		switch (command.kind) {
			case 'load': {
				element.src = command.source
				pendingSeekRef.current = null
				break
			}
			case 'seek': {
				// Setting currentTime before the element has metadata throws. Hold it and
				// apply it when the metadata arrives.
				if (element.readyState === 0) {
					pendingSeekRef.current = command.seconds
				} else {
					element.currentTime = command.seconds
				}
				break
			}
			case 'start': {
				// Called synchronously inside the gesture handler, with nothing awaited
				// between the `src` assignment above and this line. An `await` here is
				// what mobile Safari refuses.
				void element.play().catch((error: unknown) => {
					// Loading a new source interrupts a play() that has not resolved yet and
					// rejects it with AbortError. That is the Recruiter starting another Song,
					// not a failure — treating it as one puts the Folder they just pressed
					// straight back into a stopped state, and only when they press quickly.
					if (error instanceof DOMException && error.name === 'AbortError') {
						return
					}
					sendRef.current({ type: 'failed' })
				})
				break
			}
			case 'pause': {
				element.pause()
				break
			}
			default:
				break
		}
	}, [])

	const send = useCallback(
		(event: PlayerEvent) => {
			// Read the playhead off the element before any transition. Nothing advances the
			// position during playback — by design, since a state write per frame would
			// re-render the whole stack — so without this a pause records position 0, the
			// progress blocks snap back to the start, and the seek control's next arrow key
			// commits a seek backwards to one second.
			let base = stateRef.current
			if (base.status === 'playing' && audioRef.current !== null && event.type !== 'advanced') {
				base = reducePlayer(base, { type: 'advanced', seconds: audioRef.current.currentTime }).state
			}

			const { state: next, commands } = reducePlayer(base, event)
			stateRef.current = next
			for (const command of commands) {
				apply(command)
			}
			setState(next)

			if (next.status !== 'playing') {
				const duration = next.song?.durationSeconds ?? 0
				writePlayhead(next.song?.id ?? null, duration > 0 ? next.positionSeconds / duration : 0, next.positionSeconds)
			}
		},
		[apply, writePlayhead]
	)

	sendRef.current = send

	// The playhead runs off requestAnimationFrame rather than `timeupdate`, whose rate is
	// unspecified and in practice too coarse for a bar that should look continuous.
	useEffect(() => {
		if (state.status !== 'playing') {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current)
				frameRef.current = null
			}
			return
		}

		const tick = () => {
			const element = audioRef.current
			const song = stateRef.current.song
			if (element !== null && song !== null) {
				writePlayhead(song.id, Math.min(1, element.currentTime / song.durationSeconds), element.currentTime)
			}
			frameRef.current = requestAnimationFrame(tick)
		}
		frameRef.current = requestAnimationFrame(tick)

		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current)
				frameRef.current = null
			}
		}
	}, [state.status, writePlayhead])

	const trackProgress = useCallback((songId: string, node: HTMLElement | null) => {
		if (node === null) {
			progressNodesRef.current.delete(songId)
		} else {
			progressNodesRef.current.set(songId, node)
		}
	}, [])

	const trackSeek = useCallback((songId: string, node: HTMLInputElement | null) => {
		if (node === null) {
			seekNodesRef.current.delete(songId)
		} else {
			seekNodesRef.current.set(songId, node)
		}
	}, [])

	const trackElapsed = useCallback((songId: string, node: HTMLElement | null) => {
		if (node === null) {
			elapsedNodesRef.current.delete(songId)
		} else {
			elapsedNodesRef.current.set(songId, node)
		}
	}, [])

	return (
		<AudioEngineContext.Provider value={{ state, send, trackProgress, trackSeek, trackElapsed }}>
			{children}
			{/* preload="none": nothing is fetched until a Recruiter asks for it, so the page
			    is readable on a slow connection without waiting on media nobody requested. */}
			{/* biome-ignore lint/a11y/useMediaCaption: a music track has no captions to offer;
			    an empty <track> would be a broken promise and one more request. */}
			<audio
				ref={audioRef}
				preload="none"
				onLoadedMetadata={() => {
					const seconds = pendingSeekRef.current
					if (seconds !== null && audioRef.current !== null) {
						audioRef.current.currentTime = seconds
						pendingSeekRef.current = null
					}
				}}
				onPause={() => {
					// Swapping `src` runs the media load algorithm, which can fire `pause` on
					// its way out. That is the old Song being replaced, not the Recruiter
					// stopping — and it is distinguishable without any bookkeeping, because a
					// load drops the element back to HAVE_NOTHING. Nothing that has nothing
					// loaded can meaningfully pause.
					if (audioRef.current === null || audioRef.current.readyState === 0) {
						return
					}
					send({ type: 'stopped' })
				}}
				onEnded={() => send({ type: 'ended' })}
				onError={() => {
					// `error` fires with no `error` object when a load is merely superseded.
					if (audioRef.current?.error == null) {
						return
					}
					send({ type: 'failed' })
				}}
			/>
		</AudioEngineContext.Provider>
	)
}
