import type { Case } from './types'

const CDN = 'https://cdn.prod.website-files.com/6624004eba739a7d48403ddb'
const TG = '/images/cases'

export const cases: Case[] = [
  {
    slug: 'krasnopolyanskaya-kosmetika',
    title: 'Краснополянская косметика',
    year: 2022,
    cover: `${CDN}/680fd515341f105f31056ab1_PR%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%8F%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BA%D0%BE%D1%81%D0%BC%D0%B5%D1%82%D0%B8%D0%BA%D0%B0.jpg`,
    coverAlt: 'Краснополянская косметика — PR-кейс ЦИТАТА',
    summary:
      'Информационная поддержка во время кризиса. «Краснополянская косметика» сохранила бизнес после суда и получила новых клиентов.',
    heroTitle:
      'Информационная поддержка во время кризиса. «Краснополянская косметика» сохранила бизнес после суда и получила новых клиентов',
    featured: true,
    homeOrder: 13,
    sortOrder: 8,
    blocks: [
      { type: 'heading', level: 'h2', text: 'Цель PR-кампании' },
      {
        type: 'paragraph',
        text: 'Предать массовой огласке действия Генпрокуратуры по изъятию земель и привлечь внимание федеральных СМИ.',
      },
      { type: 'heading', level: 'h4', text: 'Контекст' },
      {
        type: 'paragraph',
        text: 'Популярный бренд из Сочи «Краснополянская косметика» работает на beauty-рынке более 15 лет. В 2018 компания приобрела право долгосрочной аренды на земельный участок в Адлерском районе, где создала ферму для выращивания и переработки сырья для косметики.',
      },
      {
        type: 'paragraph',
        text: 'В августе 2022 она получила иск от Генпрокуратуры об изъятии участка: основание — «отсутствие сельскохозяйственной деятельности». Суд отклонял представляемые доказательства об обратном. В такой же ситуации оказались еще 140 земельных участков с территорией в более чем 1500 га.',
      },
      { type: 'heading', level: 'h2', text: 'Новости об иске' },
      {
        type: 'paragraph',
        text: 'Мы действовали оперативно и освещали процесс в режиме реального времени. Разместили новости об иске и позиции компании в информационных агентствах и федеральных изданиях уровня Tier-1.',
      },
      {
        type: 'paragraph',
        text: 'Получили поддержку Телеграм-канала «Осторожно, новости» от редакции Ксении Собчак. Пост с новостью набрал 427К просмотров.',
      },
      { type: 'heading', level: 'h2', text: 'Что в результате' },
      {
        type: 'metrics',
        title: 'За 1.5 месяца',
        items: [
          { value: '80+', label: 'публикаций в СМИ о проблеме' },
          { value: '24,3 млн', label: 'суммарный охват публикаций' },
          { value: '68%', label: 'рост брендовых запросов' },
          { value: '29', label: 'новостей об итогах заседания суда на следующий день' },
        ],
      },
      {
        type: 'paragraph',
        text: '«Краснополянская косметика» продолжила свою работу и увеличила лояльность аудитории в социальных сетях. Публикации стали инструментом для привлечения новой аудитории и клиентов.',
      },
    ],
  },
  {
    slug: 'hollyshop',
    title: 'hollyshop',
    cover: `${CDN}/680fda25ce3505d72faf1da2_hollyshop%201-2.jpg`,
    coverAlt: 'hollyshop — PR-кейс ЦИТАТА',
    featured: true,
    homeOrder: 8,
    sortOrder: 3,
    year: 2024,
    summary: 'PR hollyshop: Forbes, городские интеграции, стор в Петербурге, запуски epii и VK Tusa.',
    heroTitle: 'PR hollyshop: от Forbes до ёлок, сторов и инфлюенс-вечеринок',
    blocks: [
      {
        type: 'paragraph',
        text: 'Комплексная PR-поддержка hollyshop: СМИ, инфлюенсеры, спецпроекты и интеграции, которые усиливают позиции бренда на рынке корейской косметики.',
      },
      { type: 'heading', level: 'h2', text: 'Год с Forbes' },
      {
        type: 'paragraph',
        text: 'Мультиформатное взаимодействие с Forbes: подкаст «Делай бизнес», интервью-кейс об истории компании («Как семья из Сибири выручила больше 800 млн рублей на корейской косметике»), новость о проекте «РАС:скажи как он умеет» и участие Кристины Тишковой в рубрике «Зажмурься и делай». Итог — номинация на премию «Герои Forbes» в категории «Преодоление».',
      },
      { type: 'heading', level: 'h2', text: 'Новогодняя ёлка на Тверском' },
      {
        type: 'paragraph',
        text: 'В рамках «Путешествия в Рождество» hollyshop стал частью главного зимнего события Москвы: брендированная ёлка на Тверском бульваре, бьюти-квест, мастер-класс, эко-акция и UGC без агрессивного пуша.',
      },
      { type: 'heading', level: 'h2', text: 'Стор в Петербурге' },
      {
        type: 'paragraph',
        text: 'Открытие двухэтажного концепт-стора на Петроградке: уход и декоративная косметика, ИИ-анализатор кожи. Команда агентства сопровождала инфоповод и фиксировала ажиотаж вокруг запуска.',
      },
      { type: 'heading', level: 'h2', text: 'epii Know What’s Good' },
      {
        type: 'paragraph',
        text: 'Вечер запуска корейского бренда epii в России в SVOY Хамовники: иммерсивные станции, секретное выступление Zivert и приглашение глянца — Москвичка, РБК Стиль, The Blueprint, LLUK, Beauty Insider, Москвич Mag.',
      },
      { type: 'heading', level: 'h2', text: 'VK Tusa 4.0' },
      {
        type: 'paragraph',
        text: 'Партнёрство на закрытой вечеринке для 600+ блогеров с аудиторией 30+ млн: поп-ап hollyshop в эстетике ванной комнаты, активности и фотозона в центре инфлюенс-тусовки.',
      },
    ],
  },
  {
    slug: 'kantor-jewelry',
    title: 'Kantor Jewelry',
    cover: `${CDN}/680fdcc858f191ccde2e55aa_Larion%20Kantor%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    coverAlt: 'Kantor Jewelry — PR-кейс ЦИТАТА',
    featured: true,
    homeOrder: 11,
    sortOrder: 6,
    year: 2024,
    summary: 'PR-кампания для ювелирного бренда Kantor Jewelry: публикации в федеральных и lifestyle-изданиях.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Позиционирование ювелирного бренда Kantor Jewelry через публикации в СМИ, коллаборации и работу с лидерами мнений.',
      },
    ],
  },
  {
    slug: 'tvoe-mesto',
    title: 'Твое место',
    cover: `${CDN}/680fe07dab336d938f305066_%D0%A2%D0%B2%D0%BE%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%BE%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    coverAlt: 'Твое место — PR-кейс ЦИТАТА',
    featured: true,
    homeOrder: 12,
    sortOrder: 7,
    year: 2024,
    summary: 'PR-сопровождение проекта «Твое место».',
    blocks: [
      {
        type: 'paragraph',
        text: 'Информационная поддержка проекта: медийные интеграции, работа с лидерами мнений и спецпроекты.',
      },
    ],
  },
  {
    slug: 'bohicare',
    title: 'Bohicare',
    cover: `${CDN}/681a5ee53c233fa947223ebb_influencers%20aesthetic.jpg`,
    coverAlt: 'Bohicare — PR-кейс ЦИТАТА',
    featured: true,
    homeOrder: 9,
    sortOrder: 4,
    year: 2024,
    summary: 'PR Bohicare: кушоны, адвент и рост в beauty-медиа.',
    heroTitle: 'Bohicare: декоративная линейка и адвент в топ-подборках',
    blocks: [
      {
        type: 'paragraph',
        text: 'PR-сопровождение Bohicare: коллаборации, публикации в beauty- и lifestyle-изданиях и запуск декоративной линейки.',
      },
      { type: 'heading', level: 'h2', text: 'Запуск кушонов' },
      {
        type: 'paragraph',
        text: 'PR-кампания первой декоративной линейки бренда: 15+ публикаций в топ-СМИ и digital-медиа, охват около 500 тыс. пользователей и рост брендовых запросов. Обзор Flacon Mag / «Золотого яблока» закрепил третий солдаут кампании.',
      },
      {
        type: 'metrics',
        title: 'Кушоны Bohicare',
        items: [
          { value: '15+', label: 'публикаций в топ-СМИ и digital' },
          { value: '500 тыс.', label: 'охват аудитории' },
        ],
      },
      { type: 'heading', level: 'h2', text: 'Advent Calendar 2025' },
      {
        type: 'paragraph',
        text: 'Лимитированный адвент попал в подборки лучших зимних подарков: Marie Claire, Woman.ru, The Day и RBC Style.',
      },
    ],
  },
  {
    slug: 'delay-kak-kouch',
    title: 'Презентация книги «Делай как Коуч»',
    cover: `${CDN}/680e3e4d5b46e54492ef8dd8_advent_hollyshop-PR%20%D0%90%D0%B3%D0%B5%D0%BD%D1%82%D1%81%D1%82%D0%B2%D0%BE%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.png`,
    coverAlt: 'Презентация книги Делай как Коуч',
    featured: true,
    homeOrder: 7,
    sortOrder: 2,
    year: 2024,
    summary: 'PR-поддержка презентации книги «Делай как Коуч».',
    blocks: [
      {
        type: 'paragraph',
        text: 'Организация информационного повода и публикации в СМИ в поддержку выхода книги.',
      },
    ],
  },
  {
    slug: 'ayskro',
    title: 'АйсКро',
    cover: `${CDN}/680faf84fe00f290572cfeaf_kantor%20x%20%D1%86%D0%B8%D1%82%D0%B0%D1%82%D0%B0%20pr.png`,
    coverAlt: 'АйсКро — PR-кейс ЦИТАТА',
    featured: true,
    homeOrder: 6,
    sortOrder: 1,
    year: 2023,
    summary: 'PR-кампания для бренда АйсКро.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Медийная поддержка бренда: публикации, спецпроекты и работа с лидерами мнений.',
      },
    ],
  },
  {
    slug: 'delay-kak-kouch-pr',
    title: 'Делай как коуч, PR поддержка',
    cover: `${CDN}/680e3e4d5b46e54492ef8dd8_advent_hollyshop-PR%20%D0%90%D0%B3%D0%B5%D0%BD%D1%82%D1%81%D1%82%D0%B2%D0%BE%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.png`,
    coverAlt: 'Делай как коуч PR',
    sortOrder: 5,
    year: 2024,
    summary: 'Долгосрочное PR-сопровождение проекта.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Комплексное PR-сопровождение: регулярные публикации, экспертные колонки и медийные интеграции.',
      },
    ],
  },
  {
    slug: 'ras-skazhi-kak-on-umeet',
    title: '«РАС:скажи, как он умеет»',
    cover: `${CDN}/680fd515341f105f31056ab1_PR%20%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%8F%D0%BD%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BA%D0%BE%D1%81%D0%BC%D0%B5%D1%82%D0%B8%D0%BA%D0%B0.jpg`,
    coverAlt: 'РАС:скажи, как он умеет',
    sortOrder: 9,
    year: 2023,
    summary: 'PR-поддержка социального проекта.',
    blocks: [
      {
        type: 'paragraph',
        text: 'Информационная кампания проекта: освещение в СМИ и работа с экспертным сообществом.',
      },
    ],
  },
  {
    slug: 'divnica',
    title: 'Дивница',
    year: 2025,
    cover: `${CDN}/680fe07dab336d938f305066_%D0%A2%D0%B2%D0%BE%D0%B5%20%D0%BC%D0%B5%D1%81%D1%82%D0%BE%20x%20%D0%A6%D0%B8%D1%82%D0%B0%D1%82%D0%B0.jpg`,
    coverAlt: 'Дивница — PR-кейс',
    featured: true,
    homeOrder: 15,
    sortOrder: 10,
    summary: 'Дивница: открытие в Москве, The Blueprint и победа RE.AWARDS.',
    heroTitle: 'Дивница — новое русское спа в медиа и премиях',
    blocks: [
      {
        type: 'paragraph',
        text: 'Медийная поддержка «Дивницы»: открытия, lifestyle-подборки и федеральные wellness-премии.',
      },
      { type: 'heading', level: 'h2', text: 'Открытие в Москве' },
      {
        type: 'paragraph',
        text: 'Информационное сопровождение запуска московской студии — инфоповод, который держал город в разговорах о новом русском спа.',
      },
      { type: 'heading', level: 'h2', text: 'The Blueprint' },
      {
        type: 'paragraph',
        text: 'Дивница в подборке The Blueprint «Лучший расслабляющий массаж в Москве» — редакционный визит и живой отзыв о сервисе.',
      },
      { type: 'heading', level: 'h2', text: 'RE.AWARDS 2025' },
      {
        type: 'paragraph',
        text: 'Победа в номинации «Лучшая студия массажа» главной федеральной wellness-премии — в разгар московского открытия.',
      },
    ],
  },
  {
    slug: 'podrugomu',
    title: 'PODRUGOMU',
    year: 2026,
    cover: `${TG}/podrugomu.jpg`,
    coverAlt: 'PODRUGOMU — PR-кейс ЦИТАТА',
    summary: 'Дизайн-бюро премиальных интерьеров: Sostav, Дом Mail и INMYROOM с охватом 6,9 млн.',
    heroTitle: 'PODRUGOMU: ремонт без нервного тика — и с федеральным охватом',
    featured: true,
    homeOrder: 23,
    sortOrder: 18,
    blocks: [
      {
        type: 'paragraph',
        text: 'PODRUGOMU — дизайн-бюро полного цикла для премиальных жилых интерьеров. Основатели Анастасия и Иван Агальцовы делают ремонт управляемым процессом без ломки привычного уклада жизни клиента.',
      },
      { type: 'heading', level: 'h2', text: 'Медиарезультаты' },
      {
        type: 'paragraph',
        text: 'Публикация в Sostav о подходе бюро и две материалы с совокупным охватом 6,9 млн: Дом Mail — про функциональный интерьер без ощущения тесноты; INMYROOM — про инженерию и хранение как часть архитектуры.',
      },
      {
        type: 'metrics',
        title: 'Охват',
        items: [
          { value: '6,9 млн', label: 'совокупный охват двух публикаций' },
          { value: '3', label: 'ключевых медиа: Sostav, Дом Mail, INMYROOM' },
        ],
      },
    ],
  },
  {
    slug: 'remez',
    title: 'REMEZ',
    year: 2026,
    cover: `${TG}/remez.jpg`,
    coverAlt: 'REMEZ — PR-кейс ЦИТАТА',
    summary: 'Инженерный бренд бытовой техники: Forbes, beauty-подборки Model S и сцена Tech Week.',
    heroTitle: 'REMEZ: история основателя, продукт в подборках и экспертность на сцене',
    featured: true,
    homeOrder: 22,
    sortOrder: 17,
    blocks: [
      {
        type: 'paragraph',
        text: 'PR-сопровождение REMEZ — от большой истории основателя Игоря Ремеза до продуктовых инфоповодов в beauty- и lifestyle-медиа.',
      },
      { type: 'heading', level: 'h2', text: 'Forbes' },
      {
        type: 'paragraph',
        text: 'Материал об истории бренда REMEZ для многомиллионной аудитории Forbes: глубина фактов и живая подача личности основателя.',
      },
      { type: 'heading', level: 'h2', text: 'Фен Model S в подборках' },
      {
        type: 'paragraph',
        text: 'Model S в дайджестах Buro, Beauty Insider и U Magazine — важный pre-holiday пуш. Параллельно основатель дал комментарий рынку фенов и стайлеров для «Инк».',
      },
      { type: 'heading', level: 'h2', text: 'Tech Week' },
      {
        type: 'paragraph',
        text: 'Выступление операционного директора Екатерины Коныгиной о адаптации продаж и сервиса в условиях неопределенности.',
      },
    ],
  },
  {
    slug: 'askmask',
    title: 'AskMask',
    year: 2026,
    cover: `${TG}/askmask.jpg`,
    coverAlt: 'AskMask — PR-кейс ЦИТАТА',
    summary: 'Дистрибьютор и бренд-билдер в beauty: InterCHARM, печать «Ведомостей» и Tech Week.',
    heroTitle: 'AskMask: сцена, печать и запуск собственных брендов',
    featured: true,
    homeOrder: 21,
    sortOrder: 16,
    blocks: [
      {
        type: 'paragraph',
        text: 'AskMask — команда Анны и Лидии, которая привозит корейский beauty в Россию и запускает собственные марки. Мы выстраиваем для них экспертную и продуктовую медийность.',
      },
      { type: 'heading', level: 'h2', text: 'InterCHARM' },
      {
        type: 'paragraph',
        text: 'На выставке с аудиторией около 100 тыс. посетителей организовали выступление в деловой программе о запуске Systra Code и презентацию бренда Aumente на стенде.',
      },
      { type: 'heading', level: 'h2', text: 'Печатные «Ведомости»' },
      {
        type: 'paragraph',
        text: 'Эссенция DR. CEURACLE вышла в октябрьском номере «Как потратить» от «Ведомостей» — в подборке самых эффектных beauty-новинок.',
      },
      { type: 'heading', level: 'h2', text: 'Tech Week' },
      {
        type: 'paragraph',
        text: 'Два доклада в потоке «Ритейл»: эмоции покупателей в цифрах и ИИ в beauty-бизнесе — от локализации до ассортимента.',
      },
    ],
  },
  {
    slug: 'jcos',
    title: 'JCos',
    year: 2026,
    cover: `${TG}/jcos.jpg`,
    coverAlt: 'JCos — PR-кейс ЦИТАТА',
    summary: 'Корейская декоративная косметика: запуск в медиа, дайджесты и коллаборация с Aquamarine.',
    heroTitle: 'JCos: умные формулы, медиа и лучшая коллаборация ресторана',
    featured: true,
    homeOrder: 20,
    sortOrder: 15,
    blocks: [
      {
        type: 'paragraph',
        text: 'JCos — декоративная корейская косметика основателей Юли Родочинской и Артёма Азевича. Производство на одном из ТОП-10 заводов Южной Кореи, ставка на умные формулы и минимализм упаковки.',
      },
      { type: 'heading', level: 'h2', text: 'Старт с BB-кремом' },
      {
        type: 'paragraph',
        text: 'Знакомство бьюти-редакторов с хитом Instant Ideal Skin SPF 30 PA+++. Публикации в TimeOut и U magazine после тестирования продукта.',
      },
      { type: 'heading', level: 'h2', text: 'Два месяца медиа' },
      {
        type: 'paragraph',
        text: 'Серия медиасобытий и коллаборация с Aquamarine Аркадия Новикова — по словам ресторана, лучшая коллаборация, которую они проводили.',
      },
    ],
  },
  {
    slug: 'bezumno-krutaya-shaurma',
    title: 'Безумно. Крутая шаурма',
    year: 2026,
    cover: `${TG}/bezumno-krutaya-shaurma.jpg`,
    coverAlt: 'Безумно. Крутая шаурма — PR-кейс ЦИТАТА',
    summary: 'История франчайзинговой сети в Forbes: от точки в Томске до 70+ филиалов и 1,3 млрд выручки.',
    heroTitle: '«Безумно. Крутая шаурма» — история масштаба на страницах Forbes',
    featured: true,
    homeOrder: 19,
    sortOrder: 14,
    blocks: [
      {
        type: 'paragraph',
        text: 'Основатели Евгений Голов и Давид Калицев за шесть лет выросли из маленькой точки в Томске во франчайзинговую сеть из более 70 филиалов по России с выручкой 1,3 млрд рублей.',
      },
      { type: 'heading', level: 'h2', text: 'Forbes' },
      {
        type: 'paragraph',
        text: 'Большой материал об истории бренда: рецепт масштаба — продукт, маркетинг и ответственный подход к развитию. Экспертные мнения рынка — в карточках, полная история — на страницах Forbes.',
      },
      {
        type: 'metrics',
        title: 'Масштаб бренда',
        items: [
          { value: '70+', label: 'филиалов по России' },
          { value: '1,3 млрд ₽', label: 'выручка' },
          { value: '6 лет', label: 'от первой точки до федеральной сети' },
        ],
      },
    ],
  },
  {
    slug: 'drug',
    title: '«Друг»',
    year: 2026,
    cover: `${TG}/drug.jpg`,
    coverAlt: 'Сервис «Друг» — PR-кейс ЦИТАТА',
    summary: 'PetTech-платформа адопции животных: запуск и интервью основательницы в BURO.',
    heroTitle: '«Друг» — PetTech с доброй миссией в федеральных медиа',
    featured: true,
    homeOrder: 18,
    sortOrder: 13,
    blocks: [
      {
        type: 'paragraph',
        text: '«Друг» — платформа для быстрого поиска и пристройства бездомных животных. Стартап на стыке цифровых сервисов и новой культуры обращения с животными: волонтёры, приюты и будущие владельцы в одном сервисе.',
      },
      { type: 'heading', level: 'h2', text: 'BURO.' },
      {
        type: 'paragraph',
        text: 'Интервью основательницы Алёны Меркуловой: как создавалась платформа, как она работает и почему у PetTech в России большое будущее.',
      },
    ],
  },
  {
    slug: 'mr-2',
    title: 'MR-2',
    year: 2026,
    cover: `${TG}/mr-2.jpg`,
    coverAlt: 'Вездеход MR-2 — PR-кейс ЦИТАТА',
    summary: 'Эксклюзив в «Известиях» о серийном вездеходе нового поколения Иркутского завода.',
    heroTitle: 'MR-2: первое серийное производство вездехода нового поколения',
    featured: true,
    homeOrder: 17,
    sortOrder: 12,
    blocks: [
      {
        type: 'paragraph',
        text: 'MR-2 — разработка Иркутского завода гусеничной техники под руководством инженера и предпринимателя Александра Горина. Вездеход для бездорожья: лес, болото, туризм, нефтегаз и спасательные операции.',
      },
      { type: 'heading', level: 'h2', text: 'Известия' },
      {
        type: 'paragraph',
        text: 'Эксклюзивная инфоподдержка: три новости в разных разделах издания, обзорный материал и ролик о разработке на телеканале «Известия».',
      },
      {
        type: 'metrics',
        title: 'Результат',
        items: [
          { value: '3', label: 'новости в разных разделах «Известий»' },
          { value: '1', label: 'ролик на телеканале «Известия»' },
        ],
      },
    ],
  },
  {
    slug: 'linen-texture',
    title: 'Linen Texture',
    year: 2025,
    cover: `${TG}/linen-texture.jpg`,
    coverAlt: 'Linen Texture — PR-кейс ЦИТАТА',
    summary: 'Домашний текстиль: финал и победа RE.AWARDS как лучший бренд текстиля для дома.',
    heroTitle: 'Linen Texture — лучший бренд текстиля для дома по версии RE.AWARDS',
    featured: true,
    homeOrder: 16,
    sortOrder: 11,
    blocks: [
      {
        type: 'paragraph',
        text: 'Linen Texture — бренд текстиля для дома. Мы вели медийную поддержку на пути к главной федеральной wellness-премии.',
      },
      { type: 'heading', level: 'h2', text: 'RE.AWARDS 2025' },
      {
        type: 'paragraph',
        text: 'Сначала — финал в топ-5 номинации «Лучший бренд текстиля для дома», затем победа по версии жюри премии.',
      },
      {
        type: 'list',
        title: 'Также в поле зрения',
        items: ['Участие в премии «Сделано в России — 2025» в номинации «Мода»'],
      },
    ],
  },
]
