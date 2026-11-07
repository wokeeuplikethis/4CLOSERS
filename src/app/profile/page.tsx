'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Camera,
  LogOut,
  Trash2,
  Calendar,
  Clock,
  Shield,
} from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { useCurrentStudio } from '@/components/SiteDataProvider'
import { cn } from '@/lib/utils'
import type { Booking } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const studio = useCurrentStudio()
  const { logout, refreshUser } = useStudio()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('USER')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/profile', { cache: 'no-store' })
        if (res.status === 401) {
          router.push('/login?redirect=/profile')
          return
        }
        const data = await res.json()
        if (!alive) return
        setName(data.user?.name ?? '')
        setEmail(data.user?.email ?? '')
        setRole(data.user?.role ?? 'USER')
        setAvatarUrl(data.user?.avatar ?? null)
        setCreatedAt(data.user?.createdAt ?? null)
        setBookings(data.bookings ?? [])
      } catch {
        // тихо
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [router])

  async function onSaveName() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      await refreshUser()
    } finally {
      setSaving(false)
    }
  }

  async function onUploadAvatar(file: File) {
    setUploadError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setUploadError(data.error ?? 'Не удалось загрузить')
        return
      }
      setAvatarUrl(data.url)
      await refreshUser()
    } catch {
      setUploadError('Сеть недоступна')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function onRemoveAvatar() {
    setUploadError(null)
    setUploading(true)
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' })
      if (res.ok) {
        setAvatarUrl(null)
        await refreshUser()
      }
    } finally {
      setUploading(false)
    }
  }

  async function onLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }

  const initial = (name || email || 'U').charAt(0).toUpperCase()
  const isAdmin = role === 'ADMIN'
  const { upcoming, past } = splitBookings(bookings)

  return (
    <main className="min-h-[100svh] pt-8 pb-24">
      <section className="shell max-w-6xl">
        {/* Заголовок */}
        <div className="section-mark mb-8">
          <span className="num">профиль</span>
          <span className="rule" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
          {/* ЛЕВАЯ КОЛОНКА — карточка пользователя (шире) */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="panel p-8">
              {/* Аватар */}
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="group relative h-48 w-48 rounded-full border border-ash overflow-hidden
                             bg-slate hover:border-signal transition-colors
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-signal
                             disabled:opacity-60 disabled:cursor-wait"
                  aria-label="Сменить фото профиля"
                >
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center font-display font-light text-bone/70"
                      style={{ fontSize: '4rem' }}
                    >
                      {initial}
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-void/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-bone" />
                  </span>
                  {uploading && (
                    <span className="absolute inset-0 flex items-center justify-center bg-void/80">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/70">
                        загрузка…
                      </span>
                    </span>
                  )}
                  {isAdmin && (
                    <span
                      className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-signal border-2 border-void"
                      aria-label="Администратор"
                    />
                  )}
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onUploadAvatar(f)
                  }}
                />

                {/* Имя */}
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={onSaveName}
                  placeholder="Ваше имя"
                  className="mt-6 w-full bg-transparent border-none outline-none text-center
                             font-display font-light text-bone tracking-[-0.03em] leading-[1.05]
                             focus:outline-none placeholder:text-bone/30"
                  style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)' }}
                  aria-label="Имя"
                />

                {/* Роль */}
                <div className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40">
                  <span className={cn('dot', isAdmin && 'dot-live')} />
                  {isAdmin ? 'администратор' : 'пользователь'}
                  {saving && <span className="text-signal">· сохраняем…</span>}
                </div>

                {uploadError && (
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                    {uploadError}
                  </p>
                )}

                {avatarUrl && !uploading && (
                  <button
                    type="button"
                    onClick={onRemoveAvatar}
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em]
                               text-bone/40 hover:text-signal transition-colors"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    удалить фото
                  </button>
                )}
              </div>

              {/* Мета */}
              <div className="mt-8 pt-6 border-t border-ash space-y-3">
                <div className="datum">
                  <span>почта</span>
                  <span className="font-mono truncate">{email || '—'}</span>
                </div>
                {createdAt && (
                  <div className="datum">
                    <span>с нами с</span>
                    <span className="font-mono">
                      {new Date(createdAt).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="datum">
                  <span>студия</span>
                  <span className="font-mono">{studio.city}</span>
                </div>
              </div>

              {/* Действия */}
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/bookings" className="btn btn-solid h-11 justify-center">
                  Новая запись
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="btn btn-line h-11 justify-center"
                  >
                    <Shield className="h-4 w-4" aria-hidden="true" />
                    Админка
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* ПРАВАЯ КОЛОНКА — история + настройки */}
          <div className="lg:col-span-7 space-y-12">
            {/* История */}
            <section>
              <div className="section-mark mb-6">
                <span className="num">история</span>
                <span className="rule" />
              </div>

              {loading ? (
                <div className="panel p-8 space-y-3">
                  <div className="h-4 w-1/3 bg-slate animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-slate animate-pulse rounded" />
                  <div className="h-4 w-2/5 bg-slate animate-pulse rounded" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="panel p-10 text-center">
                  <p
                    className="font-display font-light text-bone/80 mb-3"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
                  >
                    Пока пусто
                  </p>
                  <p className="text-sm text-bone/50 mb-6 max-w-[44ch] mx-auto">
                    Первая сессия — самая интересная. Выберите услугу и слот, а мы подтвердим.
                  </p>
                  <Link href="/bookings" className="btn btn-line">
                    Записаться
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-10">
                  <BookingGroup
                    label="грядущие"
                    bookings={upcoming}
                    emptyHint="Грядущих записей пока нет — выберите услугу и слот."
                  />
                  <BookingGroup
                    label="прошлые"
                    bookings={past}
                    emptyHint="Прошлых записей пока нет."
                  />
                </div>
              )}
            </section>

            {/* Настройки */}
            <section>
              <div className="section-mark mb-6">
                <span className="num">настройки</span>
                <span className="rule" />
              </div>

              <div className="panel">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-lg"
                  aria-expanded={settingsOpen}
                >
                  <div>
                    <p className="font-display text-base text-bone">Аккаунт и безопасность</p>
                    <p className="mt-1 text-sm text-bone/50">
                      Выход, удаление аккаунта, управление данными
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'shrink-0 font-mono text-signal text-xl leading-none transition-transform duration-200',
                      settingsOpen && 'rotate-45'
                    )}
                  >
                    +
                  </span>
                </button>

                {settingsOpen && (
                  <div className="border-t border-ash p-6 space-y-4">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="btn btn-line w-full h-11 justify-center"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Выйти из аккаунта
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Удалить аккаунт? Это действие необратимо.')) return
                        await fetch('/api/profile', { method: 'DELETE' })
                        await refreshUser()
                        router.push('/')
                        router.refresh()
                      }}
                      className="w-full h-11 inline-flex items-center justify-center rounded-md
                                 border border-ash hover:border-signal
                                 text-sm text-bone/60 hover:text-signal transition-colors
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                    >
                      <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                      Удалить аккаунт
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}

function BookingGroup({
  label,
  bookings,
  emptyHint,
}: {
  label: string
  bookings: Booking[]
  emptyHint: string
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-4">
        <div className="section-mark flex-1">
          <span className="num">{label}</span>
          <span className="rule" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40 whitespace-nowrap">
          {bookings.length} {pluralBookings(bookings.length)}
        </span>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-bone/40">{emptyHint}</p>
      ) : (
        <>
          {/* Десктоп — таблица */}
          <div className="hidden md:block">
            <table className="table">
              <thead>
                <tr>
                  <th>дата</th>
                  <th>услуги</th>
                  <th>студия</th>
                  <th className="text-right">сумма</th>
                  <th className="text-right">статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="font-mono text-[12px] whitespace-nowrap align-top">
                      <span className="block">{formatBookingDate(booking.date)}</span>
                      <span className="block text-[11px] text-bone/40 mt-0.5">
                        {formatBookingTime(booking.time)}
                        {bookingHoursSuffix(booking)}
                      </span>
                    </td>
                    <td className="align-top">
                      <BookingItems items={booking.items} />
                    </td>
                    <td className="text-bone/60 align-top">
                      {studioLine(booking.studio, booking.room)}
                    </td>
                    <td className="text-right font-mono text-[12px] whitespace-nowrap align-top">
                      {(booking.total ?? 0).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="text-right align-top">
                      <StatusBadge status={booking.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Мобила — карточки */}
          <ul className="md:hidden space-y-3">
            {bookings.map((booking) => (
              <li key={booking.id} className="panel p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <StatusBadge status={booking.status} />
                  <span className="font-mono text-[11px] text-bone/40 text-right">
                    {studioLine(booking.studio, booking.room)}
                  </span>
                </div>

                <div className="mb-3">
                  <BookingItems
                    items={booking.items}
                    itemClassName="font-display text-lg font-light text-bone"
                  />
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-bone/60">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatBookingDate(booking.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {formatBookingTime(booking.time)}
                      {bookingHoursSuffix(booking)}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] text-bone whitespace-nowrap">
                    {(booking.total ?? 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function BookingItems({
  items,
  itemClassName,
}: {
  items: Booking['items']
  itemClassName?: string
}) {
  const list = items ?? []

  if (list.length === 0) {
    return <span className="text-bone/40">—</span>
  }

  return (
    <ul className="space-y-0.5">
      {list.map((item) => (
        <li key={item.id} className={cn(itemClassName)}>
          {item.name}
        </li>
      ))}
    </ul>
  )
}

function StatusBadge({ status }: { status: Booking['status'] }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
      <span className={cn('dot', status === 'CONFIRMED' && 'dot-live')} />
      {statusLabel(status)}
    </span>
  )
}

function splitBookings(bookings: Booking[]) {
  const upcoming: Booking[] = []
  const past: Booking[] = []

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  for (const booking of bookings) {
    if (isUpcoming(booking, startOfToday.getTime())) {
      upcoming.push(booking)
    } else {
      past.push(booking)
    }
  }

  // Грядущие: дата по возрастанию, удалённые (без даты) — в конце, затем свежие заявки.
  upcoming.sort((a, b) => {
    const aDate = bookingDateValue(a.date)
    const bDate = bookingDateValue(b.date)

    if (aDate === null && bDate === null) return createdDesc(a, b)
    if (aDate === null) return 1
    if (bDate === null) return -1
    if (aDate !== bDate) return aDate - bDate
    return createdDesc(a, b)
  })

  // Прошлые: дата по убыванию, удалённые (без даты) — в конце, затем свежие заявки.
  past.sort((a, b) => {
    const aDate = bookingDateValue(a.date)
    const bDate = bookingDateValue(b.date)

    if (aDate === null && bDate === null) return createdDesc(a, b)
    if (aDate === null) return 1
    if (bDate === null) return -1
    if (aDate !== bDate) return bDate - aDate
    return createdDesc(a, b)
  })

  return { upcoming, past }
}

function isUpcoming(booking: Booking, startOfToday: number) {
  const active = booking.status === 'PENDING' || booking.status === 'CONFIRMED'
  if (!active) return false
  if (booking.date === null) return true
  return new Date(booking.date).getTime() >= startOfToday
}

function bookingDateValue(date: string | null) {
  return date === null ? null : new Date(date).getTime()
}

function createdDesc(a: Booking, b: Booking) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function formatBookingDate(date: string | null) {
  if (date === null) return 'без даты'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatBookingTime(time: string | null) {
  return time || '—'
}

/** «· 2 ч» — длительность сессии, если она имеет смысл (сессионные услуги или > 1 часа). */
function bookingHoursSuffix(booking: Booking) {
  const hours = booking.hours
  if (!hours || hours < 1) return ''
  const hasSessionItems = (booking.items ?? []).some((item) => item.requiresSchedule)
  if (hours > 1 || hasSessionItems) return ` · ${hours} ч`
  return ''
}

function studioLine(studio: Booking['studio'], room: Booking['room']) {
  if (!studio) return '—'
  return room ? `${studio.city} · ${room.name}` : studio.city
}

function pluralBookings(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return 'запись'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'записи'
  return 'записей'
}

function statusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'подтверждена'
    case 'PENDING':
      return 'ожидает'
    case 'CANCELLED':
      return 'отменена'
    case 'DONE':
    case 'COMPLETED':
      return 'завершена'
    default:
      return status.toLowerCase()
  }
}