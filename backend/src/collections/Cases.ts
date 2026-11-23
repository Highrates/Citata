import type { CollectionConfig } from 'payload'

import { authenticated, publishedOnly } from '../access'
import { revalidateCase, revalidateCaseDelete } from '../hooks/revalidateCase'

export const Cases: CollectionConfig = {
  slug: 'cases',
  labels: {
    singular: 'Кейс',
    plural: 'Кейсы',
  },
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'featured', 'sortOrder', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidateCase],
    afterDelete: [revalidateCaseDelete],
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
      name: 'year',
      type: 'number',
      label: 'Год',
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
        description: 'Синхронизируется с первым элементом галереи',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Галерея',
      labels: {
        singular: 'Медиа',
        plural: 'Медиа',
      },
      admin: {
        description: 'Первое фото или видео — обложка кейса',
      },
      fields: [
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Файл',
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Краткое описание',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание (HTML)',
      admin: {
        description: 'Основной текст кейса (RichBlock)',
      },
    },
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Заголовок на странице кейса',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Отображать на главной',
      admin: {
        position: 'sidebar',
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
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
        { label: 'Скрыто', value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
