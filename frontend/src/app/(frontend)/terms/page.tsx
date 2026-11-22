import type { Metadata } from 'next'
import { FadeIn } from '@/components/animations/FadeIn'
import { fetchSiteSettings } from '@/lib/content-site'

export const metadata: Metadata = {
  title: 'Пользовательское соглашение',
  description: 'Условия использования сайта PR-агентства ЦИТАТА.',
}

export const revalidate = 300

export default async function TermsPage() {
  const settings = await fetchSiteSettings()

  return (
    <section className="section container legal-page">
      <FadeIn>
        <h1 className="page-title">Пользовательское соглашение</h1>
        <div className="legal-page__content case-content">
          <p>
            Настоящее Соглашение регулирует использование сайта citata-pr.ru. Материалы сайта
            предоставляются {settings.legal.companyName} в информационных целях.
          </p>
          <h2 className="case-content__heading">1. Предмет соглашения</h2>
          <p>
            Сайт носит информационный характер и не является публичной офертой. Стоимость услуг и
            условия сотрудничества уточняются отдельно.
          </p>
          <h2 className="case-content__heading">2. Права и обязанности</h2>
          <p>
            Пользователь обязуется не нарушать работу сайта и не использовать материалы без согласия
            правообладателя. Агентство вправе изменять содержание сайта без предварительного уведомления.
          </p>
          <h2 className="case-content__heading">3. Ограничение ответственности</h2>
          <p>{settings.legal.disclaimer}</p>
          <h2 className="case-content__heading">4. Реквизиты</h2>
          <p>
            {settings.legal.companyName}, ИНН {settings.legal.inn}, ОГРНИП {settings.legal.ogrnip}.
          </p>
        </div>
      </FadeIn>
    </section>
  )
}
