import { describe, expect, it } from 'vitest'
import { arrange, parseSpan } from '@/lib/timeline/span'

describe('reading a period', () => {
	it('reads a range written with an en dash', () => {
		expect(parseSpan('2019–2022')).toEqual({ start: 2019, end: 2022 })
	})

	it('reads a range written with spaces and a hyphen', () => {
		expect(parseSpan('2022 - 2026')).toEqual({ start: 2022, end: 2026 })
	})

	it('gives a single year a length of one, because a year is not an instant', () => {
		expect(parseSpan('2024')).toEqual({ start: 2024, end: 2025 })
	})

	it('swaps a reversed range rather than discarding the entry', () => {
		expect(parseSpan('2026–2022')).toEqual({ start: 2022, end: 2026 })
	})

	it('ignores numbers that cannot be years', () => {
		expect(parseSpan('8 minuti, 2024')).toEqual({ start: 2024, end: 2025 })
	})

	it('reports nothing readable rather than guessing', () => {
		expect(parseSpan('in corso')).toBeNull()
		expect(parseSpan('')).toBeNull()
		expect(parseSpan(null)).toBeNull()
	})
})

describe('laying entries against one ruler', () => {
	const entries = [{ period: '2019–2022' }, { period: '2022–2026' }, { period: '2024' }, { period: '2025' }]

	it('counts the ruler down from the most recent year', () => {
		const arrangement = arrange(entries, entry => entry.period)
		expect(arrangement?.firstYear).toBe(2019)
		// Bar zero is the newest. The conservatory and the 2025 commission both end in 2026,
		// so both sit at zero; 2019–2022 ends four bars earlier, so it sits at four.
		expect(arrangement?.lanes.map(lane => lane.offset)).toEqual([0, 0, 1, 4])
	})

	it('makes a clip as long as the years it covers, whichever way the ruler runs', () => {
		const arrangement = arrange(entries, entry => entry.period)
		// Reversing the axis must not squash anything: the four-year conservatory is still
		// four bars and the three-year liceo still three.
		expect([...(arrangement?.lanes.map(lane => lane.length) ?? [])].sort()).toEqual([1, 1, 3, 4])
	})

	it('puts the most recent entry in the top lane, at the left edge', () => {
		const arrangement = arrange(entries, entry => entry.period)
		const offsets = arrangement?.lanes.map(lane => lane.offset) ?? []
		// A track sheet reads top down and a CV reads newest first; unsorted, the top line of
		// the arrangement was the oldest thing on it, and it began off the right edge of a
		// strip that has to be scrolled.
		expect(offsets).toEqual([...offsets].sort((a, b) => a - b))
		// Ordered by the same quantity that positions them horizontally, so the blocks step
		// down and to the right from the top left rather than scattering.
		expect(arrangement?.lanes[0]?.entry.period).toBe('2022–2026')
		expect(arrangement?.lanes[0]?.offset, 'the newest entry is not against the left edge').toBe(0)
	})

	it('keeps two entries that end in the same year in the order they were written', () => {
		const arrangement = arrange(
			[{ period: '2024 — first' }, { period: '2024 — second' }, { period: '2019' }],
			entry => entry.period
		)
		expect(arrangement?.lanes.map(lane => lane.entry.period)).toEqual(['2024 — first', '2024 — second', '2019'])
	})

	it('keeps an entry whose period has no year, and treats it as the most recent', () => {
		const arrangement = arrange([{ period: '2019–2022' }, { period: 'in corso' }], entry => entry.period)
		expect(arrangement?.lanes).toHaveLength(2)
		// Placed after the last known bar, which on a reversed ruler is bar zero — the top
		// lane at the left edge, where something still going on belongs.
		expect(arrangement?.lanes[0]).toEqual({ entry: { period: 'in corso' }, offset: 0, length: 1 })
	})

	it('reports nothing to draw when no entry carries a year', () => {
		expect(arrange([{ period: 'in corso' }], entry => entry.period)).toBeNull()
	})

	it('reports nothing to draw for an empty timeline', () => {
		expect(arrange([], () => null)).toBeNull()
	})
})
