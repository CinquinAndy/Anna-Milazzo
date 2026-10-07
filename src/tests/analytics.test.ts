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

	it('loads the tracker and nothing else', async () => {
		// The assertion that matters is the absence. `recorder.js` replays how one person
		// moved through a page, which is the half of Umami that would need a consent
		// banner; this site does not ship it, and the legal notice says so. A change that
		// adds it back has to come past this line.
		const { umamiScripts } = await loadWith('any')
		expect(umamiScripts).toEqual(['https://umami.wadefade.fr/script.js'])
		expect(umamiScripts.some(src => src.includes('recorder'))).toBe(false)
	})

	it('reports a host the request matcher can compare against', async () => {
		// `UMAMI_HOST` is what `e2e/third-party.spec.ts` matches a request's host against,
		// so it must be the bare host and carry no scheme, path or trailing slash.
		const { UMAMI_HOST } = await loadWith('any')
		expect(UMAMI_HOST).toBe('umami.wadefade.fr')
	})
})
