import { OG } from '@/lib/og/palette'

/**
 * The colour of each Tab on the Folder, and of the type set on it.
 *
 * The reference Anna sent runs its tabs through the spectrum, one hue each, left to right.
 * The palette already holds that walk if it is read in hue order: blue (257.59), spring
 * (151.175), lemon (97.968), magenta (4.005), grape (310.797), each one lattice step or two
 * from the last. Cantaloupe is left out because it is the ground the whole section sits on,
 * and a cantaloupe Tab would be a hole in the Folder. Past five Songs the walk starts again
 * from blue, which is still a rainbow read left to right rather than a repeated colour
 * beside itself.
 *
 * Fixed stops rather than mixes between them. A `color-mix` halfway between two stops is a
 * colour this site does not have, and one whose contrast nobody has measured.
 */
export type TabColour = {
	/** The token the Tab and, while it is open, the Folder are filled with. */
	fill: string
	/** The token its type is set in. */
	ink: string
	/** The same two as hex, for the contrast check. The stylesheet is the source of both. */
	hex: { fill: string; ink: string }
}

const WHITE = '#FFFFFF'

/**
 * In walk order. The type colour is chosen per stop and not from the paired `-foreground`
 * tokens: `--magenta-foreground` is white, which is 3.3:1 on magenta and fine for the large
 * pill it was made for, and not for a label of thirteen pixels.
 */
const WALK: readonly TabColour[] = [
	{ fill: 'var(--blue)', ink: 'var(--primary-foreground)', hex: { fill: OG.blue, ink: WHITE } },
	{ fill: 'var(--spring)', ink: 'var(--ink)', hex: { fill: OG.spring, ink: OG.ink } },
	{ fill: 'var(--lemon)', ink: 'var(--ink)', hex: { fill: OG.lemon, ink: OG.ink } },
	{ fill: 'var(--magenta)', ink: 'var(--ink)', hex: { fill: OG.magenta, ink: OG.ink } },
	{ fill: 'var(--grape)', ink: 'var(--grape-foreground)', hex: { fill: OG.grape, ink: WHITE } },
]

/** The colour of the Tab at `index`, for any number of Songs. */
export function tabColour(index: number): TabColour {
	const stop = WALK[((index % WALK.length) + WALK.length) % WALK.length]
	if (stop === undefined) {
		throw new Error('the Tab colour walk is empty')
	}
	return stop
}

/** WCAG 2 relative luminance of a `#RRGGBB` colour. */
export function luminance(hex: string): number {
	const channel = (offset: number) => {
		const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

/** WCAG 2 contrast ratio between two `#RRGGBB` colours. */
export function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
	return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)
}
