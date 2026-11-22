import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ru');
  CREATE TYPE "public"."enum_cases_status" AS ENUM('draft', 'published', 'hidden');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
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
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"photo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cases_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL
  );
  
  CREATE TABLE "cases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"year" numeric,
  	"cover_id" integer NOT NULL,
  	"summary" varchar,
  	"description" varchar,
  	"hero_title" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 0,
  	"status" "enum_cases_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cases_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_blocks_paragraph" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles_blocks_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "articles_blocks_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"excerpt" varchar,
  	"cover_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"reading_time" numeric,
  	"featured" boolean DEFAULT false,
  	"status" "enum_articles_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_locales" (
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "press_mentions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"cover_id" integer NOT NULL,
  	"description" varchar,
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"authors_id" integer,
  	"cases_id" integer,
  	"articles_id" integer,
  	"press_mentions_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_main_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "site_settings_extra_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "site_settings_about_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"email" varchar
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar DEFAULT 'Стратегия. Идея. Запуск. Рост.',
  	"agency_title" varchar DEFAULT 'Агентство информационных технологий & коммуникаций',
  	"hero_title" varchar,
  	"hero_subtitle" varchar DEFAULT 'PR-агентство',
  	"about_text" varchar,
  	"telegram_bot_url" varchar DEFAULT 'https://t.me/citata_pr_bot',
  	"telegram_channel_url" varchar,
  	"info_email" varchar DEFAULT 'info@citata-pr.ru',
  	"assets_logo_id" integer,
  	"assets_logo_footer_id" integer,
  	"assets_arrow_id" integer,
  	"assets_comma_id" integer,
  	"assets_pr_hero_id" integer,
  	"assets_tg_icon_id" integer,
  	"about_stats_years" numeric DEFAULT 8,
  	"about_stats_brands" numeric DEFAULT 250,
  	"about_stats_reach_millions" numeric DEFAULT 71,
  	"legal_company_name" varchar,
  	"legal_inn" varchar,
  	"legal_ogrnip" varchar,
  	"legal_disclaimer" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases_gallery" ADD CONSTRAINT "cases_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases_gallery" ADD CONSTRAINT "cases_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cases" ADD CONSTRAINT "cases_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases_locales" ADD CONSTRAINT "cases_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cases_locales" ADD CONSTRAINT "cases_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_paragraph" ADD CONSTRAINT "articles_blocks_paragraph_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_heading" ADD CONSTRAINT "articles_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_quote" ADD CONSTRAINT "articles_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_list_items" ADD CONSTRAINT "articles_blocks_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles_blocks_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_blocks_list" ADD CONSTRAINT "articles_blocks_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cases_fk" FOREIGN KEY ("cases_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_press_mentions_fk" FOREIGN KEY ("press_mentions_id") REFERENCES "public"."press_mentions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_main_services" ADD CONSTRAINT "site_settings_main_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_extra_services" ADD CONSTRAINT "site_settings_extra_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_about_gallery" ADD CONSTRAINT "site_settings_about_gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_about_gallery" ADD CONSTRAINT "site_settings_about_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_contacts" ADD CONSTRAINT "site_settings_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_logo_id_media_id_fk" FOREIGN KEY ("assets_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_logo_footer_id_media_id_fk" FOREIGN KEY ("assets_logo_footer_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_arrow_id_media_id_fk" FOREIGN KEY ("assets_arrow_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_comma_id_media_id_fk" FOREIGN KEY ("assets_comma_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_pr_hero_id_media_id_fk" FOREIGN KEY ("assets_pr_hero_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_assets_tg_icon_id_media_id_fk" FOREIGN KEY ("assets_tg_icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "authors_photo_idx" ON "authors" USING btree ("photo_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "cases_gallery_order_idx" ON "cases_gallery" USING btree ("_order");
  CREATE INDEX "cases_gallery_parent_id_idx" ON "cases_gallery" USING btree ("_parent_id");
  CREATE INDEX "cases_gallery_media_idx" ON "cases_gallery" USING btree ("media_id");
  CREATE UNIQUE INDEX "cases_slug_idx" ON "cases" USING btree ("slug");
  CREATE INDEX "cases_cover_idx" ON "cases" USING btree ("cover_id");
  CREATE INDEX "cases_updated_at_idx" ON "cases" USING btree ("updated_at");
  CREATE INDEX "cases_created_at_idx" ON "cases" USING btree ("created_at");
  CREATE INDEX "cases_meta_meta_image_idx" ON "cases_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "cases_locales_locale_parent_id_unique" ON "cases_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_blocks_paragraph_order_idx" ON "articles_blocks_paragraph" USING btree ("_order");
  CREATE INDEX "articles_blocks_paragraph_parent_id_idx" ON "articles_blocks_paragraph" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_paragraph_path_idx" ON "articles_blocks_paragraph" USING btree ("_path");
  CREATE INDEX "articles_blocks_heading_order_idx" ON "articles_blocks_heading" USING btree ("_order");
  CREATE INDEX "articles_blocks_heading_parent_id_idx" ON "articles_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_heading_path_idx" ON "articles_blocks_heading" USING btree ("_path");
  CREATE INDEX "articles_blocks_quote_order_idx" ON "articles_blocks_quote" USING btree ("_order");
  CREATE INDEX "articles_blocks_quote_parent_id_idx" ON "articles_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_quote_path_idx" ON "articles_blocks_quote" USING btree ("_path");
  CREATE INDEX "articles_blocks_list_items_order_idx" ON "articles_blocks_list_items" USING btree ("_order");
  CREATE INDEX "articles_blocks_list_items_parent_id_idx" ON "articles_blocks_list_items" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_list_order_idx" ON "articles_blocks_list" USING btree ("_order");
  CREATE INDEX "articles_blocks_list_parent_id_idx" ON "articles_blocks_list" USING btree ("_parent_id");
  CREATE INDEX "articles_blocks_list_path_idx" ON "articles_blocks_list" USING btree ("_path");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_cover_idx" ON "articles" USING btree ("cover_id");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles_meta_meta_image_idx" ON "articles_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "press_mentions_updated_at_idx" ON "press_mentions" USING btree ("updated_at");
  CREATE INDEX "press_mentions_created_at_idx" ON "press_mentions" USING btree ("created_at");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_cover_idx" ON "services" USING btree ("cover_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_cases_id_idx" ON "payload_locked_documents_rels" USING btree ("cases_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_press_mentions_id_idx" ON "payload_locked_documents_rels" USING btree ("press_mentions_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_main_services_order_idx" ON "site_settings_main_services" USING btree ("_order");
  CREATE INDEX "site_settings_main_services_parent_id_idx" ON "site_settings_main_services" USING btree ("_parent_id");
  CREATE INDEX "site_settings_extra_services_order_idx" ON "site_settings_extra_services" USING btree ("_order");
  CREATE INDEX "site_settings_extra_services_parent_id_idx" ON "site_settings_extra_services" USING btree ("_parent_id");
  CREATE INDEX "site_settings_about_gallery_order_idx" ON "site_settings_about_gallery" USING btree ("_order");
  CREATE INDEX "site_settings_about_gallery_parent_id_idx" ON "site_settings_about_gallery" USING btree ("_parent_id");
  CREATE INDEX "site_settings_about_gallery_media_idx" ON "site_settings_about_gallery" USING btree ("media_id");
  CREATE INDEX "site_settings_contacts_order_idx" ON "site_settings_contacts" USING btree ("_order");
  CREATE INDEX "site_settings_contacts_parent_id_idx" ON "site_settings_contacts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_assets_assets_logo_idx" ON "site_settings" USING btree ("assets_logo_id");
  CREATE INDEX "site_settings_assets_assets_logo_footer_idx" ON "site_settings" USING btree ("assets_logo_footer_id");
  CREATE INDEX "site_settings_assets_assets_arrow_idx" ON "site_settings" USING btree ("assets_arrow_id");
  CREATE INDEX "site_settings_assets_assets_comma_idx" ON "site_settings" USING btree ("assets_comma_id");
  CREATE INDEX "site_settings_assets_assets_pr_hero_idx" ON "site_settings" USING btree ("assets_pr_hero_id");
  CREATE INDEX "site_settings_assets_assets_tg_icon_idx" ON "site_settings" USING btree ("assets_tg_icon_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "cases_gallery" CASCADE;
  DROP TABLE "cases" CASCADE;
  DROP TABLE "cases_locales" CASCADE;
  DROP TABLE "articles_blocks_paragraph" CASCADE;
  DROP TABLE "articles_blocks_heading" CASCADE;
  DROP TABLE "articles_blocks_quote" CASCADE;
  DROP TABLE "articles_blocks_list_items" CASCADE;
  DROP TABLE "articles_blocks_list" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "press_mentions" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_main_services" CASCADE;
  DROP TABLE "site_settings_extra_services" CASCADE;
  DROP TABLE "site_settings_about_gallery" CASCADE;
  DROP TABLE "site_settings_contacts" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_cases_status";
  DROP TYPE "public"."enum_articles_status";`)
}
