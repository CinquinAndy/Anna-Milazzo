/**
 * A keyboard along the foot of the hero, playing a phrase to itself.
 *
 * Not arbitrary decoration: piano is Anna's first instrument, it is in her skills and it
 * is what her conservatory entry says. A keyboard is the one music object on this page
 * that is about *her* rather than about music in general.
 *
 * The motion is a loop rather than a transition, which is the whole point: audio is
 * periodic and continuous, so graphics that are periodic and continuous read as audio,
 * where a one-shot ease-out reads as an interface. The phrase below is a fixed sequence of
 * offsets inside one bar, so the same keys fall in the same order every cycle instead of a
 * wave running along the keyboard, a wave reads as a loading state.
 *
 * Decorative: hidden from assistive technology, and completely still under reduced motion.
 */

/** Where the black keys sit within an octave: after the 1st, 2nd, 4th, 5th and 6th white key. */
const BLACK_AFTER = new Set([0, 1, 3, 4, 5])

const OCTAVES = 3
const WHITE_PER_OCTAVE = 7

/**
 * Beats at which each white key is struck, as a fraction of the loop. Keys not listed stay
 * down for the whole cycle. Written by hand so the phrase steps around rather than running
 * left to right.
 */
const PHRASE: Record<number, number> = {
	2: 0,
	9: 0.08,
	6: 0.17,
	13: 0.25,
	4: 0.33,
	11: 0.42,
	0: 0.5,
	16: 0.58,
	7: 0.67,
	18: 0.75,
	5: 0.83,
	12: 0.92,
}

const CYCLE_SECONDS = 4.8

export function Piano({ className }: { className?: string }) {
	const whiteKeys = Array.from({ length: OCTAVES * WHITE_PER_OCTAVE }, (_, index) => index)

	return (
		<div className={`piano ${className ?? ''}`} aria-hidden="true" data-piano>
			{whiteKeys.map(index => {
				const beat = PHRASE[index]
				const hasBlack = BLACK_AFTER.has(index % WHITE_PER_OCTAVE)

				return (
					<span key={index} className="piano-white" data-struck={beat === undefined ? undefined : 'true'}>
						{beat === undefined ? null : (
							<span
								className="piano-hit"
								style={{
									animationDuration: `${CYCLE_SECONDS}s`,
									animationDelay: `-${(CYCLE_SECONDS * (1 - beat)).toFixed(2)}s`,
								}}
							/>
						)}
						{hasBlack ? <span className="piano-black" /> : null}
					</span>
				)
			})}
		</div>
	)
}
