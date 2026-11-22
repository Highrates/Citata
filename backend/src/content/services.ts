import type { Service } from './types'
import { slugify } from '@/lib/slugify'

const CDN = 'https://cdn.prod.website-files.com'
const CITATA = `${CDN}/65fd7014c7711f3326b3ea1e`
const CASES = `${CDN}/6624004eba739a7d48403ddb`

/** Default preview when a service has no image. */
export const servicesHeroImage = `${CITATA}/67e1b977f7d9ed1edec7d55b_inside-weather-Uxqlfigh6oE-unsplash.jpg`

function service(
  title: string,
  image: string,
  sortOrder: number,
  description?: string,
): Service {
  return {
    title,
    slug: slugify(title),
    image,
    coverAlt: title,
    sortOrder,
    ...(description ? { description } : {}),
  }
}

export const mainServices: Service[] = [
  service('PR-стратегия', `${CASES}/680fda25ce3505d72faf1da2_hollyshop%201-2.jpg`, 1),
  service(
    'Публикации в СМИ',
    `${CASES}/680fdcc858f191ccde2e55aa_Larion%20Kantor%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    2,
  ),
  service(
    'PR-сопровождение',
    `${CASES}/680fe07dab336d938f305066_%D0%A2%D0%B2%D0%BE%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%BE%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    3,
  ),
  service('Коллаборации', `${CASES}/681a5ee53c233fa947223ebb_influencers%20aesthetic.jpg`, 4),
  service(
    'Организация мероприятий',
    `${CASES}/680e3e4d5b46e54492ef8dd8_advent_hollyshop-PR%20%D0%90%D0%B3%D0%B5%D0%BD%D1%82%D1%81%D1%82%D0%B2%D0%BE%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.png`,
    5,
  ),
  service(
    'Антикризисные коммуникации',
    `${CASES}/680fd515341f105f31056ab1_PR%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%8F%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BA%D0%BE%D1%81%D0%BC%D0%B5%D1%82%D0%B8%D0%BA%D0%B0.jpg`,
    6,
  ),
  service(
    'PR-продвижение мероприятий',
    `${CASES}/680faf84fe00f290572cfeaf_kantor%20x%20%D1%86%D0%B8%D1%82%D0%B0%D1%82%D0%B0%20pr.png`,
    7,
  ),
  service('Инфоподдержка событий бренда', servicesHeroImage, 8),
]

export const extraServices: Service[] = [
  service('SMM-продвижение', `${CASES}/681a5ee53c233fa947223ebb_influencers%20aesthetic.jpg`, 9),
  service('Брендинг', `${CASES}/680fda25ce3505d72faf1da2_hollyshop%201-2.jpg`, 10),
  service(
    'Продуктовый PR',
    `${CASES}/680fdcc858f191ccde2e55aa_Larion%20Kantor%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    11,
  ),
  service(
    'Интегрированные коммуникации',
    `${CASES}/680fe07dab336d938f305066_%D0%A2%D0%B2%D0%BE%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%BE%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    12,
  ),
  service(
    'Графический дизайн',
    `${CASES}/680e3e4d5b46e54492ef8dd8_advent_hollyshop-PR%20%D0%90%D0%B3%D0%B5%D0%BD%D1%82%D1%81%D1%82%D0%B2%D0%BE%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.png`,
    13,
  ),
  service(
    'Подбор PR-специалистов',
    `${CASES}/680faf84fe00f290572cfeaf_kantor%20x%20%D1%86%D0%B8%D1%82%D0%B0%D1%82%D0%B0%20pr.png`,
    14,
  ),
  service(
    'Нестандартные ивенты',
    `${CASES}/680fd515341f105f31056ab1_PR%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%8F%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BA%D0%BE%D1%81%D0%BC%D0%B5%D1%82%D0%B8%D0%BA%D0%B0.jpg`,
    15,
  ),
  service('UX/UI дизайн', servicesHeroImage, 16),
]

export const allFixtureServices: Service[] = [...mainServices, ...extraServices]

/** Merge CMS services with fixture preview images by title/slug. */
export function withServiceImages(services: Service[], fallbacks: Service[]): Service[] {
  const byTitle = new Map(
    fallbacks.map((item) => [item.title.trim().toLowerCase(), item] as const),
  )
  const bySlug = new Map(fallbacks.map((item) => [item.slug, item] as const))

  return services.map((item, index) => {
    const fallback = bySlug.get(item.slug) || byTitle.get(item.title.trim().toLowerCase())
    return {
      ...item,
      slug: item.slug || fallback?.slug || slugify(item.title),
      image: item.image || fallback?.image || servicesHeroImage,
      coverAlt: item.coverAlt || fallback?.coverAlt || item.title,
      sortOrder: item.sortOrder || fallback?.sortOrder || index + 1,
      description: item.description || fallback?.description,
    }
  })
}
