/**
 * Turning a written period into a position on a time ruler.
 *
 * The CMS gives a free-text period — "2019–2022", "2024", "2022 - 2026" — because that is
 * what Anna writes, not a pair of date pickers. Reading the years out of it is what lets a
 * clip's width mean its duration: a three-year conservatory really is three times the
 * width of a one-year commission. A layout that sizes every entry the same is a chart with
 * dates on it; this is an arrangement.
 */

export type Span = { start: number; end: number }

/** Anything below this is a page number or a track count, not a year. */
const EARLIEST_PLAUSIBLE_YEAR = 1900
const LATEST_PLAUSIBLE_YEAR = 2200

/**
 * Reads the first two four-digit years out of a period.
 *
 * One year means a span of one — an entry written "2024" occupied a year, not an instant,
 * and giving it zero width would erase it from the arrangement. Reversed pairs are
 * swapped rather than rejected: "2026-2022" is a typo, not a reason to drop the entry off
 * the timeline entirely.
 */
export function parseSpan(period: string | null | undefined): Span | null {
	if (!period) {
		return null
	}

	const years = [...period.matchAll(/\d{4}/g)]
		.map(match => Number(match[0]))
		.filter(year => year >= EARLIEST_PLAUSIBLE_YEAR && year <= LATEST_PLAUSIBLE_YEAR)

	const first = years[0]
	if (first === undefined) {
		return null
	}

	const second = years[1]
	if (second === undefined) {
		return { start: first, end: first + 1 }
	}

	return second < first ? { start: second, end: first } : { start: first, end: second }
}

export type Lane<T> = {
	entry: T
	/** Years from the arrangement's first bar. */
	offset: number
	/** Length in years, never zero. */
	length: number
}

export type Arrangement<T> = {
	lanes: Lane<T>[]
	/** The first and last bar numbers on the ruler, inclusive of the end. */
	firstYear: number
	lastYear: number
	/** How many bars the ruler spans. */
	years: number
}

/**
 * Lays entries out against a shared ruler.
 *
 * Entries whose period carries no year are kept, not dropped — losing a line of someone's
 * history because they wrote "in corso" would be the worst possible failure here. They are
 * placed at the end, each one bar long.
 */
export function arrange<T>(entries: T[], periodOf: (entry: T) => string | null | undefined): Arrangement<T> | null {
	if (entries.length === 0) {
		return null
	}

	const parsed = entries.map(entry => ({ entry, span: parseSpan(periodOf(entry)) }))
	const known = parsed.filter((item): item is { entry: T; span: Span } => item.span !== null)

	if (known.length === 0) {
		return null
	}

	const firstYear = Math.min(...known.map(item => item.span.start))
	const lastYear = Math.max(...known.map(item => item.span.end))

	// Unknown periods queue after the last known bar rather than piling up on bar one,
	// where they would sit under the earliest entries and read as contemporaneous with them.
	let unknownCursor = 0

	const lanes = parsed.map(({ entry, span }) => {
		if (span === null) {
			const offset = lastYear - firstYear + unknownCursor
			unknownCursor += 1
			return { entry, offset, length: 1 }
		}
		return { entry, offset: span.start - firstYear, length: Math.max(1, span.end - span.start) }
	})

	const span = Math.max(...lanes.map(lane => lane.offset + lane.length))

	return { lanes, firstYear, lastYear: firstYear + span, years: span }
}
