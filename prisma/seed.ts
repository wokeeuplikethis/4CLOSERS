import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// Студии (город)
// ─────────────────────────────────────────────────────────────

const STUDIOS = [
  {
    slug: 'moscow' as const,
    name: 'БЛИЗКИЕ',
    city: 'Москва',
    address: 'ул. Правды, 24с3',
    phone: '+7 (911) 776-09-94',
    email: 'moscow@4closers.studio',
    telegram: '@closers_moscow',
    vk: 'vk.com/closers_moscow',
    hours: '24/7',
    description:
      'Студия БЛИЗКИЕ в столице — запись вокала, продакшн, сведение.',
    mapUrl: 'https://yandex.ru/maps/213/moscow/',
    latitude: 55.7639,
    longitude: 37.6074,
  },
  {
    slug: 'spb' as const,
    name: 'БЛИЗКИЕ',
    city: 'Санкт-Петербург',
    address: 'ул. 7-я Советская, 20-22',
    phone: '+7 (911) 776-09-94',
    email: 'spb@4closers.studio',
    telegram: '@closers_spb',
    vk: 'vk.com/closers_spb',
    hours: '24/7',
    description:
      'Студия БЛИЗКИЕ в Северной столице — запись вокала, продакшн, сведение.',
    mapUrl: 'https://yandex.ru/maps/2/saint-petersburg/',
    latitude: 59.9311,
    longitude: 30.3609,
  },
]

// ─────────────────────────────────────────────────────────────
// Помещения внутри города
// ─────────────────────────────────────────────────────────────

interface SeedRoom {
  slug: string
  name: string
  description: string
  image: string
  sortOrder: number
}

const ROOMS_MSK: SeedRoom[] = [
  {
    slug: 'pro-room',
    name: 'PRO ROOM',
    description:
      'Премиум-комната: мониторинг, топовые микрофоны, комфортная работа с инженером.',
    image: '/images/moscow/studio/stu1.jpg',
    sortOrder: 0,
  },
  {
    slug: 'light-room',
    name: 'LIGHT ROOM',
    description:
      'Светлая комната для вокала и быстрых демо: микрофон, наушники, уютная атмосфера.',
    image: '/images/moscow/studio/stu2.jpg',
    sortOrder: 1,
  },
]

const ROOMS_SPB: SeedRoom[] = [
  {
    slug: 'main',
    name: 'БЛИЗКИЕ',
    description:
      'Основная студия в Петербурге: запись вокала, продакшн и сведение.',
    image: '/images/spb/studio/stu1.jpg',
    sortOrder: 0,
  },
]

// ─────────────────────────────────────────────────────────────
// Услуги
// roomSlug: null — услуга доступна в любом помещении города.
// requiresSchedule: false — удалённая услуга без даты и времени.
// ─────────────────────────────────────────────────────────────

interface SeedService {
  slug: string
  name: string
  price: number
  duration: number
  features: string[]
  roomSlug: string | null
  requiresSchedule: boolean
}

const SERVICES_MSK: SeedService[] = [
  {
    slug: 'rent-light-room',
    name: 'Аренда LIGHT ROOM',
    price: 850,
    duration: 60,
    features: ['Комната для записи', 'Микрофон и наушники', 'Без звукорежиссёра'],
    roomSlug: 'light-room',
    requiresSchedule: true,
  },
  {
    slug: 'rent-pro-room',
    name: 'Аренда PRO ROOM',
    price: 1200,
    duration: 60,
    features: ['Комната с мониторингом', 'Премиум-микрофоны', 'Без звукорежиссёра'],
    roomSlug: 'pro-room',
    requiresSchedule: true,
  },
  {
    slug: 'recording-engineer',
    name: 'Запись со звукорежем',
    price: 2500,
    duration: 60,
    features: ['Инженер в комнате', 'Правка по ходу', 'Черновой микс в наушниках'],
    roomSlug: null,
    requiresSchedule: true,
  },
  {
    slug: 'mixing',
    name: 'Сведение',
    price: 8000,
    duration: 0,
    features: ['Баланс и глубина', 'Аналог и цифра', 'Неограниченные правки'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'beat-custom',
    name: 'Бит на заказ',
    price: 8000,
    duration: 0,
    features: ['Индивидуальный бит', '2 правки', 'Стемы в комплекте'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'mastering',
    name: 'Мастеринг',
    price: 2000,
    duration: 0,
    features: ['Финальный мастер', 'Под стриминги', 'Под клуб и винил'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'distribution',
    name: 'Дистрибуция',
    price: 2000,
    duration: 0,
    features: ['Spotify / Apple Music', 'VK Music / Яндекс', 'ISRC / UPC'],
    roomSlug: null,
    requiresSchedule: false,
  },
]

const SERVICES_SPB: SeedService[] = [
  {
    slug: 'rent',
    name: 'Аренда',
    price: 1000,
    duration: 60,
    features: ['Комната для записи', 'Микрофон и наушники', 'Без звукорежиссёра'],
    roomSlug: 'main',
    requiresSchedule: true,
  },
  {
    slug: 'recording-engineer',
    name: 'Запись со звукорежем',
    price: 2000,
    duration: 60,
    features: ['Инженер в комнате', 'Правка по ходу', 'Черновой микс в наушниках'],
    roomSlug: null,
    requiresSchedule: true,
  },
  {
    slug: 'mixing',
    name: 'Сведение',
    price: 6000,
    duration: 0,
    features: ['Баланс и глубина', 'Аналог и цифра', 'Неограниченные правки'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'beat-custom',
    name: 'Бит на заказ',
    price: 6000,
    duration: 0,
    features: ['Индивидуальный бит', '2 правки', 'Стемы в комплекте'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'mastering',
    name: 'Мастеринг',
    price: 2000,
    duration: 0,
    features: ['Финальный мастер', 'Под стриминги', 'Под клуб и винил'],
    roomSlug: null,
    requiresSchedule: false,
  },
  {
    slug: 'distribution',
    name: 'Дистрибуция',
    price: 2000,
    duration: 0,
    features: ['Spotify / Apple Music', 'VK Music / Яндекс', 'ISRC / UPC'],
    roomSlug: null,
    requiresSchedule: false,
  },
]

// ─────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────

async function upsertStudio(s: (typeof STUDIOS)[number]) {
  const data = {
    name: s.name,
    city: s.city,
    address: s.address,
    phone: s.phone,
    email: s.email,
    telegram: s.telegram,
    vk: s.vk,
    hours: s.hours,
    description: s.description,
    mapUrl: s.mapUrl,
    latitude: s.latitude,
    longitude: s.longitude,
  }

  return prisma.studio.upsert({
    where: { slug: s.slug },
    update: data,
    create: { slug: s.slug, ...data },
  })
}

async function upsertRooms(studioId: string, rooms: SeedRoom[]) {
  const ids = new Map<string, string>()

  for (const room of rooms) {
    const saved = await prisma.room.upsert({
      where: { studioId_slug: { studioId, slug: room.slug } },
      update: {
        name: room.name,
        description: room.description,
        image: room.image,
        sortOrder: room.sortOrder,
        isActive: true,
      },
      create: {
        studioId,
        slug: room.slug,
        name: room.name,
        description: room.description,
        image: room.image,
        sortOrder: room.sortOrder,
        isActive: true,
      },
    })
    ids.set(room.slug, saved.id)
  }

  return ids
}

async function upsertServices(
  studioId: string,
  services: SeedService[],
  roomIds: Map<string, string>,
  cityLabel: string
) {
  // Удаляем услуги этой студии, которых нет в новом списке,
  // чтобы не осталось старых «Запись в час» и т.п.
  await prisma.service.deleteMany({
    where: {
      studioId,
      slug: { notIn: services.map((s) => s.slug) },
    },
  })

  for (let i = 0; i < services.length; i++) {
    const s = services[i]
    const roomId = s.roomSlug ? roomIds.get(s.roomSlug) ?? null : null

    const data = {
      name: s.name,
      price: s.price,
      duration: s.duration,
      features: s.features,
      sortOrder: i,
      isActive: true,
      roomId,
      requiresSchedule: s.requiresSchedule,
      description: `${s.name} — ${cityLabel}.`,
    }

    await prisma.service.upsert({
      where: { studioId_slug: { studioId, slug: s.slug } },
      update: data,
      create: {
        studioId,
        slug: s.slug,
        ...data,
      },
    })
  }
}

async function main() {
  console.log('▶ Seed: studios + rooms + services')

  // МСК
  const moscow = await upsertStudio(STUDIOS[0])
  console.log(`  ✓ studio: ${moscow.slug} (${moscow.name})`)
  const moscowRooms = await upsertRooms(moscow.id, ROOMS_MSK)
  console.log(`  ✓ rooms MSK: ${moscowRooms.size}`)
  await upsertServices(moscow.id, SERVICES_MSK, moscowRooms, 'Москва')
  console.log(`  ✓ services MSK: ${SERVICES_MSK.length}`)

  // СПБ
  const spb = await upsertStudio(STUDIOS[1])
  console.log(`  ✓ studio: ${spb.slug} (${spb.name})`)
  const spbRooms = await upsertRooms(spb.id, ROOMS_SPB)
  console.log(`  ✓ rooms SPB: ${spbRooms.size}`)
  await upsertServices(spb.id, SERVICES_SPB, spbRooms, 'Санкт-Петербург')
  console.log(`  ✓ services SPB: ${SERVICES_SPB.length}`)

  console.log('\n✓ Готово. Артисты, оборудование, отзывы, юзеры не тронуты.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
