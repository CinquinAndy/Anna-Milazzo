import type { CSSProperties } from 'react'

/**
 * The scrapbook layer: asterisks, arrows, hand-drawn underlines, blobs.
 *
 * Every one of these is decoration and nothing else. They are hidden from assistive
 * technology, they carry no meaning that does not exist in the text beside them, and the
 * page reads correctly with all of them deleted — which is the test that keeps this layer
 * additive rather than load-bearing.
 *
 * Ornament colour is ink by default — the only value that clears 3:1 against all six
 * section grounds. The other tones exist for the two grounds where ink would be dull.
 *
 * Rotation is composition, not animation. Each placement passes its own angle, and no two
 * are the same — a shared value reads as a repeated component, which is the tell this
 * whole layer is trying to avoid.
 */

export type OrnamentKind = 'asterisk' | 'arrow' | 'underline' | 'blob' | 'cross' | 'sparkle'

const SHAPES: Record<OrnamentKind, { viewBox: string; path: React.ReactNode }> = {
	asterisk: {
		viewBox: '0 0 100 100',
		path: (
			<g stroke="currentColor" strokeWidth="11" strokeLinecap="round">
				<line x1="50" y1="12" x2="50" y2="88" />
				<line x1="18" y1="30" x2="82" y2="70" />
				<line x1="18" y1="70" x2="82" y2="30" />
			</g>
		),
	},
	arrow: {
		viewBox: '0 0 120 60',
		path: (
			<g fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
				<path d="M6 34 C 30 8, 62 8, 108 26" />
				<path d="M88 8 L110 27 L86 40" />
			</g>
		),
	},
	underline: {
		viewBox: '0 0 200 24',
		path: (
			<g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round">
				<path d="M6 15 C 52 5, 104 20, 194 9" />
			</g>
		),
	},
	blob: {
		viewBox: '0 0 100 100',
		path: <path fill="currentColor" d="M52 6c22-4 42 14 41 36s-10 42-33 48S16 78 12 56 30 10 52 6z" />,
	},
	/* The four-point star that runs through every reference the client sent. Concave sides
	   rather than a rotated square: it is the star's pinched waist that reads as a sparkle. */
	sparkle: {
		viewBox: '0 0 100 100',
		path: <path fill="currentColor" d="M50 0c4 28 18 42 46 46-28 4-42 18-46 46-4-28-18-42-46-46 28-4 42-18 46-46z" />,
	},
	cross: {
		viewBox: '0 0 100 100',
		path: (
			<g stroke="currentColor" strokeWidth="13" strokeLinecap="round">
				<line x1="16" y1="16" x2="84" y2="84" />
				<line x1="84" y1="16" x2="16" y2="84" />
			</g>
		),
	},
}

export function Ornament({
	kind,
	rotation,
	className,
	tone = 'ink',
}: {
	kind: OrnamentKind
	/** Degrees. Unique across the page, and never zero. */
	rotation: number
	className?: string
	tone?: 'ink' | 'blue' | 'magenta' | 'sheet'
}) {
	const shape = SHAPES[kind]
	const TONES = { ink: 'var(--ink)', blue: 'var(--blue)', magenta: 'var(--magenta)', sheet: 'var(--sheet)' }
	const colour = TONES[tone]

	return (
		<span
			aria-hidden="true"
			data-ornament={kind}
			data-rotation={rotation}
			className={`pointer-events-none absolute ${className ?? ''}`}
			style={{ transform: `rotate(${rotation}deg)`, color: colour } as CSSProperties}
		>
			<svg viewBox={shape.viewBox} className="block h-full w-full" focusable="false" role="presentation">
				{shape.path}
			</svg>
		</span>
	)
}
