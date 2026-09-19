'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Не получилось войти. Проверьте почту и пароль.')
        return
      }
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
        {/* Шапка */}
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
          <span className="num">вход</span>
          <span className="rule" />
        </div>

        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-8"
          style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}
        >
          С возвращением
        </h1>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
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

          <div>
            <label htmlFor="password" className="field-label">
              пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="field"
            />
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
            {loading ? 'Входим…' : 'Войти'}
            {!loading && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-ash flex items-center justify-between gap-4">
          <span className="text-sm text-bone/50">Нет аккаунта?</span>
          <Link
            href="/register"
            className="text-sm text-bone hover:text-signal transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-sm"
          >
            Зарегистрироваться
          </Link>
        </div>

        <p className="mt-8 field-hint">
          <span className="text-signal">демо:</span> admin@4closers.studio / admin123
        </p>
      </section>
    </main>
  )
}