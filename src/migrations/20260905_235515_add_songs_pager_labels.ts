import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_locales" ADD COLUMN "songs_previous_label" varchar;
  ALTER TABLE "home_locales" ADD COLUMN "songs_next_label" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_locales" DROP COLUMN "songs_previous_label";
  ALTER TABLE "home_locales" DROP COLUMN "songs_next_label";`)
}
