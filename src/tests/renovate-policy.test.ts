import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * What `renovate.json` decides, read back as cases (ADR-0012).
 *
 * Renovate is the one dependency this project has no test for: it runs on someone else's
 * server and reads a file, and the cost of getting the file wrong is silent. It already
 * was once, a value Renovate does not allow made the hosted app create nothing for weeks.
 * CI now runs the real validator for that. This is the other half, the POLICY: which
 * updates merge themselves and which wait for a person, written as examples so that
 * loosening it, or adding a rule below the one that has to win, fails here first.
 *
 * It applies the file's `packageRules` in order, the way Renovate does (a later rule
 * overrides an earlier one), for the handful of matchers the file uses. It is not
 * Renovate and does not pretend to be: it answers "what did this file say".
 */
type Rule = {
	matchDepTypes?: string[]
	matchPackageNames?: string[]
	matchUpdateTypes?: string[]
	matchCurrentVersion?: string
	enabled?: boolean
	automerge?: boolean
	groupName?: string
	addLabels?: string[]
}

type Config = {
	automerge?: boolean
	schedule?: string[]
	minimumReleaseAge?: string
	internalChecksFilter?: string
	lockFileMaintenance?: { automerge?: boolean; schedule?: string[] }
	vulnerabilityAlerts?: { minimumReleaseAge?: string | null; schedule?: string[] }
	packageRules: Rule[]
	postUpdateOptions?: string[]
}

const config = JSON.parse(readFileSync(path.resolve(import.meta.dirname, '../../renovate.json'), 'utf8')) as Config

type Update = {
	name: string
	depType: 'dependencies' | 'devDependencies' | 'engines'
	type: 'major' | 'minor' | 'patch'
	from: string
}

const glob = (pattern: string) =>
	new RegExp(
		`^${pattern
			.replace(/[.+^${}()|[\]\\]/g, '\\$&')
			.replace(/\*\*/g, '.*')
			.replace(/\*/g, '[^/]*')}$`
	)

function resolve(update: Update) {
	const outcome = {
		enabled: true,
		automerge: config.automerge === true,
		groupName: undefined as string | undefined,
		labels: [] as string[],
	}
	for (const rule of config.packageRules) {
		const matches =
			(rule.matchDepTypes === undefined || rule.matchDepTypes.includes(update.depType)) &&
			(rule.matchPackageNames === undefined || rule.matchPackageNames.some(name => glob(name).test(update.name))) &&
			(rule.matchUpdateTypes === undefined || rule.matchUpdateTypes.includes(update.type)) &&
			(rule.matchCurrentVersion === undefined ||
				new RegExp(rule.matchCurrentVersion.replace(/^\/|\/$/g, '')).test(update.from))
		if (!matches) {
			continue
		}
		outcome.enabled = rule.enabled ?? outcome.enabled
		outcome.automerge = rule.automerge ?? outcome.automerge
		outcome.groupName = rule.groupName ?? outcome.groupName
		outcome.labels.push(...(rule.addLabels ?? []))
	}
	return outcome
}

const dep = (
	name: string,
	type: Update['type'],
	from = '1.2.3',
	depType: Update['depType'] = 'dependencies'
): Update => ({
	name,
	type,
	from,
	depType,
})

describe('what merges itself', () => {
	it.each([
		['a runtime patch', dep('graphql', 'patch')],
		['a runtime minor', dep('@react-email/render', 'minor')],
		['a toolchain patch', dep('vitest', 'patch', '4.1.12', 'devDependencies')],
		['a toolchain minor', dep('@playwright/test', 'minor', '1.62.1', 'devDependencies')],
		['a Next minor', dep('next', 'minor', '16.3.4')],
		['a Next patch', dep('next', 'patch', '16.3.4')],
		['a Payload minor, which the build checks against the schema', dep('payload', 'minor', '3.90.2')],
		['a Payload package minor', dep('@payloadcms/next', 'minor', '3.90.2')],
		['a sharp patch', dep('sharp', 'patch', '0.34.5')],
		['the bun that runs the tests', dep('bun', 'minor', '1.3.14', 'devDependencies')],
	])('%s', (_, update) => {
		expect(resolve(update).automerge).toBe(true)
	})

	it('and the monthly lockfile refresh', () => {
		expect(config.lockFileMaintenance?.automerge).toBe(true)
	})
})

describe('what waits for a person', () => {
	it.each([
		['next', 'dependencies'],
		['payload', 'dependencies'],
		['@payloadcms/ui', 'dependencies'],
		['react', 'dependencies'],
		['typescript', 'devDependencies'],
		['vitest', 'devDependencies'],
		['@biomejs/biome', 'devDependencies'],
	] as const)('a major of %s, never on its own', (name, depType) => {
		const outcome = resolve(dep(name, 'major', '1.2.3', depType))
		expect(outcome.automerge).toBe(false)
		expect(outcome.labels).toContain('major')
	})

	it('a 0.x minor, which is a breaking change by convention: sharp', () => {
		const outcome = resolve(dep('sharp', 'minor', '0.34.5'))
		expect(outcome.automerge).toBe(false)
		expect(outcome.labels).toContain('needs a read')
	})

	it('and the rule that says so is the last one, so nothing above it can undo it', () => {
		const last = config.packageRules.at(-1)
		expect(last?.matchUpdateTypes).toEqual(['major'])
		expect(last?.automerge).toBe(false)
	})

	it('a major inside a group, still', () => {
		expect(resolve(dep('payload', 'major', '3.90.2')).automerge).toBe(false)
	})
})

describe('what is not Renovate’s to touch', () => {
	it('engines.node, which is a floor and was once rewritten to an exact version', () => {
		expect(resolve(dep('node', 'minor', '>=20.9.0', 'engines')).enabled).toBe(false)
	})
})

describe('what moves together', () => {
	it.each([
		[
			'payload',
			[
				'payload',
				'@payloadcms/next',
				'@payloadcms/richtext-lexical',
				'@payloadcms/storage-s3',
				'@payloadcms/ui',
				'@payloadcms/db-postgres',
			],
		],
		['react', ['react', 'react-dom', '@types/react', '@types/react-dom']],
		['tailwind', ['tailwindcss', '@tailwindcss/postcss']],
		['bun', ['bun', 'oven/bun']],
	])('%s', (group, names) => {
		for (const name of names) {
			expect(resolve(dep(name, 'minor')).groupName, name).toBe(group)
		}
	})
})

describe('the file itself', () => {
	it('merges only behind the checks: everything automerges by default, so the age gate is real', () => {
		expect(config.automerge).toBe(true)
		// Three days is what lets a malicious release be pulled before it is merged by a bot,
		// and `strict` is what makes Renovate wait for it rather than open the PR early.
		expect(config.minimumReleaseAge).toBe('3 days')
		expect(config.internalChecksFilter).toBe('strict')
	})

	it('lets a security fix through the age gate and the schedule', () => {
		expect(config.vulnerabilityAlerts?.minimumReleaseAge).toBeNull()
		expect(config.vulnerabilityAlerts?.schedule).toEqual(['at any time'])
	})

	it('has schedules that are whole days, never a window inside one', () => {
		// A schedule is when Renovate must itself be running to create a branch. 'before 6am on
		// monday' produced nothing for a month. A cron-style schedule whose minute and hour
		// fields are not both `*` is a window.
		for (const schedule of [...(config.schedule ?? []), ...(config.lockFileMaintenance?.schedule ?? [])]) {
			expect(schedule, schedule).toMatch(/^\* \* /)
		}
	})

	it('asks for no post-update option, because the one that used to be here was invalid', () => {
		expect(config.postUpdateOptions).toBeUndefined()
	})
})
