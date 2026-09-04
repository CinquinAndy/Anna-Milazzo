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
			name: 'legalsLinkLabel',
			type: 'text',
			localized: true,
			label: { en: 'Legals link label', it: 'Etichetta del link alle note legali' },
		},
	],
}
