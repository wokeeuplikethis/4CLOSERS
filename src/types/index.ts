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
    equipment: string[]
    portfolio: string[]
  }
  seo: { title: string; description: string; ogImage: string }
}

/** Помещение внутри города: PRO ROOM / LIGHT ROOM в Москве, одна студия в СПб. */
export interface Room {
  id: string
  slug: string
  name: string
  description: string
  image: string
  sortOrder: number
}

export interface Service {
  id: string
  /** null — услуга доступна в любом помещении города (сведение, мастеринг…). */
  roomId: string | null
  name: string
  slug: string
  description: string
  price: number
  duration: number
  features: string[]
  /** true — нужна дата и время (аренда, запись вокала). false — удалённая услуга. */
  requiresSchedule: boolean
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

export interface Track {
  id: string
  title: string
  coverImage?: string | null
  genre?: string | null
  year?: number | null
  yandexUrl?: string | null
  vkUrl?: string | null
  spotifyUrl?: string | null
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

/** Тело запроса POST /api/bookings */
export interface BookingFormData {
  city: StudioSlug
  roomId: string
  serviceIds: string[]
  date?: string | null
  time?: string | null
  /** Количество часов сессии (для услуг, которым нужны дата/время). */
  hours?: number
  name: string
  phone: string
  telegram?: string | null
  comment?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface UserLite {
  id: string
  role: 'USER' | 'ADMIN'
  name?: string | null
  email?: string | null
  avatar?: string | null
}

export interface BookingItem {
  id: string
  serviceId?: string | null
  name: string
  price: number
  duration: number
  requiresSchedule: boolean
}

export interface BookingRoom {
  id: string
  slug: string
  name: string
}

export interface BookingStudio {
  id: string
  slug: string
  city: string
  name: string
}

export interface Booking {
  id: string
  userId: string | null
  studioId: string
  roomId: string | null
  name: string
  phone: string
  telegram?: string | null
  date: string | null
  time: string | null
  hours: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  comment?: string | null
  total: number
  createdAt: string
  items: BookingItem[]
  room?: BookingRoom | null
  studio?: BookingStudio | null
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
