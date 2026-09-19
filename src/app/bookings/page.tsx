'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getStudio } from '@/data/studios'
import { getServices } from '@/data/services'
import { useStudio } from '@/components/StudioProvider'

export default function BookingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { currentStudio } = useStudio()
  const slugParam = (searchParams.slug as string) || currentStudio
  const studio = getStudio(slugParam as 'moscow' | 'spb')
  const services = getServices(slugParam as 'moscow' | 'spb')
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen pt-32">
      <section className="section">
        <div className="container-custom max-w-2xl">
          <header className="text-center mb-12">
            <h1 className="font-display text-display-lg font-bold text-white mb-4">ЗАПИСАТЬСЯ НА СЕССИЮ</h1>
            <p className="text-body-lg text-graphite-200">
              Выберите услугу в студии <span className="text-accent">{studio.city}</span>.
            </p>
          </header>

          <div className="card p-8">
            {submitted ? (
              <div className="text-center py-8">
                <h2 className="font-display text-2xl font-bold text-white mb-4">Заявка отправлена!</h2>
                <p className="text-body text-graphite-200 mb-6">Мы скоро с вами свяжемся для подтверждения.</p>
                <Link href="/" className="btn-secondary">На главную</Link>
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const serviceSelect = form.elements.namedItem('service') as HTMLSelectElement
                  const data = {
                    studioSlug: slugParam,
                    serviceSlug: serviceSelect.value,
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
                    if (res.ok) {
                      setSubmitted(true)
                    } else {
                      alert('Ошибка при отправке. Попробуйте позже.')
                    }
                  } catch {
                    alert('Ошибка при отправке.')
                  }
                }}
              >
                <div>
                  <label htmlFor="service" className="label">Услуга</label>
                  <select id="service" name="service" className="input-field" defaultValue="">
                    <option value="">Выберите услугу</option>
                    {services.map(s => (
                      <option key={s.slug} value={s.slug}>{s.name} — {s.price}₽ / {s.duration} мин</option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="label">Дата</label>
                    <input id="date" name="date" type="date" className="input-field" required />
                  </div>
                  <div>
                    <label htmlFor="time" className="label">Время</label>
                    <input id="time" name="time" type="time" className="input-field" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="comment" className="label">Комментарий</label>
                  <textarea id="comment" name="comment" rows={3} className="input-field resize-none" placeholder="Расскажите о вашем проекте..." />
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-lg">
                  Подтвердить запись
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
