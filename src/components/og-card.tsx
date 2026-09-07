import { OG } from '@/lib/og/palette'

/**
 * The social card, drawn the way the site is drawn.
 *
 * Rendered by Satori rather than a browser, which constrains it in three ways worth
 * knowing before editing: flexbox only, no grid; every element holding more than one child
 * needs an explicit `display: flex`, which is what the `tw="flex"` on nearly every wrapper
 * below is doing; and Satori's Tailwind is its own default config, not this project's, so
 * `bg-blue` would be a stranger's blue. Layout is Tailwind, colour is `OG`.
 *
 * What it has to do at thumbnail size, which is how most people meet an unfurled link: say
 * the name, and say the work is sound. So the name is set as large as the card allows, in
 * the same condensed face every heading on the site uses, and the foot carries the
 * visualiser from the works section, which is the one mark here that reads as audio
 * without a caption. The band it sits in is the marquee's shape: full bleed, one keyline
 * along the top, cut by the card's own edge.
 */

/**
 * The bar heights, as a fraction of the band.
 *
 * Fixed rather than random: this image is regenerated on every build, and a card whose
 * bytes change when nothing changed busts every cache that holds it. Read off no
 * particular track; it is a drawing of a waveform, not a claim about one.
 */
const BARS = [
	0.32, 0.58, 0.44, 0.86, 0.5, 0.68, 0.36, 0.94, 0.6, 0.42, 0.76, 0.48, 0.84, 0.38, 0.64, 0.54, 0.9, 0.46, 0.7, 0.34,
	0.62, 0.82, 0.4, 0.66, 0.52, 0.88, 0.56, 0.74, 0.42, 0.6, 0.8, 0.36, 0.7, 0.5, 0.92,
]

/** Cycled along the band so no two neighbours share a colour on the ink ground. */
const BAR_FILLS = [OG.sheet, OG.lemon, OG.cantaloupe, OG.spring]

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
		<div
			tw="flex h-full w-full flex-col justify-between"
			style={{ backgroundColor: OG.blue, fontFamily: 'Instrument' }}
		>
			<div tw="flex flex-col" style={{ padding: '52px 64px 0' }}>
				{/* The wordmark pill, the same object as the one in the site's own bar. */}
				<div tw="flex">
					<div
						tw="flex"
						style={{
							backgroundColor: OG.ink,
							color: OG.sheet,
							fontFamily: 'Azeret',
							fontSize: 21,
							letterSpacing: '0.1em',
							textTransform: 'uppercase',
							padding: '11px 18px',
						}}
					>
						{domain}
					</div>
				</div>

				<div
					style={{
						marginTop: 30,
						fontFamily: 'Bricolage',
						fontSize: 196,
						lineHeight: 0.86,
						letterSpacing: '-0.02em',
						color: OG.sheet,
						textTransform: 'uppercase',
					}}
				>
					{name}
				</div>

				<div style={{ marginTop: 26, maxWidth: 940, fontSize: 33, lineHeight: 1.32, color: OG.sheet }}>{tagline}</div>

				{/* What she does, in the site's own mono pills, on the site's own hard shadow. */}
				<div tw="flex" style={{ marginTop: 32, gap: 14 }}>
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
			</div>

			<div
				tw="flex w-full items-end"
				style={{
					height: 92,
					gap: 7,
					padding: '0 12px',
					backgroundColor: OG.ink,
					borderTop: `4px solid ${OG.ink}`,
				}}
			>
				{BARS.map((height, index) => (
					<div
						key={`${index}-${height}`}
						style={{
							flex: 1,
							height: `${Math.round(height * 100)}%`,
							backgroundColor: BAR_FILLS[index % BAR_FILLS.length],
						}}
					/>
				))}
			</div>
		</div>
	)
}
