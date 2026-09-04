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

	it('measures every offset from the earliest year', () => {
		const arrangement = arrange(entries, entry => entry.period)
		expect(arrangement?.firstYear).toBe(2019)
		expect(arrangement?.lanes.map(lane => lane.offset)).toEqual([0, 3, 5, 6])
	})

	it('makes a clip as long as the years it covers', () => {
		const arrangement = arrange(entries, entry => entry.period)
		expect(arrangement?.lanes.map(lane => lane.length)).toEqual([3, 4, 1, 1])
	})

	it('keeps an entry whose period has no year, placing it after the known ones', () => {
		const arrangement = arrange([{ period: '2019–2022' }, { period: 'in corso' }], entry => entry.period)
		expect(arrangement?.lanes).toHaveLength(2)
		expect(arrangement?.lanes[1]).toEqual({ entry: { period: 'in corso' }, offset: 3, length: 1 })
	})

	it('reports nothing to draw when no entry carries a year', () => {
		expect(arrange([{ period: 'in corso' }], entry => entry.period)).toBeNull()
	})

	it('reports nothing to draw for an empty timeline', () => {
		expect(arrange([], () => null)).toBeNull()
	})
})
