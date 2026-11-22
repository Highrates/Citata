import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/FadeIn'
import { fetchSiteSettings } from '@/lib/content-site'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика обработки персональных данных PR-агентства ЦИТАТА.',
}

export const revalidate = 300

export default async function PrivacyPage() {
  const settings = await fetchSiteSettings()

  return (
    <section className="section container legal-page">
      <FadeIn>
        <h1 className="page-title">Политика конфиденциальности</h1>
        <div className="legal-page__content case-content">
          <p>
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных
            данных пользователей сайта citata-pr.ru, принадлежащего {settings.legal.companyName}.
          </p>
          <h2 className="case-content__heading">1. Общие положения</h2>
          <p>
            Оператор обрабатывает персональные данные в соответствии с Федеральным законом № 152-ФЗ
            «О персональных данных». Используя сайт, вы соглашаетесь с условиями данной Политики.
          </p>
          <h2 className="case-content__heading">2. Какие данные мы собираем</h2>
          <p>
            Мы можем получать имя, адрес электронной почты, номер телефона и иные сведения, которые вы
            добровольно передаёте через формы обратной связи, Telegram-бот или email{' '}
            {settings.infoEmail}.
          </p>
          <h2 className="case-content__heading">3. Цели обработки</h2>
          <p>
            Данные используются для ответа на запросы, организации консультаций, подготовки коммерческих
            предложений и улучшения работы сайта.
          </p>
          <h2 className="case-content__heading">4. Контакты</h2>
          <p>
            По вопросам обработки персональных данных:{' '}
            <a href={`mailto:${settings.infoEmail}`}>{settings.infoEmail}</a>.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
