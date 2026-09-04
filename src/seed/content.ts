/**
 * The first version of every word on the Portfolio, in both languages.
 *
 * ADR-0003: we write this so the copy is good, and Anna edits from there without a
 * deploy. It is placeholder in the sense that none of it is true yet — Anna's real
 * titles, stories, timeline and platform links are still outstanding — but it is
 * deliberately written at realistic length, because Italian short strings expand
 * 200–300% from English and the layout has to be judged against the longer text.
 */

import type { Locale } from '@/lib/locale'

export type SeedSong = {
	/** Stable handle. The seed upserts on it and the tests select by it. */
	reference: string
	order: number
	durationSeconds: number
	platformUrl?: string
	it: { title: string; story: string }
	/** `story` absent means untranslated: English must fall back to the Italian. */
	en: { title: string; story?: string }
}

export const SEED_SONGS: readonly SeedSong[] = [
	{
		reference: 'notturno-per-tram-vuoto',
		order: 1,
		durationSeconds: 24,
		platformUrl: 'https://open.spotify.com/track/placeholder-notturno',
		it: {
			title: 'Notturno per tram vuoto',
			story:
				'Registrato all’una di notte sulla linea 4, con il registratore appoggiato sul sedile. ' +
				'Il tram vuoto ha una sua acustica: il metallo risuona a lungo e ogni fermata è una pausa ' +
				'scritta. Ho tenuto il rumore di fondo e ci ho costruito sopra il pianoforte, invece di ' +
				'toglierlo. Non è un brano sulla città addormentata, è un brano su chi la attraversa mentre dorme.',
		},
		en: {
			title: 'Nocturne for an Empty Tram',
			story:
				'Recorded at one in the morning on the number 4, with the recorder resting on the seat. ' +
				'An empty tram has an acoustic of its own: the metal rings for a long time and every stop ' +
				'is a written rest. I kept the room tone and built the piano on top of it rather than ' +
				'clearing it away. This is not a piece about a sleeping city; it is about crossing one while it sleeps.',
		},
	},
	{
		reference: 'perche-il-temporale',
		order: 2,
		durationSeconds: 31,
		platformUrl: 'https://open.spotify.com/track/placeholder-temporale',
		it: {
			title: 'Perché il temporale',
			story:
				'Un esercizio diventato un brano. Dovevo studiare la modulazione e ho scelto come vincolo ' +
				'un temporale registrato dalla finestra di casa: ogni tuono impone un cambio di tonalità, ' +
				'e la pioggia detta il tempo. Il risultato non è programmatico, è quasi il contrario — ' +
				'la struttura è arrivata da fuori e io ho solo dovuto starle dietro.',
		},
		// No English story: the fallback case. English must show the Italian rather than
		// an empty panel.
		en: {
			title: 'Why the Storm',
		},
	},
	{
		reference: 'citta-alle-quattro',
		order: 3,
		durationSeconds: 18,
		// No platform link: the Folder must show no link at all rather than a dead one.
		it: {
			title: 'Città alle quattro',
			story:
				'Il pezzo più corto che ho scritto, e quello che ho riscritto più volte. Diciotto secondi ' +
				'perché è esattamente quanto dura il silenzio fra l’ultimo autobus e il primo. Tutto ciò ' +
				'che non serviva è stato tolto, compresa la coda.',
		},
		en: {
			title: 'The City at Four',
			story:
				'The shortest thing I have written and the one I rewrote most. Eighteen seconds because ' +
				'that is exactly how long the silence lasts between the last bus and the first. Everything ' +
				'that was not needed came out, including the tail.',
		},
	},
	{
		reference: 'studio-per-due-mani',
		order: 4,
		durationSeconds: 27,
		platformUrl: 'https://open.spotify.com/track/placeholder-studio',
		it: {
			title: 'Studio per due mani',
			story:
				'Uno studio vero, scritto per l’esame del terzo anno e mai più toccato. Lo tengo qui perché ' +
				'mostra come lavoro quando il vincolo è stretto: due mani, nessun overdub, nessun effetto ' +
				'oltre al riverbero della sala. Chi cerca la tecnica la trova qui più che altrove.',
		},
		en: {
			title: 'Study for Two Hands',
			story:
				'A real study, written for a third-year examination and never touched again. It is here ' +
				'because it shows how I work when the constraint is tight: two hands, no overdubs, no ' +
				'processing beyond the room. Anyone looking for the technique will find it here rather than elsewhere.',
		},
	},
	{
		reference: 'piu-vicino-del-previsto',
		order: 5,
		durationSeconds: 35,
		platformUrl: 'https://open.spotify.com/track/placeholder-vicino',
		it: {
			title: 'Più vicino del previsto',
			story:
				'La prima cosa che ho scritto su commissione: sigla per un podcast indipendente di ' +
				'architettura. Il vincolo era durare trentacinque secondi ed essere riconoscibile entro i ' +
				'primi tre. Lavorare su misura per qualcun altro mi ha insegnato più di un semestre di corso.',
		},
		en: {
			title: 'Closer Than Expected',
			story:
				'The first thing I wrote to order: a title theme for an independent architecture podcast. ' +
				'The brief was thirty-five seconds, recognisable inside the first three. Working to someone ' +
				'else’s measurements taught me more than a semester of coursework.',
		},
	},
]

type HomeCopy = {
	hero: { name: string; tagline: string }
	about: { heading: string; body: string }
	skills: { heading: string; entries: readonly string[] }
	songs: {
		heading: string
		intro: string
		listenLabel: string
		platformLabel: string
		pauseLabel: string
		seekLabel: string
	}
	timeline: {
		heading: string
		scrollLabel: string
		entries: readonly { period: string; label: string; detail: string }[]
	}
	contactCta: { heading: string; body: string; buttonLabel: string }
}

export const SEED_HOME: Record<Locale, HomeCopy> = {
	it: {
		hero: {
			name: 'Anna Milazzo',
			tagline: 'Compositrice e sound designer. Scrivo musica per immagini, spazi e persone.',
		},
		about: {
			heading: 'Chi sono',
			body:
				'Ho appena finito il conservatorio e ho passato gli ultimi anni a capire una cosa sola: ' +
				'come si fa a far sentire un luogo. Lavoro partendo dalle registrazioni sul campo e ci ' +
				'costruisco sopra, invece di pulirle via. Compongo per cortometraggi, installazioni e ' +
				'podcast, e accetto commissioni.',
		},
		skills: {
			heading: 'Cosa so fare',
			entries: [
				'Composizione',
				'Sound design',
				'Registrazione sul campo',
				'Produzione e mix',
				'Pianoforte',
				'Musica per immagini',
				'Notazione e arrangiamento',
			],
		},
		songs: {
			heading: 'Ascolta',
			intro: 'Cinque brani, dal più recente. Si ascoltano qui, senza andare da nessun’altra parte.',
			listenLabel: 'Ascolta',
			platformLabel: 'Ascolta sulla piattaforma',
			pauseLabel: 'Pausa',
			seekLabel: 'Punto di ascolto',
		},
		timeline: {
			heading: 'Percorso',
			scrollLabel: 'Percorso di Anna, in ordine cronologico',
			entries: [
				{
					period: '2019–2022',
					label: 'Liceo musicale, pianoforte principale',
					detail: 'Diploma con lode. Tre anni di teoria, armonia e prassi esecutiva.',
				},
				{
					period: '2022–2026',
					label: 'Conservatorio, composizione e musica elettronica',
					detail: 'Tesi sulla registrazione sul campo come materiale compositivo anziché come sfondo.',
				},
				{
					period: '2024',
					label: 'Installazione sonora, festival cittadino',
					detail: 'Otto minuti in loop per un cortile, costruiti sulle registrazioni del cortile stesso.',
				},
				{
					period: '2025',
					label: 'Sigla per podcast indipendente',
					detail: 'Prima commissione retribuita. Trentacinque secondi, riconoscibili entro i primi tre.',
				},
				{
					period: '2026',
					label: 'Colonna sonora per cortometraggio',
					detail: 'Dodici minuti di musica per un film di diciotto. Selezionato in due festival.',
				},
			],
		},
		contactCta: {
			heading: 'Lavoriamo insieme',
			body: 'Se avete un progetto che ha bisogno di suono — un film, uno spazio, un podcast — scrivetemi.',
			buttonLabel: 'Mettiamoci in contatto',
		},
	},
	en: {
		hero: {
			name: 'Anna Milazzo',
			tagline: 'Composer and sound designer. I write music for images, spaces and people.',
		},
		about: {
			heading: 'About',
			body:
				'I have just finished music school, and I spent those years working out one thing: how to ' +
				'make a place audible. I start from field recordings and build on them rather than clean ' +
				'them away. I compose for short films, installations and podcasts, and I take commissions.',
		},
		skills: {
			heading: 'What I do',
			entries: [
				'Composition',
				'Sound design',
				'Field recording',
				'Production and mixing',
				'Piano',
				'Music for picture',
				'Notation and arrangement',
			],
		},
		songs: {
			heading: 'Listen',
			intro: 'Five pieces, most recent first. They play here — you do not have to go anywhere else.',
			listenLabel: 'Play',
			platformLabel: 'Listen on the platform',
			pauseLabel: 'Pause',
			seekLabel: 'Playback position',
		},
		timeline: {
			heading: 'Training and experience',
			scrollLabel: 'Anna’s path, in chronological order',
			entries: [
				{
					period: '2019–2022',
					label: 'Music high school, principal study piano',
					detail: 'Graduated with distinction. Three years of theory, harmony and performance practice.',
				},
				{
					period: '2022–2026',
					label: 'Conservatoire, composition and electronic music',
					detail: 'Thesis on field recording as compositional material rather than as backdrop.',
				},
				{
					period: '2024',
					label: 'Sound installation, city festival',
					detail: 'Eight looping minutes for a courtyard, built from recordings of that courtyard.',
				},
				{
					period: '2025',
					label: 'Title theme, independent podcast',
					detail: 'First paid commission. Thirty-five seconds, recognisable inside the first three.',
				},
				{
					period: '2026',
					label: 'Score for a short film',
					detail: 'Twelve minutes of music for an eighteen-minute film. Selected by two festivals.',
				},
			],
		},
		contactCta: {
			heading: 'Let’s work together',
			body: 'If you have a project that needs sound — a film, a space, a podcast — write to me.',
			buttonLabel: 'Get in touch',
		},
	},
} as const

type ContactCopy = {
	heading: string
	intro: string
	form: { nameLabel: string; emailLabel: string; messageLabel: string; submitLabel: string; sendingLabel: string }
	outcome: { success: string; failure: string; invalid: string }
}

export const SEED_CONTACT: Record<Locale, ContactCopy> = {
	it: {
		heading: 'Contatti',
		intro: 'Scrivetemi. Rispondo entro pochi giorni, in italiano o in inglese.',
		form: {
			nameLabel: 'Il vostro nome',
			emailLabel: 'La vostra email',
			messageLabel: 'Il messaggio',
			submitLabel: 'Invia',
			sendingLabel: 'Invio in corso…',
		},
		outcome: {
			success: 'Messaggio inviato. Grazie — vi rispondo presto.',
			failure: 'Il messaggio non è partito. Riprovate fra poco, oppure scrivetemi direttamente via email.',
			invalid: 'Controllate i campi segnalati: manca qualcosa o l’indirizzo non è valido.',
		},
	},
	en: {
		heading: 'Contact',
		intro: 'Write to me. I answer within a few days, in Italian or English.',
		form: {
			nameLabel: 'Your name',
			emailLabel: 'Your email',
			messageLabel: 'Your message',
			submitLabel: 'Send',
			sendingLabel: 'Sending…',
		},
		outcome: {
			success: 'Message sent. Thank you — I will get back to you shortly.',
			failure: 'The message did not go through. Try again shortly, or email me directly.',
			invalid: 'Check the fields marked below: something is missing or the address is not valid.',
		},
	},
} as const

type LegalsCopy = { heading: string; paragraphs: readonly string[] }

export const SEED_LEGALS: Record<Locale, LegalsCopy> = {
	it: {
		heading: 'Note legali',
		paragraphs: [
			'Questo sito è di Anna Milazzo, compositrice e sound designer.',
			'Tutte le registrazioni pubblicate qui sono opera sua e sono ospitate con il suo consenso. ' +
				'Nessuna di esse può essere riutilizzata senza permesso scritto.',
			'Il modulo di contatto invia il vostro messaggio per email e non conserva nulla: nome, ' +
				'indirizzo e testo non vengono salvati su questo sito. Il modulo è protetto da un ' +
				'controllo anti-bot fornito da Cloudflare.',
			'I caratteri tipografici sono ospitati su questo sito e non vengono richiesti a terzi, ' +
				'quindi la loro visualizzazione non comporta alcun trasferimento di dati.',
			'Per qualsiasi domanda, usate la pagina contatti.',
		],
	},
	en: {
		heading: 'Legal notice',
		paragraphs: [
			'This site belongs to Anna Milazzo, composer and sound designer.',
			'Every recording published here is her own work and is hosted with her consent. None of it ' +
				'may be reused without written permission.',
			'The contact form sends your message by email and keeps nothing: your name, address and text ' +
				'are not stored on this site. The form is protected by an anti-bot check provided by Cloudflare.',
			'The typefaces are hosted on this site and are not requested from a third party, so displaying ' +
				'them involves no data transfer.',
			'For any question, use the contact page.',
		],
	},
} as const

type SettingsCopy = { legalsLinkLabel: string; socialLinks: readonly { label: string; url: string }[] }

export const SEED_SETTINGS: { contactEmail: string } & Record<Locale, SettingsCopy> = {
	contactEmail: 'anna@example.com',
	it: {
		legalsLinkLabel: 'Note legali',
		socialLinks: [
			{ label: 'Ascolta su Spotify', url: 'https://open.spotify.com/artist/placeholder' },
			{ label: 'Ascolta su Bandcamp', url: 'https://placeholder.bandcamp.com' },
			{ label: 'Scrivetemi', url: 'mailto:anna@example.com' },
		],
	},
	en: {
		legalsLinkLabel: 'Legal notice',
		socialLinks: [
			{ label: 'Listen on Spotify', url: 'https://open.spotify.com/artist/placeholder' },
			{ label: 'Listen on Bandcamp', url: 'https://placeholder.bandcamp.com' },
			{ label: 'Write to me', url: 'mailto:anna@example.com' },
		],
	},
}

/** The portrait, and the alternative text a screen reader reads in its place. */
export const SEED_PORTRAIT = {
	file: 'portrait-anna.png',
	it: 'Ritratto di Anna Milazzo (immagine segnaposto in attesa delle fotografie).',
	en: 'Portrait of Anna Milazzo (placeholder image pending the real photographs).',
} as const
