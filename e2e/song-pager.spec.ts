import { expect, test } from '@playwright/test'

/** Matches PER_PAGE in src/components/song-pager.tsx. */
const PER_PAGE = 3

const items = (page: import('@playwright/test').Page) => page.locator('[data-song-pager] > ul > li')
const shown = (page: import('@playwright/test').Page) => page.locator('[data-song-pager] > ul > li:not([hidden])')

test.describe('the works pager', () => {
	test('keeps every work in the document and shows one page of them', async ({ page }) => {
		await page.goto('/')

		const total = await items(page).count()
		expect(total, 'the seed should hold more works than one page').toBeGreaterThan(PER_PAGE)
		await expect(shown(page)).toHaveCount(PER_PAGE)

		// Paging is not fetching. Everything is already here, which is what a crawler
		// and a reader with the page saved offline both get.
		await expect(items(page)).toHaveCount(total)
	})

	test('every work is reachable, exactly once, across the pages', async ({ page }) => {
		await page.goto('/')

		const all = await items(page).evaluateAll(nodes =>
			nodes.map(n => n.querySelector('.folder')?.getAttribute('data-song') ?? '')
		)

		const buttons = page.locator('.song-pager-page')
		const pages = await buttons.count()
		const seen: string[] = []
		for (let index = 0; index < pages; index++) {
			await buttons.nth(index).click()
			seen.push(
				...(await shown(page).evaluateAll(nodes =>
					nodes.map(n => n.querySelector('.folder')?.getAttribute('data-song') ?? '')
				))
			)
		}

		expect(seen, 'the pages do not deal out the works in order, once each').toEqual(all)
		expect(new Set(seen).size).toBe(all.length)
	})

	test('the page you are on is marked, and is the only one marked', async ({ page }) => {
		await page.goto('/')

		const buttons = page.locator('.song-pager-page')
		await expect(page.locator('.song-pager-page[aria-current="page"]')).toHaveCount(1)
		await expect(buttons.first()).toHaveAttribute('aria-current', 'page')

		await buttons.nth(1).click()
		await expect(page.locator('.song-pager-page[aria-current="page"]')).toHaveCount(1)
		await expect(buttons.nth(1)).toHaveAttribute('aria-current', 'page')
	})

	test('the ends of the run stay focusable and do nothing', async ({ page }) => {
		await page.goto('/')

		const steps = page.locator('.song-pager-step')
		const back = steps.first()
		const on = steps.last()

		await expect(back).toHaveAttribute('aria-disabled', 'true')
		await expect(on).toHaveAttribute('aria-disabled', 'false')

		// Not the `disabled` attribute: a control that goes inert under the press that
		// reached it drops keyboard focus to the body. It stays focusable and refuses.
		await expect(back).not.toHaveAttribute('disabled', /.*/)
		const before = await shown(page).evaluateAll(n => n.length)
		await back.click({ force: true })
		await expect(shown(page)).toHaveCount(before)
		await expect(page.locator('.song-pager-page').first()).toHaveAttribute('aria-current', 'page')

		await back.focus()
		await expect(back).toBeFocused()
	})

	test('changing page puts the reader at the top of what changed', async ({ page }) => {
		await page.goto('/')

		await page.locator('.song-pager-page').nth(1).click()

		// Focus moves to the list, which both scrolls its first work into view and puts
		// a screen reader at the start of the new page rather than leaving it stranded.
		const focused = await page.evaluate(() => document.activeElement?.classList.contains('song-list') ?? false)
		expect(focused, 'focus did not land on the list after paging').toBe(true)

		const listTop = await page.locator('.song-list').evaluate(el => el.getBoundingClientRect().top)
		expect(listTop, 'the new page did not scroll into view').toBeLessThan(400)
	})

	test('a work that is playing keeps playing when the page changes', async ({ page }) => {
		await page.goto('/')

		const paused = async () => await page.evaluate(() => document.querySelector('audio')?.paused ?? true)

		await page.locator('[data-song-stack] [data-play]').first().click()
		await expect.poll(paused).toBe(false)

		await page.locator('.song-pager-page').nth(1).click()

		// One audio element for the whole page, and paging neither unmounts it nor
		// touches it: music does not stop because you looked at the next page.
		await expect.poll(paused, { message: 'paging stopped the track' }).toBe(false)
	})

	test('the strip fits one row at 375px', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const rows = await page
			.locator('.song-pager button')
			.evaluateAll(nodes => new Set(nodes.map(n => Math.round(n.getBoundingClientRect().top))).size)
		expect(rows, 'the pager wrapped onto more than one row at 375px').toBe(1)

		const overflow = await page
			.locator('.song-pager')
			.evaluate(el => el.getBoundingClientRect().right - document.documentElement.clientWidth)
		expect(overflow, 'the pager runs off the side at 375px').toBeLessThanOrEqual(0)
	})

	test('the arrows and the numbers are the same height', async ({ page }) => {
		await page.goto('/')

		const heights = await page
			.locator('.song-pager button')
			.evaluateAll(nodes => nodes.map(n => Math.round(n.getBoundingClientRect().height)))
		expect(new Set(heights).size, `pager controls have mismatched heights: ${heights.join(', ')}`).toBe(1)
	})

	test('the arrows are named from the CMS, in both languages', async ({ page }) => {
		for (const [locale, back, on] of [
			['/', 'Brani precedenti', 'Brani successivi'],
			['/en', 'Previous works', 'Next works'],
		] as const) {
			await page.goto(locale)
			// The arrows are triangles. Without a name from the CMS they are two unlabelled
			// buttons, which is the whole of what a screen reader would be given.
			const steps = page.locator('.song-pager-step')
			await expect(steps.first()).toHaveAccessibleName(back)
			await expect(steps.last()).toHaveAccessibleName(on)
		}
	})

	test('the works section no longer carries the standing intro sentence', async ({ page }) => {
		await page.goto('/en')
		await expect(page.locator('[data-song-stack]')).not.toContainText('most recent first')

		await page.goto('/')
		await expect(page.locator('[data-song-stack]')).not.toContainText('Cinque brani')
	})
})

test.describe('paging lands the reader on the new page', () => {
	for (const width of [375, 768, 1440]) {
		test(`the first work of the new page sits under the bar at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 800 })
			await page.emulateMedia({ reducedMotion: 'reduce' })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			// Arrive at the strip the way a reader does, from the works above it.
			await page.locator('.song-pager').evaluate(el => el.scrollIntoView({ block: 'end' }))
			await page.waitForTimeout(150)

			await page.locator('.song-pager-page').nth(1).click()
			await page.waitForTimeout(400)

			// `setPage` and `focus` used to run in the same handler, so the browser scrolled
			// the OLD three-work list into view, bottom-aligned because it is taller than the
			// screen, and React then swapped in a shorter page under a scroll position
			// computed for a list that no longer existed. On a phone the next section filled
			// the whole screen and the works sat two thousand pixels above.
			const { listTop, barBottom } = await page.evaluate(() => ({
				listTop: document.querySelector('.song-list')?.getBoundingClientRect().top ?? 0,
				barBottom: document.querySelector('[data-site-header]')?.getBoundingClientRect().bottom ?? 0,
			}))
			expect(listTop, `the new page starts above the bar at ${width}px`).toBeGreaterThanOrEqual(barBottom - 1)
			expect(listTop, `the reader was dropped past the works at ${width}px`).toBeLessThan(barBottom + 32)
		})
	}
})
