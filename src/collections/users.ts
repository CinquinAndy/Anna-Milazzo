import type { CollectionConfig } from 'payload'

/** Anna, and anyone else who edits the Portfolio. Email plus password is added by `auth`. */
export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
	},
	auth: true,
	fields: [],
}
