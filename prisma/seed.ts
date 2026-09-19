import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/jwt'

const prisma = new PrismaClient()

// ─────────────────────────────────────────────────────────────
// Данные
// ─────────────────────────────────────────────────────────────

const SERVICES = [
  { slug: 'recording-hour',            name: 'Запись в час',                priceMsk: 3500,  priceSpb: 3200,  duration: 60,  features: ['Комната', 'Микрофон', 'Наушники', 'Инженер на подхвате'] },
  { slug: 'recording-engineer-hour',   name: 'Запись со звукорежем в час', priceMsk: 5500,  priceSpb: 5000,  duration: 60,  features: ['Полное сопровождение', 'Правка по ходу', 'Черновой микс'] },
  { slug: 'beat-custom',               name: 'Бит на заказ',               priceMsk: 25000, priceSpb: 22000, duration: 240, features: ['Индивидуальный бит', '2 правки', 'Стемы в комплекте'] },
  { slug: 'mixing-mastering',          name: 'Сведение и мастеринг',       priceMsk: 18000, priceSpb: 16000, duration: 240, features: ['Баланс и глубина', 'Финальный мастер', 'Стриминг-версии'] },
  { slug: 'mastering',                 name: 'Мастеринг',                  priceMsk: 7000,  priceSpb: 6500,  duration: 60,  features: ['Аналоговая цепочка', 'Оптимизация под платформы', 'DDP по запросу'] },
  { slug: 'distribution',              name: 'Дистрибуция',                priceMsk: 4000,  priceSpb: 3500,  duration: 30,  features: ['Spotify / Apple Music', 'Все площадки', 'ISRC / UPC'] },
]

const EQUIPMENT = [
  // Микрофоны
  { category: 'microphones',      name: 'Neumann U 87 Ai',        model: 'U 87 Ai',      description: 'Легендарный конденсаторный микрофон. Стандарт индустрии.',   image: '/images/equipment/u87.jpg',        sortOrder: 1 },
  { category: 'microphones',      name: 'Shure SM7B',             model: 'SM7B',         description: 'Король рэп-записи. Плотный, детальный звук.',                image: '/images/equipment/sm7b.jpg',       sortOrder: 2 },
  { category: 'microphones',      name: 'Telefunken ELA M 251E',  model: 'ELA M 251E',   description: 'Винтажный трубный микрофон. Тёплый, бархатный звук.',        image: '/images/equipment/ela251.jpg',     sortOrder: 3 },
  // Звуковая карта
  { category: 'audio-interfaces', name: 'Antelope Orion 32+',     model: 'Orion 32+',    description: '32 канала AD/DA. Мастер-клок студии.',                       image: '/images/equipment/orion32.jpg',    sortOrder: 1 },
  { category: 'audio-interfaces', name: 'Universal Audio Apollo x8p', model: 'Apollo x8p', description: '8 преампов Unison + UAD-2 QUAD.',                          image: '/images/equipment/apollo-x8p.jpg', sortOrder: 2 },
  // Мониторы
  { category: 'monitors',         name: 'ATC SCM25A Pro',         model: 'SCM25A Pro',   description: 'Референсные мониторы. Честность без раскрашивания.',         image: '/images/equipment/atc-scm25.jpg',  sortOrder: 1 },
  { category: 'monitors',         name: 'Focal Trio6 Be',         model: 'Trio6 Be',     description: 'Трёхпутевые мониторы с бериллиевым твитером.',               image: '/images/equipment/focal-trio6.jpg', sortOrder: 2 },
  { category: 'monitors',         name: 'Avantone MixCubes',      model: 'MixCubes',     description: 'Кубики для проверки микса в моно.',                          image: '/images/equipment/avantone.jpg',   sortOrder: 3 },
  // Наушники
  { category: 'headphones',       name: 'Sennheiser HD 650',      model: 'HD 650',       description: 'Открытые референсные наушники. Ровная АЧХ.',                 image: '/images/equipment/hd650.jpg',      sortOrder: 1 },
  { category: 'headphones',       name: 'Beyerdynamic DT 1990 Pro', model: 'DT 1990 Pro', description: 'Студийные наушники с высокой детализацией.',               image: '/images/equipment/dt1990.jpg',     sortOrder: 2 },
  { category: 'headphones',       name: 'Audio-Technica ATH-M50x', model: 'ATH-M50x',    description: 'Закрытые наушники для трекинга и контроля.',                 image: '/images/equipment/m50x.jpg',       sortOrder: 3 },
]

// Артисты. StudioSlug — к какой студии привязан.
const ARTISTS: Array<{
  slug: string
  studioSlug: 'moscow' | 'spb'
  name: string
  avatar: string | null
  genre: string
  bio: string
  isFeatured: boolean
  tracks: Array<{ title: string; coverImage: string | null; genre?: string; year?: number; isFeatured?: boolean }>
}> = [
  {
    slug: 'icegergert',
    studioSlug: 'moscow',
    name: 'ICEGERGERT',
    avatar: '/images/artists/icegergert.jpg',
    genre: 'Hip-Hop / Trap',
    bio: 'Один из самых громких голосов нового поколения. Плотный флоу, мрачная подача, узнаваемый тембр.',
    isFeatured: true,
    tracks: [
      { title: 'Наследство',  coverImage: '/images/tracks/icegergert-nasledstvo.jpg', genre: 'Hip-Hop', year: 2024, isFeatured: true },
      { title: 'Банк',        coverImage: '/images/tracks/icegergert-bank.jpg',       genre: 'Trap',    year: 2024 },
      { title: 'Мать',        coverImage: '/images/tracks/icegergert-mat.jpg',        genre: 'Hip-Hop', year: 2023 },
      { title: 'Императрица', coverImage: '/images/tracks/icegergert-imperatritsa.jpg', genre: 'Trap',  year: 2023 },
      { title: 'Евроденс.ру', coverImage: '/images/tracks/icegergert-evrodance.jpg',  genre: 'Hip-Hop', year: 2024 },
    ],
  },
  {
    slug: 'boulevard-depo',
    studioSlug: 'moscow',
    name: 'Boulevard Depo',
    avatar: '/images/artists/boulevard-depo.jpg',
    genre: 'Cloud Rap',
    bio: 'Пионер клауд-рэпа на русской сцене. Атмосферный звук, автобиографичные тексты.',
    isFeatured: false,
    tracks: [
      { title: 'Casino (feat. ICEGERGERT)', coverImage: '/images/tracks/boulevard-casino.jpg', genre: 'Cloud Rap', year: 2024 },
    ],
  },
  // ← Остальных артистов добавишь здесь, по аналогии.
]

const REVIEWS = [
  { studioSlug: 'moscow' as const, rating: 5, content: 'Лучшая студия для записи рэпа и вокала. Оборудование топовое.' },
  { studioSlug: 'moscow' as const, rating: 5, content: 'Записал EP за три дня. Команда работает слаженно.' },
  { studioSlug: 'spb'    as const, rating: 5, content: 'Атмосфера на Невском — правильная. Звук — московский уровень.' },
]

// ─────────────────────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log('▶ Seeding…')

  // 1. Студии — upsert (не трогаем связанные данные)
  const moscow = await prisma.studio.upsert({
    where: { slug: 'moscow' },
    update: {},
    create: {
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

  const spb = await prisma.studio.upsert({
    where: { slug: 'spb' },
    update: {},
    create: {
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

  console.log('  ✓ studios:', moscow.slug, spb.slug)

  // 2. Demo admin и user — upsert по email
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.user.upsert({
    where: { email: 'admin@4closers.studio' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@4closers.studio',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: '/images/avatars/admin.jpg',
    },
  })

  const userPassword = await hashPassword('user123')
  await prisma.user.upsert({
    where: { email: 'user@4closers.studio' },
    update: {},
    create: {
      name: 'Артём',
      email: 'user@4closers.studio',
      passwordHash: userPassword,
      role: 'USER',
      avatar: '/images/avatars/user.jpg',
    },
  })

  console.log('  ✓ users: admin, user')

  // 3. Services — upsert по (studioId, slug)
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i]
    await prisma.service.upsert({
      where: { studioId_slug: { studioId: moscow.id, slug: s.slug } },
      update: { name: s.name, price: s.priceMsk, duration: s.duration, features: s.features, sortOrder: i },
      create: { studioId: moscow.id, slug: s.slug, name: s.name, description: `${s.name} в московской студии.`, price: s.priceMsk, duration: s.duration, features: s.features, sortOrder: i },
    })
    await prisma.service.upsert({
      where: { studioId_slug: { studioId: spb.id, slug: s.slug } },
      update: { name: s.name, price: s.priceSpb, duration: s.duration, features: s.features, sortOrder: i },
      create: { studioId: spb.id, slug: s.slug, name: s.name, description: `${s.name} в студии Санкт-Петербурга.`, price: s.priceSpb, duration: s.duration, features: s.features, sortOrder: i },
    })
  }

  console.log(`  ✓ services: ${SERVICES.length} × 2 города`)

  // 4. Equipment — сначала удалим оборудование этих студий, потом создадим заново (у Equipment нет уникального ключа)
  await prisma.equipment.deleteMany({ where: { studioId: { in: [moscow.id, spb.id] } } })

  for (const e of EQUIPMENT) {
    // МСК
    await prisma.equipment.create({
      data: { studioId: moscow.id, category: e.category, name: e.name, model: e.model, description: e.description, image: e.image, sortOrder: e.sortOrder },
    })
    // СПБ — те же позиции, картинки можно переопределить позже
    await prisma.equipment.create({
      data: { studioId: spb.id, category: e.category, name: e.name, model: e.model, description: e.description, image: e.image, sortOrder: e.sortOrder },
    })
  }

  console.log(`  ✓ equipment: ${EQUIPMENT.length} × 2 города`)

  // 5. Artists + Tracks — upsert
  for (let i = 0; i < ARTISTS.length; i++) {
    const a = ARTISTS[i]
    const studioId = a.studioSlug === 'moscow' ? moscow.id : spb.id

    const artist = await prisma.artist.upsert({
      where: { studioId_slug: { studioId, slug: a.slug } },
      update: { name: a.name, avatar: a.avatar, genre: a.genre, bio: a.bio, isFeatured: a.isFeatured, sortOrder: i },
      create: { studioId, slug: a.slug, name: a.name, avatar: a.avatar, genre: a.genre, bio: a.bio, isFeatured: a.isFeatured, sortOrder: i },
    })

    for (let j = 0; j < a.tracks.length; j++) {
      const t = a.tracks[j]
      const existing = await prisma.track.findFirst({ where: { artistId: artist.id, title: t.title } })
      const data = { artistId: artist.id, title: t.title, coverImage: t.coverImage, genre: t.genre ?? a.genre, year: t.year ?? null, isFeatured: t.isFeatured ?? false, sortOrder: j }
      if (existing) {
        await prisma.track.update({ where: { id: existing.id }, data })
      } else {
        await prisma.track.create({ data })
      }
    }

    console.log(`  ✓ ${a.name} — ${a.tracks.length} трек(ов)`)
  }

  // 6. Reviews — удаляем старые для этих студий и создаём заново
  await prisma.review.deleteMany({ where: { studioId: { in: [moscow.id, spb.id] } } })
  for (const r of REVIEWS) {
    const studioId = r.studioSlug === 'moscow' ? moscow.id : spb.id
    await prisma.review.create({
      data: { userId: admin.id, studioId, rating: r.rating, content: r.content },
    })
  }

  console.log(`  ✓ reviews: ${REVIEWS.length}`)

  console.log('\n✓ Seeding complete')
  console.log('  admin: admin@4closers.studio / admin123')
  console.log('  user:  user@4closers.studio / user123')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })