/**
 * Applies the migrations in `src/migrations`. Runs before `next build` (the `build` script)
 * and is also what `bun run migrate` is, so there is one way to migrate and it is this one.
 *
 * Launched with tsx, not with `payload migrate`, because the Payload CLI:
 * - asks a question on stdin, and so hangs a build, when `payload_migrations` holds the
 *   `dev` row (batch -1) that a development push leaves behind;
 * - treats every migration missing from `payload_migrations` as one to run. On the live
 *   database that would replay migrations which were never written to be replayed;
 * - has been seen to exit 0 on Node 22 without having run anything.
 *
 * What it does instead, in ONE transaction, behind an advisory lock:
 * - looks at what the database actually holds and asks `planMigrations` what to do. The
 *   migrations in `BASELINE` are executed only on a database with nothing in it. On the
 *   live one they are recorded as applied and never run. See ADR-0011;
 * - runs the others, which have to be additive and replayable, one batch number each;
 * - checks that every column the Payload config reads is there, and only then commits.
 *
 * Exit code 0 is reached on the last line and nowhere else. Anything thrown rolls the whole
 * transaction back and exits 1: the build stops, and the container already serving the site
 * keeps serving it.
 *
 * Things worth knowing:
 * - `bun run build` therefore WRITES to the database in `DATABASE_URL`, `.env` included.
 *   On this project that is the live one. That is safe only because of the rule above.
 * - It never asks anything, and it never pushes a schema: `push` is off in the config and
 *   `PAYLOAD_MIGRATING` is set here.
 * - `payload migrate:down`, `migrate:refresh`, `migrate:reset` and `migrate:fresh` are not
 *   guarded by any of this. Their `down` halves drop tables and columns. Do not run them
 *   against the live database.
 * - It refuses to connect when `PAYLOAD_DROP_DATABASE` is set, because Payload then drops
 *   every table as it connects, in production too, and when `DATABASE_URL` is empty,
 *   because the driver would then pick a database from the ambient `PG*` variables. As
 *   the build is `migrate && next build`, `next build` does not connect either.
 */
// Static imports only: a top-level `await import()` makes Node 22 exit 13 now and then.
import './load-env'
import config from '@payload-config'
import { type PostgresAdapter, sql } from '@payloadcms/db-postgres'
import { getTableConfig } from '@payloadcms/db-postgres/drizzle/pg-core'
import { commitTransaction, createLocalReq, getPayload, initTransaction, killTransaction } from 'payload'
import { migrations } from '../migrations'
import { BASELINE_TABLES, planMigrations } from './migration-plan'

const MIGRATIONS_TABLE = 'payload_migrations'

// Never a schema push from here, whatever NODE_ENV says.
process.env.PAYLOAD_MIGRATING = 'true'

// Both are checked before anything connects: connecting is what drops. No logger yet.
const refusal =
	process.env.PAYLOAD_DROP_DATABASE !== undefined && process.env.PAYLOAD_DROP_DATABASE !== ''
		? 'PAYLOAD_DROP_DATABASE is set. Refusing to connect: Payload would drop every table.'
		: process.env.DATABASE_URL === undefined || process.env.DATABASE_URL.trim() === ''
			? 'DATABASE_URL is empty. Refusing to migrate a database chosen by default.'
			: undefined
if (refusal !== undefined) {
	process.stderr.write(`${refusal} Nothing was changed. Stopping before the build.\n`)
	process.exit(1)
}

const payload = await getPayload({ config, disableOnInit: true })
const adapter = payload.db as unknown as PostgresAdapter

/** Every `table.column` the Payload config of THIS build reads. */
const expected = Object.values(adapter.tables).flatMap(table => {
	const { name, columns } = getTableConfig(table)
	return columns.map(column => `${name}.${column.name}`)
})

const req = await createLocalReq({}, payload)
await initTransaction(req)

try {
	const session = adapter.sessions[String(await req.transactionID)]
	if (session === undefined) {
		throw new Error('The migration transaction did not open.')
	}
	const { db } = session

	// Never wait long on a lock with the live site queued behind it: failing and deploying
	// again is the better outcome. The advisory lock makes two deployments take turns, and
	// everything below reads the database only once it is held.
	await db.execute(sql`
    SET LOCAL lock_timeout = '3s';
    SELECT pg_advisory_xact_lock(hashtext('payload_migrations'));
  `)

	// Every schema, not `public` alone: a table anywhere means this is not an empty database.
	// `visible` is whether an unqualified name, which is what the migrations use, reaches it.
	const relations = await db.execute<{ schema: string; name: string; visible: boolean }>(sql`
    SELECT n.nspname AS "schema", c.relname AS "name", pg_table_is_visible(c.oid) AS "visible"
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f') AND n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
  `)
	const presentTables: string[] = []
	const otherRelations: string[] = []
	let migrationsTable = false
	for (const relation of relations.rows) {
		if (relation.visible && relation.name === MIGRATIONS_TABLE) {
			migrationsTable = true
		} else if (relation.visible && (BASELINE_TABLES as readonly string[]).includes(relation.name)) {
			presentTables.push(relation.name)
		} else {
			otherRelations.push(`${relation.schema}.${relation.name}`)
		}
	}

	const docs = migrationsTable
		? (await payload.find({ collection: 'payload-migrations', limit: 0, pagination: false, req })).docs
		: []

	const plan = planMigrations({
		migrations: migrations.map(migration => migration.name),
		migrationsTable,
		recorded: docs.map(doc => String(doc.name)),
		presentTables,
		otherRelations,
	})

	// A database that was only ever pushed to has the schema and no `payload_migrations`.
	// The definition is the one Payload generates (see the .json snapshots). On an empty
	// database the first migration creates the table itself, without `IF NOT EXISTS`, so it
	// must not be created here.
	if (!migrationsTable && presentTables.length > 0) {
		await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "payload_migrations" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar,
        "batch" numeric,
        "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
        "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
      CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
    `)
	}

	// One batch per migration (last + 1; the `dev` row is batch -1 and does not count), so a
	// `migrate:down` can only ever undo the latest one and never the whole history at once.
	let batch = Math.max(0, ...docs.map(doc => Number(doc.batch)))
	let executed = 0

	for (const migration of migrations) {
		const step = plan.find(candidate => candidate.name === migration.name)
		if (step === undefined) {
			throw new Error(`No decision was made for ${migration.name}.`)
		}
		if (step.action === 'skip') {
			continue
		}
		if (step.action === 'execute') {
			payload.logger.info(`Migrating: ${migration.name}`)
			await migration.up({ db, payload, req })
			executed++
		} else {
			payload.logger.info(
				`Baseline: ${migration.name} is not in payload_migrations, and the database already holds the schema. Recorded as applied, NOT executed.`
			)
		}
		batch++
		await payload.create({ collection: 'payload-migrations', data: { name: migration.name, batch }, req })
	}

	// The build that follows reads these columns while it collects page data. Better to stop
	// here, with the names, than there, with Postgres error 42703. Nothing is committed yet.
	const columns = await db.execute<{ table: string; column: string }>(sql`
    SELECT c.relname AS "table", a.attname AS "column"
    FROM pg_attribute a JOIN pg_class c ON c.oid = a.attrelid
    WHERE c.relkind IN ('r', 'p') AND pg_table_is_visible(c.oid) AND a.attnum > 0 AND NOT a.attisdropped
  `)
	const found = new Set(columns.rows.map(row => `${row.table}.${row.column}`))
	const missing = expected.filter(column => !found.has(column))
	if (missing.length > 0) {
		throw new Error(
			`The database is missing ${missing.length} column(s) this build reads: ${missing.join(', ')}. ` +
				'No migration in the repository adds them. Nothing was changed.'
		)
	}

	await commitTransaction(req)
	payload.logger.info(executed ? `Migrations applied: ${executed}` : 'No migration to apply.')
} catch (error) {
	await killTransaction(req)
	payload.logger.error(error instanceof Error ? error.message : String(error))
	payload.logger.error('Migration failed and was rolled back. Stopping before the build.')
	process.exit(1)
}

await payload.destroy()
// Explicit, and the very last statement: without it the process stays alive and the build
// never finishes.
process.exit(0)
