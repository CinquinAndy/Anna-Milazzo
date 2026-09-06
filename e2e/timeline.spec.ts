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
		// which is the same quantity that positions it on the reversed ruler, so the lanes
		// and the columns agree and the blocks step down and to the right.
		expect(periods).toEqual(['2026', '2022–2026', '2025', '2024', '2019–2022'])
	})

	test('reads in English with the shared periods intact', async ({ page }) => {
		await page.goto('/en')

		const entries = page.locator('[data-timeline] ol > li')
		await expect(entries).toHaveCount(5)
		await expect(entries.last()).toContainText('Music high school, principal study piano')
		// The period is not localized, it is the same fact in both languages.
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

test.describe('the arrangement on a small screen', () => {
	for (const width of [320, 360]) {
		test(`the newest work is readable at rest at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 })
			await page.emulateMedia({ reducedMotion: 'reduce' })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			// The 2026 clip is the one the playhead points at. The lane gutter plus a clip's
			// minimum width was 304px against a 272px scrollport, so its title and its
			// description ran under the opaque edge marker before the reader touched anything.
			const gap = await page.evaluate(() => {
				const strip = document.querySelector('.daw') as HTMLElement
				strip.scrollLeft = 0
				const detail = strip.querySelector('.daw-clip-detail')?.getBoundingClientRect()
				const title = strip.querySelector('.daw-clip-title')?.getBoundingClientRect()
				const mark = document.querySelector('.daw-edge-mark')?.getBoundingClientRect()
				if (detail === undefined || title === undefined || mark === undefined) {
					return Number.NaN
				}
				return Math.min(mark.left - detail.right, mark.left - title.right)
			})
			expect(gap, `the newest clip runs under the edge marker at ${width}px`).toBeGreaterThanOrEqual(0)
		})
	}

	test('a drag past the start of the strip does not take the page with it', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		// Unconsumed inline scroll chains to the document, and that is what feeds the
		// browser's swipe-back: a reader halfway through the arrangement could be taken off
		// the page entirely.
		const containment = await page.locator('.daw').evaluate(el => getComputedStyle(el).overscrollBehaviorInline)
		expect(containment, 'the strip hands its overshoot to the document').toBe('contain')

		const moved = await page.evaluate(async () => {
			const strip = document.querySelector('.daw') as HTMLElement
			strip.scrollIntoView({ block: 'center' })
			await new Promise(resolve => setTimeout(resolve, 100))
			strip.scrollLeft = 0
			const before = window.scrollX
			const box = strip.getBoundingClientRect()
			for (let i = 0; i < 6; i++) {
				strip.dispatchEvent(
					new WheelEvent('wheel', {
						deltaX: -120,
						bubbles: true,
						cancelable: true,
						clientX: box.left + box.width / 2,
						clientY: box.top + box.height / 2,
					})
				)
			}
			await new Promise(resolve => setTimeout(resolve, 200))
			return window.scrollX - before
		})
		expect(moved, 'the overshoot moved the document').toBe(0)
	})
})
