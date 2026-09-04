import type { CollectionConfig } from 'payload'

/**
 * One audio work by Anna: a title, a story, a cover, the audio itself, and an optional
 * link out to a streaming platform. Covers a composition, a study exercise and a
 * Commission alike.
 *
 * `title` and `story` are `text`/`textarea` rather than richText on purpose. Payload
 * falls back an empty string to the default locale only for those two types; every other
 * type, richText included, falls back only on null. A Song Anna has not translated yet
 * has to render its Italian story in English rather than a blank — that is an acceptance
 * criterion, so the field types are chosen to make it true.
 */
export const Songs: CollectionConfig = {
	slug: 'songs',
	access: {
		read: () => true,
	},
	admin: {
		useAsTitle: 'title',
		defaultColumns: ['title', 'order', 'platformUrl'],
		description: {
			en: 'The works shown on the landing page, in the order set below.',
			it: 'I brani mostrati sulla home, nell’ordine impostato qui sotto.',
		},
	},
	defaultSort: 'order',
	fields: [
		{
			name: 'title',
			type: 'text',
			localized: true,
			required: true,
			label: { en: 'Title', it: 'Titolo' },
		},
		{
			name: 'story',
			type: 'textarea',
			localized: true,
			// Not required: a required localized field means Anna cannot save at all
			// while the admin is showing English until she has written the English.
			label: { en: 'Story', it: 'Storia' },
			admin: {
				description: {
					en: 'Left empty in English, the Italian text is shown instead.',
					it: 'Se lasciata vuota in inglese, viene mostrato il testo italiano.',
				},
			},
		},
		{
			name: 'cover',
			type: 'upload',
			relationTo: 'media',
			required: true,
			label: { en: 'Cover image', it: 'Copertina' },
		},
		{
			name: 'track',
			type: 'upload',
			relationTo: 'audio',
			required: true,
			label: { en: 'Audio', it: 'Audio' },
		},
		{
			name: 'durationSeconds',
			type: 'number',
			required: true,
			min: 1,
			label: { en: 'Duration in seconds', it: 'Durata in secondi' },
			admin: {
				description: {
					en: 'Stored here so the page can show a running time without loading the audio.',
					it: 'Memorizzata qui per mostrare la durata senza caricare l’audio.',
				},
			},
		},
		{
			name: 'platformUrl',
			type: 'text',
			// Deliberately optional and deliberately not localized: the same track on the
			// same platform is one URL. Empty means the Folder shows no link at all.
			label: { en: 'Streaming link', it: 'Link alla piattaforma' },
			admin: {
				description: {
					en: 'Optional. Left empty, no link is shown.',
					it: 'Facoltativo. Se vuoto, non viene mostrato alcun link.',
				},
			},
		},
		{
			name: 'order',
			type: 'number',
			required: true,
			defaultValue: 0,
			label: { en: 'Order', it: 'Ordine' },
			admin: {
				description: {
					en: 'Lowest first. Anna’s strongest work goes at the top.',
					it: 'Dal più basso al più alto. Il lavoro migliore va in cima.',
				},
			},
		},
		{
			name: 'reference',
			type: 'text',
			unique: true,
			index: true,
			// A stable handle the seed can upsert against and the tests can select by, so
			// neither depends on a title Anna is free to rewrite.
			admin: { hidden: true },
		},
	],
}
