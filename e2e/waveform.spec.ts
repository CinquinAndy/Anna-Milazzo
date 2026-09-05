import { expect, type Page, test } from '@playwright/test'

/**
 * The drawn height of every column of one Folder's rail, 0..1.
 *
 * Read back off the canvas rather than from markup, because the rail is a canvas: the
 * ground is whatever the top-left pixel is — always above every bar — and a column's height
 * is the first row that differs from it.
 */
async function shapeOf(page: Page, index: number) {
	return page.evaluate(nth => {
		const canvas = document.querySelectorAll<HTMLCanvasElement>('[data-song-stack] .playhead-canvas')[nth]
		if (canvas === undefined) {
			return []
		}
		const context = canvas.getContext('2d')
		if (context === null) {
			return []
		}
		const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
		// The most common colour along the top row. Reading the corner pixel instead looks
		// simpler and is wrong: when a bar reaches the top of the leftmost column the ground
		// is read as a bar colour, every column then differs from it at row 0, and the whole
		// rail measures as full height. That produced a real false result before this.
		const tally = new Map<string, number>()
		for (let x = 0; x < canvas.width; x++) {
			const i = x * 4
			const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
			tally.set(key, (tally.get(key) ?? 0) + 1)
		}
		let ground = ''
		let seen = -1
		for (const [key, count] of tally) {
			if (count > seen) {
				ground = key
				seen = count
			}
		}
		const columns: number[] = []
		for (let x = 0; x < canvas.width; x++) {
			let top = canvas.height
			for (let y = 0; y < canvas.height; y++) {
				const i = (y * canvas.width + x) * 4
				if (`${data[i]},${data[i + 1]},${data[i + 2]}` !== ground) {
					top = y
					break
				}
			}
			columns.push((canvas.height - top) / canvas.height)
		}
		return columns
	}, index)
}

/**
 * Waits until the rail has actually been painted.
 *
 * The canvas is drawn from an effect, so `goto` can return before a single pixel exists.
 * Reading straight away is a flake that shows up as "nothing reaches the top of the rail"
 * in one run and passes in the next — which it did, before this.
 */
async function railPainted(page: Page) {
	await page.waitForFunction(() => {
		const canvas = document.querySelector<HTMLCanvasElement>('[data-song-stack] .playhead-canvas')
		const context = canvas?.getContext('2d')
		if (canvas === null || canvas === undefined || context === null || context === undefined) {
			return false
		}
		const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
		const first = `${data[0]},${data[1]},${data[2]}`
		for (let i = 4; i < data.length; i += 4) {
			if (`${data[i]},${data[i + 1]},${data[i + 2]}` !== first) {
				return true
			}
		}
		return false
	})
}

const near = (a: readonly number[], b: readonly number[]) =>
	a.length === b.length && a.every((value, i) => Math.abs(value - (b[i] ?? 0)) < 0.02)

test.describe('the rail visualiser', () => {
	test('draws each track from its own audio, not one shape for all of them', async ({ page }) => {
		await page.goto('/')
		await railPainted(page)

		const first = await shapeOf(page, 0)
		const second = await shapeOf(page, 1)
		const third = await shapeOf(page, 2)

		expect(first.length, 'the rail drew nothing at all').toBeGreaterThan(20)
		// The whole point of measuring the file: two Songs cannot share a shape. An authored
		// phrase reused everywhere passes every other test here and fails this one.
		expect(near(first, second), 'two Songs drew the same waveform').toBe(false)
		expect(near(second, third), 'two Songs drew the same waveform').toBe(false)
	})

	test('shows the shape of the track before anything is pressed', async ({ page }) => {
		await page.goto('/')
		await railPainted(page)

		const shape = await shapeOf(page, 0)
		const lit = shape.filter(value => value > 0)
		const tallest = Math.max(...lit)
		const shortest = Math.min(...lit)

		// Unplayed bars are drawn low on purpose, but they must still differ from each other:
		// a rail of equal stubs hides where the piece swells, which is the reason for drawing
		// them at all.
		expect(lit.length, 'the rail drew nothing before playing').toBeGreaterThan(20)
		expect(tallest - shortest, 'every unplayed bar is the same height').toBeGreaterThan(0.15)
		// And none of them is at full height yet — that is what playing is for.
		expect(tallest, 'a bar was already at full height before playing').toBeLessThan(0.82)
	})

	test('comes alive when the track plays, and holds its frame when it stops', async ({ page }) => {
		await page.goto('/')
		await railPainted(page)

		const resting = await shapeOf(page, 0)
		await page.locator('[data-song-stack] .transport-play').first().click()
		await page.waitForTimeout(3000)

		const playing = await shapeOf(page, 0)
		// The bars the playhead has passed have grown to their true height. If this passes
		// with the two identical, the visualiser is not being driven by playback at all.
		expect(near(resting, playing), 'the rail did not change when the track played').toBe(false)
		// And it grew where the playhead has been, not everywhere: the left of the rail is
		// taller than it was, the right is untouched.
		const early = Math.max(...playing.slice(0, Math.floor(playing.length / 6)))
		const late = Math.max(...playing.slice(Math.floor(playing.length * 0.75)))
		const restedEarly = Math.max(...resting.slice(0, Math.floor(resting.length / 6)))
		expect(early, 'the played bars did not grow').toBeGreaterThan(restedEarly + 0.1)
		expect(late, 'bars grew ahead of the playhead').toBeLessThan(0.75)

		await page.locator('[data-song-stack] .transport-play').first().click()
		await page.waitForTimeout(600)
		const paused = await shapeOf(page, 0)
		await page.waitForTimeout(900)
		const stillPaused = await shapeOf(page, 0)
		// Held, not decayed: the playhead stays where the audio stopped, and the bars must
		// agree with it rather than sliding back to rest under it.
		expect(near(paused, stillPaused), 'the bars kept moving after the audio stopped').toBe(true)
	})

	test('fills the rail at every width, and never pushes the page sideways', async ({ page }) => {
		for (const width of [375, 414, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 })
			await page.goto('/')
			await railPainted(page)
			await railPainted(page)

			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - document.documentElement.clientWidth
			)
			expect(overflow, `the page scrolls sideways at ${width}px`).toBe(0)

			const shape = await shapeOf(page, 0)
			const lit = shape.filter(value => value > 0).length
			// Bars folded onto fewer, wider columns when the rail is narrow — but never so few
			// that the histogram stops being one, and never so thin that they vanish.
			expect(lit, `the rail is nearly empty at ${width}px`).toBeGreaterThan(shape.length / 3)
		}
	})

	test('leaves the focus ring on the controls and not around the whole Folder', async ({ page }) => {
		await page.goto('/')
		await railPainted(page)

		const outlineOf = (selector: string) =>
			page.evaluate(sel => {
				const node = document.querySelector(sel)
				return node === null ? '' : getComputedStyle(node).outlineStyle
			}, selector)

		await page.locator('[data-song-stack] .folder .transport-play').first().focus()
		// The card-wide ring was the ugly one. The control's own ring is the accessible one,
		// and it is the reason removing the card's is safe.
		expect(await outlineOf('[data-song-stack] .folder')).toBe('none')
		expect(await outlineOf('[data-song-stack] .folder .transport-play')).not.toBe('none')

		// The seek input is deliberately transparent over the canvas, so the rail carries its
		// indicator — it is the only one that control has.
		await page.locator('[data-song-stack] .folder .playhead-seek').first().focus()
		expect(await outlineOf('[data-song-stack] .folder .transport-rail')).not.toBe('none')
	})

	test('is still a canvas the seek control sits on top of, not in place of', async ({ page }) => {
		await page.goto('/')
		await railPainted(page)

		// Decoration must stay decoration: the canvas carries no information the transport
		// does not also report in text, and it must not be announced. Asserted on the rail
		// rather than on the canvas — the wrapper is what carries `aria-hidden`, and putting
		// it on the canvas as well trips the rule against hiding a focusable element.
		const hidden = await page.evaluate(() => {
			const canvas = document.querySelector('[data-song-stack] .playhead-canvas')
			return canvas?.closest('[aria-hidden="true"]') !== null && canvas?.closest('[aria-hidden="true"]') !== undefined
		})
		expect(hidden, 'the canvas is not hidden from assistive technology').toBe(true)

		const seek = page.locator('[data-song-stack] .playhead-seek').first()
		await expect(seek).toHaveAttribute('type', 'range')
		await seek.focus()
		await seek.press('ArrowRight')
		expect(Number(await seek.inputValue()), 'the keyboard cannot move the playhead').toBeGreaterThan(0)
	})
})
