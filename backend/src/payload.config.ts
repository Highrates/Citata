import { postgresAdapter } from '@payloadcms/db-postgres'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Authors } from './collections/Authors'
import { Cases } from './collections/Cases'
import { Media } from './collections/Media'
import { PressMentions } from './collections/PressMentions'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001',
  routes: {
    admin: '/payload',
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— ЦИТАТА',
    },
  },
  collections: [Users, Media, Authors, Cases, Articles, PressMentions, Services],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Avoid interactive Drizzle prompts that hang the whole Next.js process in CI/agent terminals.
    // Schema changes: run `npm run migrate` / `payload migrate` explicitly.
    push: false,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  localization: {
    locales: ['ru'],
    defaultLocale: 'ru',
    fallback: true,
  },
  cors: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean),
  csrf: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean),
  plugins: [
    seoPlugin({
      collections: ['cases', 'articles'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => {
        if ('title' in doc && typeof doc.title === 'string') {
          return `${doc.title} — ЦИТАТА`
        }
        return 'ЦИТАТА — PR-агентство'
      },
      generateURL: ({ doc, collectionSlug }) => {
        const base = process.env.FRONTEND_URL || 'https://citata-pr.ru'
        if (collectionSlug === 'cases' && 'slug' in doc) {
          return `${base}/works/${doc.slug}`
        }
        if (collectionSlug === 'articles' && 'slug' in doc) {
          return `${base}/articles/${doc.slug}`
        }
        return base
      },
    }),
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              region: process.env.S3_REGION || 'ru-1',
              endpoint: process.env.S3_ENDPOINT,
              forcePathStyle: process.env.S3_FORCE_PATH_STYLE === '1',
            },
          }),
        ]
      : []),
  ],
})
