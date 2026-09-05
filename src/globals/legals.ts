import type { GlobalConfig } from 'payload'

/**
 * The legals page. Its body is richText rather than textarea because it genuinely has
 * structure, headings, paragraphs, a list of who is behind the site.
 *
 * The trade is that Payload only falls an empty value back to Italian for `text` and
 * `textarea`; richText falls back on null alone. Both languages are therefore written at
 * seed time, and the page checks for an empty body rather than assuming fallback.
 */
export const Legals: GlobalConfig = {
	slug: 'legals',
	access: {
		read: () => true,
	},
	label: { en: 'Legals page', it: 'Note legali' },
	fields: [
		{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
		{ name: 'body', type: 'richText', localized: true, label: { en: 'Body', it: 'Contenuto' } },
	],
}
