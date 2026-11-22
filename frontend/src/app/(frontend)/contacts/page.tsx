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
  const channelUrl = settings.telegramChannelUrl || 'https://t.me/citatapr'

  return (
    <section className="contacts-page" aria-label="Контакты">
      <h1 className="sr-only">Контакты</h1>

      <FadeIn className="contacts-page__people">
        {settings.contacts.map((contact) => (
          <article key={contact.email || contact.name} className="contact-person">
            <div className="contact-person__who">
              <h2 className="contact-person__name">{contact.name}</h2>
              {contact.role ? <p className="contact-person__role">{contact.role}</p> : null}
            </div>

            {contact.email ? (
              <a href={`mailto:${contact.email}`} className="contact-person__email">
                {contact.email}
              </a>
            ) : null}

            {contact.telegram ? (
              <a
                href={contact.telegram}
                className="contact-person__telegram"
                target="_blank"
                rel="noreferrer"
              >
                Телеграм
              </a>
            ) : null}
          </article>
        ))}
      </FadeIn>

      <FadeIn className="contacts-page__bar" delay={0.08}>
        <a href={`mailto:${settings.infoEmail}`} className="contacts-page__info-email">
          {settings.infoEmail}
        </a>

        {settings.telegramBotUrl ? (
          <a
            href={settings.telegramBotUrl}
            className="contacts-page__consult"
            target="_blank"
            rel="noreferrer"
          >
            Консультация
          </a>
        ) : null}

        <p className="contacts-page__channel">
          Лучшие материалы о пиаре в нашем{' '}
          <a href={channelUrl} target="_blank" rel="noreferrer">
            телеграм-канале
          </a>
        </p>
      </FadeIn>
    </section>
  )
}
