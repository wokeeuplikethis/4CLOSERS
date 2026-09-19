import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { getStudio } from '@/data/studios'

export const metadata: Metadata = {
  title: 'Профиль — 4CLOSERS',
  description: 'Ваш личный кабинет в студии 4CLOSERS.',
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Read cookie in middleware; for server component we'll rely on cookie passed via middleware headers
  // For simplicity, we'll redirect unauthenticated users via middleware already

  const studioSlug = (searchParams.slug as string) || 'moscow'
  const studio = getStudio(studioSlug as 'moscow' | 'spb')

  return (
    <main className="min-h-screen pt-32">
      <section className="section">
        <div className="container-custom max-w-3xl">
          <div className="card p-8 lg:p-12">
            <header className="mb-8">
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">Профиль</h1>
              <p className="text-graphite-200">Ваш личный кабинет в студии <span className="text-accent">{studio.city}</span>.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-xl font-bold text-white mb-4">Личные данные</h3>
                <ul className="space-y-3 text-body text-graphite-200">
                  <li><span className="text-graphite-300">Имя:</span> <span className="text-white">Артём</span></li>
                  <li><span className="text-graphite-300">Email:</span> user@4closers.studio</li>
                  <li><span className="text-graphite-300">Город:</span> <span className="text-accent">{studio.city}</span></li>
                  <li><span className="text-graphite-300">Статус:</span> <span className="text-green-400">Активен</span></li>
                </ul>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-xl font-bold text-white mb-4">Ближайшая запись</h3>
                <div className="text-body text-graphite-300 mb-3">Нет активных записей</div>
                <a href="/bookings" className="btn-primary inline-flex text-sm px-4 py-2">Записаться</a>
              </div>
            </div>

            <div className="mt-8 border-t border-graphite-200/10 pt-8">
              <h3 className="font-display text-xl font-bold text-white mb-4">История записей</h3>
              <p className="text-graphite-300 text-body">История посещений появится после первой записи.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
