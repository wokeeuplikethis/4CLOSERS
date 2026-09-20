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

interface BookingRow {
  id: string
  date: string
  time: string
  status: string
  service?: { name: string } | null
  studio?: { city: string; slug: string } | null
}

export default function ProfilePage() {
  const router = useRouter()
  const studio = useCurrentStudio()
  const { logout, refreshUser } = useStudio()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('USER')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
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

  return (
    <main className="min-h-[100svh] pt-4 pb-24 lg:pt-8">
      <section className="shell max-w-6xl">
        {/* Заголовок */}
        <div className="section-mark mb-10">
          <span className="num">профиль</span>
          <span className="rule" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
          {/* ЛЕВАЯ КОЛОНКА — карточка пользователя */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className="panel p-8">
              {/* Аватар */}
              <div className="flex flex-col items-center text-center">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="group relative h-40 w-40 rounded-full border border-ash overflow-hidden
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
                      style={{ fontSize: '3.5rem' }}
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
                      className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-signal border-2 border-void"
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
                  {isAdmin ? 'администратор' : 'клиент'}
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
          <div className="lg:col-span-8 space-y-12">
            {/* История */}
            <section>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div className="section-mark flex-1">
                  <span className="num">история</span>
                  <span className="rule" />
                </div>
                {!loading && bookings.length > 0 && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/40 whitespace-nowrap">
                    {bookings.length} {bookings.length === 1 ? 'запись' : 'записей'}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="panel p-8 space-y-3">
                  <div className="h-4 w-1/3 bg-slate animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-slate animate-pulse rounded" />
                  <div className="h-4 w-2/5 bg-slate animate-pulse rounded" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="panel p-12 text-center">
                  <p
                    className="font-display font-light text-bone/80 mb-3"
                    style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
                  >
                    Пока пусто
                  </p>
                  <p className="text-sm text-bone/50 mb-8 max-w-[44ch] mx-auto">
                    Первая сессия — самая интересная. Выберите услугу и слот, а мы подтвердим.
                  </p>
                  <Link href="/bookings" className="btn btn-line">
                    Записаться
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : (
                <>
                  {/* Десктоп — таблица */}
                  <div className="hidden md:block">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>дата</th>
                          <th>время</th>
                          <th>услуга</th>
                          <th>студия</th>
                          <th className="text-right">статус</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id}>
                            <td className="font-mono text-[12px] whitespace-nowrap">
                              {new Date(b.date).toLocaleDateString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="font-mono text-[12px]">{b.time}</td>
                            <td>{b.service?.name ?? '—'}</td>
                            <td className="text-bone/60">{b.studio?.city ?? '—'}</td>
                            <td className="text-right">
                              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                                <span className={cn('dot', b.status === 'CONFIRMED' && 'dot-live')} />
                                {statusLabel(b.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Мобила — карточки */}
                  <ul className="md:hidden space-y-3">
                    {bookings.map((b) => (
                      <li key={b.id} className="panel p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                            <span className={cn('dot', b.status === 'CONFIRMED' && 'dot-live')} />
                            {statusLabel(b.status)}
                          </span>
                          <span className="font-mono text-[11px] text-bone/40">
                            {b.studio?.city ?? '—'}
                          </span>
                        </div>
                        <p className="font-display text-lg font-light text-bone mb-3">
                          {b.service?.name ?? '—'}
                        </p>
                        <div className="flex items-center gap-4 font-mono text-[11px] text-bone/60">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            {new Date(b.date).toLocaleDateString('ru-RU')}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            {b.time}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
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