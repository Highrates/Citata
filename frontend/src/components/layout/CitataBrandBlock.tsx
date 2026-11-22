type CitataBrandBlockProps = {
  telegramUrl?: string
  className?: string
  siteUrl?: string
  email?: string
  phone?: string
  phoneDisplay?: string
  agencyLines?: [string, string]
}

/**
 * Бренд-блок с preload: логотип + agency + контакты.
 */
export function CitataBrandBlock({
  telegramUrl = 'https://t.me/citatapr',
  className = 'preloader__inner',
  siteUrl = 'https://citata-pr.ru',
  email = 'info@citata-pr.ru',
  phone = '+79072031119',
  phoneDisplay = '890 720 3119',
  agencyLines = ['Агентство информационных', 'технологий & коммуникаций'],
}: CitataBrandBlockProps) {
  const tgHref = telegramUrl.startsWith('http')
    ? telegramUrl
    : `https://t.me/${telegramUrl.replace(/^@/, '')}`
  const tgLabel = `@${tgHref.replace(/^https?:\/\/(www\.)?t\.me\//i, '').replace(/^\@/, '')}`

  return (
    <div className={className}>
      <div className="preloader__logo-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/Citata.svg"
          alt="ЦИТАТА"
          width={1663}
          height={171}
          className="preloader__logo"
          decoding="sync"
          fetchPriority="high"
        />
      </div>

      <div className="preloader__below">
        <p className="preloader__agency">
          {agencyLines[0]}
          <br />
          {agencyLines[1]}
        </p>

        <div className="preloader__contacts">
          <div className="preloader__col">
            <a href={siteUrl}>{siteUrl.replace(/^https?:\/\//, '')}</a>
            <a href={`mailto:${email}`}>{email}</a>
          </div>
          <div className="preloader__col">
            <span>TG</span>
            <a href={tgHref} target="_blank" rel="noreferrer">
              {tgLabel}
            </a>
          </div>
          <div className="preloader__col">
            <span>GLOBAL</span>
            <a href={`tel:${phone}`}>{phoneDisplay}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
