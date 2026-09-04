/**
 * A column of musical directions, scrolling.
 *
 * This replaces two attempts at the same slot that both failed the same way — a cassette,
 * then a metronome. Each was a drawing of an object dropped into a corner, and a drawing of
 * an object reads as clip-art whichever object you pick. The problem was the kind of thing,
 * not the choice of thing.
 *
 * So this is not an object. It is the vocabulary of the job: the words a composer writes on
 * a score to tell a player what to do. Typographic, which is what the rest of this site is;
 * moving, because a list that scrolls is a list you read rather than scan; and musical
 * without depicting anything.
 *
 * The words stay Italian in the English build, and that is not an oversight. Every score on
 * earth is annotated in Italian and Anna is Italian — this is the one string on the site
 * that is correctly untranslated, which also means no CMS field and no locale to keep in
 * step.
 */

/** Tempo, dynamics and articulation — the three things a direction can be about. */
const TERMS = [
	{ id: 't1', word: 'allegro', tint: 'bg-lemon' },
	{ id: 't2', word: 'pianissimo', tint: 'bg-sheet' },
	{ id: 't3', word: 'rubato', tint: 'bg-magenta' },
	{ id: 't4', word: 'legato', tint: 'bg-accent' },
	{ id: 't5', word: 'crescendo', tint: 'bg-sheet' },
	{ id: 't6', word: 'sostenuto', tint: 'bg-lemon' },
	{ id: 't7', word: 'dolce', tint: 'bg-accent' },
	{ id: 't8', word: 'andante', tint: 'bg-sheet' },
	{ id: 't9', word: 'staccato', tint: 'bg-magenta' },
	{ id: 't10', word: 'con brio', tint: 'bg-lemon' },
] as const

/** Never zero, never repeated in sequence: a shared angle reads as a repeated component. */
const TILTS = [-2.4, 1.8, -1.2, 2.6, -1.9, 1.3, -2.7, 1.1, -1.6, 2.2] as const

export function Terms({ className }: { className?: string }) {
	// Two identical passes, and the track travels exactly one of them, so the loop has no
	// seam to arrive. The same construction as the marquee band further down the page.
	const passes = [0, 1]
	// Derived from the content rather than fixed, so the speed is a constant number of
	// pixels per second whatever the list grows to.
	const seconds = Math.max(20, Math.round(TERMS.reduce((n, term) => n + term.word.length, 0) * 0.9))

	return (
		<div className={`terms ${className ?? ''}`} aria-hidden="true" data-terms>
			<div className="terms-track" style={{ '--terms-duration': `${seconds}s` } as React.CSSProperties}>
				{passes.map(pass => (
					<ul key={pass} className="terms-pass">
						{TERMS.map((term, index) => (
							<li
								key={`${pass}-${term.id}`}
								className={`terms-chip ${term.tint}`}
								style={{ transform: `rotate(${TILTS[index % TILTS.length]}deg)` }}
							>
								{term.word}
							</li>
						))}
					</ul>
				))}
			</div>
		</div>
	)
}
