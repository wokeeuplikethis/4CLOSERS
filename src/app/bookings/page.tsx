import { prisma } from '@/lib/prisma'
import {
  CityDataProvider,
  type CityDataMap,
  type CityPayload,
} from '@/components/CityDataProvider'
import { BookingsContent } from '@/components/BookingsContent'

export const dynamic = 'force-dynamic'

async function loadCity(slug: 'moscow' | 'spb'): Promise<CityPayload> {
  const studio = await prisma.studio.findUnique({ where: { slug } })
  if (!studio) throw new Error(`Studio ${slug} not found`)

  const services = await prisma.service.findMany({
    where: { studioId: studio.id, isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

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
      studio: [],
      equipment: [],
      portfolio: [],
    },
    seo: {
      title: `4CLOSERS ${studio.slug === 'moscow' ? 'Moscow' : 'SPB'} - Бронирование`,
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
    equipment: [],
    artists: [],
    reviews: [],
  }
}

export default async function BookingsPage() {
  const [moscow, spb] = await Promise.all([loadCity('moscow'), loadCity('spb')])
  const data: CityDataMap = { moscow, spb }

  return (
    <CityDataProvider value={data}>
      <BookingsContent />
    </CityDataProvider>
  )
}