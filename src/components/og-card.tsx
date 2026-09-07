import { OgFrame, OgHeadline } from '@/components/og-frame'
import { OG } from '@/lib/og/palette'

/**
 * The card the site unfurls with: the name, what she does, and the visualiser.
 *
 * Blue ground, the anchor colour, and the hero's own. See `og-frame.tsx` for what Satori
 * allows and why the colours are hex rather than utilities.
 */

/** The pills, in the order the site cycles its Folder covers. Magenta stays rationed. */
const PILL_FILLS = [OG.cantaloupe, OG.lemon, OG.spring]

/**
 * How wide a pill is, so the row can take as many disciplines as fit and no more.
 *
 * A fixed count does not work across two languages: three fit in both, four fit in English
 * and the Italian fourth runs twenty-four pixels off the card, because "Registrazione sul
 * campo" is twenty-three characters against "Field recording"'s fifteen. Anna writes these
 * in the CMS, so the number cannot be decided here at all; the row has to measure.
 *
 * Azeret Mono is monospaced at 0.65em, read from the font file rather than estimated.
 */
const MONO_ADVANCE = 0.65
const PILL_FONT = 20
const PILL_TRACKING = 0.06
/** 16px of padding and a 4px keyline, each side. */
const PILL_CHROME = 40
const PILL_GAP = 14
/** The card's 1200 less its 64px gutters, less the 6px the last pill's shadow needs. */
const PILL_ROW = 1200 - 64 * 2 - 6

const pillWidth = (label: string) => label.length * PILL_FONT * (MONO_ADVANCE + PILL_TRACKING) + PILL_CHROME

/** As many as the row holds, in the order Anna set them. */
function fitPills(disciplines: string[]) {
	const taken: string[] = []
	let used = 0
	for (const discipline of disciplines) {
		const next = used + (taken.length > 0 ? PILL_GAP : 0) + pillWidth(discipline)
		if (next > PILL_ROW) {
			break
		}
		used = next
		taken.push(discipline)
	}
	return taken
}

export function OgCard({
	name,
	tagline,
	disciplines,
	domain,
}: {
	name: string
	tagline: string
	disciplines: string[]
	domain: string
}) {
	return (
		<OgFrame ground={OG.blue} domain={domain}>
			<OgHeadline colour={OG.sheet}>{name}</OgHeadline>

			<div style={{ marginTop: 26, maxWidth: 940, fontSize: 33, lineHeight: 1.32, color: OG.sheet }}>{tagline}</div>

			{/* What she does, in the site's own mono pills, on the site's own hard shadow. */}
			<div tw="flex" style={{ marginTop: 32, gap: PILL_GAP }}>
				{fitPills(disciplines).map((discipline, index) => (
					<div
						key={discipline}
						tw="flex"
						style={{
							backgroundColor: PILL_FILLS[index % PILL_FILLS.length],
							color: OG.ink,
							fontFamily: 'Azeret',
							fontSize: PILL_FONT,
							letterSpacing: `${PILL_TRACKING}em`,
							textTransform: 'uppercase',
							padding: '10px 16px',
							border: `4px solid ${OG.ink}`,
							boxShadow: `6px 6px 0 0 ${OG.ink}`,
						}}
					>
						{discipline}
					</div>
				))}
			</div>
		</OgFrame>
	)
}
