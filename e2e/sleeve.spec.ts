import { expect, type Page, test } from '@playwright/test'

/** The record's painted box, and what it is measured against. */
async function sleeveGeometry(page: Page, index = 0) {
	return page.evaluate(nth => {
		const folder = document.querySelectorAll('[data-song-stack] .folder')[nth]
		if (folder === undefined) {
			return null
		}
		const disc = folder.querySelector('.folder-disc')
		const cover = folder.querySelector('.folder-sleeve img')
		const heading = folder.querySelector('h3')
		const story = folder.querySelector('p')
		if (disc === null || cover === null) {
			return null
		}
		const discBox = disc.getBoundingClientRect()
		const coverBox = cover.getBoundingClientRect()
		// The PAINTED record, not the element's box. The record is a square SVG and it spins,
		// and the axis-aligned box of a spinning square grows by up to 41% while the circle
		// inside it does not move at all — measuring the box reports a collision that never
		// happens. The centre is invariant under a rotation about itself, and the record is
		// drawn at r=98 of a 200-unit viewBox.
		const layoutWidth = Number.parseFloat(getComputedStyle(disc).width)
		const centre = (discBox.left + discBox.right) / 2
		const paintedRight = centre + (layoutWidth * 98) / 200
		const body = folder.querySelector('.folder-body')
		const columns = body === null ? '' : getComputedStyle(body).gridTemplateColumns
		const beside = columns.split(' ').length > 1
		const textLeft = Math.min(
			heading === null ? Number.POSITIVE_INFINITY : heading.getBoundingClientRect().left,
			story === null ? Number.POSITIVE_INFINITY : story.getBoundingClientRect().left
		)
		return {
			// How far the record shows past the sleeve's right edge.
			out: paintedRight - coverBox.right,
			// Its top, relative to the cover, so every Song can be compared.
			top: discBox.top - coverBox.top,
			// Null when the story is not beside the cover at all.
			clearance: beside ? textLeft - paintedRight : null,
		}
	}, index)
}

test.describe('the record and its sleeve', () => {
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

		// Clicked, then the pointer is moved away, so nothing here depends on hover — a
		// portfolio gets opened on a phone, where there is no pointer to hover with.
		await page.locator('[data-song-stack] .transport-play').first().click()
		await page.mouse.move(0, 0)
		await page.waitForTimeout(700)

		const playing = await sleeveGeometry(page)
		expect(playing?.out ?? 0, 'the record did not come out').toBeGreaterThan((resting?.out ?? 0) + 12)
	})

	test('never reaches the story, at any width', async ({ page }) => {
		for (const width of [375, 414, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await page.locator('[data-song-stack] .transport-play').first().click()
			await page.mouse.move(0, 0)
			await page.waitForTimeout(700)

			const playing = await sleeveGeometry(page)
			// Null means the story is not beside the cover at this width, so there is nothing
			// to collide with. A previous disc position overlapped the text by 14px at every
			// width — black under black, so the first character of every line lost contrast.
			if (playing?.clearance !== null && playing?.clearance !== undefined) {
				expect(playing.clearance, `the record reaches the story at ${width}px`).toBeGreaterThan(0)
			}
		}
	})

	test('sits at the same height on every Song', async ({ page }) => {
		await page.goto('/')
		const tops: number[] = []
		for (let index = 0; index < 5; index++) {
			const geometry = await sleeveGeometry(page, index)
			if (geometry !== null) {
				tops.push(Math.round(geometry.top))
			}
		}
		// A percentage `inset-block-start` resolves against the containing block's HEIGHT,
		// which here is a grid row stretched by the story beside it — so the record hung at a
		// different height on every Song. A percentage margin resolves against the width.
		expect(Math.max(...tops) - Math.min(...tops), 'the record hangs at a different height per Song').toBeLessThan(3)
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
					const disc = document.querySelector('[data-song-stack] .folder-disc')
					return disc === null ? '' : getComputedStyle(disc).rotate
				})
			)
			await page.waitForTimeout(250)
		}
		expect(new Set(angles).size, 'the record is not turning').toBeGreaterThan(2)

		const offAxis = await page.evaluate(() => {
			const disc = document.querySelector('[data-song-stack] .folder-disc')
			if (disc === null) {
				return 0
			}
			// Anything drawn with its own rotation is, by definition, not concentric.
			return disc.querySelectorAll('[transform*="rotate"]').length
		})
		expect(offAxis, 'nothing on the record is off its axis, so turning it shows nothing').toBeGreaterThan(0)
	})
})
