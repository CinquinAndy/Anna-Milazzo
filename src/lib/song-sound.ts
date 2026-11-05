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

/** What `songsLeftSilent` needs to know of a Song that points at an audio file. */
type Dependant = { id: number | string; title?: string | null; videoUrl?: string | null }

/**
 * The Songs that deleting an audio file would leave with nothing to play.
 *
 * Postgres answers the deletion of an Audio record with `ON DELETE set null` on
 * `songs.track_id`, without passing through Payload, so `validateTrack` never sees the
 * Song it empties. While the audio was required, the column's NOT NULL refused it; since
 * it is optional the deletion goes through, and a Song without a video is left with a
 * cover and no sound. The Audio collection asks this before it deletes, and refuses while
 * the answer is not empty. A Song that has a video it can fall back on is not counted: it
 * becomes a video-only Song, which is a Song the site knows how to show. ADR-0006.
 */
export function songsLeftSilent<T extends Dependant>(songs: readonly T[]): T[] {
	return songs.filter(song => parseVideo(song.videoUrl) === null)
}

/** The refusal Anna reads in the admin, in both languages, naming the Songs to change first. */
export function silentSongsMessage(songs: readonly Dependant[]): string {
	const titles = songs.map(song => `“${song.title || `#${song.id}`}”`).join(', ')
	return (
		`This audio is still used by ${titles}. Remove it from the work first, or add a video link to the work. · ` +
		`Questo audio è ancora usato da ${titles}. Toglilo prima dal brano, oppure aggiungi al brano un link a un video.`
	)
}
