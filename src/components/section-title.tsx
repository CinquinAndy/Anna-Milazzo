/**
 * A section heading as a full-bleed band: the words set as large as the page allows,
 * inside a dark block that runs edge to edge.
 *
 * The client asked for this device by name from a record-label reference — the title that
 * takes the whole width in a very stylised face inside a dark block. It is what stops a
 * section reading as a column of content with a label on top: the heading stops being
 * a caption and becomes the thing you see.
 *
 * Sized from the character count rather than by a fixed clamp, so the words actually
 * reach both edges. A fixed clamp caps a short heading at the same size as a long one, and
 * "ASCOLTA" then sits in a third of the band with black to spare — which is the one thing
 * this device must not do.
 *
 * The alternative would be stretching the glyphs to the width with SVG `lengthAdjust`,
 * which distorts the letterforms and throws away the reason for choosing a face with a
 * real width axis. Here the size is arithmetic instead: a heading of n characters fills a
 * band of width W at roughly W / (kn), where k is the average advance per uppercase
 * character.
 *
 * k was MEASURED, not guessed — Bricolage Grotesque at font-stretch 74%, uppercase, gives
 * 0.284em for "COSA SO FARE", 0.303em for "ASCOLTA" and 0.328em for "PERCORSO". The value
 * below is the top of that range, because the cost of the two cases is not symmetric: a
 * heading that underfills by a tenth reads as measured, one that overflows is a bug. The
 * first pass used 0.55 from memory and every title landed at under half the band.
 *
 * If the display face or the stretch changes, re-measure. A Range over the h2's contents
 * gives the glyph width; divide by font-size and character count.
 */
const EM_PER_CHARACTER = 0.32
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
	// The longest line decides: a heading that wraps must still fit on its widest line.
	const longestLine = Math.max(...children.split(/\s{2,}|\n/).map(line => line.length), 1)
	// The ceiling is a guard for very wide viewports, not a size: at 1440px the widest
	// heading here needs 38rem, so nothing on a normal screen ever reaches it.
	const size = `clamp(2.25rem, calc((100vw - 4rem) / ${(longestLine * EM_PER_CHARACTER).toFixed(2)}), 44rem)`

	return (
		<div className={`border-b-brutal border-border ${grounds[tone]} px-5 py-8 sm:px-8 sm:py-10`}>
			<h2
				id={id}
				style={{ fontSize: size }}
				className="font-display text-sheet leading-[0.86] uppercase [font-stretch:74%] [letter-spacing:-0.02em]"
			>
				{children}
			</h2>
		</div>
	)
}
