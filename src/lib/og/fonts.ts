import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * The three faces, as Satori can read them.
 *
 * Read once at module scope rather than per request: the files never change, and
 * `ImageResponse` is generated at build time, so a read per image is a read per build step
 * for nothing. See `src/assets/fonts/README.md` for why the card carries its own copies.
 */
const dir = join(process.cwd(), 'src/assets/fonts')

const [display, mono, sans] = await Promise.all([
	readFile(join(dir, 'bricolage-grotesque-condensed-extrabold.ttf')),
	readFile(join(dir, 'azeret-mono-medium.ttf')),
	readFile(join(dir, 'instrument-sans-regular.ttf')),
])

/** Named as the card refers to them, in the order Satori should try them. */
export const OG_FONTS = [
	{ name: 'Bricolage', data: display, weight: 800 as const, style: 'normal' as const },
	{ name: 'Azeret', data: mono, weight: 500 as const, style: 'normal' as const },
	{ name: 'Instrument', data: sans, weight: 400 as const, style: 'normal' as const },
]
