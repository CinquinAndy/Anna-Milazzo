import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Songs get an optional video link (YouTube or Vimeo), shown as a player that loads on click.
// One nullable varchar, no default, nothing rewritten: what a deploy may run (ADR-0011). The
// previous build never names the column, so it keeps serving while this one is built, and a
// song with no value in it renders exactly as before. The generated statement is unchanged
// apart from `IF NOT EXISTS`, which lets it be run twice.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" ADD COLUMN IF NOT EXISTS "video_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" DROP COLUMN IF EXISTS "video_url";`)
}
