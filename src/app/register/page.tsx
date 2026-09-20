'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser } = useStudio()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const password2 = (form.elements.namedItem('password2') as HTMLInputElement).value

    if (password.length < 6) {
      setError('Пароль слишком короткий — минимум 6 символов.')
      return
    }
    if (password !== password2) {
      setError('Пароли не совпадают.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Не получилось зарегистрироваться. Попробуйте снова.')
        return
      }
      await refreshUser()
      router.push('/profile')
      router.refresh()
    } catch {
      setError('Сеть недоступна. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100svh] flex items-center justify-center px-4 py-24">
      <section className="w-full max-w-md">
        <div className="mb-10">
          <Link
            href="/"
            className="font-display text-lg font-medium text-bone tracking-tight"
            aria-label="4CLOSERS — на главную"
          >
            4CLOSERS
          </Link>
        </div>

        <div className="section-mark mb-8">
          <span className="num">регистрация</span>
          <span className="rule" />
        </div>

        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-8"
          style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}
        >
          Создать аккаунт
        </h1>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="field-label">
              имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Как к вам обращаться"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@studio.ru"
              className="field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="field-label">
                пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="мин. 6 символов"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="password2" className="field-label">
                повторите
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                className="field"
              />
            </div>
          </div>

          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-solid w-full h-12 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Создаём…' : 'Создать аккаунт'}
            {!loading && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-ash flex items-center justify-between gap-4">
          <span className="text-sm text-bone/50">Уже есть аккаунт?</span>
          <Link
            href="/login"
            className="text-sm text-bone hover:text-signal transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
          >
            Войти
          </Link>
        </div>
      </section>
    </main>
  )
}