/**
 * The ribbon sweeping across the foot of the hero, with records caught in it.
 *
 * Taken from the client's own reference, the vinyl shop whose hero is one enormous
 * multicolour band, after two background attempts that were both discrete shapes scattered
 * in a field: concentric ripples, then a piano roll of small rectangles. The objection to
 * both was the same shape of idea, so this is a different shape of idea: one continuous
 * object, not a pattern.
 *
 * Built as an onion of strokes. One path, stroked eight times at decreasing widths,
 * alternating ink and colour. Each black stroke is 8 units wider than the colour laid on
 * top of it, so every band gets exactly 4 units of black on each edge, the keyline is not
 * extra geometry, it is the stroke underneath. That is what lets a curved object obey a
 * system where every edge is a 4px black line.
 *
 * Colour order is the lattice, minus two: on the blue hero the blue band would measure
 * 1.00:1 against its own ground and the magenta 1.66:1, so both are omitted rather than
 * drawn and lost.
 *
 * `preserveAspectRatio="xMidYMid slice"` is the whole of the responsive story: the viewBox
 * scales uniformly to cover and clips the overflow, like `object-fit: cover`. Stretching it
 * with `none` would thin the horizontal strokes, fatten the vertical ones and turn the
 * records into ellipses, which would break the one rule this design has. It also means the
 * records stay stuck to the band at every width, because the coordinate system is never
 * distorted.
 *
 * The viewBox is 1440 x 420 against a 420px-tall element, so one user unit is one CSS pixel
 * and the 4-unit keylines land at exactly 4px, the same width as every border on the page.
 */

/** ink first, then the colour laid inside it. Widths descend in pairs eight apart. */
const BANDS = [
	{ id: 'a', ink: 208, colour: 200, tint: 'var(--cantaloupe)' },
	{ id: 'b', ink: 160, colour: 152, tint: 'var(--lemon)' },
	{ id: 'c', ink: 112, colour: 104, tint: 'var(--spring)' },
	{ id: 'd', ink: 64, colour: 56, tint: 'var(--grape)' },
]

/** Starts left of the viewBox and ends past it, so the band bleeds off both edges uncapped. */
const SPINE = 'M-180 372 C 200 352, 430 316, 720 246 S 1170 92, 1620 150'

function Disc({ x, y, size, label }: { x: number; y: number; size: number; label: string }) {
	const r = size / 2
	return (
		<g transform={`translate(${x} ${y})`}>
			<circle cx={r} cy={r} r={r - 2} fill="var(--ink)" stroke="var(--ink)" strokeWidth="4" />
			<g fill="none" stroke="var(--sheet)" strokeOpacity="0.18" strokeWidth={Math.max(1, size / 90)}>
				<circle cx={r} cy={r} r={r * 0.86} />
				<circle cx={r} cy={r} r={r * 0.72} />
				<circle cx={r} cy={r} r={r * 0.58} />
				<circle cx={r} cy={r} r={r * 0.44} />
			</g>
			<circle cx={r} cy={r} r={r * 0.3} fill={label} stroke="var(--ink)" strokeWidth="4" />
			<circle cx={r} cy={r} r={r * 0.05} fill="var(--ink)" />
		</g>
	)
}

export function Ribbon() {
	return (
		<svg
			className="ribbon"
			viewBox="0 0 1440 420"
			preserveAspectRatio="xMidYMid slice"
			aria-hidden="true"
			focusable="false"
			role="presentation"
		>
			<title>Ribbon</title>
			<defs>
				<path id="ribbon-spine" d={SPINE} />
			</defs>

			<g fill="none" strokeLinecap="butt">
				{BANDS.map(band => (
					<g key={band.id}>
						<use href="#ribbon-spine" stroke="var(--ink)" strokeWidth={band.ink} />
						<use href="#ribbon-spine" stroke={band.tint} strokeWidth={band.colour} />
					</g>
				))}
			</g>

			{/* Last in document order, so they sit on the bands rather than under them.
			    Placed high on the band: lower down the keyboard crops them, and a record cut
			    in half by a piano reads as a mistake rather than as an overlap. */}
			<Disc x={318} y={158} size={150} label="var(--lemon)" />
			<Disc x={1010} y={76} size={120} label="var(--spring)" />
		</svg>
	)
}
