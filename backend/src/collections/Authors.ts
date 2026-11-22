import type { CollectionConfig } from 'payload'

import { anyone } from '../access'

export const Authors: CollectionConfig = {
  slug: 'authors',
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Имя',
    },
    {
      name: 'role',
      type: 'text',
      label: 'Должность',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото',
    },
  ],
}
