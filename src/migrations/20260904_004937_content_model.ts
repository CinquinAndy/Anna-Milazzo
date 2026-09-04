import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('it', 'en');
  CREATE TABLE "songs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cover_id" integer NOT NULL,
  	"track_id" integer NOT NULL,
  	"duration_seconds" numeric NOT NULL,
  	"platform_url" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"reference" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "songs_locales" (
  	"title" varchar NOT NULL,
  	"story" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "audio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "home_skills_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_skills_entries_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home_timeline_entries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"period" varchar NOT NULL
  );
  
  CREATE TABLE "home_timeline_entries_locales" (
  	"label" varchar NOT NULL,
  	"detail" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_portrait_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_locales" (
  	"hero_name" varchar NOT NULL,
  	"hero_tagline" varchar NOT NULL,
  	"about_heading" varchar,
  	"about_body" varchar,
  	"skills_heading" varchar,
  	"songs_heading" varchar,
  	"songs_intro" varchar,
  	"songs_listen_label" varchar,
  	"songs_platform_label" varchar,
  	"timeline_heading" varchar,
  	"contact_cta_heading" varchar,
  	"contact_cta_body" varchar,
  	"contact_cta_button_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"form_name_label" varchar,
  	"form_email_label" varchar,
  	"form_message_label" varchar,
  	"form_submit_label" varchar,
  	"form_sending_label" varchar,
  	"outcome_success" varchar,
  	"outcome_failure" varchar,
  	"outcome_invalid" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "legals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "legals_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings_social_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_locales" (
  	"legals_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "songs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audio_id" integer;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs" ADD CONSTRAINT "songs_track_id_audio_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."audio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "songs_locales" ADD CONSTRAINT "songs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_skills_entries" ADD CONSTRAINT "home_skills_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_skills_entries_locales" ADD CONSTRAINT "home_skills_entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_skills_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_timeline_entries" ADD CONSTRAINT "home_timeline_entries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_timeline_entries_locales" ADD CONSTRAINT "home_timeline_entries_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_timeline_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_portrait_id_media_id_fk" FOREIGN KEY ("hero_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_locales" ADD CONSTRAINT "home_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_locales" ADD CONSTRAINT "contact_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "legals_locales" ADD CONSTRAINT "legals_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."legals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_social_links" ADD CONSTRAINT "settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_social_links_locales" ADD CONSTRAINT "settings_social_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings_social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "songs_cover_idx" ON "songs" USING btree ("cover_id");
  CREATE INDEX "songs_track_idx" ON "songs" USING btree ("track_id");
  CREATE UNIQUE INDEX "songs_reference_idx" ON "songs" USING btree ("reference");
  CREATE INDEX "songs_updated_at_idx" ON "songs" USING btree ("updated_at");
  CREATE INDEX "songs_created_at_idx" ON "songs" USING btree ("created_at");
  CREATE UNIQUE INDEX "songs_locales_locale_parent_id_unique" ON "songs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "audio_updated_at_idx" ON "audio" USING btree ("updated_at");
  CREATE INDEX "audio_created_at_idx" ON "audio" USING btree ("created_at");
  CREATE UNIQUE INDEX "audio_filename_idx" ON "audio" USING btree ("filename");
  CREATE INDEX "home_skills_entries_order_idx" ON "home_skills_entries" USING btree ("_order");
  CREATE INDEX "home_skills_entries_parent_id_idx" ON "home_skills_entries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_skills_entries_locales_locale_parent_id_unique" ON "home_skills_entries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_timeline_entries_order_idx" ON "home_timeline_entries" USING btree ("_order");
  CREATE INDEX "home_timeline_entries_parent_id_idx" ON "home_timeline_entries" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_timeline_entries_locales_locale_parent_id_unique" ON "home_timeline_entries_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_hero_hero_portrait_idx" ON "home" USING btree ("hero_portrait_id");
  CREATE UNIQUE INDEX "home_locales_locale_parent_id_unique" ON "home_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_locales_locale_parent_id_unique" ON "contact_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "legals_locales_locale_parent_id_unique" ON "legals_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "settings_social_links_order_idx" ON "settings_social_links" USING btree ("_order");
  CREATE INDEX "settings_social_links_parent_id_idx" ON "settings_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_social_links_locales_locale_parent_id_unique" ON "settings_social_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "settings_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_songs_fk" FOREIGN KEY ("songs_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audio_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."audio"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_songs_id_idx" ON "payload_locked_documents_rels" USING btree ("songs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_audio_id_idx" ON "payload_locked_documents_rels" USING btree ("audio_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "songs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "songs_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audio" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_skills_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_skills_entries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_timeline_entries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_timeline_entries_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "legals_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_social_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "songs" CASCADE;
  DROP TABLE "songs_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "audio" CASCADE;
  DROP TABLE "home_skills_entries" CASCADE;
  DROP TABLE "home_skills_entries_locales" CASCADE;
  DROP TABLE "home_timeline_entries" CASCADE;
  DROP TABLE "home_timeline_entries_locales" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_locales" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "contact_locales" CASCADE;
  DROP TABLE "legals" CASCADE;
  DROP TABLE "legals_locales" CASCADE;
  DROP TABLE "settings_social_links" CASCADE;
  DROP TABLE "settings_social_links_locales" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "settings_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_songs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audio_fk";
  
  DROP INDEX "payload_locked_documents_rels_songs_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  DROP INDEX "payload_locked_documents_rels_audio_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "songs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audio_id";
  DROP TYPE "public"."_locales";`)
}
