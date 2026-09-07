import { expect, test } from '@playwright/test'
import { SITE_ORIGIN } from '../src/lib/site'

/**
 * The card that stands in for the site anywhere a link is unfurled.
 *
 * What matters is not how it looks, which a test cannot judge, but that a scraper can
 * actually fetch it: the right size, the right type, a first-party URL, and no redirect on
 * the way, because several scrapers will not follow one on `og:image` and the link then
 * unfurls with no card at all.
 */
const PAGES = ['/', '/en', '/contact', '/en/contact', '/legal', '/en/legal'] as const

for (const path of PAGES) {
	test(`${path} declares a card a scraper can fetch`, async ({ page, request }) => {
		await page.goto(path)

		const url = await page.locator('meta[property="og:image"]').getAttribute('content')
		expect(url, `${path} declares no og:image`).toBeTruthy()

		// Absolute, and on the site's own origin. Open Graph does not reliably resolve a
		// relative image URL, which is what the layout's `metadataBase` is there to prevent.
		const declared = new URL(url ?? '')
		expect(declared.origin, 'the card is declared on a foreign origin').toBe(new URL(SITE_ORIGIN).origin)

		// Twitter reads its own tag first, and Next fills it from the same source.
		const twitter = await page.locator('meta[name="twitter:image"]').getAttribute('content')
		expect(twitter, 'the Twitter card points somewhere else').toBe(url)

		await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200')
		await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630')
		await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png')

		// The alt text is the card read aloud, and it comes from the CMS like everything else.
		const alt = await page.locator('meta[property="og:image:alt"]').getAttribute('content')
		expect(alt ?? '', `${path} has no alt on its card`).toMatch(/Anna Milazzo/)

		// No redirect. The Italian tree is served unprefixed and `/it/*` redirects away, so
		// the card's own `/it/...` address has to be let through the proxy.
		// Fetched from the server under test rather than from production, which is what the
		// declared origin points at.
		const local = new URL(declared.pathname + declared.search, page.url()).toString()
		const response = await request.get(local, { maxRedirects: 0 })
		expect(response.status(), `${local} did not answer 200 directly`).toBe(200)
		expect(response.headers()['content-type']).toBe('image/png')

		const body = await response.body()
		expect(body.byteLength, 'the card is suspiciously small').toBeGreaterThan(10_000)
		// Under the 500KB an ImageResponse bundle is allowed, and under what a scraper will
		// happily download on a phone.
		expect(body.byteLength, 'the card is too heavy for a preview').toBeLessThan(300_000)
		// A real PNG, not an error page with the wrong header.
		expect(body.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
	})
}

test('the card says what Anna does, in the language of the page', async ({ page }) => {
	for (const [path, phrase] of [
		['/', 'Compositrice'],
		['/en', 'Composer'],
	] as const) {
		await page.goto(path)
		const alt = await page.locator('meta[property="og:image:alt"]').getAttribute('content')
		expect(alt ?? '', `${path} card is not described in its own language`).toContain(phrase)
	}
})
