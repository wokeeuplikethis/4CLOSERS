import { prisma } from '@/lib/prisma'
import {
  CityDataProvider,
  type CityDataMap,
  type CityPayload,
} from '@/components/CityDataProvider'
import { HomeContent } from '@/components/HomeContent'

export const dynamic = 'force-dynamic'

async function loadCity(slug: 'moscow' | 'spb'): Promise<CityPayload> {
  const studio = await prisma.studio.findUnique({ where: { slug } })
  if (!studio) throw new Error(`Studio ${slug} not found`)

  const [services, equipment, artists, reviews] = await Promise.all([
    prisma.service.findMany({
      where: { studioId: studio.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.equipment.findMany({
      where: { studioId: studio.id },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.artist.findMany({
      where: { studioId: studio.id },
      orderBy: { sortOrder: 'asc' },
      include: { tracks: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.review.findMany({
      where: { studioId: studio.id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, avatar: true } } },
      take: 12,
    }),
  ])

  const studioConfig = {
    slug: studio.slug as 'moscow' | 'spb',
    name: studio.name,
    city: studio.city,
    shortName: studio.slug === 'moscow' ? 'МСК' : 'СПБ',
    address: studio.address,
    phone: studio.phone,
    email: studio.email,
    telegram: studio.telegram,
    vk: studio.vk,
    hours: studio.hours,
    description: studio.description,
    mapUrl: studio.mapUrl,
    latitude: studio.latitude,
    longitude: studio.longitude,
    hero: {
      image: `/images/${studio.slug}/hero.svg`,
      alt: `${studio.city} — студия`,
    },
    images: {
      studio: [
        `/images/${studio.slug}/studio/studio-1.svg`,
        `/images/${studio.slug}/studio/studio-2.svg`,
        `/images/${studio.slug}/studio/studio-3.svg`,
      ],
      rooms: [
        `/images/${studio.slug}/rooms/rooms-1.svg`,
        `/images/${studio.slug}/rooms/rooms-2.svg`,
        `/images/${studio.slug}/rooms/rooms-3.svg`,
        `/images/${studio.slug}/rooms/rooms-4.svg`,
      ],
      equipment: [],
      portfolio: [],
    },
    seo: {
      title: `4CLOSERS ${studio.slug === 'moscow' ? 'Moscow' : 'SPB'}`,
      description: studio.description,
      ogImage: `/images/${studio.slug}/og-image.svg`,
    },
  }

  return {
    studio: studioConfig,
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      price: s.price,
      duration: s.duration,
      features: s.features,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    })),
    equipment: equipment.map((e) => ({
      id: e.id,
      category: e.category,
      name: e.name,
      model: e.model,
      description: e.description ?? undefined,
      image: e.image ?? undefined,
      sortOrder: e.sortOrder,
    })),
    artists: artists.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      avatar: a.avatar,
      genre: a.genre,
      bio: a.bio,
      isFeatured: a.isFeatured,
      sortOrder: a.sortOrder,
      tracks: a.tracks.map((t) => ({
        id: t.id,
        title: t.title,
        coverImage: t.coverImage,
        audioUrl: t.audioUrl,
        genre: t.genre,
        year: t.year,
        isFeatured: t.isFeatured,
        sortOrder: t.sortOrder,
      })),
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      userName: r.user.name,
      userAvatar: r.user.avatar ?? undefined,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    })),
  }
}

export default async function Page() {
  const [moscow, spb] = await Promise.all([loadCity('moscow'), loadCity('spb')])
  const data: CityDataMap = { moscow, spb }

  return (
    <CityDataProvider value={data}>
      <HomeContent />
    </CityDataProvider>
  )
}