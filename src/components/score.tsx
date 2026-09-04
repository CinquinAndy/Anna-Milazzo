/**
 * A fragment of engraved score.
 *
 * This slot went through five attempts and twenty variants before landing here, and the
 * reasons the others failed are worth keeping. A cassette and a metronome were drawings of
 * objects, which read as clip-art whichever object you pick. A framed column of scrolling
 * Italian directions read as a widget dropped onto a page. A composition of abstract shapes
 * was closer but said nothing — it could have sat on any site.
 *
 * A score fragment is the one graphic here that is about HER: it is the thing a composer
 * produces. Prior research on this project drew the line exactly where this sits — "stave
 * lines yes, her own score yes, floating notes and clefs and rests no" — and the difference
 * between the two is the beam. Three noteheads with stems are three symbols placed by hand;
 * join them with a beam and put bar lines around them and it is engraved music, because a
 * beam is a statement about rhythm that only holds if the notes belong together.
 *
 * Everything here is drawn rather than set in a music font: no glyph to fail to load, and
 * the same flat-fill, black-keyline construction as the rest of the page.
 *
 * Decoration. Hidden from assistive technology, carrying nothing the text beside it says,
 * and the section reads correctly with it deleted.
 */

/** Five ruled lines. The stave is the only part of notation that is pure structure. */
const RULES = [110, 138, 166, 194, 222]

/**
 * Three beamed quavers, then two on their own — a phrase with a shape rather than an even
 * row. `up` flips the stem, which real engraving does around the middle line.
 */
const NOTES = [
	{ id: 's1', x: 62, y: 194, up: true },
	{ id: 's2', x: 104, y: 166, up: true },
	{ id: 's3', x: 146, y: 138, up: true },
	{ id: 's4', x: 206, y: 152, up: false },
	{ id: 's5', x: 248, y: 180, up: false },
] as const

export function Score({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 320 320" aria-hidden="true" focusable="false" role="presentation">
			<title>Score</title>
			<rect x="4" y="4" width="312" height="312" fill="var(--sheet)" stroke="var(--ink)" strokeWidth="7" />

			<g stroke="var(--ink)" strokeWidth="4">
				{RULES.map(y => (
					<line key={y} x1="24" y1={y} x2="296" y2={y} />
				))}
				{/* Bar lines: what turns five rules into a bar of music. The final one is
				    heavier, the way the end of a system is. */}
				<line x1="180" y1="110" x2="180" y2="222" strokeWidth="6" />
				<line x1="290" y1="110" x2="290" y2="222" strokeWidth="8" />
			</g>

			<g stroke="var(--ink)" strokeWidth="5">
				{NOTES.map(note => (
					<g key={note.id}>
						{/* Noteheads are tilted ellipses, not circles — an engraver's notehead is
						    an oval rotated off the horizontal, and a circle reads as a bullet. */}
						<ellipse
							cx={note.x}
							cy={note.y}
							rx="15"
							ry="11"
							fill="var(--magenta)"
							transform={`rotate(-18 ${note.x} ${note.y})`}
						/>
						<line
							x1={note.x + (note.up ? 14 : -14)}
							y1={note.y}
							x2={note.x + (note.up ? 14 : -14)}
							y2={note.y + (note.up ? -66 : 66)}
						/>
					</g>
				))}
				{/* The beam. This is the element that makes the whole thing read as engraved
				    rather than as symbols arranged by eye. */}
				<path d="M72 128 L162 72 L162 88 L72 144 Z" fill="var(--ink)" />
			</g>
		</svg>
	)
}
