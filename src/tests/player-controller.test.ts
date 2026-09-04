import { describe, expect, it } from 'vitest'
import {
	initialPlayerState,
	isPlaying,
	type PlayableSong,
	type PlayerEvent,
	type PlayerState,
	progressOf,
	reducePlayer,
} from '@/lib/player/controller'

const NOTTURNO: PlayableSong = {
	id: 'notturno-per-tram-vuoto',
	source: 'https://audio.example/audio/notturno.mp3',
	durationSeconds: 24,
}

const TEMPORALE: PlayableSong = {
	id: 'perche-il-temporale',
	source: 'https://audio.example/audio/temporale.mp3',
	durationSeconds: 31,
}

/** Runs a sequence of events and returns the final state and the commands each produced. */
function run(events: PlayerEvent[], from: PlayerState = initialPlayerState) {
	let state = from
	const commands = events.map(event => {
		const transition = reducePlayer(state, event)
		state = transition.state
		return transition.commands
	})
	return { state, commands }
}

describe('a Recruiter pressing play', () => {
	it('starts the Song, loading it before starting it', () => {
		const { state, commands } = run([{ type: 'pressedPlay', song: NOTTURNO }])

		expect(state.status).toBe('playing')
		expect(state.song?.id).toBe(NOTTURNO.id)
		expect(state.positionSeconds).toBe(0)
		// The order matters: the source has to be assigned before play() is called, and
		// nothing may go between them.
		expect(commands[0]).toEqual([{ kind: 'load', source: NOTTURNO.source }, { kind: 'start' }])
	})

	it('pauses when the same Song is pressed again', () => {
		const { state, commands } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 9 },
			{ type: 'pressedPlay', song: NOTTURNO },
		])

		expect(state.status).toBe('paused')
		// Where it was left, not back to the start.
		expect(state.positionSeconds).toBe(9)
		expect(commands[2]).toEqual([{ kind: 'pause' }])
	})

	it('resumes from where it was left, without reloading', () => {
		const { state, commands } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 9 },
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'pressedPlay', song: NOTTURNO },
		])

		expect(state.status).toBe('playing')
		expect(state.positionSeconds).toBe(9)
		expect(commands[3]).toEqual([{ kind: 'start' }])
	})
})

describe('a Recruiter starting a second Song', () => {
	it('leaves only the second one playing', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 11 },
			{ type: 'pressedPlay', song: TEMPORALE },
		])

		expect(state.song?.id).toBe(TEMPORALE.id)
		expect(isPlaying(state, TEMPORALE.id)).toBe(true)
		expect(isPlaying(state, NOTTURNO.id)).toBe(false)
	})

	it('starts the second one from the beginning, not from the first one’s position', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 11 },
			{ type: 'pressedPlay', song: TEMPORALE },
		])

		expect(state.positionSeconds).toBe(0)
	})

	it('replaces the source rather than adding one', () => {
		const { commands } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'pressedPlay', song: TEMPORALE },
		])

		expect(commands[1]).toEqual([{ kind: 'load', source: TEMPORALE.source }, { kind: 'start' }])
	})
})

describe('seeking', () => {
	it('moves the playhead of the Song already loaded', () => {
		const { state, commands } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'scrubbed', song: NOTTURNO, seconds: 18 },
		])

		expect(state.positionSeconds).toBe(18)
		expect(state.status).toBe('playing')
		expect(commands[1]).toEqual([{ kind: 'seek', seconds: 18 }])
	})

	it('never moves past the end of the Song', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'scrubbed', song: NOTTURNO, seconds: 9999 },
		])

		expect(state.positionSeconds).toBe(NOTTURNO.durationSeconds)
	})

	it('never moves before the start', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'scrubbed', song: NOTTURNO, seconds: -12 },
		])

		expect(state.positionSeconds).toBe(0)
	})

	it('scrubbing a Song that is not loaded selects it without starting it', () => {
		const { state, commands } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'scrubbed', song: TEMPORALE, seconds: 12 },
		])

		expect(state.song?.id).toBe(TEMPORALE.id)
		expect(state.status).toBe('paused')
		expect(state.positionSeconds).toBe(12)
		// Loaded and positioned, but no `start`: dragging a bar is not asking to hear it.
		expect(commands[1]).toEqual([
			{ kind: 'load', source: TEMPORALE.source },
			{ kind: 'seek', seconds: 12 },
		])
	})
})

describe('reaching the end', () => {
	// The HTML spec fires `pause` before `ended`, always. Testing `ended` alone would
	// assert against a sequence the element never actually produces.
	it('resets to the start and stops, through the pause the element really sends first', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 24 },
			{ type: 'stopped' },
			{ type: 'ended' },
		])

		expect(state.status).toBe('idle')
		expect(state.positionSeconds).toBe(0)
	})

	it('does not start the next Song', () => {
		const { state, commands } = run([{ type: 'pressedPlay', song: NOTTURNO }, { type: 'stopped' }, { type: 'ended' }])

		expect(state.song?.id).toBe(NOTTURNO.id)
		expect(commands.flat().filter(c => c.kind === 'start')).toHaveLength(1)
	})
})

describe('when the audio cannot play', () => {
	it('stops reading as playing, so the Folder does not lie', () => {
		const { state } = run([{ type: 'pressedPlay', song: NOTTURNO }, { type: 'failed' }])

		expect(state.status).toBe('idle')
		expect(state.failed).toBe(true)
		expect(isPlaying(state, NOTTURNO.id)).toBe(false)
	})

	it('clears the failure when the Recruiter tries again', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'failed' },
			{ type: 'pressedPlay', song: NOTTURNO },
		])

		expect(state.failed).toBe(false)
		expect(state.status).toBe('playing')
	})
})

describe('events that arrive when nothing is playing', () => {
	it('ignores a playhead update', () => {
		const { state } = run([{ type: 'advanced', seconds: 12 }])
		expect(state.positionSeconds).toBe(0)
	})

	it('ignores a pause', () => {
		const { state, commands } = run([{ type: 'pressedPause' }])
		expect(state.status).toBe('idle')
		expect(commands[0]).toEqual([])
	})
})

describe('progress', () => {
	it('is zero for every Song but the one loaded', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 12 },
		])

		expect(progressOf(state, NOTTURNO.id)).toBeCloseTo(0.5, 5)
		expect(progressOf(state, TEMPORALE.id)).toBe(0)
	})

	it('never exceeds one', () => {
		const { state } = run([
			{ type: 'pressedPlay', song: NOTTURNO },
			{ type: 'advanced', seconds: 24 },
		])

		expect(progressOf(state, NOTTURNO.id)).toBe(1)
	})
})
