import type { GlobalConfig } from 'payload'

/** Every word on the contact page, including the form's own labels (ADR-0003). */
export const Contact: GlobalConfig = {
	slug: 'contact',
	access: {
		read: () => true,
	},
	label: { en: 'Contact page', it: 'Pagina contatti' },
	fields: [
		{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
		{ name: 'intro', type: 'textarea', localized: true, label: { en: 'Intro', it: 'Introduzione' } },
		{
			name: 'form',
			type: 'group',
			label: { en: 'Form', it: 'Modulo' },
			fields: [
				{ name: 'nameLabel', type: 'text', localized: true, label: { en: 'Name field', it: 'Campo nome' } },
				{ name: 'emailLabel', type: 'text', localized: true, label: { en: 'Email field', it: 'Campo email' } },
				{ name: 'messageLabel', type: 'text', localized: true, label: { en: 'Message field', it: 'Campo messaggio' } },
				{ name: 'submitLabel', type: 'text', localized: true, label: { en: 'Send button', it: 'Pulsante invia' } },
				{ name: 'sendingLabel', type: 'text', localized: true, label: { en: 'While sending', it: 'Durante l’invio' } },
			],
		},
		{
			name: 'outcome',
			type: 'group',
			label: { en: 'Outcome messages', it: 'Messaggi di esito' },
			fields: [
				{ name: 'success', type: 'textarea', localized: true, label: { en: 'Sent', it: 'Inviato' } },
				{ name: 'failure', type: 'textarea', localized: true, label: { en: 'Not sent', it: 'Non inviato' } },
				{
					name: 'invalid',
					type: 'textarea',
					localized: true,
					label: { en: 'Missing or wrong fields', it: 'Campi mancanti o errati' },
				},
			],
		},
	],
}
