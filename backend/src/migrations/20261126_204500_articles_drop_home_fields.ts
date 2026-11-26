import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Articles are not shown on the homepage after news → events split.
 * Drop dead featured / home_order columns from articles only.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "home_order";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "featured";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "home_order" numeric;
  `)
}
