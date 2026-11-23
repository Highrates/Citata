import type { CollectionConfig } from 'payload'

import { authenticated, publishedOnly } from '../access'
import { revalidateArticle, revalidateArticleDelete } from '../hooks/revalidateArticle'

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: 'Статья',
    plural: 'Статьи',
  },
  access: {
    read: publishedOnly,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidateArticle],
    afterDelete: [revalidateArticleDelete],
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
        description: 'Первое фото или видео — обложка статьи',
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
      label: 'Текст статьи (HTML)',
      admin: {
        description: 'Основной текст статьи (RichBlock)',
      },
    },
    {
      name: 'sections',
      type: 'blocks',
      label: 'Содержание (legacy)',
      required: false,
      admin: {
        description: 'Устаревшие секции — предпочтителен HTML в description',
      },
      blocks: [
        {
          slug: 'paragraph',
          labels: { singular: 'Абзац', plural: 'Абзацы' },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              label: 'Текст',
            },
          ],
        },
        {
          slug: 'heading',
          labels: { singular: 'Заголовок', plural: 'Заголовки' },
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
              label: 'Текст',
            },
          ],
        },
        {
          slug: 'quote',
          labels: { singular: 'Цитата', plural: 'Цитаты' },
          fields: [
            {
              name: 'text',
              type: 'textarea',
              required: true,
              label: 'Текст',
            },
          ],
        },
        {
          slug: 'list',
          labels: { singular: 'Список', plural: 'Списки' },
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                  label: 'Пункт',
                },
              ],
            },
          ],
        },
      ],
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
