import Image from 'next/image'

type ConsultationCtaProps = {
  href: string
  arrowSrc: string
  title?: string
  label?: string
  variant?: 'dark' | 'light'
}

export function ConsultationCta({
  href,
  arrowSrc,
  title = 'Быстрый способ узнать, как мы можем помочь вам и вашему бренду',
  label = 'Записаться на консультацию',
  variant = 'light',
}: ConsultationCtaProps) {
  return (
    <section className={`cta-section cta-section--${variant}`}>
      <div className="container cta-section__inner">
        <div>
          <p className="cta-section__eyebrow">Консультация</p>
          <h2 className="cta-section__title">{title}</h2>
        </div>
        <a href={href} target="_blank" rel="noreferrer" className="cta-section__link">
          <span>{label}</span>
          <Image src={arrowSrc} alt="" width={24} height={24} aria-hidden />
        </a>
      </div>
    </section>
  )
}
