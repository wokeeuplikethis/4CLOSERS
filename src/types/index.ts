export interface StudioConfig {
  slug: 'moscow' | 'spb'
  name: string
  city: string
  shortName: string
  address: string
  phone: string
  email: string
  telegram: string
  vk: string
  hours: string
  description: string
  mapUrl: string
  latitude: number
  longitude: number
  hero: { image: string; video?: string; alt: string }
  images: {
    studio: string[]
    rooms: string[]
    equipment: string[]
    portfolio: string[]
  }
  seo: { title: string; description: string; ogImage: string }
}

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  price: number
  duration: number
  features: string[]
  isActive: boolean
  sortOrder: number
}

export interface EquipmentItem {
  id: string
  category: string
  name: string
  model: string
  description?: string
  image?: string
  sortOrder: number
}

/** @deprecated Заменена на Artist + Track. */
export interface PortfolioItem {
  id: string
  artist: string
  trackTitle: string
  genre: string
  coverImage: string
  audioUrl?: string
  isFeatured: boolean
  sortOrder: number
}

export interface Track {
  id: string
  title: string
  coverImage?: string | null
  audioUrl?: string | null
  genre?: string | null
  year?: number | null
  isFeatured: boolean
  sortOrder: number
}

export interface Artist {
  id: string
  name: string
  slug: string
  avatar?: string | null
  genre?: string | null
  bio?: string | null
  isFeatured: boolean
  sortOrder: number
  tracks: Track[]
}

export interface Review {
  id: string
  userName: string
  userAvatar?: string
  rating: number
  content: string
  createdAt: string
}

export interface FAQItem {
  question: string
  answer: string
  citySpecific?: boolean
}

export interface BookingFormData {
  studioSlug: 'moscow' | 'spb'
  serviceId: string
  date: string
  time: string
  comment?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface UserLite {
  role: 'USER' | 'ADMIN'
  name?: string
  email?: string
  avatar?: string | null
}

export interface Booking {
  id: string
  userId: string
  studioId: string
  serviceId: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  comment?: string
  createdAt: string
  service?: Service
  studio?: StudioConfig
}

export type StudioSlug = 'moscow' | 'spb'

export const STUDIO_SLUGS: StudioSlug[] = ['moscow', 'spb']

export const STUDIO_LABELS: Record<StudioSlug, string> = {
  moscow: 'МОСКВА',
  spb: 'СПБ',
}

export const STUDIO_CITIES: Record<StudioSlug, string> = {
  moscow: 'Москва',
  spb: 'Санкт-Петербург',
}

export const EQUIPMENT_CATEGORIES = [
  'microphones',
  'audio-interfaces',
  'monitors',
  'headphones',
] as const

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number]

export const EQUIPMENT_LABELS: Record<string, string> = {
  microphones: 'Микрофоны',
  'audio-interfaces': 'Звуковая карта',
  monitors: 'Мониторы',
  headphones: 'Наушники',
}