/**
 * A section heading as a full-bleed band: the words set as large as the page allows,
 * inside a dark block that runs edge to edge.
 *
 * The client asked for this device by name from a record-label reference, the title that
 * takes the whole width in a very stylised face inside a dark block. It is what stops a
 * section reading as a column of content with a label on top: the heading stops being
 * a caption and becomes the thing you see.
 *
 * Sized from the letters rather than by a fixed clamp, so the words actually reach both
 * edges. A fixed clamp caps a short heading at the same size as a long one, and "ASCOLTA"
 * then sits in a third of the band with black to spare, which is the one thing this device
 * must not do.
 *
 * The alternative would be stretching the glyphs to the width with SVG `lengthAdjust`,
 * which distorts the letterforms and throws away the reason for choosing a face with a
 * real width axis. Here the size is arithmetic instead: a line whose letters add up to
 * `n` em fills a band of `W` at `W / n`.
 *
 * It used to average that: one constant, 0.32em per character. An average is wrong for
 * every actual word, and it was wrong in the dangerous direction for two of them.
 * PERCORSO runs 0.328 and ABOUT 0.332, so both came out 2.5% to 4% too wide; the about
 * section clips, so ABOUT was sliced flat by the viewport edge, and the timeline section
 * does not, so PERCORSO widened the document and made the whole page scroll sideways on
 * any machine with a classic scrollbar. The table below is the real advance of every
 * glyph, so the arithmetic is now right per word instead of right on average.
 */

/**
 * Advance per glyph in em, Bricolage Grotesque at font-stretch 74%, uppercase, with the
 * -0.02em tracking the heading renders with already counted in.
 *
 * MEASURED, not taken from the font's tables: a Range over a span carrying the h2's own
 * computed style, at font-size 1000px, each value rounded up. Four decimals because two
 * lost enough per glyph that ABOUT summed to 1.66 against a real 1.6707, which at 1024px
 * put the word six pixels past its band.
 *
 * Summing is still not exact. Most pairs kern together, so a word usually comes out under
 * its summed advances by up to 0.12em, but a few kern apart and come out over by about
 * 0.003em. That is why SLACK below is not optional.
 *
 * If the display face, its stretch or its tracking changes, measure again.
 */
const ADVANCE: Record<string, number> = {
	A: 0.3421,
	B: 0.336,
	C: 0.334,
	D: 0.338,
	E: 0.265,
	F: 0.261,
	G: 0.3391,
	H: 0.349,
	I: 0.1391,
	J: 0.199,
	K: 0.346,
	L: 0.261,
	M: 0.522,
	N: 0.409,
	O: 0.3431,
	P: 0.33,
	Q: 0.3431,
	R: 0.346,
	S: 0.316,
	T: 0.304,
	U: 0.346,
	V: 0.359,
	W: 0.565,
	X: 0.357,
	Y: 0.328,
	Z: 0.288,
	À: 0.3421,
	Á: 0.3421,
	È: 0.265,
	É: 0.265,
	Ì: 0.1391,
	Í: 0.1391,
	Ò: 0.3431,
	Ó: 0.3431,
	Ù: 0.346,
	Ú: 0.346,
	'0': 0.322,
	'1': 0.163,
	'2': 0.304,
	'3': 0.305,
	'4': 0.3431,
	'5': 0.321,
	'6': 0.338,
	'7': 0.283,
	'8': 0.331,
	'9': 0.335,
	' ': 0.123,
	'’': 0.107,
	"'": 0.094,
	'-': 0.15,
	',': 0.084,
	'.': 0.078,
	':': 0.086,
	'&': 0.473,
}

/** Anything not in the table, sized as the widest letter so an unknown glyph cannot overflow. */
const UNKNOWN = 0.565

/**
 * One percent of the line held back, and a pixel per glyph on top.
 *
 * The percentage covers the kerning the table cannot see. The pixel per glyph covers
 * something the table cannot fix at all: an advance measured at 1000px does not predict
 * rendering at 80px, because every glyph's advance rounds to the device grid and the error
 * accumulates with the letter count. Measured, the eight-glyph PERCORSO comes out 0.4%
 * wider than its table sum, while the twenty-three-glyph "TRAINING AND EXPERIENCE" comes
 * out 7.4% wider at 76px. A flat percentage big enough for the long one would rob every
 * short one; a pixel a letter costs the long heading twenty-three pixels of a 576px band
 * and the short one eight.
 */
const SLACK = 1.01

/**
 * The pixels each glyph can gain to rounding at the sizes headings are actually set at.
 *
 * 2.5, measured rather than reasoned: the gap between the table and the rendering shrinks
 * as the type grows, 2px a glyph at 71px, 1.4 at 82px, 0.8 at 86px and nothing by 1000px,
 * so the smallest heading on the smallest phone sets the number. Over-reserving is cheap
 * at the sizes where it is wrong: twenty pixels of a 1376px band, under one and a half
 * percent. Under-reserving costs a line.
 */
const PER_GLYPH = 2.5

const emWidth = (line: string) => [...line.toUpperCase()].reduce((sum, glyph) => sum + (ADVANCE[glyph] ?? UNKNOWN), 0)

/**
 * The narrowest a heading may be set before it stops being this device and starts being a
 * caption. Below it, a long heading is broken over two lines and sized from the longer of
 * them instead.
 *
 * 4.5rem because the English "TRAINING AND EXPERIENCE" is the case that forced this: 23
 * characters against a 280px band at 320px came out at 40px, wrapped to two lines anyway,
 * and filled barely half the band while the Italian PERCORSO beside it filled it edge to
 * edge at 104px.
 */
const CAPTION_FLOOR = 72

/**
 * The band's content width at the top of the range where the broken pair is used, 512px
 * minus the 40px of padding the band carries below sm.
 *
 * The decision has to be made once, in the component, for a breakpoint the stylesheet
 * applies: 512px is where the longest heading on the site stops being a caption on one
 * line. Below it, a heading long enough to fall under the floor there is set as two lines
 * all the way down to 320.
 */
const NARROW_BAND = 472

/**
 * Splits a heading into two lines at the space that leaves the two sides most even, so the
 * pair is sized by the shorter longest-line and therefore set as large as possible.
 */
function balance(heading: string) {
	const words = heading.split(' ')
	if (words.length < 2) {
		return null
	}
	let best: { longest: string; widest: number } | null = null
	for (let cut = 1; cut < words.length; cut++) {
		const head = words.slice(0, cut).join(' ')
		const tail = words.slice(cut).join(' ')
		const longest = emWidth(head) >= emWidth(tail) ? head : tail
		const widest = emWidth(longest)
		if (best === null || widest < best.widest) {
			best = { longest, widest }
		}
	}
	return best
}

export function SectionTitle({
	children,
	tone = 'ink',
	id,
}: {
	children: string
	tone?: 'ink' | 'grape' | 'blue'
	id?: string | undefined
}) {
	const grounds = { ink: 'bg-ink', grape: 'bg-grape', blue: 'bg-primary' }

	// An explicit break in the CMS string still wins: two spaces or a newline, as before.
	const written = children
		.split(/\s{2,}|\n/)
		.map(line => line.trim())
		.filter(Boolean)
	const widest = written.reduce(
		(longest, line) => (emWidth(line) > emWidth(longest) ? line : longest),
		written[0] ?? ''
	)
	const wide = Math.max(emWidth(widest), 0.5)

	// Below sm the band is 472px at the top of the range. If one line would be a caption
	// there, set the broken pair instead, and size from its longer line.
	const split = written.length === 1 ? balance(written[0] ?? '') : null
	const broken = split !== null && NARROW_BAND / wide < CAPTION_FLOOR ? split : null
	const narrow = broken === null ? wide : broken.widest
	const narrowLine = broken === null ? widest : broken.longest

	// `cqi`, not `vw`. The band is the container, so this is its real content width: the
	// scrollbar is already excluded and so is the band's own padding, which is what the old
	// `100vw - 4rem` was trying and failing to subtract. The ceiling is a guard for very
	// wide viewports, not a size.
	const size = (em: number, glyphs: number) =>
		`clamp(2.25rem, calc((100cqi - ${(glyphs * PER_GLYPH).toFixed(1)}px) / ${(em * SLACK).toFixed(3)}), 44rem)`

	return (
		<div
			data-section-title
			className={`section-title border-b-brutal border-border ${grounds[tone]} px-5 py-8 sm:px-8 sm:py-10`}
			style={
				{
					'--title-wide': size(wide, widest.length),
					'--title-narrow': size(narrow, narrowLine.length),
				} as React.CSSProperties
			}
		>
			{/* The pair is never written into the markup as a hard break: at the wide size the
			    heading fits one line and must stay on one. At the narrow size it no longer
			    fits, so it wraps on its own, and `text-wrap: balance` makes the two lines the
			    even pair the size was computed for. */}
			<h2
				id={id}
				className="font-display text-sheet leading-[0.86] text-balance uppercase [font-stretch:74%] [letter-spacing:-0.02em]"
			>
				{written.join(' ')}
			</h2>
		</div>
	)
}
