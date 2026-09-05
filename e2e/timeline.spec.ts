import { expect, test } from '@playwright/test'

test.describe('the timeline', () => {
	test('renders Anna’s path as an ordered list from the CMS', async ({ page }) => {
		await page.goto('/')

		const entries = page.locator('[data-timeline] ol > li')
		await expect(entries).toHaveCount(5)

		// Not an image: every step is real text a screen reader reaches.
		await expect(page.locator('[data-timeline] ol')).toHaveJSProperty('tagName', 'OL')
		// Newest first, both down the lanes and across the ruler: the reader wants to know
		// what she is doing now, and on a strip that has to be scrolled the newest entry has
		// to be the one already on screen.
		await expect(entries.first()).toContainText('2026')
		await expect(entries.first()).toContainText('Colonna sonora per cortometraggio')
		await expect(entries.last()).toContainText('2019–2022')
		await expect(entries.last()).toContainText('Liceo musicale, pianoforte principale')
	})

	test('reads newest first, whatever order the CMS holds', async ({ page }) => {
		await page.goto('/')

		const periods = await page
			.locator('[data-timeline] ol > li')
			.evaluateAll(nodes => nodes.map(n => n.textContent?.match(/\d{4}(–\d{4})?/)?.[0] ?? ''))
		// The CMS holds these in the order she lived them. Ordered by the year a clip ENDS,
		// which is the same quantity that positions it on the reversed ruler — so the lanes
		// and the columns agree and the blocks step down and to the right.
		expect(periods).toEqual(['2026', '2022–2026', '2025', '2024', '2019–2022'])
	})

	test('reads in English with the shared periods intact', async ({ page }) => {
		await page.goto('/en')

		const entries = page.locator('[data-timeline] ol > li')
		await expect(entries).toHaveCount(5)
		await expect(entries.last()).toContainText('Music high school, principal study piano')
		// The period is not localized — it is the same fact in both languages.
		await expect(entries.last()).toContainText('2019–2022')
	})

	test('scrolls inside its own container, never the page', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const measurements = await page.evaluate(() => {
			const strip = document.querySelector('[data-timeline-scroller]') as HTMLElement
			return {
				stripScrolls: strip.scrollWidth > strip.clientWidth,
				overflowX: getComputedStyle(strip).overflowX,
				pageScrollWidth: document.documentElement.scrollWidth,
				pageClientWidth: document.documentElement.clientWidth,
			}
		})

		expect(measurements.overflowX).toBe('auto')
		expect(measurements.stripScrolls, 'the strip should be wider than the phone').toBe(true)
		expect(measurements.pageScrollWidth, 'the page itself scrolls sideways').toBeLessThanOrEqual(
			measurements.pageClientWidth
		)
	})

	test('the strip is reachable and scrollable by keyboard', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')

		const strip = page.locator('[data-timeline-scroller]')
		// A scrollable region that cannot be focused cannot be scrolled without a pointer.
		await expect(strip).toHaveAttribute('tabindex', '0')
		expect(await strip.getAttribute('aria-label')).toBeTruthy()

		await strip.focus()
		await expect(strip).toBeFocused()

		const before = await strip.evaluate(el => el.scrollLeft)
		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowRight')
		await expect.poll(async () => strip.evaluate(el => el.scrollLeft)).toBeGreaterThan(before)
	})

	test('an entry added in the CMS would appear with no code change', async ({ page }) => {
		await page.goto('/')

		// The count is read from the rendered list rather than hardcoded in the component:
		// nothing in the markup names five, so a sixth row in Payload simply renders.
		const rendered = await page.locator('[data-timeline] ol > li').count()
		const fromApi = await page.evaluate(async () => {
			const response = await fetch('/api/globals/home?locale=it&depth=0')
			const home = await response.json()
			return home.timeline?.entries?.length ?? 0
		})
		expect(rendered).toBe(fromApi)
	})
})
