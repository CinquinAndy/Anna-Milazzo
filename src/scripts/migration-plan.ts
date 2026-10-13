/**
 * Decides what the deployment does with each migration. Pure, so the rule can be tested
 * without a database: `src/scripts/migrate.ts` gathers the facts and carries out the answer.
 *
 * The rule exists because the migrations written before 2026-10-13 cannot be replayed. They
 * create types and tables without guards, and their `down` halves drop tables and columns.
 * Nobody can inspect what `payload_migrations` holds on the live database, so "it is not
 * recorded" must never be read as "it has to run". See ADR-0011.
 */

/**
 * Every migration that existed when migrations started running at deploy. Names, written
 * out, and never derived from a timestamp or from the folder: a migration is in this list
 * because someone put it there.
 *
 * These are NEVER executed on a database that already holds tables. Do not add to this
 * list: a migration written after it is additive and replayable, and runs.
 */
export const BASELINE = [
	'20260903_232844_initial',
	'20260904_004937_content_model',
	'20260904_005732_r2_storage',
	'20260904_011542_audio_labels',
	'20260904_012130_timeline_label',
	'20260904_215954_peaks',
	'20260904_225010_spectrum',
	'20260904_232618_drop_spectrum',
	'20260904_232630_tone',
	'20260905_091533_cta_badge',
	'20260905_202229_drop_cta_badge',
	'20260905_213339_contact_page',
	'20260905_220003_footer_headings',
	'20260905_221112_drop_check_label',
	'20260905_235515_add_songs_pager_labels',
	'20260905_235525_drop_songs_intro',
] as const

/**
 * The tables those migrations leave behind, `payload_migrations` aside: what the live
 * database holds. Written out for the same reason. All thirty have to be there for a
 * database to be taken for the live one, so that half a schema is never mistaken for it.
 */
export const BASELINE_TABLES = [
	'audio',
	'contact',
	'contact_brief_points',
	'contact_brief_points_locales',
	'contact_locales',
	'contact_practical_entries',
	'contact_practical_entries_locales',
	'home',
	'home_locales',
	'home_skills_entries',
	'home_skills_entries_locales',
	'home_timeline_entries',
	'home_timeline_entries_locales',
	'legals',
	'legals_locales',
	'media',
	'media_locales',
	'payload_kv',
	'payload_locked_documents',
	'payload_locked_documents_rels',
	'payload_preferences',
	'payload_preferences_rels',
	'settings',
	'settings_locales',
	'settings_social_links',
	'settings_social_links_locales',
	'songs',
	'songs_locales',
	'users',
	'users_sessions',
] as const

const isBaseline = (name: string) => (BASELINE as readonly string[]).includes(name)

export type DatabaseFacts = {
	/** Every migration in the repository, in order (`src/migrations/index.ts`). */
	migrations: readonly string[]
	/** Whether `payload_migrations` exists at all. */
	migrationsTable: boolean
	/** Every `name` in it, the `dev` row a development push leaves included. */
	recorded: readonly string[]
	/** The `BASELINE_TABLES` that exist, where an unqualified table name resolves. */
	presentTables: readonly string[]
	/** Every other table, view or foreign table in any schema of the database, `payload_migrations` aside. */
	otherRelations: readonly string[]
}

export type Step = {
	name: string
	/**
	 * `execute` runs the migration and records it. `record` records it WITHOUT running it.
	 * `skip` means it is already recorded.
	 */
	action: 'execute' | 'record' | 'skip'
}

const few = (names: readonly string[]) => `${names.slice(0, 8).join(', ')}${names.length > 8 ? ', …' : ''}`

/**
 * Three outcomes and no fourth:
 *
 * - The database holds nothing at all, not even `payload_migrations`. Every migration runs,
 *   in order. This is a new environment or a CI container, and there is nothing in it to
 *   lose.
 * - The database holds every table in `BASELINE_TABLES`. No baseline migration runs, whatever
 *   `payload_migrations` says or fails to say: the ones missing from it are recorded as
 *   applied. Only the migrations written after the baseline can run.
 * - Anything else, the plan refuses, and the build stops before `next build`. Some tables
 *   but not all, tables that are not this site's, a `payload_migrations` with no table
 *   beside it, a table of the site that a second schema holds too: each is a state a
 *   person has to look at.
 *
 * A baseline migration is therefore executed only when the database contains no table.
 */
export function planMigrations(facts: DatabaseFacts): Step[] {
	const { migrations, migrationsTable, recorded, presentTables, otherRelations } = facts

	if (migrations.length < BASELINE.length || BASELINE.some((name, index) => migrations[index] !== name)) {
		throw new Error(
			'src/migrations/index.ts no longer starts with the baseline migrations, in their order. ' +
				'Refusing to migrate: the baseline list in src/scripts/migration-plan.ts is what keeps the old migrations from running on the live database.'
		)
	}

	const missingTables = BASELINE_TABLES.filter(table => !presentTables.includes(table))
	const holdsNothing = !migrationsTable && presentTables.length === 0 && otherRelations.length === 0
	const holdsTheSchema = missingTables.length === 0

	if (holdsNothing) {
		return migrations.map(name => ({ name, action: 'execute' }))
	}

	if (!holdsTheSchema) {
		throw new Error(
			'The database is neither empty nor complete, so the migrations written before 2026-10-13 can be neither run nor assumed applied. ' +
				`Tables of the site that are missing: ${few(missingTables)}. ` +
				(otherRelations.length > 0 ? `Relations that are not this site's: ${few(otherRelations)}. ` : '') +
				(migrationsTable ? `payload_migrations exists and lists ${recorded.length} row(s). ` : '') +
				'A new environment has to start from a database with nothing in it. ' +
				'Nothing was changed. See ADR-0011.'
		)
	}

	// The migrations name their tables without a schema. If another schema holds a table of
	// the same name, which of the two an `ALTER TABLE` reaches is the search path's choice.
	const twice = otherRelations.filter(relation =>
		(BASELINE_TABLES as readonly string[]).includes(relation.slice(relation.lastIndexOf('.') + 1))
	)
	if (twice.length > 0) {
		throw new Error(
			`Tables of the site exist in more than one schema: ${few(twice)} beside the ones the connection reaches. ` +
				'Refusing to choose which to migrate. Nothing was changed. See ADR-0011.'
		)
	}

	return migrations.map(name => {
		if (recorded.includes(name)) {
			return { name, action: 'skip' }
		}
		return { name, action: isBaseline(name) ? 'record' : 'execute' }
	})
}
