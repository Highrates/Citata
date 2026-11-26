export type CaseBlock =
  | { type: 'heading'; level: 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'metrics'; title?: string; items: { value: string; label: string }[] }
  | { type: 'list'; title?: string; items: string[] }

export type CaseStatus = 'draft' | 'published' | 'hidden'

export type CaseGalleryItem = {
  src: string
  alt: string
  kind: 'image' | 'video'
}

export type Case = {
  slug: string
  title: string
  year?: number
  cover: string
  coverAlt: string
  summary?: string
  description?: string
  heroTitle?: string
  featured?: boolean
  homeOrder?: number | null
  status?: CaseStatus
  sortOrder: number
  gallery?: CaseGalleryItem[]
  /** @deprecated legacy fixtures only */
  blocks?: CaseBlock[]
  seo?: { title?: string; description?: string }
}

export type ArticleSection =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }

export type ArticleStatus = 'draft' | 'published'
export type EventStatus = ArticleStatus

export type RelatedCaseRef = {
  id?: number
  slug: string
  title: string
}

export type Article = {
  slug: string
  title: string
  excerpt: string
  cover: string
  coverAlt: string
  author: { name: string; role: string; photo?: string }
  publishedAt: string
  readingTime: number
  status?: ArticleStatus
  /** HTML из RichBlock */
  description?: string
  /** @deprecated prefer `description` HTML */
  sections: ArticleSection[]
  seo?: { title?: string; description?: string }
}

/** Former «новости»; may link to one or more cases. Home slots shared with cases. */
export type Event = Omit<Article, 'status'> & {
  status?: EventStatus
  featured?: boolean
  homeOrder?: number | null
  cases?: RelatedCaseRef[]
}

export type PressMention = {
  title: string
  source: string
  url: string
  sortOrder?: number
}

export type SiteSettings = {
  tagline: string
  agencyTitle: string
  heroTitle: string
  heroSubtitle: string
  telegramBotUrl: string
  telegramChannelUrl: string
  infoEmail: string
  aboutText: string
  aboutStats: { years: number; brands: number; reachMillions: number }
  /** Первое фото — основной портрет на /about */
  aboutGallery: CaseGalleryItem[]
  contacts: { name: string; role: string; email: string; telegram?: string }[]
  legal: {
    disclaimer: string
    companyName: string
    inn: string
    ogrnip: string
  }
  assets: {
    logo: string
    logoFooter: string
    arrow: string
    comma: string
    prHero: string
    tgIcon: string
  }
  mainServices: Service[]
  extraServices: Service[]
}

export type Service = {
  title: string
  slug: string
  description?: string
  image?: string
  coverAlt?: string
  sortOrder: number
}
