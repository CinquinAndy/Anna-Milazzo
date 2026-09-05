/**
 * The shared vocabulary of the page's dithered canvases.
 *
 * Extracted when a second one appeared. Everything here is pure and has no opinion about
 * what is being drawn, the hero's field and the spectrum band each own their own loop and
 * their own geometry, and share only the parts that must not drift apart: the same matrix,
 * the same way of resolving a palette token, and the same pixel packing.
 */

export type Rgb = { r: number; g: number; b: number }

/**
 * The classic 8x8 Bayer matrix, normalised to 0..63.
 *
 * Ordered, not error-diffused: error diffusion gives an organic scatter, and the point here
 * is a regular, obviously digital grid that agrees with a page built on hard 4px edges.
 */
export const BAYER = [
	[0, 32, 8, 40, 2, 34, 10, 42],
	[48, 16, 56, 24, 50, 18, 58, 26],
	[12, 44, 4, 36, 14, 46, 6, 38],
	[60, 28, 52, 20, 62, 30, 54, 22],
	[3, 35, 11, 43, 1, 33, 9, 41],
	[51, 19, 59, 27, 49, 17, 57, 25],
	[15, 47, 7, 39, 13, 45, 5, 37],
	[63, 31, 55, 23, 61, 29, 53, 21],
] as const

/** The threshold at a cell, 0..1. */
export function threshold(x: number, y: number, offsetX = 0, offsetY = 0) {
	return ((BAYER[(y + offsetY) & 7] as unknown as number[])[(x + offsetX) & 7] ?? 0) / 64
}

/**
 * Reads an element's computed colour as sRGB.
 *
 * Painting it and reading the pixel back, rather than parsing the string: the palette is
 * authored in oklch and `getComputedStyle` hands back the computed value in its original
 * space, Chromium returns `lab(42.4292 0.830233 -40.9019)` here, so a regex for `rgb()`
 * matches nothing and falls through to whatever default it was given. A 2D context converts
 * any CSS colour to sRGB by definition, which makes this exact rather than hopeful.
 */
export function readColour(element: HTMLElement): Rgb {
	const probe = document.createElement('canvas')
	probe.width = 1
	probe.height = 1
	const context = probe.getContext('2d', { willReadFrequently: true })
	if (context === null) {
		throw new Error('cannot resolve a colour without a 2D context')
	}
	context.fillStyle = getComputedStyle(element).color
	context.fillRect(0, 0, 1, 1)
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data
	return { r: r ?? 0, g: g ?? 0, b: b ?? 0 }
}

/**
 * Resolves a palette token to sRGB by borrowing the host's own cascade.
 *
 * A hidden span is attached inside the host, given `color: var(--token)`, read, and thrown
 * away. Custom properties are inherited, so the span sees the same values the page does, * and going through a real element is what makes the browser resolve the oklch rather than
 * handing back the literal `var(...)` a direct getPropertyValue would return.
 */
export function resolveToken(host: HTMLElement, token: string): Rgb {
	const probe = document.createElement('span')
	probe.style.cssText = `position:absolute;width:0;height:0;overflow:hidden;color:var(${token})`
	host.appendChild(probe)
	const colour = readColour(probe)
	probe.remove()
	return colour
}

/** WCAG relative luminance: linearise each channel, then weight. */
export function relativeLuminance({ r, g, b }: Rgb): number {
	const channel = (value: number) => {
		const v = value / 255
		return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Straight-line blend, `amount` of `b` into `a`. */
export function mix(a: Rgb, b: Rgb, amount: number): Rgb {
	return {
		r: Math.round(a.r + (b.r - a.r) * amount),
		g: Math.round(a.g + (b.g - a.g) * amount),
		b: Math.round(a.b + (b.b - a.b) * amount),
	}
}

/**
 * A packer for one 32-bit write per pixel instead of four byte writes.
 *
 * Endianness is probed rather than assumed: `Uint32Array` writes in the platform's order,
 * and while every browser this ships to is little-endian, getting it wrong swaps red and
 * blue rather than failing, which is the kind of bug that survives review.
 */
export function endianPacker() {
	const probe = new Uint32Array(1)
	const bytes = new Uint8Array(probe.buffer)
	probe[0] = 0x0a0b0c0d
	const little = bytes[0] === 0x0d
	return (c: Rgb) =>
		(little ? (255 << 24) | (c.b << 16) | (c.g << 8) | c.r : (c.r << 24) | (c.g << 16) | (c.b << 8) | 255) >>> 0
}
