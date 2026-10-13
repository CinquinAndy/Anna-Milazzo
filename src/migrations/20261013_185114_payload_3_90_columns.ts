import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Payload 3.88.0 -> 3.90.2: three columns Payload itself now reads and writes.
// - media._objectkey, audio._objectkey: the `_objectKey` field of @payloadcms/plugin-cloud-storage (storage-s3)
// - users.reset_password_requested_at: the auth field `resetPasswordRequestedAt`
// Nullable, no default: no table rewrite, no existing row touched, and the previous build,
// which never names these columns, keeps serving the site while this one is being built.
// Every statement can be replayed: this runs at deploy, see src/scripts/migrate.ts and ADR-0011.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "audio" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_requested_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN IF EXISTS "_objectkey";
  ALTER TABLE "audio" DROP COLUMN IF EXISTS "_objectkey";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_requested_at";`)
}
