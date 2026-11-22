import Link from 'next/link'
import { adminPath } from '@/lib/admin/constants'
import { getArticles, getCases } from '@/lib/content'
import { fetchPressMentions } from '@/lib/content-press'
import { fetchServices } from '@/lib/content-services'

export const metadata = { title: 'Обзор' }

export default async function AdminDashboardPage() {
  const cases = getCases()
  const articles = getArticles()
  const [press, services] = await Promise.all([fetchPressMentions(), fetchServices()])

  const cards = [
    { href: adminPath('cases'), title: 'Кейсы', note: `${cases.length} работ` },
    { href: adminPath('services'), title: 'Услуги', note: `${services.length} позиций` },
    { href: adminPath('about'), title: 'О нас', note: 'Текст и цифры /about' },
    { href: adminPath('articles'), title: 'Статьи', note: `${articles.length} публикаций` },
    { href: adminPath('press'), title: 'Пресса', note: `${press.length} ссылок` },
    { href: adminPath('media'), title: 'Медиа', note: 'Библиотека файлов' },
    { href: adminPath('settings'), title: 'Настройки', note: 'Контакты, Telegram, юр. инфо' },
  ]

  return (
    <>
      <h1 className="admin-title">Обзор</h1>
      <p className="admin-lead">Кастомная админка — единая точка входа для редакторов.</p>
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
