import type { ReactNode } from 'react'
import { OG } from '@/lib/og/palette'

/**
 * What every social card shares: the ground, the wordmark pill, and the visualiser band
 * along the foot.
 *
 * Rendered by Satori rather than a browser, which constrains it in three ways worth
 * knowing before editing: flexbox only, no grid; every element holding more than one child
 * needs an explicit `display: flex`, which is what the `tw="flex"` on nearly every wrapper
 * is doing; and Satori's Tailwind is its own default config, not this project's, so
 * `bg-blue` would be a stranger's blue. Layout is Tailwind, colour is `OG`.
 *
 * The band is the marquee's shape, full bleed with the bars cut by the card's own edge,
 * and it carries the visualiser from the works section: the one mark here that reads as
 * audio without a caption, which is what a card has to do at thumbnail size.
 */

/**
 * The bar heights, as a fraction of the band.
 *
 * Fixed rather than random: these images are regenerated on every build, and a card whose
 * bytes change when nothing changed busts every cache that holds it. Read off no
 * particular track; it is a drawing of a waveform, not a claim about one.
 */
const BARS = [
	0.32, 0.58, 0.44, 0.86, 0.5, 0.68, 0.36, 0.94, 0.6, 0.42, 0.76, 0.48, 0.84, 0.38, 0.64, 0.54, 0.9, 0.46, 0.7, 0.34,
	0.62, 0.82, 0.4, 0.66, 0.52, 0.88, 0.56, 0.74, 0.42, 0.6, 0.8, 0.36, 0.7, 0.5, 0.92,
]

/** Cycled along the band so no two neighbours share a colour on the ink ground. */
const BAR_FILLS = [OG.sheet, OG.lemon, OG.cantaloupe, OG.spring]

export function OgFrame({ ground, domain, children }: { ground: string; domain: string; children: ReactNode }) {
	return (
		<div tw="flex h-full w-full flex-col justify-between" style={{ backgroundColor: ground, fontFamily: 'Instrument' }}>
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

				{children}
			</div>

			<div tw="flex w-full items-end" style={{ height: 92, gap: 7, padding: '0 12px', backgroundColor: OG.ink }}>
				{BARS.map((height, index) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: BARS is a fixed drawing, never reordered and never filtered, so a bar's position in it is its identity
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

/** The display line, at the one size both cards set their loudest word in. */
export function OgHeadline({ children, colour, size = 196 }: { children: string; colour: string; size?: number }) {
	return (
		<div
			style={{
				marginTop: 30,
				fontFamily: 'Bricolage',
				fontSize: size,
				lineHeight: 0.86,
				letterSpacing: '-0.02em',
				color: colour,
				textTransform: 'uppercase',
			}}
		>
			{children}
		</div>
	)
}
