'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check } from 'lucide-react'
import { getStudio } from '@/data/studios'
import { getServices } from '@/data/services'
import { useStudio } from '@/components/StudioProvider'
import { CitySwitch } from '@/components/CitySwitch'

export default function BookingsPage() {
  const router = useRouter()
  const { currentStudio, user, userLoading } = useStudio()
  const studio = getStudio(currentStudio)
  const services = getServices(currentStudio)

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string>('')

  // Редирект на /login, если не авторизован.
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirect=/bookings')
    }
  }, [userLoading, user, router])

  const activeService = services.find((s) => s.slug === selectedService)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const data = {
      studioSlug: currentStudio,
      serviceSlug: selectedService,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      time: (form.elements.namedItem('time') as HTMLInputElement).value,
      comment: (form.elements.namedItem('comment') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      // Сессия истекла — на логин.
      if (res.status === 401) {
        router.push('/login?redirect=/bookings')
        return
      }

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? 'Не удалось создать заявку. Попробуйте позже.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  // Пока грузится user или его нет — заглушка. Это должно быть ПОСЛЕ всех useState/useEffect.
  if (userLoading || !user) {
    return (
      <main className="min-h-[100svh] pt-24 pb-16">
        <div className="shell max-w-2xl">
          <p className="text-sm text-bone/40">Проверяем доступ…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[100svh] pt-24 pb-16">
      <div className="shell flex justify-center mb-14">
        <CitySwitch />
      </div>

      <section className="shell max-w-2xl">
        <div className="section-mark mb-8">
          <span className="num">бронь</span>
          <span className="rule" />
        </div>

        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-4"
          style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}
        >
          Записаться
        </h1>
        <p className="text-sm text-bone/50 mb-12 max-w-[60ch]">
          {studio.city} · {studio.address}. Оставьте заявку — мы подтвердим слот и напишем вам.
        </p>

        {submitted ? (
          <div className="panel p-10 text-center">
            <div className="inline-flex h-12 w-12 rounded-full border border-signal items-center justify-center text-signal mb-6">
              <Check className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-light text-bone mb-3">
              Заявка отправлена
            </h2>
            <p className="text-sm text-bone/60 mb-8 max-w-[44ch] mx-auto">
              Мы свяжемся с вами в течение дня, чтобы подтвердить дату и время.
            </p>
            <Link href="/" className="btn btn-line">
              На главную
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="service" className="field-label">
                услуга
              </label>
              <select
                id="service"
                name="service"
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="field"
              >
                <option value="" disabled>
                  Выберите услугу
                </option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — {s.price.toLocaleString('ru-RU')} ₽ / {Math.floor(s.duration / 60)}ч{' '}
                    {s.duration % 60}м
                  </option>
                ))}
              </select>
              {activeService && (
                <p className="field-hint max-w-[60ch]">{activeService.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="field-label">
                  дата
                </label>
                <input id="date" name="date" type="date" required className="field" />
              </div>
              <div>
                <label htmlFor="time" className="field-label">
                  время
                </label>
                <input id="time" name="time" type="time" required className="field" />
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="field-label">
                комментарий
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={4}
                placeholder="Расскажите о проекте: жанр, референсы, что уже готово…"
                className="field resize-none"
              />
            </div>

            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/35">
                {studio.hours}
              </span>
              <button
                type="submit"
                disabled={loading || !selectedService}
                className="btn btn-solid h-12 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправляем…' : 'Отправить заявку'}
                {!loading && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  )
}