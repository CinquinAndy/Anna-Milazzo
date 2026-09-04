import type { GlobalConfig } from 'payload'

/**
 * Every word on the landing page (ADR-0003) — headings included, not only the copy
 * inside sections.
 *
 * The arrays are deliberately NOT localized; the text fields inside them are. Anna's
 * skills and her timeline have the same shape and the same order in both languages, only
 * different words. Localizing the array itself instead would mean each locale keeps its
 * own rows, and Payload matches rows across locales by id — so writing English without
 * carrying the Italian row ids silently drops the Italian.
 */
export const Home: GlobalConfig = {
	slug: 'home',
	access: {
		read: () => true,
	},
	label: { en: 'Landing page', it: 'Home' },
	fields: [
		{
			name: 'hero',
			type: 'group',
			label: { en: 'Hero', it: 'Apertura' },
			fields: [
				{ name: 'name', type: 'text', localized: true, required: true, label: { en: 'Name', it: 'Nome' } },
				{
					name: 'tagline',
					type: 'text',
					localized: true,
					required: true,
					label: { en: 'Positioning line', it: 'Frase di posizionamento' },
					admin: {
						description: {
							en: 'What a Recruiter should know in the first two seconds.',
							it: 'Ciò che un recruiter deve capire nei primi due secondi.',
						},
					},
				},
				{
					name: 'portrait',
					type: 'upload',
					relationTo: 'media',
					label: { en: 'Portrait', it: 'Ritratto' },
				},
			],
		},
		{
			name: 'about',
			type: 'group',
			label: { en: 'About', it: 'Chi sono' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{ name: 'body', type: 'textarea', localized: true, label: { en: 'Text', it: 'Testo' } },
			],
		},
		{
			name: 'skills',
			type: 'group',
			label: { en: 'Skills', it: 'Competenze' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{
					name: 'entries',
					type: 'array',
					label: { en: 'Skills', it: 'Competenze' },
					labels: { singular: { en: 'Skill', it: 'Competenza' }, plural: { en: 'Skills', it: 'Competenze' } },
					fields: [{ name: 'name', type: 'text', localized: true, required: true, label: { en: 'Name', it: 'Nome' } }],
				},
			],
		},
		{
			name: 'songs',
			type: 'group',
			label: { en: 'Works', it: 'Brani' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{ name: 'intro', type: 'textarea', localized: true, label: { en: 'Intro', it: 'Introduzione' } },
				{
					name: 'listenLabel',
					type: 'text',
					localized: true,
					label: { en: 'Play control label', it: 'Etichetta del comando di ascolto' },
				},
				{
					name: 'platformLabel',
					type: 'text',
					localized: true,
					label: { en: 'Streaming link label', it: 'Etichetta del link alla piattaforma' },
				},
				{
					name: 'pauseLabel',
					type: 'text',
					localized: true,
					label: { en: 'Pause control label', it: 'Etichetta del comando di pausa' },
				},
				{
					name: 'seekLabel',
					type: 'text',
					localized: true,
					label: { en: 'Seek control label', it: 'Etichetta del cursore di avanzamento' },
					admin: {
						description: {
							en: 'Read aloud by a screen reader; never shown.',
							it: 'Letta da uno screen reader; mai mostrata.',
						},
					},
				},
			],
		},
		{
			name: 'timeline',
			type: 'group',
			label: { en: 'Timeline', it: 'Percorso' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{
					name: 'scrollLabel',
					type: 'text',
					localized: true,
					label: { en: 'Strip label', it: 'Etichetta della striscia' },
					admin: {
						description: {
							en: 'Names the scrollable strip for a screen reader; never shown.',
							it: 'Nomina la striscia scorrevole per uno screen reader; mai mostrata.',
						},
					},
				},
				{
					name: 'entries',
					type: 'array',
					label: { en: 'Entries', it: 'Tappe' },
					labels: { singular: { en: 'Entry', it: 'Tappa' }, plural: { en: 'Entries', it: 'Tappe' } },
					fields: [
						{
							name: 'period',
							type: 'text',
							required: true,
							label: { en: 'Period', it: 'Periodo' },
							admin: {
								description: { en: 'For example 2021–2024.', it: 'Per esempio 2021–2024.' },
							},
						},
						{
							name: 'label',
							type: 'text',
							localized: true,
							required: true,
							label: { en: 'Label', it: 'Titolo' },
						},
						{ name: 'detail', type: 'textarea', localized: true, label: { en: 'Detail', it: 'Dettaglio' } },
					],
				},
			],
		},
		{
			name: 'contactCta',
			type: 'group',
			label: { en: 'Route to contact', it: 'Invito al contatto' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{ name: 'body', type: 'textarea', localized: true, label: { en: 'Text', it: 'Testo' } },
				{
					name: 'buttonLabel',
					type: 'text',
					localized: true,
					label: { en: 'Button label', it: 'Etichetta del pulsante' },
				},
			],
		},
	],
}
