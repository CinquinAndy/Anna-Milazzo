import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The toolchain is named in four places, and a dependency bot moves them one at a time.
 *
 * `package.json` says which bun and which Node, the Dockerfile says what production is built
 * and run with, and the workflows say what the tests run on. CI builds the project with the
 * first and Coolify builds it with the second, so a bump that reaches only one of them is
 * green here and different there: a lockfile written by one bun and read with `--frozen-lockfile`
 * by another, types for a Node the image does not have. Dependencies merge themselves
 * (ADR-0012), so the agreement is a test and not a habit.
 */
const root = path.resolve(import.meta.dirname, '../..')
const read = (file: string) => readFileSync(path.join(root, file), 'utf8')
const pkg = JSON.parse(read('package.json')) as {
	packageManager: string
	engines: { node: string }
	devDependencies: Record<string, string>
}
const dockerfile = read('Dockerfile')

describe('bun', () => {
	const declared = pkg.packageManager.match(/^bun@(\d+\.\d+\.\d+)$/)?.[1]

	it('is pinned to an exact version in package.json', () => {
		expect(declared, pkg.packageManager).toBeDefined()
	})

	it('is the same bun in the production image as in the tests', () => {
		const images = [...dockerfile.matchAll(/^FROM oven\/bun:(\d+\.\d+\.\d+)/gm)].map(match => match[1])
		expect(images.length).toBeGreaterThan(0)
		expect(images, 'the Dockerfile builds with a different bun than package.json says').toEqual(
			images.map(() => declared)
		)
	})

	it('is read from package.json by every workflow, never typed into one', () => {
		const dir = path.join(root, '.github/workflows')
		for (const file of readdirSync(dir).filter(name => name.endsWith('.yml'))) {
			const workflow = readFileSync(path.join(dir, file), 'utf8')
			expect(workflow, `${file} names a bun version of its own`).not.toMatch(/bun-version:/)
		}
	})
})

describe('node', () => {
	const tags = [...dockerfile.matchAll(/^FROM node:(\d+)\.(\d+\.\d+)/gm)].map(match => ({
		major: match[1],
		full: `${match[1]}.${match[2]}`,
	}))

	it('is one version across the stages of the image', () => {
		expect(tags.length).toBeGreaterThan(0)
		expect(new Set(tags.map(tag => tag.full)).size, 'the build and run stages use different Nodes').toBe(1)
	})

	it('has types for the Node the image runs', () => {
		const types = pkg.devDependencies['@types/node']?.match(/^(\d+)\./)?.[1]
		expect(types, '@types/node describes a different Node than production runs').toBe(tags[0]?.major)
	})

	it('is a floor in package.json, never an exact version', () => {
		// A bot's pin rewrote this to a Node the project does not run. The runtime is chosen
		// in the Dockerfile; this only refuses an install on something too old.
		expect(pkg.engines.node).toMatch(/^>=\d+(\.\d+){0,2}$/)
		const floor = Number(pkg.engines.node.match(/\d+/)?.[0])
		expect(Number(tags[0]?.major)).toBeGreaterThanOrEqual(floor)
	})
})
