import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The bucket is configured from the environment, and the environment is exactly what a
 * continuous integration run does not have. If the plugin ever becomes unconditional
 * again, CI stops falling back to local disk and starts writing Anna's fixtures into the
 * real bucket on every pull request, which is slow, wrong, and silent.
 */
const KEYS = ['S3_BUCKET', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const

const load = async () => {
	vi.resetModules()
	return import('@/lib/storage')
}

describe('where uploaded files go', () => {
	const saved: Record<string, string | undefined> = {}

	beforeEach(() => {
		for (const key of KEYS) {
			saved[key] = process.env[key]
		}
	})

	afterEach(() => {
		for (const key of KEYS) {
			if (saved[key] === undefined) {
				delete process.env[key]
			} else {
				process.env[key] = saved[key]
			}
		}
	})

	it('uses the bucket when all four values are set', async () => {
		for (const key of KEYS) {
			process.env[key] = 'set'
		}
		const { bucketConfigured, storagePlugins } = await load()
		expect(bucketConfigured).toBe(true)
		expect(storagePlugins).toHaveLength(1)
	})

	it('falls back to local disk when nothing is configured', async () => {
		for (const key of KEYS) {
			delete process.env[key]
		}
		const { bucketConfigured, storagePlugins } = await load()
		expect(bucketConfigured).toBe(false)
		expect(storagePlugins, 'an empty list is what leaves Payload writing to disk').toEqual([])
	})

	for (const missing of KEYS) {
		it(`falls back to local disk when ${missing} alone is missing`, async () => {
			for (const key of KEYS) {
				process.env[key] = 'set'
			}
			delete process.env[missing]
			const { bucketConfigured } = await load()
			// Half a bucket is worse than none: the client builds, and every upload fails at
			// the first write with an error that says nothing.
			expect(bucketConfigured).toBe(false)
		})
	}
})
