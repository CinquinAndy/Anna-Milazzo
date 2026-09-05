import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_brief_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "contact_brief_points_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_practical_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "contact_practical_entries_locales" (
  	"term" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "contact_locales" ADD COLUMN "form_heading" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_required_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_check_label" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_check_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_missing_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_email_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "form_privacy_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "brief_heading" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "brief_intro" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "practical_heading" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "direct_heading" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "direct_note" varchar;
  ALTER TABLE "contact_locales" ADD COLUMN "direct_elsewhere_heading" varchar;
  ALTER TABLE "contact_brief_points" ADD CONSTRAINT "contact_brief_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_brief_points_locales" ADD CONSTRAINT "contact_brief_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_brief_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_practical_entries" ADD CONSTRAINT "contact_practical_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_practical_entries_locales" ADD CONSTRAINT "contact_practical_entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_practical_entries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_brief_points_order_idx" ON "contact_brief_points" USING btree ("_order");
  CREATE INDEX "contact_brief_points_parent_id_idx" ON "contact_brief_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_brief_points_locales_locale_parent_id_unique" ON "contact_brief_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_practical_entries_order_idx" ON "contact_practical_entries" USING btree ("_order");
  CREATE INDEX "contact_practical_entries_parent_id_idx" ON "contact_practical_entries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_practical_entries_locales_locale_parent_id_unique" ON "contact_practical_entries_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_brief_points" CASCADE;
  DROP TABLE "contact_brief_points_locales" CASCADE;
  DROP TABLE "contact_practical_entries" CASCADE;
  DROP TABLE "contact_practical_entries_locales" CASCADE;
  ALTER TABLE "contact_locales" DROP COLUMN "form_heading";
  ALTER TABLE "contact_locales" DROP COLUMN "form_required_note";
  ALTER TABLE "contact_locales" DROP COLUMN "form_check_label";
  ALTER TABLE "contact_locales" DROP COLUMN "form_check_note";
  ALTER TABLE "contact_locales" DROP COLUMN "form_missing_note";
  ALTER TABLE "contact_locales" DROP COLUMN "form_email_note";
  ALTER TABLE "contact_locales" DROP COLUMN "form_privacy_note";
  ALTER TABLE "contact_locales" DROP COLUMN "brief_heading";
  ALTER TABLE "contact_locales" DROP COLUMN "brief_intro";
  ALTER TABLE "contact_locales" DROP COLUMN "practical_heading";
  ALTER TABLE "contact_locales" DROP COLUMN "direct_heading";
  ALTER TABLE "contact_locales" DROP COLUMN "direct_note";
  ALTER TABLE "contact_locales" DROP COLUMN "direct_elsewhere_heading";`)
}
