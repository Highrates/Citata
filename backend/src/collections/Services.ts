import type { CollectionConfig } from 'payload'

import { anyone } from '../access'
import { revalidateService, revalidateServiceDelete } from '../hooks/revalidateService'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Услуга',
    plural: 'Услуги',
  },
  access: {
    read: anyone,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sortOrder', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidateService],
    afterDelete: [revalidateServiceDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Название',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL (slug)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Обложка',
      admin: {
        description: 'Превью при наведении на /services',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание (HTML)',
      admin: {
        description: 'Основной текст услуги (RichBlock)',
      },
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
