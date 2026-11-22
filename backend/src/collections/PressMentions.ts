import type { CollectionConfig } from 'payload'

import { anyone } from '../access'
import { revalidatePressMention, revalidatePressMentionDelete } from '../hooks/revalidatePress'

export const PressMentions: CollectionConfig = {
  slug: 'press-mentions',
  labels: {
    singular: 'Публикация о нас',
    plural: 'Публикации о нас',
  },
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'source', 'sortOrder', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidatePressMention],
    afterDelete: [revalidatePressMentionDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Заголовок',
    },
    {
      name: 'source',
      type: 'text',
      required: true,
      label: 'Издание',
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Ссылка',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Порядок',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
