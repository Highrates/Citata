'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect, unstable_rethrow } from 'next/navigation'

import type {
  ArticleStatus,
  GalleryItem,
  CaseStatus,
  PressMention,
} from '@/content/types'
import { adminPath } from '@/lib/admin/constants'
import {
  ensureAuthor,
  ensureMediaByUrl,
  findArticleIdBySlug,
  findCaseIdBySlug,
  findServiceIdBySlug,
  getAdminPayload,
  hasPayloadDatabase,
} from '@/lib/admin/payload-helpers'
import { mapArticleToPayloadData } from '@/lib/map-article'
import { mapCaseToPayloadData } from '@/lib/map-case'
import { mapPressMentionToPayloadData } from '@/lib/map-press'
import { mapServiceToPayloadData } from '@/lib/map-service'
import {
  mapPayloadSiteSettingsToSiteSettings,
  mapSiteSettingsToPayloadData,
  resolveAboutGalleryMediaIds,
} from '@/lib/map-site'
import { fetchAllPages } from '@/lib/admin/paginate'
import { sortOrderFromIndex } from '@/lib/admin/sortable'
import { slugify } from '@/lib/slugify'
import type {
  Case as PayloadCase,
  PressMention as PayloadPressMention,
  Service as PayloadService,
  SiteSetting,
} from '@/payload-types'
import type { AdminPayloadClient } from '@/lib/admin/payload-helpers'

async function findAllDocs<T>(
  payload: AdminPayloadClient,
  args: { collection: string; depth?: number; sort?: string },
): Promise<T[]> {
  return fetchAllPages((page, limit) =>
    payload.find<T>({
      collection: args.collection,
      depth: args.depth,
      sort: args.sort,
      page,
      limit,
    }),
  )
}

function requireDatabase(path: string) {
  if (!hasPayloadDatabase()) {
    redirect(
      `${path}?error=${encodeURIComponent('PAYLOAD_API_KEY не настроен — запустите backend и задайте ключ')}`,
    )
  }
}

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function formBool(formData: FormData, name: string) {
  return formData.get(name) === 'on'
}

function formNumber(formData: FormData, name: string, fallback = 0) {
  const raw = String(formData.get(name) ?? '').trim()
  if (!raw) return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function formString(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

function parseJsonField<T>(raw: string, label: string): T {
  if (!raw.trim()) return [] as T
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error(`Некорректный JSON: ${label}`)
  }
}

async function getNextCaseSortOrder(payload: AdminPayloadClient) {
  const docs = await findAllDocs<PayloadCase>(payload, { collection: 'cases', depth: 0 })
  const maxOrder = docs.reduce((max, doc) => Math.max(max, doc.sortOrder ?? 0), 0)
  return maxOrder + 1
}

async function getExistingCaseSortOrder(
  payload: Awaited<ReturnType<typeof getAdminPayload>>,
  id: number,
) {
  const doc = await payload.findByID<PayloadCase>({ collection: 'cases', id, depth: 0 })
  return doc.sortOrder ?? 0
}

export async function reorderCasesAction(formData: FormData) {
  const path = adminPath('cases')
  requireDatabase(path)

  try {
    const payload = await getAdminPayload()
    const slugs = parseJsonField<string[]>(formString(formData, 'orderJson'), 'порядок')

    const listedDocs = await findAllDocs<PayloadCase>(payload, {
      collection: 'cases',
      depth: 0,
      sort: 'sortOrder',
    })

    const idBySlug = new Map(
      listedDocs
        .filter((doc): doc is PayloadCase & { slug: string } => Boolean(doc.slug))
        .map((doc) => [doc.slug, doc.id] as const),
    )
    const orderById = new Map(listedDocs.map((doc) => [doc.id, doc.sortOrder ?? 0] as const))

    await Promise.all(
      slugs.map(async (slug, index) => {
        const id = idBySlug.get(slug)
        if (!id) return
        const nextOrder = sortOrderFromIndex(index)
        if (orderById.get(id) === nextOrder) return
        await payload.update({
          collection: 'cases',
          id,
          data: { sortOrder: nextOrder },
        })
      }),
    )

    revalidatePath(path)
    revalidatePath('/works')
    revalidatePath('/')
    revalidateTag('cases')
    redirect(`${path}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения порядка'
    redirectWithError(path, message)
  }
}

export async function checkCaseSlugAction(
  slugRaw: string,
  excludeSlug?: string,
): Promise<{ available: boolean; slug: string; reason?: string }> {
  const slug = slugify(slugRaw)
  if (!slug) {
    return { available: false, slug: '', reason: 'Пустой slug' }
  }

  if (!hasPayloadDatabase()) {
    return { available: true, slug }
  }

  try {
    const payload = await getAdminPayload()
    const existingId = await findCaseIdBySlug(payload, slug)
    if (!existingId) return { available: true, slug }

    if (excludeSlug && excludeSlug === slug) {
      return { available: true, slug }
    }

    // Same document being edited under a previous slug
    if (excludeSlug) {
      const currentId = await findCaseIdBySlug(payload, excludeSlug)
      if (currentId && currentId === existingId) {
        return { available: true, slug }
      }
    }

    return { available: false, slug, reason: 'Уже занят' }
  } catch {
    return { available: false, slug, reason: 'Не удалось проверить' }
  }
}

export async function saveCaseAction(formData: FormData) {
  const returnPath = formData.get('returnPath')
  const basePath =
    typeof returnPath === 'string' && returnPath.startsWith(adminPath('cases'))
      ? returnPath.split('?')[0]
      : adminPath('cases/new')

  requireDatabase(basePath)

  try {
    const payload = await getAdminPayload()
    const originalSlug = formString(formData, 'originalSlug')
    const slug = slugify(formString(formData, 'slug'))
    const title = formString(formData, 'title')

    if (!title || !slug) {
      redirectWithError(basePath, 'Заполните название и slug')
    }

    const gallery = parseJsonField<GalleryItem[]>(
      formString(formData, 'galleryJson'),
      'галерея',
    )
    const coverUrl = formString(formData, 'cover') || gallery[0]?.src || ''
    if (!coverUrl) {
      redirectWithError(basePath, 'Добавьте хотя бы одно фото или видео в галерею')
    }

    const statusRaw = formString(formData, 'status') as CaseStatus
    const status: CaseStatus =
      statusRaw === 'published' || statusRaw === 'hidden' || statusRaw === 'draft'
        ? statusRaw
        : 'draft'

    const galleryMediaIds: number[] = []
    for (const item of gallery) {
      if (!item.src) continue
      const id = await ensureMediaByUrl(payload, item.src, item.alt || title)
      galleryMediaIds.push(id)
    }

    const coverId =
      galleryMediaIds[0] ?? (await ensureMediaByUrl(payload, coverUrl, title))

    const existingId = originalSlug ? await findCaseIdBySlug(payload, originalSlug) : undefined
    const sortOrder = existingId
      ? await getExistingCaseSortOrder(payload, existingId)
      : await getNextCaseSortOrder(payload)

    const seoTitle = formString(formData, 'seoTitle') || undefined
    const seoDescription = formString(formData, 'seoDescription') || undefined

    const caseData = {
      slug,
      title,
      year: formNumber(formData, 'year', new Date().getFullYear()),
      cover: coverUrl,
      coverAlt: gallery[0]?.alt || title,
      summary: formString(formData, 'summary') || undefined,
      description: formString(formData, 'description') || undefined,
      heroTitle: formString(formData, 'heroTitle') || undefined,
      featured: formBool(formData, 'featured') && status === 'published',
      status,
      sortOrder,
      gallery,
      seo: {
        title: seoTitle,
        description: seoDescription,
      },
    }

    const payloadData = {
      ...mapCaseToPayloadData(caseData, {
        coverId,
        galleryMediaIds,
      }),
      cover: coverId,
      gallery: galleryMediaIds.map((media) => ({ media })),
      status,
      description: caseData.description || null,
      meta: {
        title: seoTitle || null,
        description: seoDescription || null,
      },
    }

    const duplicateId = await findCaseIdBySlug(payload, slug)
    if (duplicateId && duplicateId !== existingId) {
      redirectWithError(basePath, 'Кейс с таким slug уже существует')
    }

    if (existingId) {
      await payload.update({ collection: 'cases', id: existingId, data: payloadData })
    } else {
      await payload.create({ collection: 'cases', data: payloadData, draft: false })
    }

    revalidatePath(adminPath('cases'))
    revalidatePath(`/works/${slug}`)
    if (originalSlug && originalSlug !== slug) {
      revalidatePath(`/works/${originalSlug}`)
    }
    revalidatePath('/works')
    revalidatePath('/')
    revalidateTag('cases')
    redirect(`${adminPath(`cases/${slug}`)}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(basePath, message)
  }
}

export async function deleteCaseAction(formData: FormData) {
  const slug = formString(formData, 'slug')
  const path = slug ? adminPath(`cases/${slug}`) : adminPath('cases')
  requireDatabase(path)

  try {
    if (!slug) redirectWithError(adminPath('cases'), 'Slug не указан')

    const payload = await getAdminPayload()
    const id = await findCaseIdBySlug(payload, slug)
    if (!id) redirectWithError(path, 'Кейс не найден')

    await payload.delete({ collection: 'cases', id })

    revalidatePath(adminPath('cases'))
    revalidatePath(`/works/${slug}`)
    revalidatePath('/works')
    revalidatePath('/')
    revalidateTag('cases')
    redirect(`${adminPath('cases')}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка удаления'
    redirectWithError(path, message)
  }
}

export async function checkArticleSlugAction(
  slugRaw: string,
  excludeSlug?: string,
): Promise<{ available: boolean; slug: string; reason?: string }> {
  const slug = slugify(slugRaw)
  if (!slug) {
    return { available: false, slug: '', reason: 'Пустой slug' }
  }

  if (!hasPayloadDatabase()) {
    return { available: true, slug }
  }

  try {
    const payload = await getAdminPayload()
    const existingId = await findArticleIdBySlug(payload, slug)
    if (!existingId) return { available: true, slug }

    if (excludeSlug && excludeSlug === slug) {
      return { available: true, slug }
    }

    if (excludeSlug) {
      const currentId = await findArticleIdBySlug(payload, excludeSlug)
      if (currentId && currentId === existingId) {
        return { available: true, slug }
      }
    }

    return { available: false, slug, reason: 'Уже занят' }
  } catch {
    return { available: false, slug, reason: 'Не удалось проверить' }
  }
}

export async function saveArticleAction(formData: FormData) {
  const returnPath = formData.get('returnPath')
  const basePath =
    typeof returnPath === 'string' && returnPath.startsWith(adminPath('articles'))
      ? returnPath.split('?')[0]
      : adminPath('articles/new')

  requireDatabase(basePath)

  try {
    const payload = await getAdminPayload()
    const originalSlug = formString(formData, 'originalSlug')
    const slug = slugify(formString(formData, 'slug'))
    const title = formString(formData, 'title')
    const authorName = formString(formData, 'author')
    const publishedAt = formString(formData, 'publishedAt')

    if (!title || !slug || !authorName || !publishedAt) {
      redirectWithError(basePath, 'Заполните обязательные поля')
    }

    const gallery = parseJsonField<GalleryItem[]>(
      formString(formData, 'galleryJson'),
      'галерея',
    )
    const coverUrl = formString(formData, 'cover') || gallery[0]?.src || ''
    if (!coverUrl) {
      redirectWithError(basePath, 'Добавьте хотя бы одно фото или видео в галерею')
    }

    const statusRaw = formString(formData, 'status') as ArticleStatus
    const status: ArticleStatus =
      statusRaw === 'published' || statusRaw === 'draft' ? statusRaw : 'draft'

    const galleryMediaIds: number[] = []
    for (const item of gallery) {
      if (!item.src) continue
      const id = await ensureMediaByUrl(payload, item.src, item.alt || title)
      galleryMediaIds.push(id)
    }

    const coverId =
      galleryMediaIds[0] ?? (await ensureMediaByUrl(payload, coverUrl, title))
    const authorId = await ensureAuthor(payload, authorName, formString(formData, 'role'))

    const seoTitle = formString(formData, 'seoTitle') || undefined
    const seoDescription = formString(formData, 'seoDescription') || undefined
    const description = formString(formData, 'description') || undefined

    const article = {
      slug,
      title,
      excerpt: formString(formData, 'excerpt'),
      cover: coverUrl,
      coverAlt: gallery[0]?.alt || title,
      author: { name: authorName, role: formString(formData, 'role') },
      publishedAt: new Date(publishedAt).toISOString(),
      readingTime: formNumber(formData, 'readingTime', 3),
      featured: formBool(formData, 'featured') && status === 'published',
      status,
      description,
      gallery,
      sections: [],
      seo: {
        title: seoTitle,
        description: seoDescription,
      },
    }

    const data = {
      ...mapArticleToPayloadData(article, { coverId, authorId, galleryMediaIds }),
      cover: coverId,
      author: authorId,
      gallery: galleryMediaIds.map((media) => ({ media })),
      status,
      description: description || null,
      sections: [],
      meta: {
        title: seoTitle || null,
        description: seoDescription || null,
      },
    }

    const existingId = originalSlug ? await findArticleIdBySlug(payload, originalSlug) : undefined
    const duplicateId = await findArticleIdBySlug(payload, slug)
    if (duplicateId && duplicateId !== existingId) {
      redirectWithError(basePath, 'Статья с таким slug уже существует')
    }

    if (existingId) {
      await payload.update({ collection: 'articles', id: existingId, data })
    } else {
      await payload.create({ collection: 'articles', data, draft: false })
    }

    revalidatePath(adminPath('articles'))
    revalidatePath(`/articles/${slug}`)
    if (originalSlug && originalSlug !== slug) {
      revalidatePath(`/articles/${originalSlug}`)
    }
    revalidatePath('/articles')
    revalidatePath('/')
    revalidateTag('articles')
    redirect(`${adminPath(`articles/${slug}`)}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(basePath, message)
  }
}

export async function deleteArticleAction(formData: FormData) {
  const slug = formString(formData, 'slug')
  const path = slug ? adminPath(`articles/${slug}`) : adminPath('articles')
  requireDatabase(path)

  try {
    if (!slug) redirectWithError(adminPath('articles'), 'Slug не указан')

    const payload = await getAdminPayload()
    const id = await findArticleIdBySlug(payload, slug)
    if (!id) redirectWithError(path, 'Статья не найдена')

    await payload.delete({ collection: 'articles', id })

    revalidatePath(adminPath('articles'))
    revalidateTag('articles')
    redirect(`${adminPath('articles')}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка удаления'
    redirectWithError(path, message)
  }
}

export async function saveSiteSettingsAction(formData: FormData) {
  const path = adminPath('settings')
  requireDatabase(path)

  try {
    const payload = await getAdminPayload()
    const currentDoc = await payload.findGlobal<SiteSetting>({ slug: 'site-settings', depth: 1 })
    const current = mapPayloadSiteSettingsToSiteSettings(currentDoc)

    const assetIds = {
      logo: resolveRelationId(currentDoc.assets?.logo),
      logoFooter: resolveRelationId(currentDoc.assets?.logoFooter),
      arrow: resolveRelationId(currentDoc.assets?.arrow),
      comma: resolveRelationId(currentDoc.assets?.comma),
      prHero: resolveRelationId(currentDoc.assets?.prHero),
      tgIcon: resolveRelationId(currentDoc.assets?.tgIcon),
    }

    const settings = {
      ...current,
      tagline: formString(formData, 'tagline'),
      agencyTitle: formString(formData, 'agencyTitle') || current.agencyTitle || '',
      heroTitle: formString(formData, 'heroTitle'),
      heroSubtitle: formString(formData, 'heroSubtitle') || current.heroSubtitle || '',
      telegramBotUrl: formString(formData, 'telegramBotUrl'),
      telegramChannelUrl: formString(formData, 'telegramChannelUrl'),
      infoEmail: formString(formData, 'infoEmail'),
      // aboutText / aboutStats / aboutGallery редактируются в /admin/about
      aboutText: current.aboutText,
      aboutStats: current.aboutStats,
      aboutGallery: current.aboutGallery,
      legal: {
        disclaimer: formString(formData, 'disclaimer'),
        companyName: formString(formData, 'companyName'),
        inn: formString(formData, 'inn'),
        ogrnip: formString(formData, 'ogrnip'),
      },
    }

    await payload.updateGlobal({
      slug: 'site-settings',
      data: mapSiteSettingsToPayloadData(
        settings,
        assetIds,
        resolveAboutGalleryMediaIds(currentDoc),
      ),
    })

    revalidatePath(adminPath('settings'))
    revalidateTag('site-settings')
    redirect(`${path}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(path, message)
  }
}

export async function saveAboutPageAction(formData: FormData) {
  const path = adminPath('about')
  requireDatabase(path)

  try {
    const payload = await getAdminPayload()
    const currentDoc = await payload.findGlobal<SiteSetting>({ slug: 'site-settings', depth: 1 })
    const current = mapPayloadSiteSettingsToSiteSettings(currentDoc)

    const assetIds = {
      logo: resolveRelationId(currentDoc.assets?.logo),
      logoFooter: resolveRelationId(currentDoc.assets?.logoFooter),
      arrow: resolveRelationId(currentDoc.assets?.arrow),
      comma: resolveRelationId(currentDoc.assets?.comma),
      prHero: resolveRelationId(currentDoc.assets?.prHero),
      tgIcon: resolveRelationId(currentDoc.assets?.tgIcon),
    }

    const aboutText = formString(formData, 'aboutText')
    if (!aboutText) redirectWithError(path, 'Заполните описание')

    const gallery = parseJsonField<GalleryItem[]>(
      formString(formData, 'galleryJson'),
      'галерея',
    )

    const aboutGalleryMediaIds: number[] = []
    for (const item of gallery) {
      if (!item.src) continue
      const id = await ensureMediaByUrl(payload, item.src, item.alt || 'О нас')
      aboutGalleryMediaIds.push(id)
    }

    const settings = {
      ...current,
      aboutText,
      aboutStats: {
        years: formNumber(formData, 'years', current.aboutStats.years),
        brands: formNumber(formData, 'brands', current.aboutStats.brands),
        reachMillions: formNumber(formData, 'reachMillions', current.aboutStats.reachMillions),
      },
      aboutGallery: gallery,
    }

    await payload.updateGlobal({
      slug: 'site-settings',
      data: mapSiteSettingsToPayloadData(settings, assetIds, aboutGalleryMediaIds),
    })

    revalidatePath(path)
    revalidatePath('/about')
    revalidateTag('site-settings')
    redirect(`${path}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(path, message)
  }
}

export async function reorderServicesAction(formData: FormData) {
  const path = adminPath('services')
  requireDatabase(path)

  try {
    const payload = await getAdminPayload()
    const slugs = parseJsonField<string[]>(formString(formData, 'orderJson'), 'порядок')

    const listedDocs = await findAllDocs<PayloadService>(payload, {
      collection: 'services',
      depth: 0,
      sort: 'sortOrder',
    })
    const idBySlug = new Map(
      listedDocs
        .filter((doc): doc is PayloadService & { slug: string } => Boolean(doc.slug))
        .map((doc) => [doc.slug, doc.id] as const),
    )

    await Promise.all(
      slugs.map(async (slug, index) => {
        const id = idBySlug.get(slug)
        if (!id) return
        await payload.update({
          collection: 'services',
          id,
          data: { sortOrder: sortOrderFromIndex(index) },
        })
      }),
    )

    revalidatePath(path)
    revalidatePath('/services')
    revalidateTag('services')
    redirect(`${path}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения порядка'
    redirectWithError(path, message)
  }
}

export async function checkServiceSlugAction(
  slugRaw: string,
  excludeSlug?: string,
): Promise<{ available: boolean; slug: string; reason?: string }> {
  const slug = slugify(slugRaw)
  if (!slug) {
    return { available: false, slug: '', reason: 'Пустой slug' }
  }

  if (!hasPayloadDatabase()) {
    return { available: true, slug }
  }

  try {
    const payload = await getAdminPayload()
    const existingId = await findServiceIdBySlug(payload, slug)
    if (!existingId) return { available: true, slug }

    if (excludeSlug && excludeSlug === slug) {
      return { available: true, slug }
    }

    if (excludeSlug) {
      const currentId = await findServiceIdBySlug(payload, excludeSlug)
      if (currentId && currentId === existingId) {
        return { available: true, slug }
      }
    }

    return { available: false, slug, reason: 'Уже занят' }
  } catch {
    return { available: false, slug, reason: 'Не удалось проверить' }
  }
}

export async function saveServiceAction(formData: FormData) {
  const returnPath = formData.get('returnPath')
  const basePath =
    typeof returnPath === 'string' && returnPath.startsWith(adminPath('services'))
      ? returnPath.split('?')[0]
      : adminPath('services/new')

  requireDatabase(basePath)

  try {
    const payload = await getAdminPayload()
    const originalSlug = formString(formData, 'originalSlug')
    const slug = slugify(formString(formData, 'slug'))
    const title = formString(formData, 'title')
    const coverUrl = formString(formData, 'cover')
    const description = formString(formData, 'description') || undefined
    const coverAlt = formString(formData, 'coverAlt') || title

    if (!title || !slug) redirectWithError(basePath, 'Заполните название и slug')
    if (!coverUrl) redirectWithError(basePath, 'Добавьте обложку')

    const existingId = originalSlug ? await findServiceIdBySlug(payload, originalSlug) : undefined
    const duplicateId = await findServiceIdBySlug(payload, slug)
    if (duplicateId && duplicateId !== existingId) {
      redirectWithError(basePath, 'Услуга с таким slug уже существует')
    }

    let sortOrder = formNumber(formData, 'sortOrder', 0)
    if (!existingId) {
      const listedDocs = await findAllDocs<PayloadService>(payload, {
        collection: 'services',
        depth: 0,
      })
      const maxOrder = listedDocs.reduce((max, doc) => Math.max(max, doc.sortOrder ?? 0), 0)
      sortOrder = maxOrder + 1
    } else if (!sortOrder) {
      const doc = await payload.findByID<PayloadService>({ collection: 'services', id: existingId, depth: 0 })
      sortOrder = doc.sortOrder ?? 0
    }

    const coverId = await ensureMediaByUrl(payload, coverUrl, coverAlt)
    const payloadData = mapServiceToPayloadData(
      { title, slug, description, image: coverUrl, coverAlt, sortOrder },
      coverId,
    )

    if (existingId) {
      await payload.update({ collection: 'services', id: existingId, data: payloadData })
    } else {
      await payload.create({ collection: 'services', data: payloadData })
    }

    revalidatePath(adminPath('services'))
    revalidatePath('/services')
    revalidateTag('services')
    redirect(`${adminPath(`services/${slug}`)}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(basePath, message)
  }
}

export async function deleteServiceAction(formData: FormData) {
  const slug = formString(formData, 'slug')
  const path = slug ? adminPath(`services/${slug}`) : adminPath('services')
  requireDatabase(path)

  try {
    if (!slug) redirectWithError(adminPath('services'), 'Slug не указан')

    const payload = await getAdminPayload()
    const id = await findServiceIdBySlug(payload, slug)
    if (!id) redirectWithError(path, 'Услуга не найдена')

    await payload.delete({ collection: 'services', id })

    revalidatePath(adminPath('services'))
    revalidatePath('/services')
    revalidateTag('services')
    redirect(`${adminPath('services')}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка удаления'
    redirectWithError(path, message)
  }
}

export async function savePressMentionsAction(formData: FormData) {
  const path = adminPath('press')
  requireDatabase(path)

  try {
    const payload = await getAdminPayload()
    const items = parseJsonField<PressMention[]>(formString(formData, 'itemsJson'), 'публикации')

    const existingDocs = await findAllDocs<PayloadPressMention>(payload, {
      collection: 'press-mentions',
      sort: 'sortOrder',
    })

    const existingById = new Map(existingDocs.map((doc) => [doc.id, doc]))
    const existingByUrl = new Map(
      existingDocs.map((doc) => [doc.url.trim().toLowerCase(), doc] as const),
    )
    const keptIds = new Set<number>()

    for (const [index, item] of items.entries()) {
      const data = mapPressMentionToPayloadData({
        ...item,
        sortOrder: sortOrderFromIndex(index),
      })

      const byId =
        typeof item.id === 'number' && existingById.has(item.id)
          ? existingById.get(item.id)
          : undefined
      const byUrl = existingByUrl.get(item.url.trim().toLowerCase())
      const match = byId ?? byUrl

      if (match) {
        await payload.update({
          collection: 'press-mentions',
          id: match.id,
          data,
        })
        keptIds.add(match.id)
      } else {
        const created = await payload.create<PayloadPressMention>({
          collection: 'press-mentions',
          data,
        })
        if (created?.id) keptIds.add(created.id)
      }
    }

    for (const doc of existingDocs) {
      if (!keptIds.has(doc.id)) {
        await payload.delete({ collection: 'press-mentions', id: doc.id })
      }
    }

    revalidatePath(path)
    revalidateTag('press-mentions')
    redirect(`${path}?saved=1`)
  } catch (error) {
    unstable_rethrow(error)
    const message = error instanceof Error ? error.message : 'Ошибка сохранения'
    redirectWithError(path, message)
  }
}

function resolveRelationId(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}
