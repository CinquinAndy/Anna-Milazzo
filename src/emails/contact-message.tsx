import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from '@react-email/components'
import type { ContactMessage } from '@/lib/contact/send-contact-message'
import { SITE_DOMAIN } from '@/lib/site'

/**
 * The email Anna receives when somebody writes from the portfolio.
 *
 * Built to look like the site it came from: flat fills, a black keyline, the same palette.
 * The constraints are not the site's, though, and three of them shape everything here.
 *
 * A mail client is not a browser. There are no custom properties, so every colour is a
 * literal; there is no cascade worth relying on, so every rule is inline; and the site's
 * three typefaces will not load anywhere, so the display voice is carried by weight and
 * letter spacing over a stack every client already has.
 *
 * The words are in Italian and live here rather than in Payload. That is deliberate and it
 * is the second exception on this project, after the footer's signature: this is not a page
 * anybody visits, it is a notice addressed to Anna in her own language, and a field for it
 * would be a question she has to answer about an email she is the only person to read.
 */

const INK = '#000000'
const PAPER = '#FEE5DB'
const SHEET = '#FDFCF8'
const DUST = '#E6E5DF'
const BLUE = '#3866A8'
const MAGENTA = '#F74183'

/** Everything a client is likely to have, in the register of the face it stands in for. */
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const MONO = "'SFMono-Regular', SFMono, Menlo, Consolas, 'Liberation Mono', monospace"

const body = { backgroundColor: PAPER, margin: 0, padding: '24px 12px' }
const container = { maxWidth: '600px', margin: '0 auto' }

/** The wordmark band. Ink on the outside of the card, the way the site's own bands sit. */
const band = { backgroundColor: INK, padding: '20px 24px' }
const wordmark = {
	margin: 0,
	color: SHEET,
	fontFamily: SANS,
	fontSize: '20px',
	fontWeight: 700,
	letterSpacing: '0.04em',
	lineHeight: '1.1',
	textTransform: 'uppercase' as const,
}
const kicker = {
	margin: '6px 0 0',
	color: DUST,
	fontFamily: MONO,
	fontSize: '12px',
	letterSpacing: '0.1em',
	textTransform: 'uppercase' as const,
}

/* The card. A 3px keyline rather than the site's 4px: at 600px an email column is smaller
 * than a page section, and four reads as a frame around a small object rather than as an
 * edge. */
const card = { backgroundColor: SHEET, border: `3px solid ${INK}`, borderTop: 'none', padding: '24px' }
const label = {
	margin: '0 0 4px',
	color: INK,
	fontFamily: MONO,
	fontSize: '11px',
	letterSpacing: '0.1em',
	textTransform: 'uppercase' as const,
}
const value = { margin: '0 0 20px', color: INK, fontFamily: SANS, fontSize: '16px', lineHeight: '1.5' }
const address = { ...value, fontFamily: MONO, fontSize: '15px', color: BLUE, textDecoration: 'underline' }

/* The message itself, set apart in its own box: it is the only part of this email somebody
 * else wrote, and it should look like a quotation rather than like more of the notice. */
const quote = {
	backgroundColor: PAPER,
	border: `2px solid ${INK}`,
	borderLeft: `8px solid ${MAGENTA}`,
	padding: '16px 18px',
	margin: '0 0 24px',
}
const quoteText = {
	margin: 0,
	color: INK,
	fontFamily: SANS,
	fontSize: '16px',
	lineHeight: '1.6',
	whiteSpace: 'pre-wrap' as const,
}

const rule = { borderColor: DUST, borderWidth: '1px 0 0', margin: '0 0 16px' }
const note = { margin: 0, color: INK, fontFamily: SANS, fontSize: '14px', lineHeight: '1.5' }
const foot = { margin: '20px 0 0', color: INK, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.06em' }

/** The site this arrived from. */
const SITE = SITE_DOMAIN

export function ContactMessageEmail({ message }: { message: ContactMessage }) {
	// What a client shows beside the subject in the inbox list. Without it, clients fall back
	// to the first words of the body, which here would be the wordmark on every message.
	const preview = `${message.name}: ${message.message.replace(/\s+/g, ' ').slice(0, 90)}`

	return (
		<Html lang="it">
			<Head />
			<Preview>{preview}</Preview>
			<Body style={body}>
				<Container style={container}>
					<Section style={band}>
						<Heading as="h1" style={wordmark}>
							Anna Milazzo
						</Heading>
						<Text style={kicker}>Nuovo messaggio dal sito</Text>
					</Section>

					<Section style={card}>
						<Text style={label}>Da</Text>
						<Text style={value}>{message.name}</Text>

						<Text style={label}>Email</Text>
						<Text style={value}>
							<Link href={`mailto:${message.email}`} style={address}>
								{message.email}
							</Link>
						</Text>

						<Text style={label}>Messaggio</Text>
						<Section style={quote}>
							<Text style={quoteText}>{message.message}</Text>
						</Section>

						<Hr style={rule} />
						{/* The send sets `reply_to` to their address, so this is true rather than
						    hopeful: replying goes to them and not to the sending domain. */}
						<Text style={note}>Rispondete direttamente a questa email: la risposta arriva a chi ha scritto.</Text>
						<Text style={foot}>{SITE}</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

/**
 * The plain text alternative, sent alongside the HTML.
 *
 * Not a nicety. A message with no text part scores worse with spam filters, and a portfolio
 * whose contact form lands in junk is a portfolio with no contact form.
 */
export function contactMessageText(message: ContactMessage): string {
	return [
		'ANNA MILAZZO, nuovo messaggio dal sito',
		'',
		`Da: ${message.name}`,
		`Email: ${message.email}`,
		'',
		message.message,
		'',
		'Rispondete direttamente a questa email: la risposta arriva a chi ha scritto.',
		SITE,
	].join('\n')
}
