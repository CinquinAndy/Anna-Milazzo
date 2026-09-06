import { expect, test } from '@playwright/test'

/**
 * The section titles are the design's loudest device: a giant word in a band that runs
 * edge to edge. They are sized by arithmetic, from the real advance of every glyph against
 * the band's own width, so what has to hold is that every heading reaches its band without
 * crossing it, in both languages, at every width.
 */
const WIDTHS = [320, 360, 375, 430, 500, 512, 640, 768, 900, 1024, 1280, 1440, 1536, 1920, 2560] as const

for (const path of ['/', '/en'] as const) {
	for (const width of WIDTHS) {
		test(`no title runs past its band at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ reducedMotion: 'reduce' })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			const overruns = await page.locator('[data-section-title] h2').evaluateAll(nodes =>
				nodes.flatMap(h2 => {
					const band = h2.parentElement
					if (band === null) {
						return []
					}
					const style = getComputedStyle(band)
					const inner =
						band.getBoundingClientRect().width -
						Number.parseFloat(style.paddingInlineStart) -
						Number.parseFloat(style.paddingInlineEnd)
					const range = document.createRange()
					range.selectNodeContents(h2)
					const widest = Math.max(...[...range.getClientRects()].map(rect => rect.width))
					const over = widest - inner
					return over > 0 ? [`${(h2.textContent ?? '').trim()} overruns by ${Math.round(over)}px`] : []
				})
			)
			expect(overruns, overruns.join('; ')).toEqual([])

			// PERCORSO ran past the viewport and gave the whole page a horizontal scrollbar
			// on every machine with a classic one, because the old arithmetic measured
			// against `100vw` and counted that scrollbar in.
			const slop = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			)
			expect(slop, 'a title widened the document').toBeLessThanOrEqual(0)
		})
	}
}

for (const path of ['/', '/en'] as const) {
	for (const width of [320, 375, 430, 768, 1440]) {
		test(`every title fills its band at ${width}px on ${path}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 })
			await page.emulateMedia({ reducedMotion: 'reduce' })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			const thin = await page.locator('[data-section-title] h2').evaluateAll(nodes =>
				nodes.flatMap(h2 => {
					const band = h2.parentElement
					if (band === null) {
						return []
					}
					const style = getComputedStyle(band)
					const inner =
						band.getBoundingClientRect().width -
						Number.parseFloat(style.paddingInlineStart) -
						Number.parseFloat(style.paddingInlineEnd)
					const range = document.createRange()
					range.selectNodeContents(h2)
					const widest = Math.max(...[...range.getClientRects()].map(rect => rect.width))
					const size = Number.parseFloat(getComputedStyle(h2).fontSize)
					// 44rem is the ceiling the component sets for very wide viewports, so a
					// heading resting on it is underfilling on purpose.
					if (size >= 44 * 16 - 1) {
						return []
					}
					const fill = widest / inner
					return fill < 0.85 ? [`${(h2.textContent ?? '').trim()} fills ${Math.round(fill * 100)}%`] : []
				})
			)
			expect(thin, `a heading is set as a caption: ${thin.join('; ')}`).toEqual([])
		})
	}
}

test('the hero name fills its column rather than a fraction of it', async ({ page }) => {
	for (const width of [320, 375, 430, 560, 639, 768, 900, 1440]) {
		await page.setViewportSize({ width, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const name = await page.locator('h1').evaluate(h1 => {
			const column = h1.parentElement?.getBoundingClientRect().width ?? 0
			const range = document.createRange()
			range.selectNodeContents(h1)
			const rects = [...range.getClientRects()]
			return { fill: Math.max(...rects.map(rect => rect.width)) / column, lines: rects.length }
		})
		// One `vw` coefficient used to serve two layouts, and below md, where the column
		// becomes the whole page, it filled half of it: 51% at 639px, smaller than every
		// section band under it.
		expect(name.fill, `the hero name fills ${Math.round(name.fill * 100)}% at ${width}px`).toBeGreaterThan(0.85)
		expect(name.lines, `the hero name broke over ${name.lines} lines at ${width}px`).toBe(1)
	}
})
