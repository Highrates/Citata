import type { Access } from 'payload'

/** Публичное чтение (фронт → REST) */
export const anyone: Access = () => true

/** Запись / удаление только с авторизацией (API key или сессия) */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)

/** Чтение только опубликованных документов */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    status: {
      equals: 'published',
    },
  }
}
