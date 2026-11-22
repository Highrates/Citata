import type { Access } from 'payload'

/** Публичное чтение (фронт → REST) */
export const anyone: Access = () => true

/** Чтение только опубликованных документов */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    status: {
      equals: 'published',
    },
  }
}
