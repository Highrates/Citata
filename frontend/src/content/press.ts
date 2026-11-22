import type { PressMention } from './types'

const CDN = 'https://cdn.prod.website-files.com/65fd7014c7711f3326b3ea1e'

export const pressMentions: PressMention[] = [
  {
    title: 'Пять ошибок в PR, которые приведут бизнес к убыткам',
    source: 'Колонка для издания РБК ПРО',
    url: 'https://pro.rbc.ru/',
    logo: `${CDN}/682b551ff7adf52a49118268_Rbk%20pro%20logo.svg`,
    sortOrder: 1,
  },
  {
    title: 'Топ-5 заблуждений о PR, или Как выжить в кризис',
    source: 'Колонка для издания Sostav',
    url: 'https://www.sostav.ru/',
    logo: `${CDN}/682b60fa19a45c6e01166b62_logo2918-05v3.svg`,
    sortOrder: 2,
  },
  {
    title: '6 трендов в копирайтинге, которые мы похоронили 24 февраля',
    source: 'Колонка для издания Rusbase',
    url: 'https://rb.ru/',
    logo: `${CDN}/682b670210b132181fef7249_rusbase%20logo.svg`,
    sortOrder: 3,
  },
]
