import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { OG } from '@/lib/og/palette'

/**
 * The OG card cannot read the stylesheet, so it carries its own copy of the palette. A
 * second copy of anything drifts, and the drift here would be invisible: a social card is
 * not on screen while anybody works on the site.
 *
 * The stylesheet writes each colour as oklch and records the hex beside it in a comment.
 * That comment is the contract, and this reads it back.
 */
const CSS = readFileSync('src/app/(frontend)/globals.css', 'utf8')

describe('the OG palette', () => {
	for (const [name, hex] of Object.entries(OG)) {
		if (name === 'ink') {
			continue
		}
		it(`${name} is the hex the stylesheet records`, () => {
			expect(CSS.toUpperCase(), `${hex} is not written anywhere in globals.css`).toContain(hex.toUpperCase())
		})
	}

	it('ink is black, which is what every keyline on the site is', () => {
		expect(OG.ink).toBe('#000000')
		expect(CSS).toMatch(/--ink:\s*oklch\(0 0 0\)/)
	})

	it('names only colours the site actually has', () => {
		for (const name of Object.keys(OG)) {
			expect(CSS, `--${name} is not a token in the stylesheet`).toMatch(new RegExp(`--${name}:`))
		}
	})
})
