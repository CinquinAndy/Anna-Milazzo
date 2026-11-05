import { describe, expect, it } from 'vitest'
import { hasTrack, validateDuration, validateTrack } from '@/lib/song-sound'

const VIDEO = 'https://youtu.be/M7lc1UVf-VE'

describe('what a Song has to carry', () => {
	it('takes an audio file on its own, as before', () => {
		expect(validateTrack(17, { videoUrl: null })).toBe(true)
	})

	it('takes a video on its own: the video carries the sound', () => {
		expect(validateTrack(null, { videoUrl: VIDEO })).toBe(true)
		expect(validateTrack(undefined, { videoUrl: VIDEO })).toBe(true)
	})

	it('takes both', () => {
		expect(validateTrack(17, { videoUrl: VIDEO })).toBe(true)
	})

	it('refuses neither, in both languages', () => {
		const message = validateTrack(null, { videoUrl: '' })
		expect(message).toMatch(/video link that carries the sound/)
		expect(message).toMatch(/Aggiungi l’audio/)
	})

	it('refuses a link the site cannot play in place of the audio', () => {
		expect(validateTrack(null, { videoUrl: 'https://example.com/film.mp4' })).not.toBe(true)
	})

	it('copes with the siblings Payload sends when there are none', () => {
		expect(validateTrack(null, undefined)).not.toBe(true)
		expect(validateTrack(5, null)).toBe(true)
	})
})

describe('the running time', () => {
	it('is required beside an audio file, at a second or more', () => {
		expect(validateDuration(192, { track: 17 })).toBe(true)
		expect(validateDuration(null, { track: 17 })).toMatch(/duration of the audio/)
		expect(validateDuration(0, { track: 17 })).toMatch(/At least 1 second/)
	})

	it('is not asked for, and not shown, without one', () => {
		expect(validateDuration(null, { track: null, videoUrl: VIDEO })).toBe(true)
		expect(hasTrack({ track: null })).toBe(false)
		expect(hasTrack({ track: 17 })).toBe(true)
		expect(hasTrack({ track: { id: 17 } })).toBe(true)
	})
})
