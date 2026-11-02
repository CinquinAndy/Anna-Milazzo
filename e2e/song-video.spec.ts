import { expect, type Page, test } from '@playwright/test'
import { hydrated } from './hydrated'

/**
 * The videos on the works: a link Anna pastes, a player that exists only after a press
 * (ADR-0013).
 *
 * The seed gives two of its works a link, a Vimeo one on the first page of the pager and a
 * YouTube one on the second, and leaves the rest without. The provider's hosts are
 * intercepted so nothing here depends on, or reaches, anybody's servers.
 */
const VIMEO_SONG = 'notturno-per-tram-vuoto'
const YOUTUBE_SONG = 'studio-per-due-mani'
const NO_VIDEO_SONG = 'perche-il-temporale'

const PROVIDERS = /youtube|youtu\.be|ytimg|googlevideo|vimeo|vimeocdn|doubleclick/i

const song = (page: Page, reference: string) => page.locator(`.folder[data-song="${reference}"]`)

test.describe('a video on a work', () => {
	test.beforeEach(async ({ page }) => {
		// Not the point of these tests, and a click during the section's entrance misses.
		await page.emulateMedia({ reducedMotion: 'reduce' })
		await page.route(PROVIDERS, route =>
			route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>player</title>' })
		)
	})

	test('asks nothing of YouTube or Vimeo until it is pressed', async ({ page }) => {
		const asked: string[] = []
		page.on('request', request => {
			if (PROVIDERS.test(new URL(request.url()).host)) {
				asked.push(request.url())
			}
		})

		await page.goto('/')
		await hydrated(page)
		await page.waitForTimeout(1500)

		// No request, no frame, no thumbnail: the page is exactly as quiet as it was before
		// there were videos, which is what lets it go on saying it sets no cookie.
		expect(asked, 'the page contacted a video provider before anybody pressed play').toEqual([])
		await expect(page.locator('iframe')).toHaveCount(0)
	})

	test('shows a play button for the works that have a video and for no other', async ({ page }) => {
		await page.goto('/')

		await expect(page.locator('[data-song-video]')).toHaveCount(2)
		await expect(song(page, VIMEO_SONG).locator('[data-song-video]')).toHaveCount(1)
		await expect(song(page, YOUTUBE_SONG).locator('[data-song-video]')).toHaveCount(1)
		await expect(song(page, NO_VIDEO_SONG).locator('[data-song-video]')).toHaveCount(0)
	})

	test('pressing play loads the provider’s player, privacy-enhanced, and moves focus into it', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const button = song(page, VIMEO_SONG).locator('.song-video-start')
		await expect(button).toHaveAccessibleName(/^Guarda il video: /)
		await button.click()

		const frame = song(page, VIMEO_SONG).locator('iframe')
		await expect(frame).toHaveCount(1)
		// Built from the id, with Vimeo's do-not-track flag, and nothing else from the link.
		await expect(frame).toHaveAttribute('src', 'https://player.vimeo.com/video/76979871?autoplay=1&dnt=1')
		await expect(frame).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin')
		await expect(frame).toHaveAttribute('title', /^Guarda il video: /)
		await expect(frame).toHaveAttribute('allow', /fullscreen/)
		// Sandboxed: it may run its own scripts and open its own links, and no more.
		const sandbox = (await frame.getAttribute('sandbox')) ?? ''
		expect(sandbox).toContain('allow-scripts')
		expect(sandbox).not.toContain('allow-top-navigation')
		expect(sandbox).not.toContain('allow-forms')
		await expect(frame).toBeFocused()
		await expect(song(page, VIMEO_SONG).locator('.song-video-start')).toHaveCount(0)
	})

	test('a YouTube link plays from youtube-nocookie.com', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		// The second page of the pager: paging is not fetching, so the play button was
		// already in the document, hidden.
		await page.locator('.song-pager-page').nth(1).click()
		await song(page, YOUTUBE_SONG).locator('.song-video-start').click()

		await expect(song(page, YOUTUBE_SONG).locator('iframe')).toHaveAttribute(
			'src',
			'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1&rel=0&playsinline=1'
		)
	})

	test('is pressed from the keyboard', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		await song(page, VIMEO_SONG).locator('.song-video-start').focus()
		await page.keyboard.press('Enter')

		await expect(song(page, VIMEO_SONG).locator('iframe')).toHaveCount(1)
	})

	test('speaks English on the English page', async ({ page }) => {
		await page.goto('/en')
		await hydrated(page)

		await expect(song(page, VIMEO_SONG).locator('.song-video-start')).toContainText('Watch the video')
	})

	test('keeps the player in the same box, so nothing moves when it arrives', async ({ page }) => {
		await page.goto('/')
		await hydrated(page)

		const box = song(page, VIMEO_SONG).locator('[data-song-video]')
		await box.scrollIntoViewIfNeeded()
		const before = await box.boundingBox()
		await song(page, VIMEO_SONG).locator('.song-video-start').click()
		await expect(song(page, VIMEO_SONG).locator('iframe')).toHaveCount(1)
		const after = await box.boundingBox()

		expect(after?.width).toBeCloseTo(before?.width ?? 0, 0)
		expect(after?.height).toBeCloseTo(before?.height ?? 0, 0)
	})
})

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false })

	test('the address is offered as a plain link', async ({ page }) => {
		await page.goto('/')

		// A link, not an embed: nothing is requested from the provider until it is followed.
		await expect(song(page, VIMEO_SONG).locator('a.song-video-start')).toHaveAttribute(
			'href',
			'https://vimeo.com/76979871'
		)
	})
})
