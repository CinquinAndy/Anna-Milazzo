import { expect, test } from '@playwright/test'

const PAGES = ['/', '/contact', '/legal', '/en', '/en/contact', '/en/legal']

test.describe('the foot of every page', () => {
	test('reaches every page of the site, from every page of the site', async ({ page }) => {
		for (const path of PAGES) {
			await page.goto(path)
			const footer = page.locator('[data-site-footer]')

			// It used to carry the social links and the legals link and nothing else, so a
			// visitor who reached the bottom of the legals page had the back button and no
			// route anywhere.
			const hrefs = await footer.locator('nav a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') ?? ''))
			const english = path.startsWith('/en')
			const home = english ? '/en' : '/'
			expect(hrefs, `${path} has no route home`).toContain(home)
			expect(
				hrefs.some(h => h.endsWith('#ascolta')),
				`${path} cannot reach the work`
			).toBe(true)
			expect(
				hrefs.some(h => h.endsWith('#percorso')),
				`${path} cannot reach the timeline`
			).toBe(true)
			expect(hrefs, `${path} cannot reach contact`).toContain(english ? '/en/contact' : '/contact')
			await expect(footer.locator('[data-legals-link]'), `${path} cannot reach the legals`).toHaveCount(1)
		}
	})

	test('keeps every route in the language being served', async ({ page }) => {
		await page.goto('/en')
		const hrefs = await page
			.locator('[data-site-footer] a[href^="/"]')
			.evaluateAll(nodes => nodes.map(n => n.getAttribute('href') ?? ''))
		// A footer that drops out of the language is how a bilingual site loses a reader.
		for (const href of hrefs) {
			expect(href.startsWith('/en'), `${href} leaves English`).toBe(true)
		}
	})

	test('opens the links out in their own tab, safely', async ({ page }) => {
		await page.goto('/')
		const external = page.locator('[data-site-footer] a[target="_blank"]')
		expect(await external.count()).toBeGreaterThan(0)
		for (const link of await external.all()) {
			const rel = (await link.getAttribute('rel')) ?? ''
			expect(rel, 'an external link opens a tab without noopener').toContain('noopener')
		}
	})

	test('signs the site, with a year nobody has to remember to change', async ({ page }) => {
		await page.goto('/')
		const credit = page.locator('[data-site-footer] [data-credit]')
		await expect(credit).toBeVisible()

		const text = (await credit.textContent()) ?? ''
		// Rendered on the server on every request rather than baked into the build.
		expect(text, 'the credit carries no current year').toContain(String(new Date().getFullYear()))
		expect(text, 'the credit does not name whoever built it').toContain('Cinquin Andy')

		const link = credit.locator('a[href="https://andy-cinquin.com"]')
		await expect(link, 'the credit does not link anywhere').toHaveCount(1)
	})

	test('names the site from the CMS rather than from the code', async ({ page }) => {
		await page.goto('/')
		const name = await page.locator('h1').first().textContent()
		const credit = (await page.locator('[data-site-footer] [data-credit]').textContent()) ?? ''
		// If Anna renames herself in Payload, the copyright line follows.
		expect(credit, 'the credit hardcodes the site name').toContain((name ?? '').trim())
	})
})
