import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { slugify, songSlugs } from '@/lib/folder/slug'
import { contrast, tabColour } from '@/lib/folder/tab-colours'

const CSS = readFileSync('src/app/(frontend)/globals.css', 'utf8')

describe('the colour of each Tab', () => {
	it('walks the palette from blue through spring and lemon to magenta and grape', () => {
		expect([0, 1, 2, 3, 4].map(index => tabColour(index).fill)).toEqual([
			'var(--blue)',
			'var(--spring)',
			'var(--lemon)',
			'var(--magenta)',
			'var(--grape)',
		])
	})

	it('never gives a Tab the cantaloupe the section is painted with', () => {
		for (let index = 0; index < 12; index++) {
			expect(tabColour(index).fill).not.toBe('var(--cantaloupe)')
			expect(tabColour(index).fill).not.toBe('var(--accent)')
		}
	})

	it('never puts two Tabs of the same colour side by side, for any number of Songs', () => {
		for (let index = 1; index < 24; index++) {
			expect(tabColour(index).fill).not.toBe(tabColour(index - 1).fill)
		}
	})

	it('sets every label at 4.5:1 or better on its Tab', () => {
		for (let index = 0; index < 12; index++) {
			const { hex } = tabColour(index)
			expect(contrast(hex.fill, hex.ink), `Tab ${index + 1}: ${hex.ink} on ${hex.fill}`).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('measures contrast the way WCAG does', () => {
		expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
		// The figure the stylesheet records for the blue.
		expect(contrast('#3866A8', '#000000')).toBeCloseTo(3.634, 2)
	})

	it('names only tokens the stylesheet has', () => {
		for (let index = 0; index < 5; index++) {
			for (const token of [tabColour(index).fill, tabColour(index).ink]) {
				const name = token.match(/^var\((--[\w-]+)\)$/)?.[1]
				expect(name, `${token} is not a var()`).toBeDefined()
				expect(CSS).toMatch(new RegExp(`${name}:`))
			}
		}
	})
})

describe('the fragment each Song answers to', () => {
	it('is the title, lower case, accents taken off, words joined by hyphens', () => {
		expect(slugify('Perché il temporale')).toBe('perche-il-temporale')
		expect(slugify('Città alle quattro')).toBe('citta-alle-quattro')
		expect(slugify('All for Freedom - Short film by Anna Milazzo')).toBe('all-for-freedom-short-film-by-anna-milazzo')
		expect(slugify('  Nocturnal Ashes (Original Soundtrack)  ')).toBe('nocturnal-ashes-original-soundtrack')
	})

	it('is short enough to read in an address bar, and never ends on a hyphen', () => {
		const slug = slugify('Nocturnal Ashes (Original Soundtrack by Phiboux Adventures) and a great deal more')
		expect(slug.length).toBeLessThanOrEqual(48)
		expect(slug).toBe('nocturnal-ashes-original-soundtrack-by-phiboux')
	})

	it('falls back to the record id when the title leaves nothing', () => {
		expect(songSlugs([{ id: 7, title: '…' }])).toEqual(['song-7'])
		expect(songSlugs([{ id: 8, title: null }])).toEqual(['song-8'])
	})

	it('tells two Songs with the same title apart', () => {
		expect(
			songSlugs([
				{ id: 1, title: 'Study' },
				{ id: 2, title: 'Study' },
				{ id: 3, title: 'Study' },
			])
		).toEqual(['study', 'study-2', 'study-3'])
	})
})
