import { expect, type Page, test } from '@playwright/test'

/** Fills the form. The Turnstile test key solves itself, so no interaction is needed. */
async function fillForm(page: Page, message = 'Cerco musica per un cortometraggio.') {
	await page.getByLabel('Il vostro nome').fill('Giulia Ferrari')
	await page.getByLabel('La vostra email').fill('giulia@example.com')
	await page.getByLabel('Il messaggio').fill(message)
}

/** The widget writes its token into a hidden field inside the form. */
async function waitForToken(page: Page) {
	await expect
		.poll(
			async () =>
				page.evaluate(() => {
					const input = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')
					return (input?.value ?? '').length
				}),
			{ timeout: 20_000 }
		)
		.toBeGreaterThan(0)
}

test.describe('the contact page', () => {
	test('says what she takes on and where to write, before the form', async ({ page }) => {
		await page.goto('/contact')

		const main = page.locator('main')
		const sections = main.locator('section')
		// Three colour fields separated by black, the same grammar as the landing page. It was
		// one flat field with a heading and a form on it.
		await expect(sections).toHaveCount(3)

		// The address is in the CMS and used to be rendered nowhere, while the form's own
		// failure message told people to write directly.
		const mailto = main.locator('a[href^="mailto:"]').first()
		await expect(mailto).toBeVisible()

		// And it comes first: somebody who is not going to fill in a web form should not have
		// to scroll past one to find an address.
		const addressTop = (await mailto.boundingBox())?.y ?? 0
		const formTop = (await main.locator('[data-contact-form]').boundingBox())?.y ?? 0
		expect(addressTop, 'the address sits below the form').toBeLessThan(formTop)
	})

	test('answers the four questions that decide whether anyone writes at all', async ({ page }) => {
		await page.goto('/contact')

		// Reply time, languages, where she is and how fees work were all unanswered, and each
		// is the kind of thing somebody emails to ask before sending the email they wanted to.
		const facts = page.locator('main dl .folder')
		await expect(facts).toHaveCount(4)

		const dated = await page
			.locator('main dd')
			.evaluateAll(nodes => nodes.map(n => n.textContent ?? '').filter(text => /\b(19|20)\d{2}\b/.test(text)))
		// A claim with a date in it is one she has to remember to change, and a stale one
		// reads as an abandoned site.
		expect(dated, 'a fact carries a year and will go stale').toEqual([])
	})

	test('tells you what to write before it gives you somewhere to write it', async ({ page }) => {
		await page.goto('/contact')

		const points = page.locator('main .brief-point')
		await expect(points).toHaveCount(5)

		// DOM order, not geometry: at a wide viewport the two sit side by side, and the
		// guarantee is about the order they are read and tabbed through, not their tops.
		const briefIsFirst = await page.evaluate(() => {
			const brief = document.querySelector('main .brief-list')
			const form = document.querySelector('main [data-contact-form]')
			if (brief === null || form === null) {
				return false
			}
			return (brief.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
		})
		expect(briefIsFirst, 'the form is read before the note that says what to put in it').toBe(true)
	})

	test('still sends, and still keeps nothing', async ({ page }) => {
		await page.goto('/contact')
		await fillForm(page)
		await waitForToken(page)
		await page.locator('[data-contact-form] button[type="submit"]').click()

		await expect(page.locator('[data-contact-outcome="sent"]')).toBeVisible({ timeout: 20_000 })
		// ADR-0005: nothing is persisted, so there is no collection to read it back from.
		const stored = await page.request.get('/api/messages?limit=1')
		expect(stored.status()).toBe(404)
	})

	test('marks the check itself when the check is what failed', async ({ page }) => {
		await page.goto('/contact')
		await fillForm(page, 'Un messaggio che non deve sparire.')
		await waitForToken(page)
		// The one rejection with no box of its own. Before this it produced "check the fields
		// marked" with nothing marked anywhere on the page.
		await page.evaluate(() => {
			document.querySelector('[name="cf-turnstile-response"]')?.remove()
		})
		await page.locator('[data-contact-form] button[type="submit"]').click()

		await expect(page.locator('[data-contact-outcome="invalid"]')).toBeVisible({ timeout: 20_000 })
		const well = page.locator('[data-check-well]')
		await expect(well).toHaveAttribute('data-invalid', 'true')

		const describedBy = await well.getAttribute('aria-describedby')
		expect(describedBy, 'the failed check describes itself to nobody').toBeTruthy()
		await expect(page.locator(`#${describedBy}`)).toBeVisible()

		// And it costs the visitor nothing.
		await expect(page.getByLabel('Il messaggio')).toHaveValue('Un messaggio che non deve sparire.')
	})

	test('says which box is wrong, in words and not only as a state', async ({ page }) => {
		await page.goto('/contact')
		await page.getByLabel('Il vostro nome').fill('Giulia Ferrari')
		await page.getByLabel('La vostra email').fill('giulia@example')
		await page.getByLabel('Il messaggio').fill('Un cortometraggio di diciotto minuti.')
		await waitForToken(page)
		await page.locator('[data-contact-form] button[type="submit"]').click()

		await expect(page.locator('[data-contact-outcome="invalid"]')).toBeVisible({ timeout: 20_000 })
		const email = page.getByLabel('La vostra email')
		await expect(email).toHaveAttribute('aria-invalid', 'true')

		// WCAG 3.3.1 wants the item identified AND described in text. `aria-invalid` alone is
		// a state, not a description.
		const describedBy = await email.getAttribute('aria-describedby')
		expect(describedBy, 'a rejected field is marked but not explained').toBeTruthy()
		const note = page.locator(`#${describedBy}`)
		await expect(note).toBeVisible()
		expect((await note.textContent())?.trim().length ?? 0).toBeGreaterThan(0)
	})

	test('never pushes the page sideways, at any width, in either language', async ({ page }) => {
		for (const path of ['/contact', '/en/contact']) {
			for (const width of [320, 375, 414, 768, 1024, 1440]) {
				await page.setViewportSize({ width, height: 900 })
				await page.goto(path)
				await page.evaluate(() => document.fonts.ready)

				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - document.documentElement.clientWidth
				)
				expect(overflow, `${path} scrolls sideways at ${width}px`).toBe(0)

				// The widget is the one object here drawn by somebody else, and it has a hard
				// 300px floor that cannot be reached from this stylesheet. Below roughly 364px
				// it is wider than the room available, so the FRAME scrolls rather than the
				// page: a sideways scrollbar on the document is a defect, one inside a box the
				// width of a phone is a widget. What has to hold is that the frame itself fits.
				const well = await page.locator('[data-check-well]').boundingBox()
				if (well !== null) {
					expect(well.x, `the check frame starts off screen at ${width}px`).toBeGreaterThanOrEqual(-1)
					expect(well.x + well.width, `the check frame runs off screen at ${width}px`).toBeLessThanOrEqual(width + 1)
				}
			}
		}
	})

	test('gives the header back its route into the work', async ({ page }) => {
		await page.goto('/contact')

		const header = page.locator('[data-site-header]')
		// This page dropped to the brand and the two language controls at the moment a
		// Recruiter had just been thrown off the landing page, so there was no way back into
		// the work without the browser's back button.
		await expect(header.getByRole('link', { name: 'Ascolta' })).toBeVisible()
		await expect(header.getByRole('link', { name: 'Percorso' })).toBeVisible()

		// And this is the only page where the branch written into site-header.tsx can fire.
		await expect(header.locator('a[aria-current="page"]')).toHaveCount(1)
	})
})
