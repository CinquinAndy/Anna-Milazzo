/**
 * Larger decorative objects, as opposed to the small marks in `ornament.tsx`.
 *
 * Everything here is built the same way the rest of the page is: flat fills inside black
 * keylines, no gradient, no radius that is not physically part of the object being drawn.
 * A record and a cassette reel are round because reels are round, that is the only reason
 * anything on this site is.
 *
 * All of it is decoration: hidden from assistive technology, carrying nothing the text
 * beside it does not say, and safe to delete.
 */

/**
 * Concentric quarter-arcs, in the manner of the client's references.
 *
 * Built as an onion of strokes, like the ribbon: each colour band is drawn over a black
 * band eight units wider, so every arc gets exactly four units of keyline on each edge
 * without any second path. It is the only way a curve obeys a system where every edge is a
 * black line.
 */
const ARC_BANDS = [
	{ id: 'a', radius: 150, tint: 'var(--lemon)' },
	{ id: 'b', radius: 112, tint: 'var(--accent)' },
	{ id: 'c', radius: 74, tint: 'var(--magenta)' },
] as const

export function Arcs({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 180 180"
			aria-hidden="true"
			focusable="false"
			role="presentation"
			fill="none"
		>
			<title>Arcs</title>
			{ARC_BANDS.map(band => (
				<g key={band.id}>
					<path
						d={`M0 ${180 - band.radius} A ${band.radius} ${band.radius} 0 0 1 ${band.radius} 180`}
						stroke="var(--ink)"
						strokeWidth="30"
					/>
					<path
						d={`M0 ${180 - band.radius} A ${band.radius} ${band.radius} 0 0 1 ${band.radius} 180`}
						stroke={band.tint}
						strokeWidth="22"
					/>
				</g>
			))}
		</svg>
	)
}
