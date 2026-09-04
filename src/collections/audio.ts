import type { CollectionConfig } from 'payload'
import { readTrackPeaks } from '@/lib/player/decode-track'

/** One full track per record. Anna holds the masters — see ADR-0006. */
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
	],
	hooks: {
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
				// missing, so the cost of landing here is cosmetic.
				const peaks = await readTrackPeaks(new Uint8Array(upload.data)).catch(() => null)
				if (peaks === null) {
					req.payload.logger.warn(`Could not measure a waveform for ${upload.name}; the fallback phrase is used.`)
				}
				return { ...data, peaks }
			},
		],
	},
	upload: {
		mimeTypes: ['audio/mpeg'],
		// An audio file has no thumbnail to crop and no sizes to derive.
		focalPoint: false,
	},
}
