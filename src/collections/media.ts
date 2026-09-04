import type { CollectionConfig } from 'payload'

/** Images: Song covers and Anna's portrait. */
export const Media: CollectionConfig = {
	slug: 'media',
	access: {
		// Payload requires a logged-in user by default; the Portfolio is public.
		read: () => true,
	},
	admin: {
		useAsTitle: 'alt',
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			// Alternative text is read aloud to a Recruiter, so it is copy like any other
			// (ADR-0003). Localized now because switching a field to localized after data
			// exists destroys that field's data.
			localized: true,
			required: true,
			label: { en: 'Alternative text', it: 'Testo alternativo' },
		},
	],
	upload: {
		mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
	},
}
