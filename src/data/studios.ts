import { StudioConfig } from '@/types'

export const studios: Record<'moscow' | 'spb', StudioConfig> = {
  moscow: {
    slug: 'moscow',
    name: '4CLOSERS STUDIO MOSCOW',
    city: 'Москва',
    shortName: 'МСК',
    address: 'ул. Большая Дмитровка, 15с1, Москва, 125009',
    phone: '+7 (495) 123-45-67',
    email: 'moscow@4closers.studio',
    telegram: '@closers_moscow',
    vk: 'vk.com/closers_moscow',
    hours: 'Ежедневно 10:00 — 02:00',
    description: 'Флагманская студия 4CLOSERS в сердце Москвы. Профессиональная запись вокала и рэпа, сведение, мастеринг и полноценный продакшн. Работаем с топовыми артистами российской хип-хоп сцены.',
    mapUrl: 'https://yandex.ru/maps/213/moscow/house/bolshaya_dmitrovka_15s1/Z04YcwFkT0cAQFtvfXR4dYx3Zw==/',
    latitude: 55.7639,
    longitude: 37.6074,
    hero: {
      image: '/images/moscow/hero.svg',
      video: '/images/moscow/hero.mp4',
      alt: '4CLOSERS Studio Moscow — главная студия записи',
    },
    images: {
      studio: [
        '/images/moscow/studio/studio-1.svg',
        '/images/moscow/studio/studio-2.svg',
        '/images/moscow/studio/studio-3.svg',
      ],
      rooms: [
        '/images/moscow/rooms/rooms-1.svg',
        '/images/moscow/rooms/rooms-2.svg',
        '/images/moscow/rooms/rooms-3.svg',
        '/images/moscow/rooms/rooms-4.svg',
      ],
      equipment: [
        '/images/moscow/equipment/equipment-1.svg',
        '/images/moscow/equipment/equipment-2.svg',
        '/images/moscow/equipment/equipment-3.svg',
      ],
      portfolio: [
        '/images/moscow/portfolio/portfolio-1.svg',
        '/images/moscow/portfolio/portfolio-2.svg',
        '/images/moscow/portfolio/portfolio-3.svg',
        '/images/moscow/portfolio/portfolio-4.svg',
      ],
    },
    seo: {
      title: '4CLOSERS Studio Moscow — Профессиональная запись, сведение и мастеринг в Москве',
      description: 'Запись вокала и рэпа, сведение, мастеринг, автотюн и продакшн в центре Москвы. Работаем с топовыми артистами. Запишись на сессию сегодня.',
      ogImage: '/images/moscow/og-image.svg',
    },
  },
  spb: {
    slug: 'spb',
    name: '4CLOSERS STUDIO SPB',
    city: 'Санкт-Петербург',
    shortName: 'СПБ',
    address: 'Невский пр., 82, Санкт-Петербург, 191040',
    phone: '+7 (812) 987-65-43',
    email: 'spb@4closers.studio',
    telegram: '@closers_spb',
    vk: 'vk.com/closers_spb',
    hours: 'Ежедневно 11:00 — 03:00',
    description: 'Студия 4CLOSERS на Невском проспекте — сердце Петербургской музыкальной сцены. Профессиональное оборудование, атмосфера подворотень и команда инженеров, понимающих твой звук.',
    mapUrl: 'https://yandex.ru/maps/2/saint-petersburg/house/nevskiy_prospekt_82/Z04YcwFkT0cAQFtvfXR4dYx3Zw==/',
    latitude: 59.9311,
    longitude: 30.3609,
    hero: {
      image: '/images/spb/hero.svg',
      video: '/images/spb/hero.mp4',
      alt: '4CLOSERS Studio SPB — студия на Невском',
    },
    images: {
      studio: [
        '/images/spb/studio/studio-1.svg',
        '/images/spb/studio/studio-2.svg',
        '/images/spb/studio/studio-3.svg',
      ],
      rooms: [
        '/images/spb/rooms/rooms-1.svg',
        '/images/spb/rooms/rooms-2.svg',
        '/images/spb/rooms/rooms-3.svg',
        '/images/spb/rooms/rooms-4.svg',
      ],
      equipment: [
        '/images/spb/equipment/equipment-1.svg',
        '/images/spb/equipment/equipment-2.svg',
        '/images/spb/equipment/equipment-3.svg',
      ],
      portfolio: [
        '/images/spb/portfolio/portfolio-1.svg',
        '/images/spb/portfolio/portfolio-2.svg',
        '/images/spb/portfolio/portfolio-3.svg',
        '/images/spb/portfolio/portfolio-4.svg',
      ],
    },
    seo: {
      title: '4CLOSERS Studio SPB — Запись, сведение и мастеринг в Санкт-Петербурге',
      description: 'Профессиональная студия звукозаписи на Невском проспекте. Запись рэпа и вокала, сведение, мастеринг, автотюн. Атмосфера, в которой рождаются хиты.',
      ogImage: '/images/spb/og-image.svg',
    },
  },
}

export const STUDIO_SLUGS = ['moscow', 'spb'] as const

export function getStudio(slug: 'moscow' | 'spb'): StudioConfig {
  return studios[slug]
}

export function getAllStudios(): StudioConfig[] {
  return Object.values(studios)
}