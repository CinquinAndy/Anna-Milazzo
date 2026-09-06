/**
 * How wide the display face sets, so a heading can be sized to fill its box without a
 * browser to measure it in.
 *
 * Used by the section title bands and by the hero name. Both are Bricolage Grotesque set
 * uppercase and tightly tracked; the hero is two points wider in the width axis and half a
 * point tighter in the tracking, and the two differences very nearly cancel. Measured on
 * the seeded name, this table predicts the hero within one percent, which the extra slack
 * the hero asks for covers.
 */

/**
 * Advance per glyph in em, at font-stretch 74%, uppercase, with the -0.02em tracking the
 * headings render with already counted in.
 *
 * MEASURED, not taken from the font's tables: a Range over a span carrying the real
 * computed style, at font-size 1000px, each value rounded up. Four decimals because two
 * lost enough per glyph that ABOUT summed to 1.66 against a real 1.6707, which at 1024px
 * put the word six pixels past its band.
 *
 * Summing is still not exact. Most pairs kern together, so a word usually comes out under
 * its summed advances by up to 0.12em, but a few kern apart and come out over by about
 * 0.003em. That is why the slack below is not optional.
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

/** The em width of one line, uppercased, as the display face will set it. */
export function emWidth(line: string) {
	return [...line.toUpperCase()].reduce((sum, glyph) => sum + (ADVANCE[glyph] ?? UNKNOWN), 0)
}

/**
 * What to divide the box by, and what to hold back from it, to set a line that fills it.
 *
 * The proportional slack covers the kerning the table cannot see. The per-glyph pixels
 * cover something the table cannot fix at all: an advance measured at 1000px does not
 * predict rendering at 80px, because every glyph's advance rounds to the device grid and
 * the error accumulates with the letter count. Measured, the eight-glyph PERCORSO comes
 * out 0.4% wider than its table sum, while the twenty-three-glyph "TRAINING AND
 * EXPERIENCE" comes out 7.4% wider at 76px. A flat percentage big enough for the long one
 * would rob every short one; two and a half pixels a letter costs the long heading
 * fifty-eight pixels of a 576px band and the short one twenty.
 *
 * @param line  the text that has to fit
 * @param slack the proportional reserve. 1.01 where the table was measured; a little more
 *              where the face is set at a different width or tracking.
 */
export function fitToBox(line: string, slack = 1.01) {
	return { em: emWidth(line) * slack, reserve: line.length * 2.5 }
}
