import { randomUUID } from 'node:crypto'
import { expect, test } from '@playwright/test'

/**
 * The admin panel, which is where Anna edits her own site and which nothing else in this
 * suite opens.
 *
 * It matters more now that dependencies merge themselves (ADR-0012). Payload and Next both
 * ship the admin's bundle, a bump can break it without breaking a single public page, and
 * the first person to find out would be Anna with a broken editor and no one to ask. So the
 * suite opens it: creates an administrator, signs out and back in, and loads the form of
 * the landing page with its content in it.
 *
 * Only in CI. The first administrator is created through the form Payload shows on an
 * empty database, which is what a CI database is and what the live one never is, and a
 * run against the database in `.env` has no business signing in to anything. It reads
 * and writes nothing else: no field is changed and nothing is saved.
 */
test.describe('the admin panel', () => {
	test.skip(!process.env.CI, 'creates an administrator, in a database that is thrown away')

	test('creates the first administrator, signs out and back in, and opens the landing page form', async ({ page }) => {
		const broken: string[] = []
		page.on('pageerror', error => broken.push(error.message))

		const email = `admin-${randomUUID().slice(0, 8)}@example.com`
		const password = randomUUID()

		// An empty database sends every visitor to the form that makes the first account.
		await page.goto('/admin')
		await expect(page).toHaveURL(/create-first-user/)
		// The panel is a client-rendered app and a click that lands before it has hydrated is a
		// plain form post that goes nowhere, the same trap as the public site's controls.
		await page.waitForLoadState('networkidle')
		await page.locator('input[name="email"]').fill(email)
		await page.locator('input[name="password"]').fill(password)
		await page.locator('input[name="confirm-password"]').fill(password)
		await page.getByRole('button', { name: 'Create' }).click()

		// The dashboard lists what she can edit.
		await expect(page).toHaveURL(/\/admin\/?$/)
		await expect(page.getByRole('link', { name: /Landing page/ }).first()).toBeVisible()
		await expect(page.getByRole('link', { name: /Songs/ }).first()).toBeVisible()

		// Out, and in again with the account just made: the sign-in is as much of the panel
		// as the form is.
		await page.goto('/admin/logout')
		await page.goto('/admin/login')
		await page.waitForLoadState('networkidle')
		await page.locator('input[name="email"]').fill(email)
		await page.locator('input[name="password"]').fill(password)
		await page.getByRole('button', { name: 'Login' }).click()
		await expect(page).toHaveURL(/\/admin\/?$/)
		const me = await page.evaluate(() => fetch('/api/users/me').then(response => response.json()))
		expect(me.user?.email).toBe(email)

		// The form of the landing page, with the CMS's own words in it: the heading of the
		// timeline, and the kind of its first entry, which is a select Payload builds.
		await page.goto('/admin/globals/home')
		await expect(page.locator('#field-timeline__heading')).toHaveValue('Percorso')
		// Rows may be open or closed depending on what the panel remembers; "Show All" makes
		// the question the same every time.
		for (const button of await page.getByRole('button', { name: 'Show All' }).all()) {
			await button.click()
		}
		await expect(page.getByText('Kind', { exact: true }).first()).toBeVisible()
		await expect(page.getByText('Certificate', { exact: true }).first()).toBeVisible()

		expect(broken, 'the admin threw in the browser').toEqual([])
	})

	test('a visitor who is not signed in does not get the form', async ({ page }) => {
		const response = await page.goto('/admin/globals/home')
		expect(response?.ok()).toBe(true)
		await expect(page).toHaveURL(/\/admin\/(login|create-first-user)/)
		await expect(page.locator('#field-timeline__heading')).toHaveCount(0)
	})
})
