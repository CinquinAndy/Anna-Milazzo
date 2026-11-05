import { APIError, type CollectionConfig } from 'payload'
import { readTrack } from '@/lib/player/decode-track'
import { silentSongsMessage, songsLeftSilent } from '@/lib/song-sound'

/** One full track per record. Anna holds the masters, see ADR-0006. */
export const Audio: CollectionConfig = {
	slug: 'audio',
	access: {
		read: () => true,
	},
	admin: {
		useAsTitle: 'filename',
	},
	fields: [
		{
			name: 'peaks',
			type: 'json',
			// Measured from the file, never typed. Shown nowhere and editable by nobody:
			// there is no answer Anna could give here that the audio does not already
			// contain, and a hand-edited waveform is a drawing of a different track.
			admin: { hidden: true },
			access: { create: () => false, update: () => false },
			// Without this a `json` field types as `unknown`, and every reader downstream
			// casts. The shape is fixed by `summarise`, so it may as well be declared.
			typescriptSchema: [() => ({ type: 'array', items: { type: 'number' } })],
		},
		{
			name: 'tone',
			type: 'json',
			// Where the track's energy sits in the spectrum over time, one reading per peak.
			// Small enough to travel with the page, which is the whole reason it is a
			// centroid rather than the spectrum it was folded from.
			admin: { hidden: true },
			access: { create: () => false, update: () => false },
			typescriptSchema: [() => ({ type: 'array', items: { type: 'number' } })],
		},
	],
	hooks: {
		// Deleting a file a Song still plays would leave that Song with nothing to play:
		// Postgres empties `songs.track_id` on its own (`ON DELETE set null`), past every rule
		// of the Songs collection. Refused while it would, and the refusal says which Song to
		// change first. A Song with a video to fall back on does not hold the file. ADR-0006.
		beforeDelete: [
			async ({ id, req }) => {
				const { docs } = await req.payload.find({
					collection: 'songs',
					where: { track: { equals: id } },
					depth: 0,
					pagination: false,
					req,
				})
				const silent = songsLeftSilent(docs)
				if (silent.length > 0) {
					throw new APIError(silentSongsMessage(silent), 409, null, true)
				}
			},
		],
		beforeChange: [
			async ({ data, req }) => {
				const upload = req.file
				if (upload === undefined) {
					// A metadata-only update. Leave whatever was measured from the file that
					// is still on the record.
					return data
				}

				// A failed decode is not a failed upload. Anna uploading a file this build of
				// the decoder cannot read should still get a working Song with a playable
				// track; the transport falls back to its authored phrase when peaks are
				// missing and the visualiser simply stays still, so the cost of landing here
				// is cosmetic.
				const measured = await readTrack(new Uint8Array(upload.data)).catch(() => null)
				if (measured === null) {
					req.payload.logger.warn(`Could not measure ${upload.name}; the fallback phrase is used.`)
					return { ...data, peaks: null, tone: null }
				}
				return { ...data, peaks: measured.peaks, tone: measured.tone }
			},
		],
	},
	upload: {
		mimeTypes: ['audio/mpeg'],
		// An audio file has no thumbnail to crop and no sizes to derive.
		focalPoint: false,
	},
}
