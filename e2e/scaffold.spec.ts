import { expect, test } from '@playwright/test'

/**
 * Placeholder that fixes where end-to-end tests live: `e2e/**\/*.spec.ts`, driven against
 * real routes and the real database. This is the seam most later tickets add to.
 */
test('the Portfolio answers at the root', async ({ page }) => {
	await page.goto('/')

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Anna Milazzo')
})
