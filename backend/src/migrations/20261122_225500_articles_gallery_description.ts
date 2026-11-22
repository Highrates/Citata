import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Articles gained `gallery` (array) + `description` (HTML) after the initial schema.
 * Without this, GET /api/articles 500s: relation "articles_gallery" does not exist.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "description" varchar;

    CREATE TABLE IF NOT EXISTS "articles_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_id" integer NOT NULL
    );

    DO $$ BEGIN
      ALTER TABLE "articles_gallery"
        ADD CONSTRAINT "articles_gallery_media_id_media_id_fk"
        FOREIGN KEY ("media_id") REFERENCES "public"."media"("id")
        ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "articles_gallery"
        ADD CONSTRAINT "articles_gallery_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id")
        ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "articles_gallery_order_idx"
      ON "articles_gallery" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "articles_gallery_parent_id_idx"
      ON "articles_gallery" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "articles_gallery_media_idx"
      ON "articles_gallery" USING btree ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "articles_gallery" CASCADE;
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "description";
  `)
}
