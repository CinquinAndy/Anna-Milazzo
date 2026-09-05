/**
 * Generates the placeholder sleeves in `fixtures/`.
 *
 * Run by hand — `bun run src/seed/make-covers.ts`. Rasterised with sharp, which is already
 * a dependency of Payload, so this adds nothing to the project.
 *
 * WHY THESE EXIST. The first placeholders were flat single-colour squares, which is what a
 * cover looks like when it has failed to load rather than what one looks like before it has
 * been made. These are unmistakably provisional and still composed: printer's crop marks at
 * the corners say "artwork not final" in the one language every designer reads, and inside
 * them is the page's own vocabulary — an onion of quarter-arcs, flat fills inside black
 * keylines, nothing that is a drawing of an object.
 *
 * Anna's own artwork replaces these. Nothing here is meant to survive her.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const FIXTURES = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

/** Matches the size the seeded covers already are. */
const SIZE = 1200

/**
 * The palette, as literals.
 *
 * Written out rather than read from the stylesheet because this runs in Node with no
 * cascade to ask. Kept in the same order as `globals.css` declares them, so a change there
 * is easy to mirror here.
 */
const INK = '#000000'
const SHEET = '#FDFCF8'
const HUES = {
	blue: '#3866A8',
	cantaloupe: '#F79E76',
	lemon: '#F7D725',
	spring: '#57E486',
	magenta: '#F74183',
	grape: '#9B35D1',
} as const

/**
 * One sleeve per Song, keyed by the reference the seed uploads under.
 *
 * Assigned by hand rather than by hashing the reference. A hash spreads colours evenly and
 * has no idea that two sleeves sitting next to each other in a list should not both be
 * blue, or that magenta is rationed and belongs to exactly one of the five.
 */
const SLEEVES = [
	{ reference: 'notturno-per-tram-vuoto', ground: HUES.blue, arcs: [HUES.lemon, HUES.spring, SHEET], corner: 'br' },
	{ reference: 'perche-il-temporale', ground: HUES.lemon, arcs: [HUES.blue, HUES.cantaloupe, INK], corner: 'bl' },
	{ reference: 'citta-alle-quattro', ground: HUES.spring, arcs: [HUES.blue, SHEET, HUES.cantaloupe], corner: 'tr' },
	{ reference: 'studio-per-due-mani', ground: HUES.cantaloupe, arcs: [SHEET, HUES.blue, HUES.lemon], corner: 'tl' },
	{ reference: 'piu-vicino-del-previsto', ground: SHEET, arcs: [HUES.magenta, HUES.grape, HUES.blue], corner: 'br' },
] as const

/** Where the arcs radiate from, and which way the quarter turns. */
const CORNERS = {
	tl: { x: 0, y: 0, sweep: 1 },
	tr: { x: SIZE, y: 0, sweep: 0 },
	bl: { x: 0, y: SIZE, sweep: 0 },
	br: { x: SIZE, y: SIZE, sweep: 1 },
} as const

/**
 * A quarter-arc band, drawn the way this project draws every curve.
 *
 * An onion of strokes: the colour band goes over a black band sixteen units wider, so each
 * arc gets eight units of keyline on both edges without a second path. It is the only way a
 * curve obeys a system where every edge is a black line.
 */
function arcBand(corner: keyof typeof CORNERS, radius: number, tint: string, width: number) {
	const { x, y, sweep } = CORNERS[corner]
	const from = `${x === 0 ? radius : x - radius},${y}`
	const to = `${x},${y === 0 ? radius : y - radius}`
	const d = `M${from} A${radius} ${radius} 0 0 ${sweep} ${to}`
	return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${width + 16}"/><path d="${d}" fill="none" stroke="${tint}" stroke-width="${width}"/>`
}

/**
 * Printer's crop marks.
 *
 * Two strokes per corner, held clear of the edge, never touching each other. This is the
 * whole reason a viewer reads the sleeve as provisional rather than as finished art, so
 * they are drawn in ink at full strength and are not decoration to be tuned away.
 */
function cropMarks() {
	const inset = 54
	const length = 132
	const width = 9
	const marks: string[] = []
	for (const [dx, dy] of [
		[0, 0],
		[1, 0],
		[0, 1],
		[1, 1],
	] as const) {
		const x = dx === 0 ? inset : SIZE - inset
		const y = dy === 0 ? inset : SIZE - inset
		const hx = dx === 0 ? x + length : x - length
		const vy = dy === 0 ? y + length : y - length
		marks.push(
			`<path d="M${x} ${y} L${hx} ${y} M${x} ${y} L${x} ${vy}" stroke="${INK}" stroke-width="${width}" fill="none"/>`
		)
	}
	return marks.join('')
}

function sleeve(spec: (typeof SLEEVES)[number]) {
	const bands = spec.arcs
		.map((tint, index) => arcBand(spec.corner, SIZE * (0.86 - index * 0.19), tint, SIZE * 0.11))
		.join('')
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
	<rect width="${SIZE}" height="${SIZE}" fill="${spec.ground}"/>
	${bands}
	${cropMarks()}
	<rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="none" stroke="${INK}" stroke-width="28"/>
</svg>`
}

for (const spec of SLEEVES) {
	const file = path.join(FIXTURES, `cover-${spec.reference}.png`)
	await sharp(Buffer.from(sleeve(spec)))
		.png()
		.toFile(file)
	// biome-ignore lint/suspicious/noConsole: a hand-run generator whose only output is this
	console.log(`wrote ${path.basename(file)}`)
}
