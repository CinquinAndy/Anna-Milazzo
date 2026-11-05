import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// A Song may carry no audio when its video already carries the sound (ADR-0006), so its
// audio and its running time may be null. Relaxing a NOT NULL is the one ALTER COLUMN a
// deploy may run (ADR-0011, amended): it rewrites no row and only accepts more than before,
// Postgres runs it twice without complaint, and the previous build, which only ever reads
// values that are all still there, keeps serving while this one is built. The generated
// statements, unchanged. `down` puts the constraints back and fails while a Song has no
// audio, which is what it should do.

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" ALTER COLUMN "track_id" DROP NOT NULL;
  ALTER TABLE "songs" ALTER COLUMN "duration_seconds" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" ALTER COLUMN "track_id" SET NOT NULL;
  ALTER TABLE "songs" ALTER COLUMN "duration_seconds" SET NOT NULL;`)
}
