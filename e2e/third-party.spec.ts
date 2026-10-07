import { expect, test } from '@playwright/test'

import { UMAMI_HOST, umamiScripts, umamiWebsiteId } from '../src/lib/analytics'

/**
 * Nothing on this site loads code from somebody else's server, beyond the exceptions
 * named here.
 *
 * Everything else is a supply-chain question that no dependency update can answer, because
 * a script tag is not a dependency: Renovate cannot see it, the lockfile does not pin it,
 * and whoever serves it can change what it does between one visitor and the next. It also
 * runs with full access to the page, which on the contact page means the message being
 * typed into it.
 *
 * The allowance for Umami is derived from the configuration rather than written in, which
 * matters: in a build that is not measuring anything (local work, and CI, neither of which
 * sets the website id) the host is NOT allowed, so the strict rule is what actually runs
 * on every pull request. A build that does set it gets the second test below, which pins
 * exactly which two scripts the exception buys.
 */
const ALLOWED = [
	// The anti-bot check. Only on the contact page, and the form cannot work without it.
	'challenges.cloudflare.com',
	// Analytics, on Andy's own server, and only in a build configured to report to it.
	...(umamiWebsiteId === null ? [] : [UMAMI_HOST]),
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

/**
 * The analytics exception, pinned from both sides.
 *
 * Whichever way this build is configured, one of these two tests runs and the other is
 * skipped, so the suite always states what it expects rather than going quiet.
 */
test.describe('analytics', () => {
	test.skip(umamiWebsiteId === null, 'this build reports to no Umami instance')

	for (const path of PAGES) {
		test(`${path} declares exactly the two Umami scripts`, async ({ page }) => {
			await page.goto(path, { waitUntil: 'load' })

			const declared = await page.locator(`script[src*="${UMAMI_HOST}"]`).evaluateAll(nodes =>
				nodes.map(node => {
					const script = node as HTMLScriptElement
					return { src: script.src, id: script.dataset.websiteId ?? '', defer: script.defer }
				})
			)

			expect(
				declared.map(one => one.src),
				'the wrong scripts, or in the wrong order'
			).toEqual([...umamiScripts])
			// Without the id the script loads and measures nothing, which is the failure
			// that looks like success.
			expect(
				declared.map(one => one.id),
				'a script with no website id'
			).toEqual(declared.map(() => umamiWebsiteId))
			expect(
				declared.map(one => one.defer),
				'analytics competing with the page for the main thread'
			).toEqual(declared.map(() => true))
		})
	}
})

test.describe('no analytics', () => {
	test.skip(umamiWebsiteId !== null, 'this build does report to an Umami instance')

	for (const path of PAGES) {
		test(`${path} mentions no analytics host at all`, async ({ page }) => {
			await page.goto(path, { waitUntil: 'load' })

			// Named rather than inferred: the generic test above allows any host that is not
			// in ALLOWED to fail the run, and this one says out loud that an unconfigured
			// build must not carry the tag even inert.
			await expect(page.locator(`script[src*="${UMAMI_HOST}"]`)).toHaveCount(0)
		})
	}
})
