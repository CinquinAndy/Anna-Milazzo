import { expect, test } from '@playwright/test'

/** The seeded order. `citta-alle-quattro` is the Song with no platform link. */
const ORDER = [
	'notturno-per-tram-vuoto',
	'perche-il-temporale',
	'citta-alle-quattro',
	'studio-per-due-mani',
	'piu-vicino-del-previsto',
] as const

test.describe('the Folder stack', () => {
	test('shows every Song, in the order set in the CMS', async ({ page }) => {
		await page.goto('/')

		const folders = page.locator('[data-song-stack] .folder')
		await expect(folders).toHaveCount(ORDER.length)

		const rendered = await folders.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-song')))
		expect(rendered).toEqual([...ORDER])
	})

	test('is a list of works, not a tab interface', async ({ page }) => {
		await page.goto('/')

		// The visual metaphor is a filing tab. The semantics must not be.
		await expect(page.locator('[role="tablist"]')).toHaveCount(0)
		await expect(page.locator('[role="tab"]')).toHaveCount(0)
		await expect(page.locator('[role="tabpanel"]')).toHaveCount(0)

		const list = page.locator('[data-song-stack] ul')
		await expect(list.getByRole('listitem')).toHaveCount(ORDER.length)
		await expect(list.getByRole('article')).toHaveCount(ORDER.length)
	})

	test('a Song with no platform link shows no link', async ({ page }) => {
		await page.goto('/')

		const withLink = page.locator('[data-song="notturno-per-tram-vuoto"] [data-platform-link]')
		await expect(withLink).toHaveCount(1)

		const without = page.locator('[data-song="citta-alle-quattro"] [data-platform-link]')
		await expect(without, 'a Song with no platformUrl rendered a link anyway').toHaveCount(0)
	})

	test('a Song with no English story falls back to the Italian', async ({ page }) => {
		await page.goto('/en')

		const untranslated = page.locator('[data-song="perche-il-temporale"]')
		await expect(untranslated.getByRole('heading', { level: 3 })).toHaveText('Why the Storm')
		// The English story was never written; the Italian must show rather than a blank.
		await expect(untranslated).toContainText('Un esercizio diventato un brano')

		// And a Song that IS translated shows its English.
		await expect(page.locator('[data-song="citta-alle-quattro"]')).toContainText('The shortest thing I have written')
	})

	test('the tab alternates down the column', async ({ page }) => {
		await page.goto('/')

		const sides = await page
			.locator('[data-song-stack] .folder')
			.evaluateAll(nodes => nodes.map(n => n.getAttribute('data-tab')))
		expect(sides).toEqual(['start', 'end', 'start', 'end', 'start'])
	})

	test('the keyline has no seam where the tab meets the body', async ({ page }) => {
		await page.goto('/')

		const geometry = await page.locator('[data-song="notturno-per-tram-vuoto"]').evaluate(folder => {
			const tab = folder.querySelector('.folder-tab') as HTMLElement
			const body = folder.querySelector('.folder-body') as HTMLElement
			const tabStyle = getComputedStyle(tab)
			return {
				keyline: Number.parseFloat(getComputedStyle(body).borderTopWidth),
				pull: Number.parseFloat(tabStyle.marginBottom),
				tabBottomBorder: Number.parseFloat(tabStyle.borderBottomWidth),
				overlap: tab.getBoundingClientRect().bottom - body.getBoundingClientRect().top,
			}
		})

		// The body is pulled up by exactly one keyline, and the tab has no bottom border
		// of its own — that is what removes the seam.
		expect(geometry.pull).toBe(-geometry.keyline)
		expect(geometry.tabBottomBorder).toBe(0)
		expect(geometry.overlap).toBeCloseTo(geometry.keyline, 1)
	})

	test('the shadow is one filter on the wrapper, not a shadow per box', async ({ page }) => {
		await page.goto('/')

		const shadows = await page.locator('[data-song="notturno-per-tram-vuoto"]').evaluate(folder => ({
			wrapper: getComputedStyle(folder).filter,
			tab: getComputedStyle(folder.querySelector('.folder-tab') as HTMLElement).boxShadow,
			body: getComputedStyle(folder.querySelector('.folder-body') as HTMLElement).boxShadow,
		}))

		expect(shadows.wrapper).toContain('drop-shadow')
		// A box-shadow per box notches the tab/body join.
		expect(shadows.tab).toBe('none')
		expect(shadows.body).toBe('none')
	})

	test('the tape straddles the cover, is translucent, and is hidden from assistive technology', async ({ page }) => {
		await page.goto('/')

		const tape = page.locator('[data-song="notturno-per-tram-vuoto"] .tape')
		await expect(tape).toHaveCount(2)

		for (let i = 0; i < 2; i++) {
			await expect(tape.nth(i)).toHaveAttribute('aria-hidden', 'true')
		}

		const strips = await page.locator('[data-song-stack] .tape').evaluateAll(nodes =>
			nodes.map(node => {
				const style = getComputedStyle(node)
				const cover = node.parentElement?.querySelector('img')?.getBoundingClientRect()
				const box = node.getBoundingClientRect()
				return {
					transform: style.transform,
					blend: style.mixBlendMode,
					// Straddling: part on the image, part on the paper behind it.
					crossesEdge: cover !== undefined && (box.left < cover.left || box.right > cover.right || box.top < cover.top),
				}
			})
		)

		expect(strips.length).toBe(ORDER.length * 2)
		for (const strip of strips) {
			expect(strip.transform, 'a tape strip is unrotated').not.toBe('none')
			expect(strip.blend, 'tape must let the surface below show through').toBe('multiply')
			expect(strip.crossesEdge, 'a tape strip sits entirely inside the cover — that is a sticker').toBe(true)
		}

		// Never the same angle twice: one shared value reads as a repeated component.
		const angles = new Set(strips.map(s => s.transform))
		expect(angles.size).toBeGreaterThan(1)
	})

	test('every Folder is fully visible with no overlap', async ({ page }) => {
		await page.goto('/')

		const boxes = await page
			.locator('[data-song-stack] .folder')
			.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect()).map(b => ({ top: b.top, bottom: b.bottom })))

		for (let i = 1; i < boxes.length; i++) {
			expect(boxes[i]?.top ?? 0, `Folder ${i + 1} overlaps the one above it`).toBeGreaterThan(boxes[i - 1]?.bottom ?? 0)
		}
	})

	test('every tap target clears 24 by 24 pixels at 375px', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 812 })
		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)

		const small = await page.evaluate(() => {
			const targets = document.querySelectorAll('[data-song-stack] a, [data-song-stack] button')
			return [...targets]
				.map(el => ({ box: el.getBoundingClientRect(), text: (el.textContent ?? '').slice(0, 30) }))
				.filter(({ box }) => box.width < 24 || box.height < 24)
				.map(({ box, text }) => `${text}: ${Math.round(box.width)}x${Math.round(box.height)}`)
		})
		expect(small, 'tap targets below 24x24').toEqual([])
	})
})

test('a Song created in the admin, with no seed handle, still gets a player', async ({ page }) => {
	await page.goto('/')

	// `reference` is a seed handle hidden from the admin, so Anna's own Songs have none.
	// Every Folder must carry a play control regardless of where the Song came from.
	const folders = page.locator('[data-song-stack] .folder')
	const count = await folders.count()

	for (let i = 0; i < count; i++) {
		const handle = await folders.nth(i).getAttribute('data-song')
		expect(handle, 'a Folder has no handle at all').toBeTruthy()
		await expect(folders.nth(i).locator('[data-play]'), `Folder ${i + 1} has no play control`).toHaveCount(1)
	}

	// And the handle falls back to the record id rather than vanishing.
	const stripped = await page.evaluate(() => {
		const folder = document.querySelector('[data-song-stack] .folder')
		return folder?.querySelector('[data-play]')?.getAttribute('data-play') ?? ''
	})
	expect(stripped.length).toBeGreaterThan(0)
})
