import { expect, test } from '@playwright/test'

test.describe('locale routing', () => {
	test('serves Italian at the root, with no prefix in the URL', async ({ page }) => {
		await page.goto('/')

		await expect(page).toHaveURL('/')
		await expect(page.locator('html')).toHaveAttribute('lang', 'it')
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anna Milazzo')
		await expect(page.getByText('Compositrice e sound designer.')).toBeVisible()
	})

	test('serves English under /en', async ({ page }) => {
		await page.goto('/en')

		await expect(page.locator('html')).toHaveAttribute('lang', 'en')
		await expect(page.getByText('Composer and sound designer.')).toBeVisible()
	})

	test('the language switch lands on the same page in the other language', async ({ page }) => {
		await page.goto('/')

		await page.getByRole('navigation', { name: 'Lingua' }).getByRole('link', { name: 'English' }).click()

		await expect(page).toHaveURL('/en')
		await expect(page.locator('html')).toHaveAttribute('lang', 'en')

		await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: 'Italiano' }).click()

		await expect(page).toHaveURL('/')
		await expect(page.locator('html')).toHaveAttribute('lang', 'it')
	})

	test('the switch marks the language already being served', async ({ page }) => {
		await page.goto('/')

		const current = page.locator('[data-language-switch] [aria-current="true"]')
		await expect(current).toHaveText('Italiano')
	})

	test('Italian is not also reachable under /it', async ({ page }) => {
		const response = await page.goto('/it/')

		await expect(page).toHaveURL('/')
		expect(response?.status()).toBe(200)
	})

	// The single most likely way to break this build: the naive i18n matcher rewrites
	// /admin onto the Italian tree and the Payload admin disappears.
	test('the Payload admin is untouched by the rewrite', async ({ page }) => {
		const response = await page.goto('/admin')

		expect(response?.status()).toBe(200)
		await expect(page).toHaveURL(/\/admin/)
		await expect(page.locator('html')).not.toHaveAttribute('lang', 'it')
	})

	test('the Payload REST API is untouched by the rewrite', async ({ request }) => {
		const response = await request.get('/api/users')

		// 403 rather than 404: the route exists and access control answered it.
		expect(response.status()).toBe(403)
	})
})
