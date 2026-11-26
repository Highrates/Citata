'use client'

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AdminFlash, AdminSourceBanner } from '@/components/admin/AdminFlash'
import { AdminPendingSubmit } from '@/components/admin/AdminPendingSubmit'
import { useAdminFormDirty } from '@/components/admin/useAdminFormDirty'
import type { SiteSettings } from '@/content/types'
import type { AdminDataSource } from '@/lib/admin/data'
import { saveSiteSettingsAction } from '@/lib/admin/content-actions'

type SettingsFormProps = {
  settings: SiteSettings
  source: AdminDataSource
  saved?: boolean
  error?: string
}

type Snapshot = {
  tagline: string
  heroTitle: string
  telegramBotUrl: string
  telegramChannelUrl: string
  infoEmail: string
  disclaimer: string
  companyName: string
  inn: string
  ogrnip: string
}

function snapshotFrom(settings: SiteSettings): Snapshot {
  return {
    tagline: settings.tagline,
    heroTitle: settings.heroTitle,
    telegramBotUrl: settings.telegramBotUrl,
    telegramChannelUrl: settings.telegramChannelUrl,
    infoEmail: settings.infoEmail,
    disclaimer: settings.legal.disclaimer,
    companyName: settings.legal.companyName,
    inn: settings.legal.inn,
    ogrnip: settings.legal.ogrnip,
  }
}

export function SettingsForm({ settings, source, saved, error }: SettingsFormProps) {
  const baselineRef = useRef(snapshotFrom(settings))
  const [values, setValues] = useState(baselineRef.current)

  useEffect(() => {
    const next = snapshotFrom(settings)
    baselineRef.current = next
    setValues(next)
  }, [settings, saved])

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baselineRef.current),
    [values],
  )
  const { allowLeave } = useAdminFormDirty(dirty)

  function setField<K extends keyof Snapshot>(key: K, value: Snapshot[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function onSubmit(_e: FormEvent<HTMLFormElement>) {
    allowLeave()
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-title">Настройки сайта</h1>
          {dirty ? <p className="admin-muted admin-edit-dirty">Не сохранено</p> : null}
        </div>
      </div>

      <AdminSourceBanner source={source} />
      <AdminFlash saved={saved} error={error} />

      <form className="admin-form admin-form--wide" action={saveSiteSettingsAction} onSubmit={onSubmit}>
        <div className="admin-field">
          <label className="admin-field-label" htmlFor="tagline">
            Слоган
          </label>
          <input
            className="admin-control admin-control--input"
            id="tagline"
            name="tagline"
            value={values.tagline}
            onChange={(e) => setField('tagline', e.target.value)}
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
            value={values.heroTitle}
            onChange={(e) => setField('heroTitle', e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label className="admin-field-label" htmlFor="telegramBotUrl">
            Telegram для консультации
          </label>
          <input
            className="admin-control admin-control--input"
            id="telegramBotUrl"
            name="telegramBotUrl"
            value={values.telegramBotUrl}
            onChange={(e) => setField('telegramBotUrl', e.target.value)}
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
            value={values.telegramChannelUrl}
            onChange={(e) => setField('telegramChannelUrl', e.target.value)}
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
            value={values.infoEmail}
            onChange={(e) => setField('infoEmail', e.target.value)}
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
            value={values.disclaimer}
            onChange={(e) => setField('disclaimer', e.target.value)}
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
            value={values.companyName}
            onChange={(e) => setField('companyName', e.target.value)}
          />
        </div>
        <div className="admin-form-grid-2">
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="inn">
              ИНН
            </label>
            <input
              className="admin-control admin-control--input"
              id="inn"
              name="inn"
              value={values.inn}
              onChange={(e) => setField('inn', e.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-field-label" htmlFor="ogrnip">
              ОГРНИП
            </label>
            <input
              className="admin-control admin-control--input"
              id="ogrnip"
              name="ogrnip"
              value={values.ogrnip}
              onChange={(e) => setField('ogrnip', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-form-actions">
          <AdminPendingSubmit />
          {dirty ? <p className="admin-edit-dirty-hint">Есть несохранённые изменения</p> : null}
        </div>
      </form>
    </>
  )
}
