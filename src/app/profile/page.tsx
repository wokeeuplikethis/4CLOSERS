'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Camera, LogOut } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { getStudio } from '@/data/studios'
import { cn } from '@/lib/utils'

interface BookingRow {
  id: string
  date: string
  time: string
  status: string
  service?: { name: string }
  studio?: { city: string; slug: string }
}

export default function ProfilePage() {
  const router = useRouter()
  const { currentStudio } = useStudio()
  const studio = getStudio(currentStudio)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('USER')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setAvatarUrl(data.user?.avatarUrl ?? null)
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
    } finally {
      setSaving(false)
    }
  }

  async function onUploadAvatar(file: File) {
    const form = new FormData()
    form.append('avatar', file)
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
    if (res.ok) {
      const data = await res.json()
      setAvatarUrl(data.url)
    }
  }

  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const initial = (name || email || 'U').charAt(0).toUpperCase()

  return (
    <main className="min-h-[100svh] pt-24 pb-20">
      <section className="shell max-w-5xl">
        <div className="section-mark mb-8">
          <span className="num">профиль</span>
          <span className="rule" />
        </div>

        {/* Шапка профиля: аватар + имя + роль + студия */}
        <div className="grid grid-cols-12 gap-x-6 gap-y-8 items-end mb-16">
          <div className="col-span-12 lg:col-span-8 flex items-end gap-6">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative h-32 w-32 shrink-0 rounded-full border border-ash overflow-hidden
                         bg-slate hover:border-signal transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label="Сменить фото профиля"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-3xl font-light text-bone/60">
                  {initial}
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-bone" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUploadAvatar(f)
                }}
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={onSaveName}
                placeholder="Ваше имя"
                className="bg-transparent border-none outline-none font-display font-light text-bone
                           tracking-[-0.03em] leading-[1.05] w-full
                           focus:outline-none"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
                aria-label="Имя"
              />
              <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
                <span className="inline-flex items-center gap-2">
                  <span className={cn('dot', role === 'ADMIN' && 'dot-live')} />
                  {role === 'ADMIN' ? 'админ' : 'клиент'}
                </span>
                <span>·</span>
                <span>{email || '—'}</span>
                {saving && <span className="text-signal">· сохраняем…</span>}
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 lg:items-end">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
              студия
            </span>
            <span className="font-display text-lg text-bone">{studio.city}</span>
            <Link href="/bookings" className="btn btn-solid h-11">
              Новая запись
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* История записей — таблица, не карточки */}
        <div className="mb-16">
          <div className="section-mark mb-6">
            <span className="num">история</span>
            <span className="rule" />
          </div>

          {loading ? (
            <p className="text-sm text-bone/40">Загружаем…</p>
          ) : bookings.length === 0 ? (
            <div className="panel p-10 text-center">
              <p className="text-sm text-bone/60 mb-6">
                Пока ничего не бронировали. Первая сессия — самая интересная.
              </p>
              <Link href="/bookings" className="btn btn-line">
                Записаться
              </Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>дата</th>
                  <th>время</th>
                  <th>услуга</th>
                  <th>студия</th>
                  <th>статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="font-mono text-[12px]">
                      {new Date(b.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="font-mono text-[12px]">{b.time}</td>
                    <td>{b.service?.name ?? '—'}</td>
                    <td>{b.studio?.city ?? '—'}</td>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn('dot', b.status === 'CONFIRMED' && 'dot-live')} />
                        {statusLabel(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Настройки — свёрнутый блок внизу */}
        <div className="border-t border-ash pt-6">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-4 py-2 text-left
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
            aria-expanded={settingsOpen}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40">
              настройки
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'font-mono text-signal text-lg leading-none transition-transform duration-200',
                settingsOpen && 'rotate-45'
              )}
            >
              +
            </span>
          </button>

          {settingsOpen && (
            <div className="mt-6 space-y-4 max-w-md">
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
                  router.push('/')
                }}
                className="w-full h-11 inline-flex items-center justify-center rounded-md
                           border border-ash hover:border-signal
                           text-sm text-bone/60 hover:text-signal transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                Удалить аккаунт
              </button>
            </div>
          )}
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
      return 'завершена'
    default:
      return status.toLowerCase()
  }
}