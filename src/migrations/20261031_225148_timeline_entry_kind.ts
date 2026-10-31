import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Timeline entries get a kind (degree, certificate, project, experience), which sets the
// colour of the clip on the landing page.
//
// Written by hand from what `payload migrate:create` generated, because a migration that
// runs at deploy may only add and must be safe to run twice (ADR-0011):
// - the generated `CREATE TYPE ... AS ENUM` and `DEFAULT 'experience'` are gone. Postgres
//   has no `CREATE TYPE IF NOT EXISTS`, and a default would rewrite how every row reads.
//   The column is a plain nullable varchar instead. Payload's own select field reads and
//   writes it as text either way, and the site reads null as an experience, so a row that
//   nobody has filed yet looks exactly like it did before this column existed.
// - the previous build never names the column, so it keeps serving while this one builds.
// The accompanying .json is the snapshot Payload generated, kept as it is: it is what the
// next `migrate:create` diffs against, and it describes the config, not this SQL.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_timeline_entries" ADD COLUMN IF NOT EXISTS "kind" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_timeline_entries" DROP COLUMN IF EXISTS "kind";`)
}
