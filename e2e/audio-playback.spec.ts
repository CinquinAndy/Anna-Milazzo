import { expect, test } from '@playwright/test'

const FIRST = 'notturno-per-tram-vuoto'
const SECOND = 'perche-il-temporale'

/** What the one shared element is doing, read straight off the DOM. */
async function element(page: import('@playwright/test').Page) {
	return page.evaluate(() => {
		const audio = document.querySelector('audio')
		return audio === null
			? null
			: {
					// `src` updates the moment it is assigned. `currentSrc` only catches up
					// when the resource selection algorithm runs, so reading it would report
					// the previous Song for a beat after a swap.
					src: audio.src,
					currentSrc: audio.currentSrc,
					paused: audio.paused,
					preload: audio.preload,
					count: document.querySelectorAll('audio').length,
				}
	})
}

test.describe('audio playback', () => {
	test('mounts exactly one audio element, and does not preload it', async ({ page }) => {
		await page.goto('/')

		const audio = await element(page)
		expect(audio?.count, 'one element for the whole page, not one per Folder').toBe(1)
		expect(audio?.preload).toBe('none')
		expect(audio?.src, 'a source was assigned before anyone asked for one').toBe('')
	})

	test('requests no audio until a Recruiter asks for it', async ({ page }) => {
		const audioRequests: string[] = []
		page.on('request', request => {
			if (/\.mp3(\?|$)/.test(request.url())) {
				audioRequests.push(request.url())
			}
		})

		await page.goto('/')
		await page.evaluate(() => document.fonts.ready)
		await page.waitForTimeout(500)

		expect(audioRequests, 'audio was fetched before it was asked for').toEqual([])
	})

	test('plays a Song when its control is pressed', async ({ page }) => {
		await page.goto('/')
		await page.locator(`[data-play="${FIRST}"]`).click()

		await expect.poll(async () => (await element(page))?.paused).toBe(false)
		expect((await element(page))?.src).toContain(`track-${FIRST}.mp3`)
	})

	// The criterion this ticket exists for.
	test('starting a second Song leaves only the second playing', async ({ page }) => {
		await page.goto('/')

		await page.locator(`[data-play="${FIRST}"]`).click()
		await expect.poll(async () => (await element(page))?.paused).toBe(false)

		await page.locator(`[data-play="${SECOND}"]`).click()
		await expect.poll(async () => (await element(page))?.paused).toBe(false)

		const audio = await element(page)
		expect(audio?.count, 'a second element appeared').toBe(1)
		expect(audio?.src, 'the first Song is still loaded').toContain(`track-${SECOND}.mp3`)
		expect(audio?.src).not.toContain(`track-${FIRST}.mp3`)

		// And the first Folder no longer reads as playing.
		await expect(page.locator(`[data-play="${FIRST}"]`)).toHaveAttribute('data-playing', 'false')
		await expect(page.locator(`[data-play="${SECOND}"]`)).toHaveAttribute('data-playing', 'true')
	})

	test('pressing the same control again pauses it', async ({ page }) => {
		await page.goto('/')

		const control = page.locator(`[data-play="${FIRST}"]`)
		await control.click()
		await expect.poll(async () => (await element(page))?.paused).toBe(false)

		await control.click()
		await expect.poll(async () => (await element(page))?.paused).toBe(true)
		await expect(control).toHaveAttribute('data-playing', 'false')
	})

	test('shows a running time without loading any audio', async ({ page }) => {
		await page.goto('/')

		// Straight from the duration stored on the Song: 24s, 31s, 18s, 27s, 35s.
		await expect(page.locator(`[data-duration="${FIRST}"]`)).toHaveText('0:24')
		await expect(page.locator(`[data-duration="${SECOND}"]`)).toHaveText('0:31')
		await expect(page.locator('[data-duration="piu-vicino-del-previsto"]')).toHaveText('0:35')

		// Nothing was fetched to work that out.
		expect((await element(page))?.src).toBe('')
	})

	test('draws progress as blocks driven by a custom property, not by React state', async ({ page }) => {
		await page.goto('/')

		const blocks = page.locator(`[data-progress="${FIRST}"]`)
		await expect(blocks).toHaveAttribute('aria-hidden', 'true')
		await expect(blocks).toHaveCSS('--playhead', '0')

		await page.locator(`[data-play="${FIRST}"]`).click()
		await expect
			.poll(async () => Number(await blocks.evaluate(el => getComputedStyle(el).getPropertyValue('--playhead'))), {
				timeout: 8000,
			})
			.toBeGreaterThan(0)
	})

	test('the seek control is a native range that reports itself', async ({ page }) => {
		await page.goto('/')

		const seek = page.locator(`[data-seek="${FIRST}"]`)
		await expect(seek).toHaveJSProperty('tagName', 'INPUT')
		await expect(seek).toHaveAttribute('type', 'range')
		await expect(seek).toHaveAttribute('max', '24')
		// A label a screen reader can read, and no reimplemented slider role.
		expect(await seek.getAttribute('aria-label')).toBeTruthy()
		await expect(page.locator('[role="slider"]')).toHaveCount(0)
	})

	test('the seek control is operable by keyboard', async ({ page }) => {
		await page.goto('/')

		const seek = page.locator(`[data-seek="${FIRST}"]`)
		await seek.focus()
		await expect(seek).toBeFocused()

		await page.keyboard.press('ArrowRight')
		await page.keyboard.press('ArrowRight')
		await expect(seek).toHaveValue('2')

		// Arrow keys fire `change`, which commits the seek to the element.
		await expect.poll(async () => (await element(page))?.src).toContain(`track-${FIRST}.mp3`)
	})

	test('offers no volume control', async ({ page }) => {
		await page.goto('/')

		// On iOS `volume` is not settable from script and always reads back as 1, so a
		// volume slider would be a lie on the device most likely to see it.
		const volumeControls = await page.evaluate(
			() =>
				[...document.querySelectorAll('input[type="range"]')].filter(el =>
					/volum/i.test(el.getAttribute('aria-label') ?? '')
				).length
		)
		expect(volumeControls).toBe(0)
	})

	test('reaching the end resets the player and starts nothing else', async ({ page }) => {
		await page.goto('/')

		// The shortest Song is 18 seconds; seek near its end rather than waiting.
		await page.locator('[data-play="citta-alle-quattro"]').click()
		await expect.poll(async () => (await element(page))?.paused).toBe(false)

		// `duration` is NaN until the element has metadata; seeking before then is a no-op
		// and the test would then be waiting out the whole Song.
		await expect
			.poll(async () => page.evaluate(() => Number.isFinite(document.querySelector('audio')?.duration ?? Number.NaN)))
			.toBe(true)

		await page.evaluate(() => {
			const audio = document.querySelector('audio')
			if (audio !== null) {
				audio.currentTime = Math.max(0, audio.duration - 0.4)
			}
		})

		await expect.poll(async () => (await element(page))?.paused, { timeout: 10_000 }).toBe(true)

		// Nothing else took over.
		await expect(page.locator('[data-playing="true"]')).toHaveCount(0)
		await expect(page.locator('[data-progress="citta-alle-quattro"]')).toHaveCSS('--playhead', '0')
	})
})

test('pausing keeps the playhead where the audio stopped', async ({ page }) => {
	await page.goto('/')

	const control = page.locator(`[data-play="${FIRST}"]`)
	const seek = page.locator(`[data-seek="${FIRST}"]`)
	await control.click()

	// Let it get past the first second so zero and the real position differ.
	await expect.poll(async () => (await element(page))?.paused).toBe(false)
	await expect
		.poll(async () => page.evaluate(() => document.querySelector('audio')?.currentTime ?? 0), { timeout: 10_000 })
		.toBeGreaterThan(1.5)

	await control.click()
	await expect.poll(async () => (await element(page))?.paused).toBe(true)

	const stopped = await page.evaluate(() => document.querySelector('audio')?.currentTime ?? 0)
	expect(stopped).toBeGreaterThan(1.5)

	// The controls must report where the Recruiter actually is, not snap back to the
	// start — a seek slider reading 0 turns the next arrow key into a jump backwards.
	await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0)
	await expect
		.poll(async () =>
			Number(
				await page
					.locator(`[data-progress="${FIRST}"]`)
					.evaluate(el => getComputedStyle(el).getPropertyValue('--playhead'))
			)
		)
		.toBeGreaterThan(0)

	// Nudging forward goes forward.
	await seek.focus()
	await page.keyboard.press('ArrowRight')
	await expect
		.poll(async () => page.evaluate(() => document.querySelector('audio')?.currentTime ?? 0))
		.toBeGreaterThan(stopped - 0.5)
})
