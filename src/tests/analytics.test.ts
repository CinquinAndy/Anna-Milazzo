import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * The gate, read at module load.
 *
 * `umamiWebsiteId` is computed once when `src/lib/analytics.ts` is first imported, which
 * is what makes it safe to read from a Server Component's render without touching
 * `process.env` on every page. The cost is that a test has to set the variable and then
 * re-import the module, so each case does its own `resetModules`.
 */
async function loadWith(id: string | undefined) {
	vi.resetModules()
	if (id === undefined) {
		vi.stubEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID', '')
	} else {
		vi.stubEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID', id)
	}
	return import('@/lib/analytics')
}

afterEach(() => {
	vi.unstubAllEnvs()
	vi.resetModules()
})

describe('umami', () => {
	it('is off when no website id is configured', async () => {
		const { umamiWebsiteId } = await loadWith(undefined)
		expect(umamiWebsiteId).toBeNull()
	})

	it('is off when the website id is only whitespace', async () => {
		// Coolify writes an empty variable as an empty string, and a hand-edited `.env`
		// can leave a space behind. Both have to read as "not configured" rather than as
		// an id, or the page ships a tracker that reports nothing under no site.
		const { umamiWebsiteId } = await loadWith('   ')
		expect(umamiWebsiteId).toBeNull()
	})

	it('is on, trimmed, when an id is configured', async () => {
		// A stand-in, not the real id: the test is about the trimming, and the live value
		// belongs in Coolify rather than in a public repository that has no use for it.
		const { umamiWebsiteId } = await loadWith(' 11111111-2222-3333-4444-555555555555\n')
		expect(umamiWebsiteId).toBe('11111111-2222-3333-4444-555555555555')
	})

	it('names the recorder before the tracker', async () => {
		// The order is not cosmetic: the tracker drives the recorder, so the recorder has
		// to have registered itself first. Reversing these silently loses session replay
		// while still reporting page views, which looks like it works.
		const { umamiScripts } = await loadWith('any')
		expect(umamiScripts).toEqual(['https://umami.wadefade.fr/recorder.js', 'https://umami.wadefade.fr/script.js'])
	})

	it('reports a host the request matcher can compare against', async () => {
		// `UMAMI_HOST` is what `e2e/third-party.spec.ts` matches a request's host against,
		// so it must be the bare host and carry no scheme, path or trailing slash.
		const { UMAMI_HOST } = await loadWith('any')
		expect(UMAMI_HOST).toBe('umami.wadefade.fr')
	})
})
