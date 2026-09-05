/**
 * The player's state, as a pure function.
 *
 * No React and no DOM in the interface, this module never touches an `<audio>` element.
 * It takes an event, returns the next state and a list of commands for whoever owns the
 * element to run. That separation is what makes the awkward cases testable: iOS permits
 * one audio stream at a time and refuses `play()` unless it is called synchronously
 * inside the gesture, so the transitions have to be decided without awaiting anything.
 */

export type PlayableSong = {
	/** Stable handle, the Song's `reference`. */
	id: string
	/** Absolute URL on the bucket's public domain. */
	source: string
	/** Stored on the Song, so a running time needs no audio loaded. */
	durationSeconds: number
}

export type PlayerStatus = 'idle' | 'playing' | 'paused'

export type PlayerState = {
	status: PlayerStatus
	song: PlayableSong | null
	positionSeconds: number
	/** Set when the media element could not play what it was given. */
	failed: boolean
}

export type PlayerEvent =
	| { type: 'pressedPlay'; song: PlayableSong }
	| { type: 'pressedPause' }
	| { type: 'scrubbed'; song: PlayableSong; seconds: number }
	| { type: 'advanced'; seconds: number }
	/** The element paused. Always fires just before `ended`, per the HTML spec. */
	| { type: 'stopped' }
	| { type: 'ended' }
	| { type: 'failed' }

/**
 * What the element owner must do, in order, synchronously.
 *
 * `load` assigns `src`; `start` calls `play()`. Nothing may be awaited between them or
 * mobile Safari treats the call as unauthorised and refuses it.
 */
export type PlayerCommand =
	| { kind: 'load'; source: string }
	| { kind: 'seek'; seconds: number }
	| { kind: 'start' }
	| { kind: 'pause' }

export const initialPlayerState: PlayerState = {
	status: 'idle',
	song: null,
	positionSeconds: 0,
	failed: false,
}

export type PlayerTransition = {
	state: PlayerState
	commands: PlayerCommand[]
}

function clamp(seconds: number, duration: number): number {
	if (!Number.isFinite(seconds) || seconds < 0) {
		return 0
	}
	return Math.min(seconds, duration)
}

export function reducePlayer(state: PlayerState, event: PlayerEvent): PlayerTransition {
	switch (event.type) {
		case 'pressedPlay': {
			const isCurrent = state.song?.id === event.song.id

			// Pressing the Song that is already playing pauses it.
			if (isCurrent && state.status === 'playing') {
				return { state: { ...state, status: 'paused' }, commands: [{ kind: 'pause' }] }
			}

			// Resuming where it was left.
			if (isCurrent && state.status === 'paused') {
				return { state: { ...state, status: 'playing', failed: false }, commands: [{ kind: 'start' }] }
			}

			// A different Song, or the first press. Replacing the source is what makes
			// "only one plays" structural rather than something to coordinate: there is
			// one element, and it can hold one source.
			return {
				state: { status: 'playing', song: event.song, positionSeconds: 0, failed: false },
				commands: [{ kind: 'load', source: event.song.source }, { kind: 'start' }],
			}
		}

		case 'pressedPause': {
			if (state.status !== 'playing') {
				return { state, commands: [] }
			}
			return { state: { ...state, status: 'paused' }, commands: [{ kind: 'pause' }] }
		}

		case 'scrubbed': {
			const seconds = clamp(event.seconds, event.song.durationSeconds)
			const isCurrent = state.song?.id === event.song.id

			// Scrubbing a Song that is not loaded selects it, at that position, without
			// starting it, a Recruiter dragging a bar has not asked to hear anything yet.
			if (!isCurrent) {
				return {
					state: { status: 'paused', song: event.song, positionSeconds: seconds, failed: false },
					commands: [
						{ kind: 'load', source: event.song.source },
						{ kind: 'seek', seconds },
					],
				}
			}

			return { state: { ...state, positionSeconds: seconds }, commands: [{ kind: 'seek', seconds }] }
		}

		case 'advanced': {
			// Only the element that is running may move the playhead.
			if (state.status !== 'playing' || state.song === null) {
				return { state, commands: [] }
			}
			return { state: { ...state, positionSeconds: clamp(event.seconds, state.song.durationSeconds) }, commands: [] }
		}

		case 'stopped': {
			if (state.status !== 'playing') {
				return { state, commands: [] }
			}
			return { state: { ...state, status: 'paused' }, commands: [] }
		}

		case 'ended': {
			// Back to the start, and stopped. Nothing auto-advances: a Portfolio is not a
			// radio, and audio starting unbidden on a page someone is reading is a bad
			// surprise (ADR-0007).
			return { state: { ...state, status: 'idle', positionSeconds: 0 }, commands: [] }
		}

		case 'failed': {
			// Without this the Folder would sit at `playing` forever on a dead URL.
			return { state: { ...state, status: 'idle', positionSeconds: 0, failed: true }, commands: [] }
		}

		default: {
			return { state, commands: [] }
		}
	}
}

/** Whether `songId` is the Song currently running. */
export function isPlaying(state: PlayerState, songId: string): boolean {
	return state.status === 'playing' && state.song?.id === songId
}

/** How far through `songId` we are, 0 to 1. Zero for every other Song. */
export function progressOf(state: PlayerState, songId: string): number {
	if (state.song?.id !== songId || state.song.durationSeconds <= 0) {
		return 0
	}
	return Math.min(1, state.positionSeconds / state.song.durationSeconds)
}

/**
 * `m:ss`. Lives here rather than in the transport because two places need it: the
 * transport renders the total once at build, and the engine rewrites the elapsed reading
 * every frame without going through React.
 */
export function formatRunningTime(seconds: number): string {
	const whole = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0))
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}
