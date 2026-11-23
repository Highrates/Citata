import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Shared homepage slot order for featured cases + articles.
 * Independent from cases.sort_order (works list / drag).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "home_order" numeric;
    ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "home_order" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cases" DROP COLUMN IF EXISTS "home_order";
    ALTER TABLE "articles" DROP COLUMN IF EXISTS "home_order";
  `)
}
