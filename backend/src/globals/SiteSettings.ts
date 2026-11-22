import type { GlobalConfig } from 'payload'

import { anyone } from '../access'
import { revalidateSiteSettings } from '../hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Настройки сайта',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      name: 'tagline',
      type: 'text',
      label: 'Слоган',
      defaultValue: 'Стратегия. Идея. Запуск. Рост.',
    },
    {
      name: 'agencyTitle',
      type: 'text',
      label: 'Название агентства',
      defaultValue: 'Агентство информационных технологий & коммуникаций',
    },
    {
      name: 'heroTitle',
      type: 'textarea',
      label: 'Заголовок на главной',
    },
    {
      name: 'heroSubtitle',
      type: 'text',
      label: 'Подзаголовок на главной',
      defaultValue: 'PR-агентство',
    },
    {
      name: 'aboutText',
      type: 'textarea',
      label: 'Текст на странице «О нас»',
    },
    {
      name: 'telegramBotUrl',
      type: 'text',
      label: 'Ссылка на Telegram-бот (консультация)',
      defaultValue: 'https://t.me/citata_pr_bot',
    },
    {
      name: 'telegramChannelUrl',
      type: 'text',
      label: 'Ссылка на Telegram-канал',
    },
    {
      name: 'infoEmail',
      type: 'email',
      label: 'Общий email',
      defaultValue: 'info@citata-pr.ru',
    },
    {
      name: 'assets',
      type: 'group',
      label: 'Медиа-ассеты',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media', label: 'Логотип (шапка)' },
        { name: 'logoFooter', type: 'upload', relationTo: 'media', label: 'Логотип (футер)' },
        { name: 'arrow', type: 'upload', relationTo: 'media', label: 'Стрелка CTA' },
        { name: 'comma', type: 'upload', relationTo: 'media', label: 'Запятая (декор)' },
        { name: 'prHero', type: 'upload', relationTo: 'media', label: 'PR-блок на главной' },
        { name: 'tgIcon', type: 'upload', relationTo: 'media', label: 'Иконка Telegram' },
      ],
    },
    {
      name: 'mainServices',
      type: 'array',
      label: 'Основные услуги',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'description', type: 'textarea', label: 'Описание' },
      ],
    },
    {
      name: 'extraServices',
      type: 'array',
      label: 'Дополнительные услуги',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'description', type: 'textarea', label: 'Описание' },
      ],
    },
    {
      name: 'aboutStats',
      type: 'group',
      label: 'Статистика (О нас)',
      fields: [
        { name: 'years', type: 'number', label: 'Лет на рынке', defaultValue: 8 },
        { name: 'brands', type: 'number', label: 'Брендов и экспертов', defaultValue: 250 },
        {
          name: 'reachMillions',
          type: 'number',
          label: 'Охват (млн)',
          defaultValue: 71,
        },
      ],
    },
    {
      name: 'aboutGallery',
      type: 'array',
      label: 'Галерея (О нас)',
      labels: {
        singular: 'Фото',
        plural: 'Фото',
      },
      admin: {
        description: 'Первое фото — основной портрет на странице «О нас»',
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
      name: 'contacts',
      type: 'array',
      label: 'Контакты команды',
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Имя' },
        { name: 'role', type: 'text', label: 'Должность' },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'telegram', type: 'text', label: 'Telegram URL' },
      ],
    },
    {
      name: 'legal',
      type: 'group',
      label: 'Юридическая информация',
      fields: [
        { name: 'companyName', type: 'text', label: 'ИП / компания' },
        { name: 'inn', type: 'text', label: 'ИНН' },
        { name: 'ogrnip', type: 'text', label: 'ОГРНИП' },
        { name: 'disclaimer', type: 'textarea', label: 'Дисклеймер в футере' },
      ],
    },
  ],
}
