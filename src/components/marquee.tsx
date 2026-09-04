import { BAND_PHRASE } from '@/lib/player/bars'
import type { Home } from '@/payload-types'

/** Lattice order, so the bars step through the palette rather than sampling it randomly. */
const BAND_TINTS = ['var(--cantaloupe)', 'var(--lemon)', 'var(--spring)', 'var(--blue)', 'var(--magenta)'] as const

/**
 * The black strip that cuts the page in half.
 *
 * Structural before it is decorative: the section rhythm runs lemon then cantaloupe, two
 * warm lights one step apart, and without something at zero lightness between them the
 * two smear into each other.
 *
 * The words are Anna's own skills rather than a new CMS field — they are already written
 * in both languages, already hers to edit, and a marquee of what she does is worth more
 * than a marquee of her name.
 *
 * Two lanes in one band, text above and amplitude bars below, rather than two full-bleed
 * strips — which would spend 180px of scroll on one idea. The bars do the contrast job the
 * band was already doing and say music for free; everything clears on black, so there is
 * no pairing to check.
 */
export function Marquee({ skills }: { skills: Home['skills'] }) {
	const entries = (skills?.entries ?? []).map(entry => entry.name).filter(Boolean)
	if (entries.length === 0) {
		return null
	}

	// Two identical passes. The animation travels exactly one pass width and resets, so the
	// seam never arrives — with a single pass the strip would empty and snap back.
	const passes = [0, 1]

	return (
		<div className="marquee border-b-brutal border-border bg-ink text-sheet" data-marquee aria-hidden="true">
			<div className="marquee-track">
				{passes.map(pass => (
					<ul key={pass} className="marquee-pass">
						{entries.map(entry => (
							<li key={`${pass}-${entry}`} className="marquee-item">
								<span>{entry}</span>
								{/* The separator is drawn, not typed: a text asterisk sits on the
								    baseline and reads as punctuation rather than as a mark. */}
								<svg className="marquee-star" viewBox="0 0 100 100" focusable="false" role="presentation">
									<g stroke="currentColor" strokeWidth="14" strokeLinecap="round">
										<line x1="50" y1="14" x2="50" y2="86" />
										<line x1="19" y1="32" x2="81" y2="68" />
										<line x1="19" y1="68" x2="81" y2="32" />
									</g>
								</svg>
							</li>
						))}
					</ul>
				))}
			</div>

			<div className="band-bars">
				{BAND_PHRASE.map((bar, index) => (
					<span
						key={`band-${bar.id}`}
						className="band-bar"
						style={
							{
								'--bar': `${bar.height}%`,
								backgroundColor: BAND_TINTS[index % BAND_TINTS.length],
							} as React.CSSProperties
						}
					/>
				))}
			</div>
		</div>
	)
}
