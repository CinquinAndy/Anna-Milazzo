import { parseVideo } from '@/lib/video'

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
