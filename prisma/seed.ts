import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/jwt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.booking.deleteMany()
  await prisma.review.deleteMany()
  await prisma.equipment.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.service.deleteMany()
  await prisma.studio.deleteMany()
  await prisma.user.deleteMany()

  // Create studios
  const moscow = await prisma.studio.create({
    data: {
      slug: 'moscow',
      name: '4CLOSERS STUDIO MOSCOW',
      city: 'Москва',
      address: 'ул. Большая Дмитровка, 15с1',
      phone: '+7 (495) 123-45-67',
      email: 'moscow@4closers.studio',
      telegram: '@closers_moscow',
      vk: 'vk.com/closers_moscow',
      hours: 'Ежедневно 10:00 — 02:00',
      description: 'Флагманская студия в сердце Москвы.',
      mapUrl: 'https://yandex.ru/maps/213/moscow/',
      latitude: 55.7639,
      longitude: 37.6074,
    },
  })

  const spb = await prisma.studio.create({
    data: {
      slug: 'spb',
      name: '4CLOSERS STUDIO SPB',
      city: 'Санкт-Петербург',
      address: 'Невский пр., 82',
      phone: '+7 (812) 987-65-43',
      email: 'spb@4closers.studio',
      telegram: '@closers_spb',
      vk: 'vk.com/closers_spb',
      hours: 'Ежедневно 11:00 — 03:00',
      description: 'Студия на Невском проспекте.',
      mapUrl: 'https://yandex.ru/maps/2/saint-petersburg/',
      latitude: 59.9311,
      longitude: 30.3609,
    },
  })

  // Create demo admin
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@4closers.studio',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: '/images/avatars/admin.jpg',
    },
  })

  // Create demo user
  const userPassword = await hashPassword('user123')
  await prisma.user.create({
    data: {
      name: 'Артём',
      email: 'user@4closers.studio',
      passwordHash: userPassword,
      role: 'USER',
      avatar: '/images/avatars/user.jpg',
    },
  })

  // Services for Moscow
  const servicesMoscow = [
    { slug: 'vocal-recording', name: 'Запись вокала', price: 8000, duration: 120, features: ['Микрофоны премиум', 'Продюсер', 'Экспресс-сведение'] },
    { slug: 'rap-recording', name: 'Запись рэпа', price: 7000, duration: 120, features: ['SM7B, U87', 'Работа с флоу', 'Экспресс-сведение'] },
    { slug: 'mixing', name: 'Сведение', price: 15000, duration: 240, features: ['Аналоговое оборудование', 'Неограниченные правки'] },
    { slug: 'mastering', name: 'Мастеринг', price: 8000, duration: 60, features: ['Стем-мастеринг', 'Оптимизация под платформы'] },
    { slug: 'autotune', name: 'Автотюн', price: 5000, duration: 90, features: ['Melodyne + Auto-Tune', 'Тайминг-коррекция'] },
    { slug: 'production', name: 'Продакшн', price: 35000, duration: 480, features: ['Бит под ключ', 'Полное сведение', 'Права на бит'] },
    { slug: 'sound-design', name: 'Саунд-дизайн', price: 12000, duration: 180, features: ['Уникальные звуки', 'Пресеты', 'Аудио-брендинг'] },
  ]

  for (const s of servicesMoscow) {
    await prisma.service.create({
      data: {
        studioId: moscow.id,
        name: s.name,
        slug: s.slug,
        description: 'Профессиональная услуга в студии.',
        price: s.price,
        duration: s.duration,
        features: s.features,
        sortOrder: servicesMoscow.indexOf(s) + 1,
      },
    })
  }

  // Services for SPB (similar)
  for (const s of servicesMoscow) {
    await prisma.service.create({
      data: {
        studioId: spb.id,
        name: s.name,
        slug: s.slug,
        description: 'Профессиональная услуга в студии СПБ.',
        price: Math.round(s.price * 0.9), // SPB slightly cheaper
        duration: s.duration,
        features: s.features,
        sortOrder: servicesMoscow.indexOf(s) + 1,
      },
    })
  }

  // Portfolio items for Moscow
  const portfolioMoscow = [
    { artist: 'Oxxxymiron', trackTitle: 'Город под подошвой', genre: 'Hip-Hop', coverImage: '/images/moscow/portfolio/oxxy.jpg', isFeatured: true, sortOrder: 1 },
    { artist: 'Noize MC', trackTitle: 'Последний рейс', genre: 'Rap Rock', coverImage: '/images/moscow/portfolio/noize.jpg', isFeatured: true, sortOrder: 2 },
    { artist: 'Miyagi & Andy Panda', trackTitle: 'Captain', genre: 'Reggae Rap', coverImage: '/images/moscow/portfolio/miyagi.jpg', isFeatured: false, sortOrder: 3 },
    { artist: 'Скриптонит', trackTitle: 'Вселенная', genre: 'Experimental', coverImage: '/images/moscow/portfolio/scriptonit.jpg', isFeatured: true, sortOrder: 4 },
  ]

  for (const p of portfolioMoscow) {
    await prisma.portfolioItem.create({
      data: {
        studioId: moscow.id,
        artist: p.artist,
        trackTitle: p.trackTitle,
        genre: p.genre,
        coverImage: p.coverImage,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
      },
    })
  }

  // Portfolio for SPB
  const portfolioSpb = [
    { artist: 'Guf', trackTitle: 'Москва (SPB Version)', genre: 'Hip-Hop', coverImage: '/images/spb/portfolio/guf.jpg', isFeatured: true, sortOrder: 1 },
    { artist: 'Smoky Mo', trackTitle: 'Петербург не спит', genre: 'Storytelling Rap', coverImage: '/images/spb/portfolio/smoky.jpg', isFeatured: true, sortOrder: 2 },
  ]
  for (const p of portfolioSpb) {
    await prisma.portfolioItem.create({
      data: {
        studioId: spb.id,
        artist: p.artist,
        trackTitle: p.trackTitle,
        genre: p.genre,
        coverImage: p.coverImage,
        isFeatured: p.isFeatured,
        sortOrder: p.sortOrder,
      },
    })
  }

  // Equipment for Moscow
  const equipmentMoscow = [
    { category: 'Microphones', name: 'Neumann U 87 Ai', model: 'U 87 Ai', description: 'Легендарный микрофон', image: '/images/moscow/equipment/u87.jpg', sortOrder: 1 },
    { category: 'Microphones', name: 'Shure SM7B', model: 'SM7B', description: 'Стандарт для рэпа', image: '/images/moscow/equipment/sm7b.jpg', sortOrder: 2 },
    { category: 'Preamps', name: 'Neve 1073', model: '1073', description: 'Легендарный преамп', image: '/images/moscow/equipment/1073.jpg', sortOrder: 1 },
    { category: 'Monitors', name: 'Focal Trio6 Be', model: 'Trio6 Be', description: 'Мониторы премиум', image: '/images/moscow/equipment/focal.jpg', sortOrder: 1 },
  ]
  for (const e of equipmentMoscow) {
    await prisma.equipment.create({
      data: {
        studioId: moscow.id,
        category: e.category,
        name: e.name,
        model: e.model,
        description: e.description,
        image: e.image,
        sortOrder: e.sortOrder,
      },
    })
  }

  // Reviews
  await prisma.review.create({
    data: {
      userId: admin.id,
      studioId: moscow.id,
      rating: 5,
      content: 'Лучшая студия для записи рэпа и вокала. Оборудование топовое.',
    },
  })

  console.log('Seeding complete!')
  console.log('Admin credentials:')
  console.log('Email: admin@4closers.studio')
  console.log('Password: admin123')
  console.log('User credentials:')
  console.log('Email: user@4closers.studio')
  console.log('Password: user123')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
