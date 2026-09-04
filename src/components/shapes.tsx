/**
 * Larger decorative objects, as opposed to the small marks in `ornament.tsx`.
 *
 * Everything here is built the same way the rest of the page is: flat fills inside black
 * keylines, no gradient, no radius that is not physically part of the object being drawn.
 * A record and a cassette reel are round because reels are round — that is the only reason
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

/**
 * A composition of plain geometric shapes.
 *
 * Three attempts at this slot were rejected, and the pattern was that all three were
 * THINGS: a cassette, a metronome, then a framed window with a list scrolling in it. A
 * drawing of an object reads as clip-art whichever object you choose, and a framed box with
 * content in it reads as a widget dropped onto a page. The client's own word for what he
 * wanted was "formes" — shapes — and shapes are not objects.
 *
 * So there is nothing here to recognise. A disc, a half-disc, a triangle, a ring, a stack of
 * bars, overlapping and keylined, in the manner of a mid-century sleeve. It carries no
 * meaning to misread, which is exactly why it cannot look like a clip-art library.
 *
 * One element turns, and only one. A half-disc rotating reads as a disc turning; a full
 * circle rotating is invisible, and a triangle drifting is aimless. Everything else is
 * placed and stays placed, because a composition where every part moves is not a
 * composition.
 */
export function ShapeStack({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 320 340" aria-hidden="true" focusable="false" role="presentation">
			<title>Shapes</title>
			<g stroke="var(--ink)" strokeWidth="7" strokeLinejoin="miter">
				{/* Back to front. The order is the composition. */}
				<path d="M36 34 L152 34 L94 130 Z" fill="var(--lemon)" />
				<circle cx="206" cy="122" r="94" fill="var(--accent)" />
				<circle cx="206" cy="122" r="40" fill="none" stroke="var(--ink)" strokeWidth="7" />

				<g className="shape-turn">
					<path d="M28 250 A 84 84 0 0 1 196 250 Z" fill="var(--magenta)" />
				</g>

				<g fill="var(--sheet)" strokeWidth="6">
					<rect x="186" y="236" width="112" height="22" />
					<rect x="186" y="268" width="86" height="22" />
					<rect x="186" y="300" width="128" height="22" />
				</g>

				<circle cx="60" cy="152" r="26" fill="var(--primary)" />
			</g>
		</svg>
	)
}
