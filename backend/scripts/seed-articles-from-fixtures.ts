/**
 * No-op after news → events split.
 * Former news fixtures seed via `npm run seed:events`.
 * Articles («Статьи») stay empty unless created in admin.
 *
 * Kept so `npm run seed:articles` does not re-populate /articles URLs
 * and break /articles/:slug → /events/:slug redirects.
 */
console.log('⊘ seed:articles skipped — articles fixtures cleared; use seed:events for former news')
process.exit(0)
