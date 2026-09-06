/**
 * The first version of every word on the Portfolio, in both languages.
 *
 * ADR-0003: we write this so the copy is good, and Anna edits from there without a
 * deploy. It is placeholder in the sense that none of it is true yet, Anna's real
 * titles, stories, timeline and platform links are still outstanding, but it is
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
				'e la pioggia detta il tempo. Il risultato non è programmatico, è quasi il contrario: ' +
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
		previousLabel: string
		nextLabel: string
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
			previousLabel: 'Brani precedenti',
			nextLabel: 'Brani successivi',
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
			body: 'Se avete un progetto che ha bisogno di suono, per un film, uno spazio o un podcast, scrivetemi.',
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
			previousLabel: 'Previous works',
			nextLabel: 'Next works',
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
			body: 'If you have a project that needs sound, for a film, a space or a podcast, write to me.',
			buttonLabel: 'Get in touch',
		},
	},
} as const

type ContactCopy = {
	heading: string
	intro: string
	form: {
		heading: string
		requiredNote: string
		nameLabel: string
		emailLabel: string
		messageLabel: string
		submitLabel: string
		sendingLabel: string
		checkNote: string
		missingNote: string
		emailNote: string
		privacyNote: string
	}
	outcome: { success: string; failure: string; invalid: string }
	brief: { heading: string; intro: string; points: readonly string[] }
	practical: { heading: string; entries: readonly { term: string; value: string }[] }
	direct: { heading: string; note: string; elsewhereHeading: string }
}

export const SEED_CONTACT: Record<Locale, ContactCopy> = {
	it: {
		heading: 'Contatti',
		// Scope, not logistics: the reply time and the languages moved to `practical`, where
		// they are checkable facts rather than a sentence nobody reads twice.
		intro:
			'Un cortometraggio, un documentario, un podcast, un’installazione, uno spettacolo. ' +
			'Anche un pezzo solo: una sigla è un lavoro come un altro.',
		form: {
			heading: 'Scrivetemi',
			requiredNote: 'Tutti e tre i campi servono per potervi rispondere.',
			nameLabel: 'Il vostro nome',
			emailLabel: 'La vostra email',
			messageLabel: 'Il messaggio',
			submitLabel: 'Invia',
			sendingLabel: 'Invio in corso…',
			checkNote:
				'Il controllo non è stato completato. Riprovate: se il riquadro resta vuoto, è probabile che il ' +
				'browser lo stia bloccando, e in quel caso scrivetemi via email.',
			missingNote: 'Manca questo campo.',
			emailNote: 'Questo indirizzo non sembra valido.',
			privacyNote:
				'Il messaggio mi arriva per email e non viene salvato su questo sito. Il modulo è protetto da un ' +
				'controllo anti-bot di Cloudflare.',
		},
		outcome: {
			success:
				'Messaggio inviato. Vi rispondo entro pochi giorni dallo stesso indirizzo: se non vedete niente, ' +
				'controllate anche lo spam.',
			failure: 'Il messaggio non è partito. Riprovate fra poco, oppure scrivetemi direttamente via email.',
			invalid: 'Controllate i campi segnalati: manca qualcosa o l’indirizzo non è valido.',
		},
		brief: {
			heading: 'Cosa scrivere',
			intro:
				'Non serve un brief formale. Con queste cose nel primo messaggio vi rispondo con qualcosa di utile ' +
				'invece che con altre domande.',
			points: [
				'Che cos’è il progetto: un film, un podcast, uno spazio, altro.',
				'Quanta musica serve, e in quanti pezzi.',
				'Entro quando vi serve.',
				'Il budget che avete in mente, anche approssimativo.',
				'Un riferimento: un brano, un film, qualcosa che suoni come quello che cercate.',
			],
		},
		practical: {
			heading: 'In pratica',
			entries: [
				{
					term: 'Risposta',
					value:
						'Entro pochi giorni. Se non ricevete niente, riscrivetemi: è più probabile un problema tecnico che un no.',
				},
				{ term: 'Lingue', value: 'Italiano e inglese, scritti e parlati.' },
				{
					term: 'Dove sono',
					value: 'Palermo. Lavoro a distanza senza problemi, e vengo in studio o sul posto quando serve.',
				},
				{
					term: 'Compensi',
					value: 'Dipendono dalla durata e dall’uso. Ditemi il budget che avete in mente e vi dico subito se ha senso.',
				},
			],
		},
		direct: {
			heading: 'Per email',
			note:
				'Il modulo qui sotto manda tutto a questo indirizzo. Se preferite il vostro programma di posta, o ' +
				'dovete allegare qualcosa, scrivete direttamente qui.',
			elsewhereHeading: 'Altrove',
		},
	},
	en: {
		heading: 'Contact',
		intro:
			'A short film, a documentary, a podcast, an installation, a piece of theatre. ' +
			'A single cue too: a title theme is work like any other.',
		form: {
			heading: 'Write to me',
			requiredNote: 'All three fields are needed before I can answer you.',
			nameLabel: 'Your name',
			emailLabel: 'Your email',
			messageLabel: 'Your message',
			submitLabel: 'Send',
			sendingLabel: 'Sending…',
			checkNote:
				'The check did not complete. Try again: if the box stays empty your browser is probably blocking ' +
				'it, and in that case write to me by email instead.',
			missingNote: 'This field is missing.',
			emailNote: 'This address does not look valid.',
			privacyNote:
				'The message reaches me by email and is not stored on this site. The form is protected by an ' +
				'anti-bot check from Cloudflare.',
		},
		outcome: {
			success:
				'Message sent. I will answer within a few days from the same address. If you see nothing, check ' +
				'your spam folder too.',
			failure: 'The message did not go through. Try again shortly, or email me directly.',
			invalid: 'Check the fields marked below: something is missing or the address is not valid.',
		},
		brief: {
			heading: 'What to write',
			intro:
				'No formal brief needed. With these in the first message I can answer with something useful ' +
				'instead of more questions.',
			points: [
				'What the project is: a film, a podcast, a space, something else.',
				'How much music it needs, and in how many pieces.',
				'When you need it by.',
				'The budget you have in mind, even roughly.',
				'One reference: a piece, a film, anything that sounds like what you are after.',
			],
		},
		practical: {
			heading: 'In practice',
			entries: [
				{
					term: 'Reply',
					value: 'Within a few days. If nothing arrives, write again: a technical problem is more likely than a no.',
				},
				{ term: 'Languages', value: 'Italian and English, written and spoken.' },
				{
					term: 'Where I am',
					value: 'Palermo. I work remotely without trouble, and I come to the studio or the location when it helps.',
				},
				{
					term: 'Fees',
					value:
						'They depend on the length and on how the music is used. Tell me the budget you have and I will tell ' +
						'you straight away whether it works.',
				},
			],
		},
		direct: {
			heading: 'By email',
			note:
				'The form below sends everything to this address. If you would rather use your own mail client, or ' +
				'need to attach something, write here instead.',
			elsewhereHeading: 'Elsewhere',
		},
	},
} as const

type LegalsCopy = { heading: string; paragraphs: readonly (string | { heading: string })[] }

/**
 * The legal notice.
 *
 * Two people stand behind this site and the notice says so, which is the one thing the
 * template it started from could not: the works are Anna's, and the site around them was
 * built and is hosted by somebody else. Assigning her recordings to the developer would
 * have been the easiest mistake to make here and the hardest to notice.
 */
export const SEED_LEGALS: Record<Locale, LegalsCopy> = {
	it: {
		heading: 'Note legali',
		paragraphs: [
			{ heading: 'Chi siamo' },
			'Indirizzo del sito: https://anna-milazzo.com',
			'Il sito raccoglie e presenta il lavoro di Anna Milazzo, compositrice e sound designer. È stato realizzato e viene ospitato da Cinquin Andy, i cui recapiti sono qui sotto.',

			{ heading: 'Diritto d’autore' },
			'Le opere pubblicate qui, registrazioni, testi e immagini, sono di Anna Milazzo e sono ospitate con il suo consenso. Nessuna di esse può essere riprodotta, rappresentata o riutilizzata, in tutto o in parte e con qualsiasi procedimento, senza la sua autorizzazione scritta.',
			'La grafica, il codice e la struttura del sito sono protetti ai sensi degli articoli L335-2 e seguenti del Codice della proprietà intellettuale francese. Qualsiasi riproduzione o rappresentazione, totale o parziale, con qualsiasi procedimento e senza la previa autorizzazione di Cinquin Andy, è vietata. Ogni violazione è sanzionabile e sarà perseguita.',

			{ heading: 'Editore e realizzazione' },
			'Creazione del tema su misura, identità visiva, SEO e hosting: servizio completo.',
			'Cinquin Andy',
			'SIRET: 880 505 276 00035',
			'1250 Chemin de la renouillère, 74140 Sciez, Francia',
			'Tel: 06 21 58 26 84',
			'https://andy-cinquin.com',

			{ heading: 'Hosting' },
			'netcup GmbH',
			'Daimlerstraße 25, 76185 Karlsruhe, Germania',

			{ heading: 'Dati personali' },
			'Il trattamento dei dati personali su questo sito è soggetto al Regolamento (UE) 2016/679, il GDPR.',
			'Titolare del trattamento: Cinquin Andy, ai recapiti indicati sopra.',
			'Il modulo di contatto raccoglie soltanto quello che scrivete: nome, indirizzo email e messaggio. Questi dati non vengono salvati su questo sito né in alcun database: il messaggio viene inoltrato per email tramite Resend e conservato solo per il tempo della conversazione. La base giuridica è il vostro consenso, dato nel momento in cui inviate il modulo.',
			'Il modulo è protetto da Cloudflare Turnstile, che tratta dati tecnici del vostro browser al solo scopo di distinguere una persona da un programma automatico.',
			'Questo sito non usa cookie pubblicitari, non usa strumenti di analisi e non profila nessuno. I caratteri tipografici sono ospitati qui e non vengono richiesti a terzi, quindi visualizzarli non comporta alcun trasferimento di dati.',
			'Avete diritto di accedere ai vostri dati, di rettificarli, di chiederne la cancellazione, di limitarne il trattamento e di opporvi. Per esercitarli, scrivete dalla pagina contatti o all’indirizzo indicato sopra.',
			'Se ritenete che i vostri diritti non siano rispettati, potete presentare reclamo all’autorità di controllo competente: il Garante per la protezione dei dati personali in Italia, o la CNIL in Francia.',
		],
	},
	en: {
		heading: 'Legal notice',
		paragraphs: [
			{ heading: 'Who we are' },
			'Website address: https://anna-milazzo.com',
			'The site gathers and presents the work of Anna Milazzo, composer and sound designer. It was built and is hosted by Cinquin Andy, whose details are below.',

			{ heading: 'Copyright' },
			'The works published here, the recordings, the texts and the images, belong to Anna Milazzo and are hosted with her consent. None of them may be reproduced, represented or reused, in whole or in part and by any process, without her written authorisation.',
			'The design, the code and the structure of the site are protected under Articles L335-2 and following of the French Intellectual Property Code. Any reproduction or representation, total or partial, by any process and without the prior authorisation of Cinquin Andy, is forbidden. Any violation is a sanctionable offence and will be prosecuted.',

			{ heading: 'Publisher and creation' },
			'Custom theme creation, branding, SEO and hosting: turnkey service.',
			'Cinquin Andy',
			'SIRET: 880 505 276 00035',
			'1250 Chemin de la renouillère, 74140 Sciez, France',
			'Tel: 06 21 58 26 84',
			'https://andy-cinquin.com',

			{ heading: 'Hosting' },
			'netcup GmbH',
			'Daimlerstraße 25, 76185 Karlsruhe, Germany',

			{ heading: 'Personal data' },
			'The processing of personal data on this site is subject to Regulation (EU) 2016/679, the GDPR.',
			'Data controller: Cinquin Andy, at the details given above.',
			'The contact form collects only what you write: your name, your email address and your message. None of it is saved on this site or in any database. The message is forwarded by email through Resend and kept only for as long as the conversation lasts. The legal basis is your consent, given when you send the form.',
			'The form is protected by Cloudflare Turnstile, which processes technical data from your browser for the sole purpose of telling a person from an automated program.',
			'This site uses no advertising cookies, no analytics and profiles nobody. The typefaces are hosted here and are not requested from a third party, so displaying them transfers no data.',
			'You have the right to access your data, to correct it, to ask for it to be erased, to restrict its processing and to object. To exercise those rights, write from the contact page or to the address above.',
			'If you believe your rights are not being respected, you may lodge a complaint with the competent supervisory authority: the Garante per la protezione dei dati personali in Italy, or the CNIL in France.',
		],
	},
} as const

type SettingsCopy = {
	navHeading: string
	elsewhereHeading: string
	legalsLinkLabel: string
	socialLinks: readonly { label: string; url: string }[]
}

/**
 * The chrome every page carries: where to write to Anna, and where else to find her.
 *
 * The two profile URLs are the bare canonical ones. Both arrived carrying the parameters
 * the share sheet adds, an `stkn` share token on the Instagram link and `utm_source`,
 * `utm_content` and `utm_medium` on the LinkedIn one. A share token is tied to the account
 * that generated it and the campaign parameters would report every visitor to this site as
 * having arrived from Anna's own Android app, so neither belongs on a page anyone can read.
 *
 * A Fiverr profile is still to come. It goes in the admin as a fourth link; nothing here
 * has to change for it, though a re-seed would overwrite it, so add it here too.
 */
export const SEED_SETTINGS: { contactEmail: string } & Record<Locale, SettingsCopy> = {
	contactEmail: 'annamil012002n2@gmail.com',
	it: {
		navHeading: 'Pagine',
		elsewhereHeading: 'Altrove',
		legalsLinkLabel: 'Note legali',
		socialLinks: [
			{ label: 'Instagram', url: 'https://www.instagram.com/imannasound' },
			{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/anna-milazzo-118b413b7' },
			{ label: 'Scrivetemi', url: 'mailto:annamil012002n2@gmail.com' },
		],
	},
	en: {
		navHeading: 'Pages',
		elsewhereHeading: 'Elsewhere',
		legalsLinkLabel: 'Legal notice',
		socialLinks: [
			{ label: 'Instagram', url: 'https://www.instagram.com/imannasound' },
			{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/anna-milazzo-118b413b7' },
			{ label: 'Write to me', url: 'mailto:annamil012002n2@gmail.com' },
		],
	},
}

/** The portrait, and the alternative text a screen reader reads in its place. */
export const SEED_PORTRAIT = {
	file: 'portrait-anna.png',
	it: 'Ritratto di Anna Milazzo (immagine segnaposto in attesa delle fotografie).',
	en: 'Portrait of Anna Milazzo (placeholder image pending the real photographs).',
} as const
