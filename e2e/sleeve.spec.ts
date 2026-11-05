import { expect, type Page, test } from '@playwright/test'
import { openSong } from './folder'

/** A Song whose cover is 16:9, a video thumbnail, and which carries audio as well. */
const WIDE = 'studio-per-due-mani'

/** The record's painted box, and what it is measured against. */
async function sleeveGeometry(page: Page) {
	return page.evaluate(() => {
		// The open sheet: a closed one is `display: none` and measures as a zero box.
		const folder = document.querySelector('.song-panel[data-open="true"] .song-sheet')
		if (folder === null) {
			return null
		}
		const disc = folder.querySelector('.folder-disc')
		const cover = folder.querySelector('.folder-sleeve img')
		const heading = folder.querySelector('h3')
		const story = folder.querySelector('h3 + p')
		if (disc === null || cover === null) {
			return null
		}
		const discBox = disc.getBoundingClientRect()
		const coverBox = cover.getBoundingClientRect()
		// The PAINTED record, not the element's box. The record is a square SVG and it spins,
		// and the axis-aligned box of a spinning square grows by up to 41% while the circle
		// inside it does not move at all, measuring the box reports a collision that never
		// happens. The centre is invariant under a rotation about itself, and the record is
		// drawn at r=98 of a 200-unit viewBox.
		const layoutWidth = Number.parseFloat(getComputedStyle(disc).width)
		const centre = (discBox.left + discBox.right) / 2
		const paintedRight = centre + (layoutWidth * 98) / 200
		const body = folder.querySelector('.sheet-body')
		const columns = body === null ? '' : getComputedStyle(body).gridTemplateColumns
		const beside = columns.split(' ').length > 1
		const textLeft = Math.min(
			heading === null ? Number.POSITIVE_INFINITY : heading.getBoundingClientRect().left,
			story === null ? Number.POSITIVE_INFINITY : story.getBoundingClientRect().left
		)
		const cardBox = folder.getBoundingClientRect()
		return {
			// How far the record shows past the sleeve's right edge.
			out: paintedRight - coverBox.right,
			cardEdge: cardBox.right - paintedRight,
			// Where it sits against the cover, top and bottom, painted circle not box.
			top: discBox.top - coverBox.top,
			above: (discBox.top + discBox.bottom) / 2 - (layoutWidth * 98) / 200 - coverBox.top,
			below: coverBox.bottom - ((discBox.top + discBox.bottom) / 2 + (layoutWidth * 98) / 200),
			// How far the centre is from the cover's own, vertically.
			offCentre: (discBox.top + discBox.bottom) / 2 - (coverBox.top + coverBox.bottom) / 2,
			headingTop: heading === null ? null : heading.getBoundingClientRect().top,
			discBottom: (discBox.top + discBox.bottom) / 2 + (layoutWidth * 98) / 200,
			// Null when the story is not beside the cover at all.
			clearance: beside ? textLeft - paintedRight : null,
		}
	})
}

test.describe('the record and its sleeve', () => {
	test('gives the record a hover target no bigger than the artwork', async ({ page }) => {
		await page.setViewportSize({ width: 1024, height: 900 })
		await page.goto('/')
		const dead = await page.evaluate(() => {
			const sleeve = document.querySelector('.song-panel[data-open="true"] .folder-sleeve')
			const cover = sleeve?.querySelector('img')
			if (!sleeve || !cover) {
				return 0
			}
			return sleeve.getBoundingClientRect().height - cover.getBoundingClientRect().height
		})
		// Left to stretch, the wrapper fills a grid row the story makes far taller than the
		// picture, 282px of blank paper under it, all of which brought the record out.
		expect(dead, 'the hover target extends past the artwork').toBeLessThan(8)
	})

	test('keeps the record in the sleeve until something plays', async ({ page }) => {
		await page.goto('/')
		const resting = await sleeveGeometry(page)
		// At rest the left column is one clean square. The record showing regardless is what
		// made the disc wallpaper rather than a signal.
		expect(resting?.out ?? 0, 'the record was already out before anything played').toBeLessThan(4)
	})

	test('brings the record out when the Song plays, with no pointer involved', async ({ page }) => {
		await page.goto('/')
		const resting = await sleeveGeometry(page)

		// Clicked, then the pointer is moved away, so nothing here depends on hover, a
		// portfolio gets opened on a phone, where there is no pointer to hover with.
		await page.locator('[data-song-stack] .transport-play').first().click()
		await page.mouse.move(0, 0)
		await page.waitForTimeout(700)

		const playing = await sleeveGeometry(page)
		expect(playing?.out ?? 0, 'the record did not come out').toBeGreaterThan((resting?.out ?? 0) + 12)
	})

	test('never reaches the story, at any width', async ({ page }) => {
		for (const width of [320, 360, 375, 414, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await page.locator('[data-song-stack] .transport-play').first().click()
			await page.mouse.move(0, 0)
			await page.waitForTimeout(700)

			const playing = await sleeveGeometry(page)
			// Null means the story is not beside the cover at this width, so there is nothing
			// to collide with. A previous disc position overlapped the text by 14px at every
			// width, black under black, so the first character of every line lost contrast.
			if (playing?.clearance !== null && playing?.clearance !== undefined) {
				expect(playing.clearance, `the record reaches the story at ${width}px`).toBeGreaterThan(0)
			}
			// And it must not leave the card either. Below the width at which the cover stops
			// being capped, the runway is the card's own padding and the full travel put the
			// rim within a pixel and a half of the outer edge.
			expect(playing?.cardEdge ?? 0, `the record escapes the card at ${width}px`).toBeGreaterThan(4)
		}
	})

	test('stays inside the cover, centred on it, whatever its shape', async ({ page }) => {
		for (const width of [360, 768, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			for (const reference of ['notturno-per-tram-vuoto', WIDE]) {
				await openSong(page, reference)
				const resting = await sleeveGeometry(page)
				// Sized from the cover's width, the record assumed a square cover: on a 16:9 one
				// it was taller than the picture and hung 60px down over the title (Anna, 5
				// November). Sized from the height, it cannot leave the cover.
				expect(resting?.above ?? -1, `the record rises above ${reference} at ${width}px`).toBeGreaterThanOrEqual(0)
				expect(resting?.below ?? -1, `the record hangs below ${reference} at ${width}px`).toBeGreaterThanOrEqual(0)
				expect(Math.abs(resting?.offCentre ?? 99), `the record is off centre on ${reference}`).toBeLessThan(3)
			}
		}
	})

	test('never reaches the title on a 16:9 cover, even while it plays', async ({ page }) => {
		for (const width of [360, 390, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await openSong(page, WIDE)
			await page.locator('.song-panel[data-open="true"] .transport-play').click()
			await page.mouse.move(0, 0)
			await page.waitForTimeout(700)
			const playing = await sleeveGeometry(page)
			if (playing?.clearance === null && playing.headingTop !== null) {
				// Stacked: the title is under the cover, and the record must end above it.
				expect(playing.discBottom, `the record reaches the title at ${width}px`).toBeLessThan(playing.headingTop)
			}
			if (playing?.clearance !== null && playing?.clearance !== undefined) {
				expect(playing.clearance, `the record reaches the story at ${width}px`).toBeGreaterThan(0)
			}
		}
	})

	test('turns visibly while it plays, rather than turning invisibly', async ({ page }) => {
		await page.goto('/')
		await page.locator('[data-song-stack] .transport-play').first().click()
		await page.waitForTimeout(1200)

		// Every element of the record is a circle concentric with it, so rotating it was a
		// mathematical no-op and the spin drew nothing at all. Something on it has to be off
		// axis for the animation to mean anything.
		const angles: string[] = []
		for (let sample = 0; sample < 4; sample++) {
			angles.push(
				await page.evaluate(() => {
					const disc = document.querySelector('.song-panel[data-open="true"] .folder-disc')
					return disc === null ? '' : getComputedStyle(disc).rotate
				})
			)
			await page.waitForTimeout(250)
		}
		expect(new Set(angles).size, 'the record is not turning').toBeGreaterThan(2)

		const offAxis = await page.evaluate(() => {
			const disc = document.querySelector('.song-panel[data-open="true"] .folder-disc')
			if (disc === null) {
				return 0
			}
			// Anything drawn with its own rotation is, by definition, not concentric.
			return disc.querySelectorAll('[transform*="rotate"]').length
		})
		expect(offAxis, 'nothing on the record is off its axis, so turning it shows nothing').toBeGreaterThan(0)
	})
})
