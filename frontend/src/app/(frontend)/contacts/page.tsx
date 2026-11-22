import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/FadeIn'
import { fetchSiteSettings } from '@/lib/content-site'

export const metadata: Metadata = {
  title: 'Контакты',
  description: 'Связаться с PR-агентством ЦИТАТА: email, команда, консультация в Telegram.',
}

export const revalidate = 300

export default async function ContactsPage() {
  const settings = await fetchSiteSettings()

  return (
    <section className="section container">
      <FadeIn>
        <h1 className="page-title">Контакты</h1>
        <p className="page-subtitle" style={{ textTransform: 'none' }}>
          <a href={`mailto:${settings.infoEmail}`}>{settings.infoEmail}</a>
        </p>
        <a
          href={settings.telegramBotUrl}
          target="_blank"
          rel="noreferrer"
          className="contacts-cta"
        >
          консультация →
        </a>
      </FadeIn>

      <div className="contacts-grid">
        {settings.contacts.map((contact) => (
          <div key={contact.email} className="contact-card">
            <h2>{contact.name}</h2>
            <p>{contact.role}</p>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
        ))}
      </div>
    </section>
  )
}
