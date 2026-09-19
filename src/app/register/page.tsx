'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  return (
    <main className="min-h-screen flex items-center justify-center pt-20">
      <section className="w-full max-w-md px-6">
        <div className="card p-8 lg:p-10">
          <header className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-white mb-2">РЕГИСТРАЦИЯ</h1>
            <p className="text-body-sm text-graphite-300">Создайте аккаунт в студии</p>
          </header>
          <form
            className="space-y-5"
            onSubmit={async (e) => {
              e.preventDefault()
              setLoading(true)
              const form = e.currentTarget
              const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: (form.elements.namedItem('name') as HTMLInputElement).value,
                  email: (form.elements.namedItem('email') as HTMLInputElement).value,
                  password: (form.elements.namedItem('password') as HTMLInputElement).value,
                }),
              })
              const data = await res.json()
              setLoading(false)
              if (res.ok) {
                window.location.href = '/profile'
              } else {
                alert(data.error || 'Ошибка регистрации')
              }
            }}
          >
            <div>
              <label htmlFor="name" className="label">Имя</label>
              <input id="name" name="name" type="text" className="input-field" placeholder="Ваше имя" required />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" className="input-field" placeholder="you@studio.ru" required />
            </div>
            <div>
              <label htmlFor="password" className="label">Пароль</label>
              <input id="password" name="password" type="password" className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <div className="mt-6 text-center text-body-sm text-graphite-300">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-accent hover:text-white transition-colors">Войти</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
