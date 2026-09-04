import { expect, test } from '@playwright/test'

/** Fills the form. The Turnstile test key solves itself, so no interaction is needed. */
async function fillForm(page: import('@playwright/test').Page, message = 'Cerco musica per un cortometraggio.') {
	await page.getByLabel('Il vostro nome').fill('Giulia Ferrari')
	await page.getByLabel('La vostra email').fill('giulia@example.com')
	await page.getByLabel('Il messaggio').fill(message)
}

/** The widget writes its token into a hidden field inside the form. */
async function waitForToken(page: import('@playwright/test').Page) {
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
	test('renders its fields and labels from the CMS, in both languages', async ({ page }) => {
		await page.goto('/contact')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contatti')
		await expect(page.getByLabel('Il vostro nome')).toBeVisible()
		await expect(page.getByLabel('Il messaggio')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Invia' })).toBeVisible()

		await page.goto('/en/contact')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact')
		await expect(page.getByLabel('Your name')).toBeVisible()
		await expect(page.getByRole('button', { name: 'Send' })).toBeVisible()
	})

	test('every field is labelled and reachable by keyboard', async ({ page }) => {
		await page.goto('/contact')

		// A label element pointing at each control, not a placeholder standing in for one.
		const unlabelled = await page.evaluate(() =>
			[...document.querySelectorAll('[data-contact-form] input:not([type="hidden"]), [data-contact-form] textarea')]
				.filter(el => {
					const id = el.getAttribute('id')
					return id === null || document.querySelector(`label[for="${id}"]`) === null
				})
				.map(el => el.getAttribute('name') ?? el.tagName)
		)
		expect(unlabelled).toEqual([])

		await page.getByLabel('Il vostro nome').focus()
		await page.keyboard.press('Tab')
		await expect(page.getByLabel('La vostra email')).toBeFocused()
		await page.keyboard.press('Tab')
		await expect(page.getByLabel('Il messaggio')).toBeFocused()
	})

	test('reports success and keeps nothing in the database', async ({ page }) => {
		await page.goto('/contact')
		await fillForm(page)
		await waitForToken(page)

		await page.getByRole('button', { name: 'Invia' }).click()

		const outcome = page.locator('[data-contact-outcome]')
		await expect(outcome).toHaveAttribute('data-contact-outcome', 'sent', { timeout: 20_000 })
		await expect(page.getByText('Messaggio inviato', { exact: false })).toBeVisible()

		// ADR-0005: transmit-only. There is no collection behind the form at all.
		const collections = await page.evaluate(async () => {
			const response = await fetch('/api/messages?limit=1')
			return response.status
		})
		expect(collections, 'a messages collection exists').toBe(404)
	})

	test('the outcome is announced to assistive technology', async ({ page }) => {
		await page.goto('/contact')

		// The region is live before anything lands in it, or the announcement is missed.
		await expect(page.locator('[data-contact-outcome]')).toHaveAttribute('aria-live', 'polite')
	})

	test('a submission with no token is refused and nothing is lost', async ({ page }) => {
		await page.goto('/contact')
		await fillForm(page, 'Questo messaggio deve sopravvivere all’errore.')
		await waitForToken(page)

		// Strip the token: the widget never ran, or a bot posted the form directly.
		await page.evaluate(() => {
			const input = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')
			if (input !== null) {
				input.value = ''
			}
		})
		await page.getByRole('button', { name: 'Invia' }).click()

		await expect(page.locator('[data-contact-outcome]')).toHaveAttribute('data-contact-outcome', 'invalid', {
			timeout: 20_000,
		})

		// What the Recruiter typed is still there.
		await expect(page.getByLabel('Il messaggio')).toHaveValue('Questo messaggio deve sopravvivere all’errore.')
		await expect(page.getByLabel('Il vostro nome')).toHaveValue('Giulia Ferrari')
	})

	test('an address that could not receive a reply is refused', async ({ page }) => {
		await page.goto('/contact')
		await page.getByLabel('Il vostro nome').fill('Giulia Ferrari')
		await page.getByLabel('La vostra email').fill('giulia@example')
		await page.getByLabel('Il messaggio').fill('Ciao.')
		await waitForToken(page)

		await page.getByRole('button', { name: 'Invia' }).click()

		await expect(page.locator('[data-contact-outcome]')).toHaveAttribute('data-contact-outcome', 'invalid', {
			timeout: 20_000,
		})
		await expect(page.getByLabel('La vostra email')).toHaveAttribute('aria-invalid', 'true')
	})
})

test.describe('the legals page', () => {
	test('renders its content from the CMS in both languages', async ({ page }) => {
		await page.goto('/legal')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Note legali')
		await expect(page.locator('[data-legal-body]')).toContainText('Anna Milazzo')
		await expect(page.locator('[data-legal-body] p')).not.toHaveCount(0)

		await page.goto('/en/legal')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Legal notice')
		await expect(page.locator('[data-legal-body]')).toContainText('composer and sound designer')
	})

	test('is reachable from every page', async ({ page }) => {
		for (const path of ['/', '/contact', '/legal']) {
			await page.goto(path)
			const link = page.locator('[data-legals-link]')
			await expect(link, `no legals link on ${path}`).toHaveCount(1)
			await expect(link).toHaveAttribute('href', '/legal')
		}
	})

	test('the footer link stays in the language being served', async ({ page }) => {
		await page.goto('/en')
		await expect(page.locator('[data-legals-link]')).toHaveAttribute('href', '/en/legal')
		await expect(page.locator('[data-legals-link]')).toHaveText('Legal notice')
	})
})

test('the landing page offers a route to contact', async ({ page }) => {
	await page.goto('/')

	const cta = page.locator('[data-contact-cta]')
	await expect(cta).toHaveAttribute('href', '/contact')
	await cta.click()
	await expect(page).toHaveURL('/contact')
})
