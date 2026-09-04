import type { CollectionConfig } from 'payload'

/** One full track per record. Anna holds the masters — see ADR-0006. */
export const Audio: CollectionConfig = {
	slug: 'audio',
	access: {
		read: () => true,
	},
	admin: {
		useAsTitle: 'filename',
	},
	fields: [],
	upload: {
		mimeTypes: ['audio/mpeg'],
		// An audio file has no thumbnail to crop and no sizes to derive.
		focalPoint: false,
	},
}
