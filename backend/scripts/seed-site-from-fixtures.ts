/**
 * Импорт фикстур настроек сайта в Payload global.
 * Запуск: npm run seed:site
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') })
import { siteSettings } from '../src/content/site.js'
import { mapSiteSettingsToPayloadData } from '../src/lib/map-site.js'
import { getPayload } from 'payload'
import config from '../src/payload.config.js'
import { ensureMedia } from './lib/ensure-media.js'

type AssetKey = keyof typeof siteSettings.assets

async function main() {
  const payload = await getPayload({ config })

  const assetIds: Partial<Record<AssetKey, number>> = {}
  const assetEntries = Object.entries(siteSettings.assets) as [AssetKey, string][]

  for (const [key, url] of assetEntries) {
    assetIds[key] = await ensureMedia(payload, url, key)
  }

  const data = mapSiteSettingsToPayloadData(siteSettings, assetIds)

  await payload.updateGlobal({
    slug: 'site-settings',
    data,
  })

  console.log('✓ Site settings seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
