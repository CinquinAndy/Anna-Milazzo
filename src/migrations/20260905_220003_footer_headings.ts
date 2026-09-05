import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings_locales" ADD COLUMN "nav_heading" varchar;
  ALTER TABLE "settings_locales" ADD COLUMN "elsewhere_heading" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings_locales" DROP COLUMN "nav_heading";
  ALTER TABLE "settings_locales" DROP COLUMN "elsewhere_heading";`)
}
