import { expect, test } from '@playwright/test'

/**
 * The bar is sticky on every page, so its height is a tax on every screen, and three other
 * things read it: the hero's full-screen height, the scroll padding that keeps an anchor
 * jump from landing underneath it, and the works pager.
 */
test.describe('the sticky bar', () => {
	for (const path of ['/', '/en'] as const) {
		for (const width of [320, 360, 375, 430, 500]) {
			test(`is at most two rows on a phone at ${width}px on ${path}`, async ({ page }) => {
				await page.setViewportSize({ width, height: 800 })
				await page.goto(path)
				await page.evaluate(() => document.fonts.ready)

				const rows = await page
					.locator('[data-site-header] a, [data-site-header] span[aria-current]')
					.evaluateAll(nodes => {
						// Clustered by proximity, not bucketed by division: the pills are
						// centre-aligned and differ by a few pixels inside one row, and a
						// bucket boundary falling between two of them counts a row twice.
						const centres = nodes
							.map(node => node.getBoundingClientRect())
							// The section nav is `display: none` below md, so its links measure as
							// zero-sized boxes at the origin and would count as a row of their own.
							.filter(box => box.height > 0)
							.map(box => (box.top + box.bottom) / 2)
							.sort((a, b) => a - b)
						return centres.reduce((count, centre, index) => {
							const previous = centres[index - 1]
							return index === 0 || (previous !== undefined && centre - previous > 20) ? count + 1 : count
						}, 0)
					})
				expect(rows, 'the bar stacked into more than two rows').toBeLessThanOrEqual(2)

				const height = await page.locator('[data-site-header]').evaluate(el => el.getBoundingClientRect().height)
				expect(height, 'the bar is taller than two rows of pills').toBeLessThanOrEqual(120)
			})
		}

		for (const width of [640, 700, 768, 820, 866, 1024, 1440]) {
			test(`is one row from sm at ${width}px on ${path}`, async ({ page }) => {
				await page.setViewportSize({ width, height: 900 })
				await page.goto(path)
				await page.evaluate(() => document.fonts.ready)

				const height = await page.locator('[data-site-header]').evaluate(el => el.getBoundingClientRect().height)
				// It used to stay wrapped to 866 because the section nav appeared 128px before
				// there was room for it.
				expect(height, 'the bar wrapped where it had room not to').toBeLessThanOrEqual(80)
			})
		}
	}

	test('publishes its own height, whatever the language makes it', async ({ page }) => {
		for (const [path, width, expected] of [
			['/', 375, 109],
			['/en', 375, 109],
			['/', 1440, 67],
			['/en', 1440, 67],
		] as const) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto(path)
			await page.evaluate(() => document.fonts.ready)

			// A constant cannot be right here: the bar's wrap width depends on copy Anna is
			// free to change, and it differs between the two languages.
			//
			// Polled, because the value is published from an effect: the stylesheet's own
			// per-breakpoint default stands until the page has hydrated, which is deliberate
			// and is what keeps the page close to right with JavaScript off.
			const read = async () =>
				page.evaluate(() =>
					Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))
				)
			await expect.poll(read, { message: `--header-h never settled at ${width}px on ${path}` }).toBe(expected)

			const published = await read()
			const real = await page.locator('[data-site-header]').evaluate(el => el.getBoundingClientRect().height)
			// Rounded up on purpose: half a pixel short puts the keyline of whatever scrolled
			// to the top back under the bar, which is the whole failure this exists to stop.
			expect(published, `--header-h at ${width}px on ${path} is short of the bar`).toBeGreaterThanOrEqual(real)
			expect(published, `--header-h at ${width}px on ${path} overshoots the bar`).toBeLessThan(real + 1)
		}
	})

	test('nothing the browser scrolls to lands underneath it', async ({ page }) => {
		for (const width of [320, 375, 768, 1440]) {
			await page.setViewportSize({ width, height: 800 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			const bar = await page.locator('[data-site-header]').evaluate(el => el.getBoundingClientRect().height)

			// An anchor jump, which used to land 80px from the top whatever the bar was.
			await page.evaluate(() => {
				document.querySelector('#percorso')?.scrollIntoView()
			})
			await page.waitForTimeout(120)
			const bandTop = await page.locator('#percorso').evaluate(el => el.getBoundingClientRect().top)
			expect(bandTop, `the anchor target is under the bar at ${width}px`).toBeGreaterThanOrEqual(bar - 1)

			// And a control reached by tabbing backwards, which carried no margin at all.
			await page.evaluate(() => {
				const link = document.querySelector('footer a')
				if (link instanceof HTMLElement) {
					link.focus()
				}
			})
			await page.waitForTimeout(120)
			const linkTop = await page
				.locator('footer a')
				.first()
				.evaluate(el => el.getBoundingClientRect().top)
			expect(linkTop, `a focused footer link is under the bar at ${width}px`).toBeGreaterThanOrEqual(bar - 1)
		}
	})

	test('the wordmark goes back to the top of the landing page', async ({ page }) => {
		for (const width of [375, 1440]) {
			await page.setViewportSize({ width, height: 800 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)
			await page.evaluate(() => window.scrollTo(0, 4000))
			await page.waitForTimeout(150)

			await page.locator('[data-nav-home]').click()
			await page.waitForTimeout(400)

			// It links to the page it is already on, which the router treats as a no-op, so
			// without a fragment pressing it did nothing at all.
			const y = await page.evaluate(() => window.scrollY)
			expect(y, `the wordmark did not return to the top at ${width}px`).toBeLessThan(50)
		}
	})

	test('the language is announced in full even where it is drawn as two letters', async ({ page }) => {
		for (const width of [320, 1440]) {
			await page.setViewportSize({ width, height: 800 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			const announced = await page.locator('[data-language-switch] [aria-current="true"]').evaluate(el =>
				[...el.childNodes]
					.filter(node => !(node instanceof Element) || node.getAttribute('aria-hidden') !== 'true')
					.map(node => node.textContent ?? '')
					.join('')
					.trim()
			)
			expect(announced, `the current language at ${width}px`).toBe('Italiano')
			await expect(page.locator('[data-language-switch] a')).toHaveAccessibleName('English')
		}
	})
})
