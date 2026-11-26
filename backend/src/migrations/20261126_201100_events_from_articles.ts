import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Split former "news" (articles) into events with optional many-to-many cases.
 * Copies all existing articles → events, then clears articles for the new "Статьи" section.
 *
 * IMPORTANT — take a DB backup before `up` in production. Do not rely on `down`
 * to undo this migration in prod (see `down` notes).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "events" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "excerpt" varchar,
      "cover_id" integer NOT NULL,
      "author_id" integer,
      "published_at" timestamp(3) with time zone NOT NULL,
      "reading_time" numeric,
      "description" varchar,
      "featured" boolean DEFAULT false,
      "home_order" numeric,
      "status" "enum_events_status" DEFAULT 'draft',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "events_cover_idx" ON "events" USING btree ("cover_id");
    CREATE INDEX IF NOT EXISTS "events_author_idx" ON "events" USING btree ("author_id");
    CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");

    DO $$ BEGIN
      ALTER TABLE "events"
        ADD CONSTRAINT "events_cover_id_media_id_fk"
        FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "events"
        ADD CONSTRAINT "events_author_id_authors_id_fk"
        FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE TABLE IF NOT EXISTS "events_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "events_gallery"
        ADD CONSTRAINT "events_gallery_media_id_media_id_fk"
        FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "events_gallery"
        ADD CONSTRAINT "events_gallery_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "events_gallery_order_idx"
      ON "events_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "events_gallery_parent_id_idx"
      ON "events_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "events_gallery_media_idx"
      ON "events_gallery" USING btree ("media_id");

    CREATE TABLE IF NOT EXISTS "events_locales" (
      "meta_title" varchar,
      "meta_description" varchar,
      "meta_image_id" integer,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "events_locales"
        ADD CONSTRAINT "events_locales_meta_image_id_media_id_fk"
        FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "events_locales"
        ADD CONSTRAINT "events_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "events_meta_meta_image_idx"
      ON "events_locales" USING btree ("meta_image_id","_locale");
    CREATE UNIQUE INDEX IF NOT EXISTS "events_locales_locale_parent_id_unique"
      ON "events_locales" USING btree ("_locale","_parent_id");

    -- hasMany relationship events.cases → cases
    CREATE TABLE IF NOT EXISTS "events_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "cases_id" integer
    );

    DO $$ BEGIN
      ALTER TABLE "events_rels"
        ADD CONSTRAINT "events_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    DO $$ BEGIN
      ALTER TABLE "events_rels"
        ADD CONSTRAINT "events_rels_cases_fk"
        FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "events_rels_order_idx" ON "events_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "events_rels_path_idx" ON "events_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "events_rels_cases_id_idx" ON "events_rels" USING btree ("cases_id");

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "events_id" integer;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels"
        ADD CONSTRAINT "payload_locked_documents_rels_events_fk"
        FOREIGN KEY ("events_id") REFERENCES "public"."events"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN null; END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx"
      ON "payload_locked_documents_rels" USING btree ("events_id");

    -- Copy articles → events (only if events empty)
    INSERT INTO "events" (
      "id", "title", "slug", "excerpt", "cover_id", "author_id",
      "published_at", "reading_time", "description", "featured", "home_order",
      "status", "updated_at", "created_at"
    )
    SELECT
      a."id", a."title", a."slug", a."excerpt", a."cover_id", a."author_id",
      a."published_at", a."reading_time", a."description", a."featured", a."home_order",
      a."status"::text::"enum_events_status", a."updated_at", a."created_at"
    FROM "articles" a
    WHERE NOT EXISTS (SELECT 1 FROM "events" e WHERE e."id" = a."id" OR e."slug" = a."slug");

    INSERT INTO "events_gallery" ("_order", "_parent_id", "id", "media_id")
    SELECT g."_order", g."_parent_id", g."id" || '-evt', g."media_id"
    FROM "articles_gallery" g
    WHERE EXISTS (SELECT 1 FROM "events" e WHERE e."id" = g."_parent_id")
      AND NOT EXISTS (SELECT 1 FROM "events_gallery" eg WHERE eg."id" = g."id" || '-evt');

    INSERT INTO "events_locales" (
      "meta_title", "meta_description", "meta_image_id", "_locale", "_parent_id"
    )
    SELECT
      l."meta_title", l."meta_description", l."meta_image_id", l."_locale", l."_parent_id"
    FROM "articles_locales" l
    WHERE EXISTS (SELECT 1 FROM "events" e WHERE e."id" = l."_parent_id")
      AND NOT EXISTS (
        SELECT 1 FROM "events_locales" el
        WHERE el."_parent_id" = l."_parent_id" AND el."_locale" = l."_locale"
      );

    SELECT setval(
      pg_get_serial_sequence('"events"', 'id'),
      GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "events"), 1),
      true
    );

    -- Clear former news from articles (now empty «Статьи»)
    DELETE FROM "articles_gallery";
    DELETE FROM "articles_locales";
    DELETE FROM "articles_blocks_list_items";
    DELETE FROM "articles_blocks_list";
    DELETE FROM "articles_blocks_paragraph";
    DELETE FROM "articles_blocks_heading";
    DELETE FROM "articles_blocks_quote";
    DELETE FROM "articles";
  `)
}

/**
 * Best-effort only — NOT a full reverse.
 * Does NOT restore gallery / locales / blocks / events↔cases rels.
 * DROP events loses case links permanently. Prefer restore from backup.
 * Do not rely on this in production.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Best-effort: copy event rows back to articles if slug/id free (no gallery/locales/blocks/rels)
    INSERT INTO "articles" (
      "id", "title", "slug", "excerpt", "cover_id", "author_id",
      "published_at", "reading_time", "description", "featured", "home_order",
      "status", "updated_at", "created_at"
    )
    SELECT
      e."id", e."title", e."slug", e."excerpt", e."cover_id", e."author_id",
      e."published_at", e."reading_time", e."description", e."featured", e."home_order",
      e."status"::text::"enum_articles_status", e."updated_at", e."created_at"
    FROM "events" e
    WHERE NOT EXISTS (SELECT 1 FROM "articles" a WHERE a."id" = e."id" OR a."slug" = e."slug");

    DROP TABLE IF EXISTS "events_rels" CASCADE;
    DROP TABLE IF EXISTS "events_gallery" CASCADE;
    DROP TABLE IF EXISTS "events_locales" CASCADE;
    DROP TABLE IF EXISTS "events" CASCADE;
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "events_id";
    DROP TYPE IF EXISTS "public"."enum_events_status";
  `)
}
