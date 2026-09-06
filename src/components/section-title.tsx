import { emWidth, fitToBox } from '@/lib/type/display-advance'

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
	const narrowLine = broken === null ? widest : broken.longest

	// `cqi`, not `vw`. The band is the container, so this is its real content width: the
	// scrollbar is already excluded and so is the band's own padding, which is what the old
	// `100vw - 4rem` was trying and failing to subtract. The ceiling is a guard for very
	// wide viewports, not a size.
	const size = (line: string) => {
		const { em, reserve } = fitToBox(line)
		return `clamp(2.25rem, calc((100cqi - ${reserve}px) / ${em.toFixed(3)}), 44rem)`
	}

	return (
		<div
			data-section-title
			className={`section-title border-b-brutal border-border ${grounds[tone]} px-5 py-8 sm:px-8 sm:py-10`}
			style={
				{
					'--title-wide': size(widest),
					'--title-narrow': size(narrowLine),
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
