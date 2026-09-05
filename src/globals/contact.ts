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
				{
					name: 'heading',
					type: 'text',
					localized: true,
					label: { en: 'Heading', it: 'Titolo' },
					admin: {
						description: {
							en: 'The black band above the form, and the name a screen reader gives it. Set edge to edge, so keep it short.',
							it: 'La fascia nera sopra il modulo, e il nome che uno screen reader dà al modulo. È composto da bordo a bordo, quindi tenetelo corto.',
						},
					},
				},
				{
					name: 'requiredNote',
					type: 'text',
					localized: true,
					label: { en: 'Required-fields note', it: 'Nota sui campi obbligatori' },
					admin: {
						description: {
							en: 'Sits above the fields. All three are required.',
							it: 'Sta sopra i campi. Sono tutti e tre obbligatori.',
						},
					},
				},
				{ name: 'nameLabel', type: 'text', localized: true, label: { en: 'Name field', it: 'Campo nome' } },
				{ name: 'emailLabel', type: 'text', localized: true, label: { en: 'Email field', it: 'Campo email' } },
				{ name: 'messageLabel', type: 'text', localized: true, label: { en: 'Message field', it: 'Campo messaggio' } },
				{ name: 'submitLabel', type: 'text', localized: true, label: { en: 'Send button', it: 'Pulsante invia' } },
				{ name: 'sendingLabel', type: 'text', localized: true, label: { en: 'While sending', it: 'Durante l’invio' } },
				{
					name: 'checkLabel',
					type: 'text',
					localized: true,
					label: { en: 'Anti-bot check label', it: 'Etichetta del controllo anti-bot' },
					admin: {
						description: {
							en: 'Names the Cloudflare box, which is the one object on this site drawn by somebody else.',
							it: 'Dà un nome al riquadro di Cloudflare, l’unico oggetto di questo sito disegnato da qualcun altro.',
						},
					},
				},
				{
					name: 'checkNote',
					type: 'text',
					localized: true,
					label: { en: 'Anti-bot check note', it: 'Nota del controllo anti-bot' },
					admin: {
						description: {
							en: 'Shown when the check is what stopped the message. Without it the form says "check the fields marked" with nothing marked.',
							it: 'Mostrata quando è il controllo ad avere fermato il messaggio. Senza, il modulo dice di controllare i campi segnalati senza segnalarne nessuno.',
						},
					},
				},
				{
					name: 'missingNote',
					type: 'text',
					localized: true,
					label: { en: 'Missing-field note', it: 'Nota di campo mancante' },
					admin: {
						description: {
							en: 'Shown under a field that was left empty.',
							it: 'Mostrata sotto un campo lasciato vuoto.',
						},
					},
				},
				{
					name: 'emailNote',
					type: 'text',
					localized: true,
					label: { en: 'Bad-address note', it: 'Nota di indirizzo non valido' },
					admin: {
						description: {
							en: 'Shown under an address that could not receive a reply.',
							it: 'Mostrata sotto un indirizzo che non potrebbe ricevere una risposta.',
						},
					},
				},
				{
					name: 'privacyNote',
					type: 'textarea',
					localized: true,
					label: { en: 'Privacy note', it: 'Nota sulla privacy' },
					admin: {
						description: {
							en: 'Beside the send button. The form stores nothing (ADR-0005) and that is worth saying here, not only on the legals page.',
							it: 'Accanto al pulsante di invio. Il modulo non conserva nulla (ADR-0005), e vale la pena dirlo qui, non solo nelle note legali.',
						},
					},
				},
			],
		},
		{
			name: 'brief',
			type: 'group',
			label: { en: 'What to write', it: 'Cosa scrivere' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{ name: 'intro', type: 'textarea', localized: true, label: { en: 'Intro', it: 'Introduzione' } },
				{
					name: 'points',
					type: 'array',
					label: { en: 'Points', it: 'Punti' },
					labels: { singular: { en: 'Point', it: 'Punto' }, plural: { en: 'Points', it: 'Punti' } },
					admin: {
						description: {
							en: 'What a first message should carry so it can be answered rather than queried.',
							it: 'Cosa deve contenere un primo messaggio perché possa avere una risposta e non altre domande.',
						},
					},
					fields: [{ name: 'text', type: 'text', localized: true, required: true, label: { en: 'Text', it: 'Testo' } }],
				},
			],
		},
		{
			name: 'practical',
			type: 'group',
			label: { en: 'In practice', it: 'In pratica' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{
					name: 'entries',
					type: 'array',
					label: { en: 'Facts', it: 'Voci' },
					labels: { singular: { en: 'Fact', it: 'Voce' }, plural: { en: 'Facts', it: 'Voci' } },
					admin: {
						description: {
							en: 'Short, checkable facts. Nothing with a date in it: a claim that rots is worse than no claim.',
							it: 'Fatti brevi e verificabili. Niente con una data dentro: un’affermazione che scade è peggio di nessuna affermazione.',
						},
					},
					fields: [
						{
							name: 'term',
							type: 'text',
							localized: true,
							required: true,
							label: { en: 'Term', it: 'Voce' },
							admin: {
								description: {
									en: 'Printed on the card’s tab, so two or three words at most.',
									it: 'Stampata sulla linguetta della scheda, quindi due o tre parole al massimo.',
								},
							},
						},
						{
							name: 'value',
							type: 'textarea',
							localized: true,
							required: true,
							label: { en: 'Value', it: 'Contenuto' },
						},
					],
				},
			],
		},
		{
			name: 'direct',
			type: 'group',
			label: { en: 'By email', it: 'Per email' },
			fields: [
				{ name: 'heading', type: 'text', localized: true, label: { en: 'Heading', it: 'Titolo' } },
				{
					name: 'note',
					type: 'textarea',
					localized: true,
					label: { en: 'Note', it: 'Nota' },
					admin: {
						description: {
							en: 'The address comes from Settings, not from here. This block renders nothing while that field is empty.',
							it: 'L’indirizzo viene dalle Impostazioni, non da qui. Questo blocco non mostra niente finché quel campo è vuoto.',
						},
					},
				},
				{
					name: 'elsewhereHeading',
					type: 'text',
					localized: true,
					label: { en: 'Elsewhere heading', it: 'Titolo di Altrove' },
					admin: {
						description: {
							en: 'Heads the links from Settings, repeated on the page at a readable size.',
							it: 'Intesta i link delle Impostazioni, ripetuti nella pagina a una dimensione leggibile.',
						},
					},
				},
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
