import type { CSSProperties } from 'react'

/**
 * The scrapbook layer: asterisks, arrows, hand-drawn underlines, blobs.
 *
 * Every one of these is decoration and nothing else. They are hidden from assistive
 * technology, they carry no meaning that does not exist in the text beside them, and the
 * page reads correctly with all of them deleted — which is the test that keeps this layer
 * additive rather than load-bearing.
 *
 * Lime lives here and nowhere else: never as a fill behind type, never on a control.
 *
 * Rotation is composition, not animation. Each placement passes its own angle, and no two
 * are the same — a shared value reads as a repeated component, which is the tell this
 * whole layer is trying to avoid.
 */

export type OrnamentKind = 'asterisk' | 'arrow' | 'underline' | 'blob' | 'cross'

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
	tone = 'lime',
}: {
	kind: OrnamentKind
	/** Degrees. Unique across the page, and never zero. */
	rotation: number
	className?: string
	tone?: 'lime' | 'ink' | 'blue'
}) {
	const shape = SHAPES[kind]
	const colour = tone === 'lime' ? 'var(--decor-lime)' : tone === 'blue' ? 'var(--primary)' : 'var(--border)'

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
