'use client'

import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import type { SiteSettings } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { saveSiteSettingsAction } from '@/lib/admin/content-actions'

type SettingsFormProps = {
  settings: SiteSettings
  source: AdminDataSource
  saved?: boolean
  error?: string
}

export function SettingsForm({ settings, source, saved, error }: SettingsFormProps) {
  return (
    <>
      <h1 className="admin-title">Настройки сайта</h1>
      <p className="admin-lead">Контакты, Telegram, юридическая информация. Текст «О нас» — в разделе О нас.</p>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <form className="admin-form admin-form--wide" action={saveSiteSettingsAction}>
        <div className="admin-field">
          <label className="admin-field-label" htmlFor="tagline">
            Слоган
          </label>
          <input
            className="admin-control admin-control--input"
            id="tagline"
            name="tagline"
            defaultValue={settings.tagline}
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="heroTitle">
            Заголовок на главной
          </label>
          <textarea
            className="admin-control admin-control--textarea"
            id="heroTitle"
            name="heroTitle"
            rows={2}
            defaultValue={settings.heroTitle}
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="telegramBotUrl">
            Telegram-бот (консультация)
          </label>
          <input
            className="admin-control admin-control--input"
            id="telegramBotUrl"
            name="telegramBotUrl"
            defaultValue={settings.telegramBotUrl}
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="telegramChannelUrl">
            Telegram-канал
          </label>
          <input
            className="admin-control admin-control--input"
            id="telegramChannelUrl"
            name="telegramChannelUrl"
            defaultValue={settings.telegramChannelUrl}
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="infoEmail">
            Общий email
          </label>
          <input
            className="admin-control admin-control--input"
            id="infoEmail"
            name="infoEmail"
            defaultValue={settings.infoEmail}
          />
        </div>

        <h2 className="admin-section-title">Юридическая информация</h2>
        <div className="admin-field">
          <label className="admin-field-label" htmlFor="disclaimer">
            Дисклеймер
          </label>
          <textarea
            className="admin-control admin-control--textarea"
            id="disclaimer"
            name="disclaimer"
            rows={3}
            defaultValue={settings.legal.disclaimer}
          />
        </div>
        <div className="admin-field">
          <label className="admin-field-label" htmlFor="companyName">
            ИП / компания
          </label>
          <input
            className="admin-control admin-control--input"
            id="companyName"
            name="companyName"
            defaultValue={settings.legal.companyName}
          />
        </div>
        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="inn">
              ИНН
            </label>
            <input className="admin-control admin-control--input" id="inn" name="inn" defaultValue={settings.legal.inn} />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="ogrnip">
              ОГРНИП
            </label>
            <input
              className="admin-control admin-control--input"
              id="ogrnip"
              name="ogrnip"
              defaultValue={settings.legal.ogrnip}
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn--accent">
            Сохранить
          </button>
        </div>
      </form>
    </>
  )
}
