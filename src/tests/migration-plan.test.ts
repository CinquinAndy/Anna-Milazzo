import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { BASELINE, BASELINE_TABLES, type DatabaseFacts, planMigrations } from '@/scripts/migration-plan'

/**
 * Migrations run at deploy now, against the database Anna writes in, and the ones written
 * before that decision drop tables and columns if they are replayed or undone. What
 * `payload_migrations` holds on the live database is not something anyone can look at, so
 * the rule under test is the only thing between a missing row and lost content: a baseline
 * migration is executed on a database with no table in it, and on no other. ADR-0011.
 */
const MIGRATIONS = path.resolve(import.meta.dirname, '../migrations')
const NEWER = '20261013_185114_payload_3_90_columns'

const names = [...readFileSync(path.join(MIGRATIONS, 'index.ts'), 'utf8').matchAll(/name: '([^']+)'/g)].map(
	match => match[1] ?? ''
)

const live = (recorded: readonly string[]): DatabaseFacts => ({
	migrations: names,
	migrationsTable: true,
	recorded,
	presentTables: BASELINE_TABLES,
	otherRelations: [],
})

const executed = (facts: DatabaseFacts) =>
	planMigrations(facts)
		.filter(step => step.action === 'execute')
		.map(step => step.name)

describe('what a deployment does with each migration', () => {
	it('lists the baseline by name, and the repository still starts with it', () => {
		expect(BASELINE).toHaveLength(16)
		expect(names.slice(0, BASELINE.length)).toEqual([...BASELINE])
		expect(names).toContain(NEWER)
	})

	it('lists the tables the baseline creates, all of them', () => {
		const created = BASELINE.flatMap(name => {
			const source = readFileSync(path.join(MIGRATIONS, `${name}.ts`), 'utf8')
			const up = source.slice(0, source.indexOf('export async function down'))
			expect(up, `${name} drops a table on the way up`).not.toMatch(/DROP TABLE/)
			return [...up.matchAll(/CREATE TABLE "([^"]+)"/g)].map(match => match[1] ?? '')
		})

		expect(created.filter(table => table !== 'payload_migrations').sort()).toEqual([...BASELINE_TABLES].sort())
	})

	it.each([
		['every baseline migration is recorded', [...BASELINE]],
		['payload_migrations is empty', []],
		['it holds only the row a development push leaves', ['dev']],
		['it holds the first half of the baseline', BASELINE.slice(0, 8)],
		['it holds the baseline and a development row', [...BASELINE, 'dev']],
		['it holds names this repository has never had', ['20990101_000000_from_a_later_build']],
	])('never executes a baseline migration on the live database when %s', (_, recorded) => {
		const plan = planMigrations(live(recorded))

		expect(executed(live(recorded))).toEqual([NEWER])
		for (const name of BASELINE) {
			const step = plan.find(candidate => candidate.name === name)
			expect(step?.action).toBe(recorded.includes(name) ? 'skip' : 'record')
		}
	})

	it('never executes one either when payload_migrations does not exist beside the tables', () => {
		const facts = { ...live([]), migrationsTable: false }

		expect(executed(facts)).toEqual([NEWER])
		expect(planMigrations(facts).filter(step => step.action === 'record')).toHaveLength(BASELINE.length)
	})

	it('still knows the live database once a later migration has added a table', () => {
		expect(executed({ ...live([...BASELINE]), otherRelations: ['public.a_table_added_later'] })).toEqual([NEWER])
	})

	it('does nothing the second time', () => {
		expect(planMigrations(live(names)).every(step => step.action === 'skip')).toBe(true)
	})

	it('runs everything, in order, on a database that holds nothing', () => {
		expect(executed({ ...live([]), migrationsTable: false, presentTables: [] })).toEqual(names)
	})

	it.each([
		['one of its tables is missing', { presentTables: BASELINE_TABLES.slice(1) }],
		['some of its tables are missing', { presentTables: BASELINE_TABLES.slice(0, 2) }],
		['only one of its tables is there', { presentTables: ['users'] }],
		[
			'none of its tables are there but another schema holds some',
			{ presentTables: [], otherRelations: ['old.songs'] },
		],
		['none of its tables are there but something else is', { presentTables: [], otherRelations: ['public.orders'] }],
		['there is no table but an empty payload_migrations', { presentTables: [] }],
		['there is no table but payload_migrations has rows', { presentTables: [], recorded: [...BASELINE] }],
		['there is no table but a development row', { presentTables: [], recorded: ['dev'] }],
		['the baseline is no longer the start of the list', { migrations: names.slice(1) }],
		['a baseline migration changed places', { migrations: [names[1] ?? '', names[0] ?? '', ...names.slice(2)] }],
		['another schema holds a table of the same name', { otherRelations: ['backup.users'] }],
	])('refuses, rather than guess, when %s', (_, facts) => {
		expect(() => planMigrations({ ...live([]), ...facts })).toThrow()
	})

	/**
	 * The other half of the promise. A migration written after the baseline DOES run on the
	 * live database, unattended, while the previous build is still serving from it. So it
	 * may only add, and it must be safe to run twice. A migration that has to remove or
	 * rewrite something is a decision to take on purpose, with a backup, not a file to add.
	 */
	it('only lets additive, replayable SQL run at deploy', () => {
		for (const name of names.slice(BASELINE.length)) {
			const source = readFileSync(path.join(MIGRATIONS, `${name}.ts`), 'utf8')
			const up = source.slice(source.indexOf('export async function up'), source.indexOf('export async function down'))
			// Every `db.execute(sql`...`)` of `up`, not the first one alone, and nothing else:
			// no other call on `db`, `payload` or `req`, and no `${}` this test cannot read.
			const blocks = [...up.matchAll(/await db\.execute\(sql`([^`]*)`\)/g)].map(match => match[1] ?? '')
			const rest = up.replace(/await db\.execute\(sql`[^`]*`\)/g, '')
			expect(rest, `${name} reaches the database outside db.execute(sql\`...\`)`).not.toMatch(
				/\b(db|payload|req)\s*[.[]|sql\b|`/
			)
			expect(blocks.join(''), `${name} builds its SQL at run time`).not.toContain('${')
			const statements = blocks
				.flatMap(block => block.split(';'))
				.map(statement => statement.trim())
				.filter(statement => statement !== '')

			expect(statements.length, `${name} runs no SQL this test can read`).toBeGreaterThan(0)
			for (const statement of statements) {
				expect(statement, `${name} does more than add`).not.toMatch(
					/\b(DROP|DELETE|TRUNCATE|UPDATE|INSERT|RENAME|ALTER COLUMN|SET DATA TYPE|NOT NULL|CREATE TYPE)\b/i
				)
				expect(statement, `${name} cannot be run twice`).toMatch(/\bIF NOT EXISTS\b/i)
			}
		}
	})
})
