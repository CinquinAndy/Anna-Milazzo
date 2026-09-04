/**
 * A record, used as composition rather than as an icon.
 *
 * Grooves are the part that goes wrong: drawn as many thin evenly-spaced rings they
 * moiré the moment the disc is scaled or the display is not at 1x. So there are six
 * widely-spaced strokes at partial opacity rather than forty hairlines, and the reading
 * comes from the anatomy — black field, off-centre highlight, a coloured label, a spindle
 * hole punched clean through — not from groove density.
 *
 * Decorative throughout: it carries nothing the text beside it does not say.
 */
export function Vinyl({
	className,
	label = 'var(--accent)',
	rotation = 0,
}: {
	className?: string
	/** The paper label at the centre. Takes a colour value, not a token name. */
	label?: string
	rotation?: number
}) {
	return (
		<svg
			className={className}
			viewBox="0 0 200 200"
			aria-hidden="true"
			focusable="false"
			role="presentation"
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<title>Record</title>
			<circle cx="100" cy="100" r="98" fill="var(--ink)" stroke="var(--ink)" strokeWidth="4" />
			<g fill="none" stroke="var(--sheet)" strokeOpacity="0.16" strokeWidth="1.5">
				<circle cx="100" cy="100" r="88" />
				<circle cx="100" cy="100" r="79" />
				<circle cx="100" cy="100" r="70" />
				<circle cx="100" cy="100" r="61" />
				<circle cx="100" cy="100" r="52" />
				<circle cx="100" cy="100" r="43" />
			</g>
			{/* The label, and the keyline that makes it belong to this design rather than to
			    a stock illustration. */}
			<circle cx="100" cy="100" r="34" fill={label} stroke="var(--ink)" strokeWidth="4" />
			<circle cx="100" cy="100" r="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
		</svg>
	)
}

/**
 * A round sticker with its text set around the ring — the badge device from the client's
 * references. The word is her name, so it needs no translation and cannot fall out of
 * step with the CMS.
 */
export function Badge({ className, rotation = -8 }: { className?: string; rotation?: number }) {
	return (
		<svg
			className={className}
			viewBox="0 0 200 200"
			aria-hidden="true"
			focusable="false"
			role="presentation"
			style={{ transform: `rotate(${rotation}deg)` }}
		>
			<title>Anna Milazzo</title>
			<defs>
				{/* Started at the bottom of the circle so the text reads left to right across
				    the top of the ring rather than upside down. */}
				<path id="badge-ring" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" fill="none" />
			</defs>
			<circle cx="100" cy="100" r="96" fill="var(--lemon)" stroke="var(--ink)" strokeWidth="6" />
			<circle cx="100" cy="100" r="62" fill="var(--ink)" />
			<text fill="var(--ink)" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="3.2">
				<textPath href="#badge-ring" startOffset="0%">
					ANNA MILAZZO · ANNA MILAZZO ·
				</textPath>
			</text>
			<g stroke="var(--lemon)" strokeWidth="9" strokeLinecap="round">
				<line x1="100" y1="76" x2="100" y2="124" />
				<line x1="79" y1="88" x2="121" y2="112" />
				<line x1="79" y1="112" x2="121" y2="88" />
			</g>
		</svg>
	)
}
