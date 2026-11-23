import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Author was made optional in Articles collection config, but the initial
 * migration created author_id NOT NULL. Saving without author then 500s
 * with a Postgres not-null violation wrapped as Payload "Something went wrong."
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles" ALTER COLUMN "author_id" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "articles" ALTER COLUMN "author_id" SET NOT NULL;
  `)
}
