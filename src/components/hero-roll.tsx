/**
 * A piano roll drifting behind the hero.
 *
 * Replaces four concentric ripples, which were wrong on their own terms: circles in a
 * system with zero radius and hard keylines, radiating from a record — an object that
 * receives a stylus rather than one that broadcasts — and faint enough to read as a
 * rendering artefact rather than as a decision.
 *
 * This is the same object the timeline section already is: notes laid on a grid, moving
 * left because that is the direction a sequencer plays. Hard rectangles with keylines, so
 * it speaks the page's language, and it rhymes with the arrangement further down instead
 * of importing a second visual idea.
 *
 * Two identical passes translating by exactly half the track, so the loop has no seam.
 */

type Note = { id: string; top: number; left: number; width: number; tint: string }

/**
 * One bar of notes, in percentages of the track. Written by hand: pitches step around,
 * lengths vary, and there are rests — a generated grid reads as a texture, and the point
 * is that it reads as something someone played.
 */
const NOTES: Note[] = [
	{ id: 'n1', top: 12, left: 2, width: 9, tint: 'var(--sheet)' },
	{ id: 'n2', top: 30, left: 8, width: 5, tint: 'var(--lemon)' },
	{ id: 'n3', top: 62, left: 4, width: 12, tint: 'var(--sheet)' },
	{ id: 'n4', top: 44, left: 15, width: 7, tint: 'var(--spring)' },
	{ id: 'n5', top: 20, left: 19, width: 4, tint: 'var(--sheet)' },
	{ id: 'n6', top: 74, left: 17, width: 9, tint: 'var(--cantaloupe)' },
	{ id: 'n7', top: 36, left: 26, width: 11, tint: 'var(--sheet)' },
	{ id: 'n8', top: 54, left: 31, width: 5, tint: 'var(--lemon)' },
	{ id: 'n9', top: 16, left: 34, width: 8, tint: 'var(--sheet)' },
	{ id: 'n10', top: 68, left: 38, width: 6, tint: 'var(--magenta)' },
	{ id: 'n11', top: 26, left: 43, width: 10, tint: 'var(--sheet)' },
	{ id: 'n12', top: 48, left: 46, width: 4, tint: 'var(--spring)' },
	{ id: 'n13', top: 80, left: 44, width: 7, tint: 'var(--sheet)' },
	{ id: 'n14', top: 34, left: 55, width: 6, tint: 'var(--sheet)' },
	{ id: 'n15', top: 58, left: 58, width: 12, tint: 'var(--lemon)' },
	{ id: 'n16', top: 14, left: 63, width: 5, tint: 'var(--sheet)' },
	{ id: 'n17', top: 70, left: 68, width: 8, tint: 'var(--sheet)' },
	{ id: 'n18', top: 42, left: 72, width: 9, tint: 'var(--cantaloupe)' },
	{ id: 'n19', top: 24, left: 78, width: 6, tint: 'var(--sheet)' },
	{ id: 'n20', top: 64, left: 82, width: 11, tint: 'var(--spring)' },
	{ id: 'n21', top: 50, left: 88, width: 5, tint: 'var(--sheet)' },
	{ id: 'n22', top: 18, left: 91, width: 7, tint: 'var(--sheet)' },
]

export function HeroRoll() {
	return (
		<div className="hero-roll" aria-hidden="true" data-hero-roll>
			<div className="hero-roll-track">
				{[0, 1].map(pass => (
					<div key={pass} className="hero-roll-pass">
						{NOTES.map(note => (
							<span
								key={`${pass}-${note.id}`}
								className="hero-roll-note"
								style={{
									insetBlockStart: `${note.top}%`,
									insetInlineStart: `${note.left}%`,
									inlineSize: `${note.width}%`,
									backgroundColor: note.tint,
								}}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
