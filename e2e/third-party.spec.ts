import { expect, test } from '@playwright/test'

/**
 * Nothing on this site loads code from somebody else's server.
 *
 * Two exceptions are deliberate and named below: the fonts, which are self-hosted by
 * `next/font` and only fetched at build time, and Cloudflare Turnstile, which is the
 * anti-bot check on the contact form and cannot work any other way.
 *
 * Everything else is a supply-chain question that no dependency update can answer, because
 * a script tag is not a dependency: Renovate cannot see it, the lockfile does not pin it,
 * and whoever serves it can change what it does between one visitor and the next. It also
 * runs with full access to the page, which on the contact page means the message being
 * typed into it.
 */
const ALLOWED = [
	// The anti-bot check. Only on the contact page, and the form cannot work without it.
	'challenges.cloudflare.com',
]

const PAGES = ['/', '/en', '/contact', '/en/contact', '/legal', '/en/legal'] as const

for (const path of PAGES) {
	test(`${path} loads no third-party code`, async ({ page }) => {
		const foreign: string[] = []
		page.on('request', request => {
			if (request.resourceType() !== 'script') {
				return
			}
			const url = request.url()
			// A worker created from a blob carries its origin inside the URL rather than in
			// `host`, which parses as empty. Turnstile starts one, so reading only the host
			// would let any blob through.
			const origin = url.startsWith('blob:') ? url.slice('blob:'.length) : url
			let host: string
			try {
				host = new URL(origin).host
			} catch {
				foreign.push(`unparseable (${url.slice(0, 90)})`)
				return
			}
			if (host === 'localhost:3111' || ALLOWED.some(allowed => host.endsWith(allowed))) {
				return
			}
			foreign.push(`${host} (${url.slice(0, 90)})`)
		})

		await page.goto(path, { waitUntil: 'load' })
		await page.waitForTimeout(1500)

		expect(foreign, `${path} fetched script(s) from: ${foreign.join(', ')}`).toEqual([])
	})

	test(`${path} declares no third-party script tag`, async ({ page }) => {
		await page.goto(path, { waitUntil: 'load' })

		// The markup, not the network: a tag that fails to load is still a tag that says
		// where the page expects its code to come from.
		const tags = await page.locator('script[src]').evaluateAll(
			(nodes, allowed) =>
				nodes
					.map(node => (node as HTMLScriptElement).src)
					.filter(src => /^https?:\/\//.test(src))
					.filter(src => {
						const host = new URL(src).host
						return host !== window.location.host && !allowed.some(one => host.endsWith(one))
					}),
			ALLOWED
		)
		expect(tags, `${path} declares: ${tags.join(', ')}`).toEqual([])
	})
}
