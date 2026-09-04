import { expect, type Page, test } from '@playwright/test'

/** The drawn height of every bar in one Folder's rail, as rendered. */
async function shapeOf(page: Page, index: number) {
	return page.evaluate(nth => {
		const folder = document.querySelectorAll('[data-song-stack] .folder')[nth]
		const row = folder?.querySelector('.playhead-bars')
		return [...(row?.children ?? [])].map(bar =>
			Math.round(Number.parseFloat((bar as HTMLElement).style.getPropertyValue('--bar')))
		)
	}, index)
}

test.describe('the waveform', () => {
	test('draws each track from its own audio, not one shape for all of them', async ({ page }) => {
		await page.goto('/')

		const first = await shapeOf(page, 0)
		const second = await shapeOf(page, 1)
		const third = await shapeOf(page, 2)

		expect(first.length, 'the rail drew no bars at all').toBeGreaterThan(10)
		// The whole point of measuring the file: two Songs cannot share a shape. An authored
		// phrase reused everywhere passes every other test in this suite and fails this one.
		expect(first, 'two Songs drew the same waveform').not.toEqual(second)
		expect(second).not.toEqual(third)
	})

	test('has the dynamic range of audio rather than a row of full-height blocks', async ({ page }) => {
		await page.goto('/')

		const shape = await shapeOf(page, 0)
		const sorted = [...shape].sort((a, b) => a - b)
		const median = sorted[Math.floor(sorted.length / 2)] ?? 0

		// Folding the stored readings by maximum used to put the median bar at 99, which drew
		// a solid block. Combining them in quadrature is what keeps the quiet passages quiet.
		expect(median, 'the waveform has flattened into a block').toBeLessThan(92)
		expect(Math.max(...shape), 'the loudest moment does not reach the top').toBeGreaterThan(95)
	})

	test('shows the whole track at every width, never a truncated one', async ({ page }) => {
		for (const width of [375, 414, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')

			const clipped = await page.evaluate(() => {
				const blocks = document.querySelector('.playhead-blocks')
				if (blocks === null) {
					return -1
				}
				const edge = blocks.getBoundingClientRect().right
				// A bar past the rail's edge is a piece of the track the visitor cannot see,
				// while the playhead still travels the full width — so the drawing would be
				// telling a different story from the time.
				return [...(blocks.querySelector('.playhead-bars')?.children ?? [])].filter(
					bar => bar.getBoundingClientRect().right > edge + 0.5
				).length
			})

			expect(clipped, `bars fall off the rail at ${width}px`).toBe(0)
		}
	})

	test('leaves the focus ring on the controls and not around the whole Folder', async ({ page }) => {
		await page.goto('/')

		const outlineOf = (selector: string) =>
			page.evaluate(sel => {
				const node = document.querySelector(sel)
				return node === null ? '' : getComputedStyle(node).outlineStyle
			}, selector)

		await page.locator('[data-song-stack] .folder .transport-play').first().focus()
		// The card-wide ring was the ugly one. The control's own ring is the accessible one,
		// and it is the reason removing the card's is safe.
		expect(await outlineOf('[data-song-stack] .folder')).toBe('none')
		expect(await outlineOf('[data-song-stack] .folder .transport-play')).not.toBe('none')

		// The seek input is deliberately transparent, so the rail carries its indicator.
		await page.locator('[data-song-stack] .folder .playhead-seek').first().focus()
		expect(await outlineOf('[data-song-stack] .folder .transport-rail')).not.toBe('none')
	})
})
