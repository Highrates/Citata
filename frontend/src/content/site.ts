import type { SiteSettings } from './types'
import { extraServices, mainServices } from './services'

const CDN = 'https://cdn.prod.website-files.com'

export const siteSettings: SiteSettings = {
  tagline: 'Стратегия. Идея. Запуск. Рост.',
  agencyTitle: 'Агентство информационных технологий & коммуникаций',
  heroTitle: 'Привлекаем внимание к бизнесу, стартапу или мероприятию',
  heroSubtitle: 'PR-агентство',
  telegramBotUrl: 'https://t.me/kate_kolesnik',
  telegramChannelUrl: 'https://t.me/citatapr',
  infoEmail: 'info@citata-pr.ru',
  aboutText:
    'PR-агентство. Мы видим, как за годы сотрудничества клиенты становятся востребованными, а их компании узнаваемыми. Интерес и доверие к брендам растёт как со стороны аудитории, так и со стороны СМИ. Со многими мы переходим от формата работы с исходящими предложениями редакторам на фильтр входящих запросов. Потому что эффект от пиара накапливается и медиа уже сами приглашают делать публикации, давать интервью и выступать.',
  aboutStats: { years: 8, brands: 250, reachMillions: 71 },
  aboutGallery: [
    {
      src: '/images/about/portrait.jpg',
      alt: 'ЦИТАТА — PR-агентство',
      kind: 'image',
    },
  ],
  contacts: [
    {
      name: 'Екатерина Колесник',
      role: 'CEO',
      email: 'communikate@citata-pr.ru',
      telegram: 'https://t.me/kate_kolesnik',
    },
    {
      name: 'Олеся Колесникова',
      role: 'Head of sales',
      email: 'olesya.kolesnikova@citata-pr.ru',
      telegram: 'https://t.me/kolleska',
    },
  ],
  legal: {
    disclaimer:
      'Данный сайт носит исключительно информационный характер и не является публичной офертой. Для получения более подробной информации об указанных акциях, а также о стоимости услуг, просим уточнять.',
    companyName: 'Индивидуальный предприниматель Колесник Екатерина Васильевна',
    inn: '503512454285',
    ogrnip: '320237500237322',
  },
  assets: {
    logo: `${CDN}/65fd7014c7711f3326b3ea1e/67e2f4c80f6bcc8766c2e866_citata-logo.svg`,
    logoFooter: `${CDN}/65fd7014c7711f3326b3ea1e/67d458e91d7bbc3ad3724961_citata.svg`,
    arrow: `${CDN}/65fd7014c7711f3326b3ea1e/67e79bf1af0f00c00ea33fec_%E2%86%92.svg`,
    comma: `${CDN}/65fd7014c7711f3326b3ea1e/67d82f5e554f89a2f104c008_comma.svg`,
    prHero: `${CDN}/65fd7014c7711f3326b3ea1e/681ba128046e5cf602e4251d_PR-%D0%90%D0%B3%D0%B5%D0%BD%D1%82%D1%81%D1%82%D0%B2%D0%BE%20%D0%A6%D0%98%D0%A2%D0%90%D0%A2%D0%90.jpg`,
    tgIcon: `${CDN}/65fd7014c7711f3326b3ea1e/67e43ab53820753e8f55f5ca_tg-Icon.svg`,
  },
  mainServices,
  extraServices,
}
