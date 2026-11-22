import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

export const getPayloadClient = cache(async () => {
  return getPayload({ config: configPromise })
})

export const publishedWhere = {
  status: {
    equals: 'published',
  },
} as const
