import assert from 'node:assert/strict'
import test from 'node:test'
import { siteSettings } from '@/content/site'
import { validateSiteSettings } from '@/content/site-model'
import {
  mapPayloadSiteSettingsToSiteSettings,
  mapSiteSettingsToPayloadData,
} from '@/lib/map-site'
import type { SiteSetting } from '@/payload-types'

test('fixture site settings conform to canonical model', () => {
  assert.deepEqual(validateSiteSettings(siteSettings), [])
  assert.equal(siteSettings.mainServices.length, 8)
  assert.equal(siteSettings.extraServices.length, 8)
})

test('mapSiteSettingsToPayloadData preserves scalar and service fields', () => {
  const payloadData = mapSiteSettingsToPayloadData(siteSettings, {
    logo: 1,
    logoFooter: 2,
    arrow: 3,
    comma: 4,
    prHero: 5,
    tgIcon: 6,
  })

  assert.equal(payloadData.tagline, siteSettings.tagline)
  assert.equal(payloadData.heroTitle, siteSettings.heroTitle)
  assert.equal(payloadData.mainServices.length, 8)
  assert.equal(payloadData.assets?.logo, 1)
})

test('mapPayloadSiteSettingsToSiteSettings resolves assets and services', () => {
  const doc = {
    id: 1,
    tagline: 'Слоган',
    agencyTitle: 'Агентство',
    heroTitle: 'Hero',
    heroSubtitle: 'PR',
    aboutText: 'О нас',
    telegramBotUrl: 'https://t.me/bot',
    telegramChannelUrl: 'https://t.me/channel',
    infoEmail: 'info@test.ru',
    assets: {
      logo: { id: 1, alt: 'Logo', url: 'https://cdn.example.com/logo.svg', updatedAt: '', createdAt: '' },
    },
    mainServices: [{ title: 'PR-стратегия' }],
    extraServices: [{ title: 'SMM' }],
    aboutStats: { years: 8, brands: 250, reachMillions: 71 },
    contacts: [{ name: 'Имя', role: 'CEO', email: 'a@b.ru' }],
    legal: {
      disclaimer: 'Дисклеймер',
      companyName: 'ИП',
      inn: '123',
      ogrnip: '456',
    },
    updatedAt: '',
    createdAt: '',
  } as SiteSetting

  const mapped = mapPayloadSiteSettingsToSiteSettings(doc)
  assert.equal(mapped.tagline, 'Слоган')
  assert.equal(mapped.assets.logo, 'https://cdn.example.com/logo.svg')
  assert.deepEqual(mapped.mainServices, [{ title: 'PR-стратегия' }])
  assert.deepEqual(mapped.extraServices, [{ title: 'SMM' }])
})

test('mapPayloadSiteSettingsToSiteSettings falls back to fixtures for missing assets', () => {
  const doc = {
    id: 1,
    updatedAt: '',
    createdAt: '',
  } as SiteSetting

  const mapped = mapPayloadSiteSettingsToSiteSettings(doc)
  assert.equal(mapped.assets.logo, siteSettings.assets.logo)
  assert.equal(mapped.mainServices.length, siteSettings.mainServices.length)
})
