import Link from 'next/link'
import { CitataLogoWave } from '@/components/home/CitataLogoWave'
import type { SiteSettings } from '@/content/types'

type FooterProps = Pick<SiteSettings, 'telegramChannelUrl' | 'telegramBotUrl' | 'legal'>

export function Footer({ telegramChannelUrl, telegramBotUrl, legal }: FooterProps) {
  return (
    <footer className="site-footer">
      <Link href="/" className="site-footer__brand" aria-label="ЦИТАТА — на главную">
        <span className="sr-only">ЦИТАТА</span>
        <CitataLogoWave className="home-hero__logo" />
      </Link>

      <div className="site-footer__meta">
        <p className="site-footer__tagline">
          Агентство информационных
          <br />
          технологий &amp; коммуникаций
        </p>

        <div className="site-footer__actions">
          {telegramBotUrl ? (
            <a
              href={telegramBotUrl}
              className="site-footer__consult"
              target="_blank"
              rel="noreferrer"
            >
              Консультация
            </a>
          ) : null}

          {telegramChannelUrl ? (
            <p className="site-footer__channel">
              Лучшие материалы о пиаре в нашем{' '}
              <a href={telegramChannelUrl} target="_blank" rel="noreferrer">
                телеграм-канале
              </a>
            </p>
          ) : null}
        </div>
      </div>

      <div className="site-footer__legal-links">
        <Link href="/terms">Пользовательское соглашение</Link>
        <Link href="/privacy">Политика конфиденциальности</Link>
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__disclaimer">{legal.disclaimer}</p>
        <p className="site-footer__company">
          {legal.companyName}
          <br />
          ИНН {legal.inn}
          <br />
          ОГРНИП {legal.ogrnip}
        </p>
      </div>
    </footer>
  )
}
