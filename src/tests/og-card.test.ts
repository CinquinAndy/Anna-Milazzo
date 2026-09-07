import { describe, expect, it } from 'vitest'
import { SEED_HOME } from '@/seed/content'

/**
 * The card's discipline row measures itself, because a fixed count cannot serve two
 * languages: "Registrazione sul campo" is twenty-three characters against "Field
 * recording"'s fifteen, and a fourth Italian pill runs off the card.
 *
 * This holds the arithmetic to the same numbers the component draws with, so a change to
 * the type size or the gutters that would push a pill off the edge fails here rather than
 * in a social preview nobody looks at.
 */
const MONO_ADVANCE = 0.65
const PILL_FONT = 20
const PILL_TRACKING = 0.06
const PILL_CHROME = 40
const PILL_GAP = 14
const PILL_ROW = 1200 - 64 * 2 - 6

const width = (label: string) => label.length * PILL_FONT * (MONO_ADVANCE + PILL_TRACKING) + PILL_CHROME

const fit = (labels: readonly string[]) => {
	const taken: string[] = []
	let used = 0
	for (const label of labels) {
		const next = used + (taken.length > 0 ? PILL_GAP : 0) + width(label)
		if (next > PILL_ROW) {
			break
		}
		used = next
		taken.push(label)
	}
	return taken
}

describe('the OG card row of disciplines', () => {
	for (const locale of ['it', 'en'] as const) {
		it(`takes at least two and never overruns the card in ${locale}`, () => {
			const entries = SEED_HOME[locale].skills.entries
			const taken = fit(entries)

			// Two is the floor at which the row still says more than one thing.
			expect(taken.length, `only ${taken.length} pill(s) fit in ${locale}`).toBeGreaterThanOrEqual(2)

			const used = taken.reduce((sum, label, index) => sum + width(label) + (index > 0 ? PILL_GAP : 0), 0)
			expect(used, `the row is ${Math.round(used)}px of ${PILL_ROW}px in ${locale}`).toBeLessThanOrEqual(PILL_ROW)
		})
	}

	it('takes them in the order Anna set, never reordered to pack more in', () => {
		const entries = SEED_HOME.it.skills.entries
		const taken = fit(entries)
		expect(taken).toEqual(entries.slice(0, taken.length))
	})
})
