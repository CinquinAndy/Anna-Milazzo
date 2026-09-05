import type { GlobalConfig } from 'payload'

/** Site-wide chrome: where to write to Anna, and where else to find her. */
export const Settings: GlobalConfig = {
	slug: 'settings',
	access: {
		read: () => true,
	},
	label: { en: 'Settings', it: 'Impostazioni' },
	fields: [
		{
			name: 'contactEmail',
			type: 'email',
			// Not localized: an address is an address.
			label: { en: 'Public contact address', it: 'Indirizzo di contatto pubblico' },
		},
		{
			name: 'socialLinks',
			type: 'array',
			label: { en: 'Elsewhere', it: 'Altrove' },
			labels: { singular: { en: 'Link', it: 'Link' }, plural: { en: 'Links', it: 'Link' } },
			fields: [
				{ name: 'label', type: 'text', localized: true, required: true, label: { en: 'Label', it: 'Etichetta' } },
				{ name: 'url', type: 'text', required: true, label: { en: 'URL', it: 'URL' } },
			],
		},
		{
			name: 'navHeading',
			type: 'text',
			localized: true,
			label: { en: 'Footer nav heading', it: 'Titolo della navigazione a piè di pagina' },
			admin: {
				description: {
					en: 'Heads the list of pages in the footer. Left empty, the list is still there and simply has no heading.',
					it: 'Intesta l’elenco delle pagine a piè di pagina. Se vuoto, l’elenco resta ma senza titolo.',
				},
			},
		},
		{
			name: 'elsewhereHeading',
			type: 'text',
			localized: true,
			label: { en: 'Footer links heading', it: 'Titolo dei link a piè di pagina' },
			admin: {
				description: {
					en: 'Heads the links above. Same word as on the contact page, kept separate so the two can differ.',
					it: 'Intesta i link qui sopra. La stessa parola della pagina contatti, tenuta separata perché le due possano differire.',
				},
			},
		},
		{
			name: 'legalsLinkLabel',
			type: 'text',
			localized: true,
			label: { en: 'Legals link label', it: 'Etichetta del link alle note legali' },
		},
	],
}
