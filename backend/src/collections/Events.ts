import type { CollectionConfig } from 'payload'

import { authenticated, publishedOnly } from '../access'
import { revalidateEvent, revalidateEventDelete } from '../hooks/revalidateEvent'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Событие',
    plural: 'События',
  },
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'featured', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidateEvent],
    afterDelete: [revalidateEventDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Заголовок',
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
      name: 'excerpt',
      type: 'textarea',
      label: 'Краткое описание',
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
        description: 'Первое фото или видео — обложка события',
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
      name: 'cases',
      type: 'relationship',
      relationTo: 'cases',
      hasMany: true,
      label: 'Кейсы',
      admin: {
        description: 'Кейсы, к которым относится событие (можно несколько — коллаборации)',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: false,
      label: 'Автор',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: 'Дата публикации',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'readingTime',
      type: 'number',
      label: 'Время чтения (мин)',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Текст события (HTML)',
      admin: {
        description: 'Основной текст (RichBlock)',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Показать на главной',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'homeOrder',
      type: 'number',
      label: 'Порядок на главной',
      admin: {
        position: 'sidebar',
        description: 'Общий слот с кейсами. Появляется при выводе на главную.',
        condition: (_, siblingData) => Boolean(siblingData?.featured),
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликовано', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
