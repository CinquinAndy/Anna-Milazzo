import type { PlayableSong } from '@/lib/player/controller'
import { parseVideo } from '@/lib/video'
import type { Song } from '@/payload-types'

/**
 * What a Song has to carry to be worth showing: its audio, a video, or both.
 *
 * The audio used to be required. Anna's short film and her logo sound design are on YouTube
 * with their sound, and the site made her upload the same sound again as an audio file,
 * which then put a record on works that are not records, and took space for nothing (her
 * message of 5 November). A video already carries the sound. ADR-0006.
 *
 * Pure, so the admin's rules can be tested without Payload: `songs.ts` passes each field's
 * value and its siblings in.
 */
type Siblings = { track?: unknown; videoUrl?: unknown }

/** Payload hands the siblings over untyped. */
const read = (siblings: unknown): Siblings =>
	siblings !== null && typeof siblings === 'object' ? (siblings as Siblings) : {}

const present = (value: unknown) => value !== null && value !== undefined && value !== ''

/** The audio field: may be empty only when a video the site can embed is given. */
export function validateTrack(value: unknown, siblingData: unknown): true | string {
	if (present(value)) {
		return true
	}
	const { videoUrl } = read(siblingData)
	return parseVideo(typeof videoUrl === 'string' ? videoUrl : null) === null
		? 'Add the audio, or a video link that carries the sound. · Aggiungi l’audio, oppure un link a un video che porti il suono.'
		: true
}

/** The running time: needed exactly when there is audio to time, and a whole second at least. */
export function validateDuration(value: unknown, siblingData: unknown): true | string {
	if (!hasTrack(siblingData)) {
		return true
	}
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return 'Give the duration of the audio, in seconds. · Indica la durata dell’audio, in secondi.'
	}
	return value >= 1 ? true : 'At least 1 second. · Almeno 1 secondo.'
}

/** Whether the duration field is shown at all: only beside an audio file. */
export function hasTrack(siblingData: unknown): boolean {
	return present(read(siblingData).track)
}

/**
 * The Song as the player knows it, or null when there is nothing for the player to play.
 *
 * One answer for the sheet, which draws a transport and a record only for a playable Song,
 * and for its Tab, which shows the turning disc while that Song sounds. Asking "is there a
 * track" in one place and "is there a URL and a duration" in the other let a Song whose
 * audio came back as a bare id, or without a URL, keep a play handle on its Tab with no
 * player anywhere to answer it.
 *
 * `reference` is a seed handle and a test selector, hidden from the admin, so every Song
 * Anna creates herself has none. Falling back to the record id keeps the player present
 * for those.
 */
export function playableSong(song: Pick<Song, 'id' | 'reference' | 'track' | 'durationSeconds'>): PlayableSong | null {
	const track = song.track
	const source = track !== null && track !== undefined && typeof track === 'object' ? track.url : null
	if (!source || !song.durationSeconds) {
		return null
	}
	return { id: song.reference ?? String(song.id), source, durationSeconds: song.durationSeconds }
}
