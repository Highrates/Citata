import Link from 'next/link'
import { adminPath } from '@/lib/admin/constants'
import {
  fetchAdminArticles,
  fetchAdminCases,
  fetchAdminEvents,
  fetchAdminPress,
  fetchAdminServices,
} from '@/lib/admin/data'

export const metadata = { title: 'Обзор' }

export default async function AdminDashboardPage() {
  const [cases, events, articles, press, services] = await Promise.all([
    fetchAdminCases(),
    fetchAdminEvents(),
    fetchAdminArticles(),
    fetchAdminPress(),
    fetchAdminServices(),
  ])

  const cards = [
    { href: adminPath('cases'), title: 'Кейсы', note: `${cases.items.length} работ` },
    { href: adminPath('services'), title: 'Услуги', note: `${services.items.length} позиций` },
    { href: adminPath('about'), title: 'О нас', note: 'Текст и цифры /about' },
    { href: adminPath('events'), title: 'События', note: `${events.items.length} публикаций` },
    { href: adminPath('articles'), title: 'Статьи', note: `${articles.items.length} публикаций` },
    { href: adminPath('press'), title: 'Пресса', note: `${press.items.length} ссылок` },
    { href: adminPath('settings'), title: 'Настройки', note: 'Контакты, Telegram, юр. инфо' },
  ]

  return (
    <>
      <h1 className="admin-title">Обзор</h1>
      <ul className="admin-dashboard-grid">
        {cards.map((card) => (
          <li key={card.href}>
            <Link className="admin-card" href={card.href}>
              <span className="admin-card-title">{card.title}</span>
              <span className="admin-card-note">{card.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
