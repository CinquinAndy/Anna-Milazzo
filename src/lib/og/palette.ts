/**
 * The palette, as hex, for the one renderer that cannot read the stylesheet.
 *
 * `ImageResponse` draws with Satori, which never loads globals.css, so the OG card cannot
 * use `var(--blue)` or a Tailwind colour utility: Satori's own Tailwind is the default
 * config, where `bg-blue-500` is a completely different blue. These are the same colours
 * the site paints with, written the one other way they exist.
 *
 * Each value is the hex the stylesheet records in the comment beside its oklch token, and
 * `src/tests/og-palette.test.ts` fails if the two ever drift apart.
 */
export const OG = {
	/** Every keyline, and the type on every light ground. */
	ink: '#000000',
	/** The warm paper the page sits on. */
	paper: '#FEE5DB',
	/** Folder bodies and inputs, the off-white that is never pure white. */
	sheet: '#FDFCF8',
	/** The anchor. The hero's ground, and the card's. */
	blue: '#3866A8',
	/** Pantone 15-1239 Cantaloupe. Black type only, 2.078:1 on white. */
	cantaloupe: '#F79E76',
	lemon: '#F7D725',
	spring: '#57E486',
	/** Rationed on the site, and rationed here: one pill, never a ground. */
	magenta: '#F74183',
	grape: '#9B35D1',
} as const
