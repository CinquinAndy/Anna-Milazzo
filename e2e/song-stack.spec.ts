import { expect, test } from '@playwright/test'
import { openSheet, openSong, sheet } from './folder'
import { hydrated } from './hydrated'

/**
 * The works: one Folder, a numbered Tab per Song, one Song open at a time (ADR-0014).
 */

/** The seeded order. `citta-alle-quattro` has no platform link; `luce-di-taglio` has no audio. */
const ORDER = [
	'notturno-per-tram-vuoto',
	'perche-il-temporale',
	'citta-alle-quattro',
	'studio-per-due-mani',
	'piu-vicino-del-previsto',
	'luce-di-taglio',
] as const

const tabs = (page: import('@playwright/test').Page) => page.locator('[data-song-stack] .song-tab')

test.describe('the Folder', () => {
	test('files every Song, in the order set in the CMS, with a numbered Tab each', async ({ page }) => {
		await page.goto('/')

		const sheets = page.locator('[data-song-stack] .song-sheet')
		await expect(sheets).toHaveCount(ORDER.length)
		expect(await sheets.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-song')))).toEqual([...ORDER])

		await expect(tabs(page)).toHaveCount(ORDER.length)
		expect(await page.locator('.song-tab-number').allTextContents()).toEqual(['01', '02', '03', '04', '05', '06'])
	})

	test('is a tab interface, and says so once it works', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const list = page.getByRole('tablist')
		await expect(list).toHaveCount(1)
		await expect(list).toHaveAccessibleName('Ascolta')
		await expect(page.getByRole('tab')).toHaveCount(ORDER.length)
		// Closed sheets are out of the accessibility tree, not just out of sight.
		await expect(page.getByRole('tabpanel')).toHaveCount(1)

		const first = page.getByRole('tab').first()
		await expect(first).toHaveAttribute('aria-selected', 'true')
		const controls = await first.getAttribute('aria-controls')
		await expect(page.getByRole('tabpanel')).toHaveAttribute('id', controls ?? '')
		await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', (await first.getAttribute('id')) ?? '')
	})

	test('names each Tab by the number drawn on it, then the full title', async ({ page }) => {
		await page.goto('/en')
		await hydrated(page)

		// WCAG 2.5.3: the name starts with what is visible, so "click 02" works by voice.
		await expect(page.getByRole('tab').nth(1)).toHaveAccessibleName('02 Why the Storm')
	})

	test('opens one Song at a time, and the open Tab is the only one selected', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		await openSong(page, 'citta-alle-quattro')
		await expect(page.locator('[aria-selected="true"]')).toHaveCount(1)
		await expect(page.getByRole('tab').nth(2)).toHaveAttribute('aria-selected', 'true')
		const visible = await page
			.locator('.song-sheet')
			.evaluateAll(nodes =>
				nodes.filter(n => n.getBoundingClientRect().height > 0).map(n => n.getAttribute('data-song'))
			)
		expect(visible).toEqual(['citta-alle-quattro'])
	})

	test('moves between Tabs with the arrow keys, Home and End, and wraps round', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const tab = page.getByRole('tab')
		await tab.first().focus()

		await page.keyboard.press('ArrowRight')
		await expect(tab.nth(1)).toBeFocused()
		await expect(tab.nth(1)).toHaveAttribute('aria-selected', 'true')

		await page.keyboard.press('End')
		await expect(tab.last()).toBeFocused()
		await page.keyboard.press('ArrowRight')
		await expect(tab.first()).toBeFocused()
		await page.keyboard.press('ArrowLeft')
		await expect(tab.last()).toBeFocused()
		await page.keyboard.press('Home')
		await expect(tab.first()).toHaveAttribute('aria-selected', 'true')

		// One tab stop for the whole row: Tab leaves it for the open sheet.
		await expect(tab.nth(1)).toHaveAttribute('tabindex', '-1')
		await page.keyboard.press('Tab')
		await expect(page.getByRole('tabpanel')).toBeFocused()
	})

	test('answers to a link: the fragment opens its Song, and follows the open Tab', async ({ page }) => {
		await page.goto('/en#closer-than-expected')
		await hydrated(page)

		await expect(openSheet(page)).toHaveAttribute('data-song', 'piu-vicino-del-previsto')
		// Brought into view, since the browser could not scroll to a sheet that was hidden.
		const top = await page.locator('[data-folder]').evaluate(el => el.getBoundingClientRect().top)
		expect(top).toBeGreaterThanOrEqual(0)
		expect(top).toBeLessThan(200)

		await openSong(page, 'perche-il-temporale')
		expect(new URL(page.url()).hash).toBe('#why-the-storm')
		// Replaced, not pushed: Back leaves the page rather than stepping through Tabs.
		expect(await page.evaluate(() => history.length)).toBeLessThanOrEqual(2)
	})

	test('a Song with no platform link shows no link', async ({ page }) => {
		await page.goto('/')

		await expect(sheet(page, 'notturno-per-tram-vuoto').locator('[data-platform-link]')).toHaveCount(1)
		await expect(
			sheet(page, 'citta-alle-quattro').locator('[data-platform-link]'),
			'a Song with no platformUrl rendered a link anyway'
		).toHaveCount(0)
	})

	test('a Song with no English story falls back to the Italian', async ({ page }) => {
		await page.goto('/en')

		const untranslated = sheet(page, 'perche-il-temporale')
		await expect(untranslated.locator('h3')).toHaveText('Why the Storm')
		// The English story was never written; the Italian must show rather than a blank.
		await expect(untranslated).toContainText('Un esercizio diventato un brano')
		await expect(sheet(page, 'citta-alle-quattro')).toContainText('The shortest thing I have written')
	})

	test('the open Tab is welded to the body: no keyline between them', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const geometry = await page.evaluate(() => {
			const tab = document.querySelector('.song-tab[data-open="true"]') as HTMLElement
			const body = document.querySelector('.song-folder-body') as HTMLElement
			const fill = getComputedStyle(tab, '::after')
			return {
				keyline: Number.parseFloat(getComputedStyle(body).borderTopWidth),
				overlap: tab.getBoundingClientRect().bottom - body.getBoundingClientRect().top,
				fillReachesBottom: Number.parseFloat(fill.bottom),
				tabAbove: Number(getComputedStyle(tab).zIndex) > Number(getComputedStyle(body).zIndex),
				sameColour: fill.backgroundColor === getComputedStyle(body).backgroundColor,
			}
		})

		// The row is pulled down by exactly one keyline, the open Tab is drawn over the body,
		// and its fill runs to its bottom edge in the body's own colour: that is the weld.
		expect(geometry.overlap).toBeCloseTo(geometry.keyline, 1)
		expect(geometry.fillReachesBottom).toBe(0)
		expect(geometry.tabAbove).toBe(true)
		expect(geometry.sameColour).toBe(true)
	})

	test('the body takes the colour of the open Tab', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const colours = async () =>
			page.evaluate(() => ({
				tab: getComputedStyle(document.querySelector('.song-tab[data-open="true"]') as Element, '::after')
					.backgroundColor,
				body: getComputedStyle(document.querySelector('.song-folder-body') as Element).backgroundColor,
			}))
		const before = await colours()
		await openSong(page, 'perche-il-temporale')
		const after = await colours()

		expect(after.body).toBe(after.tab)
		expect(after.body).not.toBe(before.body)
	})

	test('the shadow is one filter on the Folder, not a shadow per box', async ({ page }) => {
		await page.goto('/')

		const shadows = await page.evaluate(() => ({
			folder: getComputedStyle(document.querySelector('.song-folder') as Element).filter,
			tab: getComputedStyle(document.querySelector('.song-tab') as Element).boxShadow,
			body: getComputedStyle(document.querySelector('.song-folder-body') as Element).boxShadow,
		}))
		expect(shadows.folder).toContain('drop-shadow')
		expect(shadows.tab).toBe('none')
		expect(shadows.body).toBe('none')
	})

	test('the tape straddles the cover, is translucent, and is hidden from assistive technology', async ({ page }) => {
		await page.goto('/')

		const tape = sheet(page, 'notturno-per-tram-vuoto').locator('.tape')
		await expect(tape).toHaveCount(2)
		for (let i = 0; i < 2; i++) {
			await expect(tape.nth(i)).toHaveAttribute('aria-hidden', 'true')
		}

		const strips = await openSheet(page)
			.locator('.tape')
			.evaluateAll(nodes =>
				nodes.map(node => {
					const style = getComputedStyle(node)
					const cover = node.parentElement?.querySelector('img')?.getBoundingClientRect()
					const box = node.getBoundingClientRect()
					return {
						transform: style.transform,
						blend: style.mixBlendMode,
						crossesEdge:
							cover !== undefined && (box.left < cover.left || box.right > cover.right || box.top < cover.top),
					}
				})
			)
		expect(strips).toHaveLength(2)
		for (const strip of strips) {
			expect(strip.transform, 'a tape strip is unrotated').not.toBe('none')
			expect(strip.blend, 'tape must let the surface below show through').toBe('multiply')
			expect(strip.crossesEdge, 'a tape strip sits entirely inside the cover, that is a sticker').toBe(true)
		}
		expect(new Set(strips.map(s => s.transform)).size).toBe(2)
	})

	test('every tap target clears 24 by 24 pixels at 375px, and every Tab 44 by 36', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await hydrated(page)
		await page.evaluate(() => document.fonts.ready)

		for (const reference of ORDER) {
			await openSong(page, reference)
			const small = await page.evaluate(() =>
				[...document.querySelectorAll('.song-panel[data-open="true"] a, .song-panel[data-open="true"] button')]
					.map(el => ({ box: el.getBoundingClientRect(), text: (el.textContent ?? '').slice(0, 30) }))
					.filter(({ box }) => box.width < 24 || box.height < 24)
					.map(({ box, text }) => `${text}: ${Math.round(box.width)}x${Math.round(box.height)}`)
			)
			expect(small, `tap targets below 24x24 on ${reference}`).toEqual([])
		}

		const tabSizes = await tabs(page).evaluateAll(nodes =>
			nodes.map(n => n.getBoundingClientRect()).filter(box => box.width < 44 || box.height < 36)
		)
		expect(tabSizes, 'a Tab is too small to hit with a thumb').toEqual([])
	})

	test('the row of Tabs scrolls on its own at 360px, and the page does not', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 800 })
		await page.goto('/')
		await hydrated(page)

		expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(
			0
		)

		// The last Tab is brought into the row when it is opened from the keyboard.
		await page.getByRole('tab').first().focus()
		await page.keyboard.press('End')
		const inRow = await page.evaluate(() => {
			const row = document.querySelector('.song-tabs')?.getBoundingClientRect()
			const last = document.querySelector('.song-tab:last-child')?.getBoundingClientRect()
			return row !== undefined && last !== undefined && last.left >= row.left - 1 && last.right <= row.right + 1
		})
		expect(inRow, 'the opened Tab is scrolled out of the row').toBe(true)
	})
})

test.describe('playing across Tabs', () => {
	test('a Song that is playing keeps playing when another Tab is opened, and its Tab says so', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const paused = async () => page.evaluate(() => document.querySelector('audio')?.paused ?? true)
		await openSheet(page).locator('[data-play]').click()
		await expect.poll(paused).toBe(false)
		await expect(tabs(page).first()).toHaveAttribute('data-sounding', 'true')

		await openSong(page, 'perche-il-temporale')

		// One audio element for the whole page, and opening a Tab neither unmounts it nor
		// touches it: the music does not stop because you looked at the next work.
		await expect.poll(paused, { message: 'opening a Tab stopped the track' }).toBe(false)
		await expect(tabs(page).first()).toHaveAttribute('data-sounding', 'true')
		await expect(tabs(page).first().locator('.song-tab-disc')).toBeVisible()
		await expect(tabs(page).nth(1).locator('.song-tab-disc')).toBeHidden()
	})
})

test.describe('a Song with no audio', () => {
	test('has no player and no record: its video is what plays', async ({ page }) => {
		await page.goto('/')
		await openSong(page, 'luce-di-taglio')

		const film = sheet(page, 'luce-di-taglio')
		await expect(film).toHaveAttribute('data-kind', 'video')
		await expect(film.locator('[data-play]')).toHaveCount(0)
		await expect(film.locator('.folder-disc')).toHaveCount(0)
		await expect(film.locator('.folder-screen [data-song-video]')).toHaveCount(1)
	})

	test('every Song with audio still gets a player, seed handle or not', async ({ page }) => {
		await page.goto('/')

		// `reference` is a seed handle hidden from the admin, so Anna's own Songs have none:
		// the handle falls back to the record id, and the player must be there regardless.
		for (const reference of ORDER.filter(r => r !== 'luce-di-taglio')) {
			await expect(sheet(page, reference).locator('[data-play]'), `${reference} has no play control`).toHaveCount(1)
		}
	})
})

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false })

	test('every Song is shown, stacked, and the Tabs are links to them', async ({ page }) => {
		await page.goto('/')

		const shown = await page
			.locator('.song-sheet')
			.evaluateAll(nodes => nodes.filter(n => n.getBoundingClientRect().height > 0).length)
		expect(shown).toBe(ORDER.length)
		await expect(page.locator('[role="tab"]')).toHaveCount(0)
		await expect(page.locator('[role="tablist"]')).toHaveCount(0)

		const href = await tabs(page).nth(2).getAttribute('href')
		await expect(page.locator(`${href} .song-sheet`)).toHaveAttribute('data-song', 'citta-alle-quattro')
	})
})
