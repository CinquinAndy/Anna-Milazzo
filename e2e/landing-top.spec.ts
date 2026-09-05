import { expect, test } from '@playwright/test'

/** Widths a Recruiter actually arrives at. 375 is the narrowest phone worth supporting. */
const WIDTHS = [375, 768, 1440] as const

test.describe('the top of the landing page', () => {
	test('introduces Anna in Italian at the root', async ({ page }) => {
		await page.goto('/')

		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anna Milazzo')
		await expect(page.getByText('Compositrice e sound designer.', { exact: false })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'Chi sono' })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'Cosa so fare' })).toBeVisible()
	})

	test('introduces Anna in English under /en', async ({ page }) => {
		await page.goto('/en')

		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anna Milazzo')
		await expect(page.getByText('Composer and sound designer.', { exact: false })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
		await expect(page.getByRole('heading', { name: 'What I do' })).toBeVisible()
	})

	test('shows the portrait with alternative text from the CMS', async ({ page }) => {
		await page.goto('/')

		const portrait = page.getByRole('img').first()
		await expect(portrait).toBeVisible()

		const alt = await portrait.getAttribute('alt')
		expect(alt, 'the portrait has no alternative text').toBeTruthy()
		expect(alt).toContain('Anna Milazzo')

		// Served from the bucket's public domain, not proxied through the app.
		const src = await portrait.getAttribute('src')
		expect(src).not.toContain('/api/')
		expect(src).not.toContain('/_next/image')
	})

	test('renders the skills as a list, from the CMS', async ({ page }) => {
		await page.goto('/')

		const skills = page.locator('[data-skills]').getByRole('listitem')
		await expect(skills).toHaveCount(7)
		await expect(skills.first()).toHaveText('Composizione')
	})

	test('heading levels descend in order with no gaps', async ({ page }) => {
		await page.goto('/')

		const levels = await page.evaluate(() =>
			[...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(el => Number(el.tagName[1]))
		)

		expect(levels[0], 'the page does not start at h1').toBe(1)
		expect(
			levels.filter(l => l === 1),
			'more than one h1'
		).toHaveLength(1)
		for (let i = 1; i < levels.length; i++) {
			const step = (levels[i] ?? 0) - (levels[i - 1] ?? 0)
			expect(step, `heading level jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1)
		}
	})

	for (const width of WIDTHS) {
		test(`holds at ${width}px with no horizontal scroll`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await page.evaluate(() => document.fonts.ready)

			const overflow = await page.evaluate(() => ({
				scrollWidth: document.documentElement.scrollWidth,
				clientWidth: document.documentElement.clientWidth,
			}))
			expect(overflow.scrollWidth, 'the page scrolls sideways').toBeLessThanOrEqual(overflow.clientWidth)

			// Nothing is VISIBLE outside the viewport either. An element can overflow without
			// making the document scrollable, and the page-level assertion above already
			// proves the page is not the thing scrolling — so what is left to check is
			// whether anything actually shows past the edge.
			//
			// Being clipped is the exemption, not being inside a scroller specifically. This
			// page deliberately bleeds things past their containers: the hero's dithered field
			// is wider than the viewport by design, and the ornament layer has its own test
			// named "overflows its container rather than being clipped by it". Both are cut by
			// an ancestor with `overflow: hidden`, which is invisible and cannot scroll
			// anything — so the old rule, which exempted only `auto` and `scroll`, was failing
			// the page for doing what the rest of the suite requires of it.
			const wide = await page.evaluate(() => {
				const limit = document.documentElement.clientWidth
				const clippedBeforeTheEdge = (el: Element) => {
					for (let node = el.parentElement; node !== null; node = node.parentElement) {
						if (getComputedStyle(node).overflowX === 'visible') {
							continue
						}
						// A clipping ancestor only helps if it is itself inside the viewport;
						// one that is also too wide has simply moved the problem up a level.
						if (node.getBoundingClientRect().right <= limit + 1) {
							return true
						}
					}
					return false
				}
				return [...document.querySelectorAll('body *')]
					.filter(el => {
						const box = el.getBoundingClientRect()
						return box.width > 0 && (box.right > limit + 1 || box.left < -1) && !clippedBeforeTheEdge(el)
					})
					.map(el => `${el.tagName.toLowerCase()}.${el.className || '(no class)'}`.slice(0, 80))
			})
			expect(wide, 'elements extend past the viewport').toEqual([])
		})
	}

	test('the longer Italian strings do not break the composition', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 900 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		// The Italian tagline is the longest short string on the page.
		const tagline = page.getByText('Compositrice e sound designer.', { exact: false })
		const box = await tagline.boundingBox()
		expect(box?.width ?? 0).toBeLessThanOrEqual(375)

		// And the name still fits on the narrowest phone.
		const heading = await page.getByRole('heading', { level: 1 }).boundingBox()
		expect(heading?.width ?? 0).toBeLessThanOrEqual(375)
	})

	test('tells search engines the two languages are one page', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('link[rel="alternate"][hreflang="it"]')).toHaveAttribute('href', /\/$|\/it$/)
		await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en$/)
		await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
	})
})
