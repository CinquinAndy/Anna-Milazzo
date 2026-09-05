/**
 * A crescendo hairpin across the hero, with "poco a poco" written along its axis.
 *
 * The mark a composer writes when the music should get bigger little by little. It is not
 * a picture of sound, a waveform, a meter, a ripple all depict a signal that already
 * exists, downstream of someone playing. A hairpin is upstream: intent, written on paper,
 * before anyone has played anything. That is the difference between a musician and a
 * composer, and the second word is her job.
 *
 * The words are Italian and stay Italian in the English build. Every score on earth is
 * annotated in Italian and she is Italian, so this is the one string on the site that is
 * correctly untranslated, no Payload field, no locale to keep in step.
 *
 * Four straight strokes and three words. No curve, no arc, no radius, nothing repeated and
 * nothing tiled, which is deliberate, since the two rejected attempts were both fields of
 * scattered shapes.
 *
 * Static. An animated read-along of the words is the karaoke gesture, which is the worst
 * genre this page could accidentally join; the mark does all its work standing still.
 *
 * It lives in the band between the buttons and the keyboard, the gutter the two-column
 * grid leaves empty, rather than across the whole hero. A full-bleed mark has nowhere to
 * go in a hero that already holds a name at 11rem, a portrait, a record, a badge and three
 * octaves; put there it crosses everything and reads as a stray diagonal.
 *
 * `preserveAspectRatio="none"` is safe here, and only here: every stroke carries
 * `vector-effect: non-scaling-stroke`, so stretching the coordinate system moves the ends
 * of the arms without thickening them. The type stretches with the box, which is what makes
 * the crescendo widen with the viewport instead of floating in the middle of it.
 */

/** Point at the left, mouth opening right and off the edge, a crescendo, not a diminuendo. */
const POINT = { x: 8, y: 80 }
const MOUTH_X = 1436
const UPPER_Y = 8
const LOWER_Y = 152

/** On the axis between the arms, growing as the mouth widens. */
const WORDS = [
	{ id: 'w1', text: 'poco', x: 300, size: 26 },
	{ id: 'w2', text: 'a', x: 640, size: 42 },
	{ id: 'w3', text: 'poco', x: 1010, size: 66 },
]

/** Where the axis sits at a given x, the mean of the two arms. */
function axisY(x: number): number {
	const t = (x - POINT.x) / (MOUTH_X - POINT.x)
	return POINT.y + t * ((UPPER_Y + LOWER_Y) / 2 - POINT.y)
}

export function Hairpin() {
	return (
		<svg
			className="hairpin"
			viewBox="0 0 1440 160"
			preserveAspectRatio="none"
			aria-hidden="true"
			focusable="false"
			role="presentation"
		>
			<title>Crescendo</title>
			{/* non-scaling-stroke so the arms stay exactly 4px, the page's border width, at
			    every viewport, instead of fattening with the viewBox. */}
			<g
				className="hairpin-mark"
				fill="none"
				stroke="var(--ink)"
				strokeWidth="4"
				strokeLinecap="butt"
				vectorEffect="non-scaling-stroke"
			>
				<line x1={POINT.x} y1={POINT.y} x2={MOUTH_X} y2={UPPER_Y} vectorEffect="non-scaling-stroke" />
				<line x1={POINT.x} y1={POINT.y} x2={MOUTH_X} y2={LOWER_Y} vectorEffect="non-scaling-stroke" />
			</g>

			<g className="hairpin-words" fill="var(--ink)">
				{WORDS.map(word => (
					<text
						key={word.id}
						x={word.x}
						y={axisY(word.x)}
						fontSize={word.size}
						fontFamily="var(--font-display)"
						fontStyle="italic"
						textAnchor="middle"
						dominantBaseline="middle"
					>
						{word.text}
					</text>
				))}
			</g>
		</svg>
	)
}
