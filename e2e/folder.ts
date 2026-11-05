import { expect, type Page } from '@playwright/test'

/** The sheet of one seeded Song, by its seed handle. */
export const sheet = (page: Page, reference: string) => page.locator(`.song-sheet[data-song="${reference}"]`)

/** The sheet that is open in the Folder. */
export const openSheet = (page: Page) => page.locator('.song-panel[data-open="true"] .song-sheet')

/**
 * Opens the Tab of one Song and waits for its sheet.
 *
 * Only one sheet is shown at a time, and a closed one is `display: none`: its text is still
 * in the document, so `toHaveText` passes on it, but nothing on it can be clicked or
 * measured. Any test that presses or measures something on a Song other than the first
 * opens its Tab with this first. Safe before hydration too: the Tab is then a link to the
 * sheet's fragment, and the Folder opens whatever the fragment names once it hydrates.
 */
export async function openSong(page: Page, reference: string) {
	const panel = page.locator(`.song-panel:has(.song-sheet[data-song="${reference}"])`)
	const slug = await panel.getAttribute('id')
	await page.locator(`.song-tab[href="#${slug}"]`).click()
	await expect(panel).toBeVisible()
}
