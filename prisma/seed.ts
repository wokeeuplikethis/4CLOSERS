import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/jwt'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// Студии
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
// Услуги
// duration: 60 — только у записей и аренды. Остальным 0 (не показываем).
// ─────────────────────────────────────────────────────────────

interface SeedService {
  slug: string
  name: string
  price: number
  duration: number
  features: string[]
}

const SERVICES_MSK: SeedService[] = [
  {
    slug: 'rent-light-room',
    name: 'Аренда LIGHT ROOM',
    price: 850,
    duration: 60,
    features: ['Комната для записи', 'Микрофон и наушники', 'Без звукорежиссёра'],
  },
  {
    slug: 'rent-pro-room',
    name: 'Аренда PRO ROOM',
    price: 1200,
    duration: 60,
    features: ['Комната с мониторингом', 'Премиум-микрофоны', 'Без звукорежиссёра'],
  },
  {
    slug: 'recording-engineer',
    name: 'Запись со звукорежем',
    price: 2500,
    duration: 60,
    features: ['Инженер в комнате', 'Правка по ходу', 'Черновой микс в наушниках'],
  },
  {
    slug: 'mixing',
    name: 'Сведение',
    price: 8000,
    duration: 0,
    features: ['Баланс и глубина', 'Аналог и цифра', 'Неограниченные правки'],
  },
  {
    slug: 'beat-custom',
    name: 'Бит на заказ',
    price: 8000,
    duration: 0,
    features: ['Индивидуальный бит', '2 правки', 'Стемы в комплекте'],
  },
  {
    slug: 'mastering',
    name: 'Мастеринг',
    price: 2000,
    duration: 0,
    features: ['Финальный мастер', 'Под стриминги', 'Под клуб и винил'],
  },
  {
    slug: 'distribution',
    name: 'Дистрибуция',
    price: 2000,
    duration: 0,
    features: ['Spotify / Apple Music', 'VK Music / Яндекс', 'ISRC / UPC'],
  },
]

const SERVICES_SPB: SeedService[] = [
  {
    slug: 'rent',
    name: 'Аренда',
    price: 1000,
    duration: 60,
    features: ['Комната для записи', 'Микрофон и наушники', 'Без звукорежиссёра'],
  },
  {
    slug: 'recording-engineer',
    name: 'Запись со звукорежем',
    price: 2000,
    duration: 60,
    features: ['Инженер в комнате', 'Правка по ходу', 'Черновой микс в наушниках'],
  },
  {
    slug: 'mixing',
    name: 'Сведение',
    price: 6000,
    duration: 0,
    features: ['Баланс и глубина', 'Аналог и цифра', 'Неограниченные правки'],
  },
  {
    slug: 'beat-custom',
    name: 'Бит на заказ',
    price: 6000,
    duration: 0,
    features: ['Индивидуальный бит', '2 правки', 'Стемы в комплекте'],
  },
  {
    slug: 'mastering',
    name: 'Мастеринг',
    price: 2000,
    duration: 0,
    features: ['Финальный мастер', 'Под стриминги', 'Под клуб и винил'],
  },
  {
    slug: 'distribution',
    name: 'Дистрибуция',
    price: 2000,
    duration: 0,
    features: ['Spotify / Apple Music', 'VK Music / Яндекс', 'ISRC / UPC'],
  },
]

// ─────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────

async function upsertStudio(s: (typeof STUDIOS)[number]) {
  const studio = await prisma.studio.upsert({
    where: { slug: s.slug },
    update: {
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
    },
    create: {
      slug: s.slug,
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
    },
  })
  return studio
}

async function upsertServices(
  studioId: string,
  services: SeedService[],
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
    await prisma.service.upsert({
      where: { studioId_slug: { studioId, slug: s.slug } },
      update: {
        name: s.name,
        price: s.price,
        duration: s.duration,
        features: s.features,
        sortOrder: i,
        isActive: true,
        description: `${s.name} — ${cityLabel}.`,
      },
      create: {
        studioId,
        slug: s.slug,
        name: s.name,
        price: s.price,
        duration: s.duration,
        features: s.features,
        sortOrder: i,
        isActive: true,
        description: `${s.name} — ${cityLabel}.`,
      },
    })
  }
}

async function main() {
  console.log('▶ Seed: studios + services')

  // МСК
  const moscow = await upsertStudio(STUDIOS[0])
  console.log(`  ✓ studio: ${moscow.slug} (${moscow.name})`)
  await upsertServices(moscow.id, SERVICES_MSK, 'Москва')
  console.log(`  ✓ services MSK: ${SERVICES_MSK.length}`)

  // СПБ
  const spb = await upsertStudio(STUDIOS[1])
  console.log(`  ✓ studio: ${spb.slug} (${spb.name})`)
  await upsertServices(spb.id, SERVICES_SPB, 'Санкт-Петербург')
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