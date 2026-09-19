import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

export const metadata: Metadata = {
  title: 'Админ-панель — 4CLOSERS',
  robots: 'noindex, nofollow',
}

export default async function AdminPage() {
  // Check auth via cookie manually (middleware should redirect, but server-side check is required)
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value || null

  if (!token) {
    redirect('/login?redirect=/admin')
  }

  try {
    const payload = await verifyToken(token)
    if (payload.role !== 'ADMIN') {
      redirect('/')
    }
  } catch {
    redirect('/login?redirect=/admin')
  }

  const prisma = new PrismaClient()
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  const bookings = await prisma.booking.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: true, studio: true, service: true },
  })

  return (
    <main className="min-h-screen pt-32">
      <section className="section">
        <div className="container-custom max-w-5xl">
          <header className="mb-8">
            <h1 className="font-display text-display-lg font-bold text-white">АДМИН-ПАНЕЛЬ</h1>
            <p className="text-graphite-200">Управление студией. <span className="text-green-400">Доступ разрешен.</span></p>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-white mb-4">Пользователи ({users.length})</h2>
              <table className="w-full text-sm">
                <thead className="text-graphite-300 border-b border-graphite-200/10">
                  <tr>
                    <th className="text-left pb-2 font-medium">Имя</th>
                    <th className="text-left pb-2 font-medium">Email</th>
                    <th className="text-left pb-2 font-medium">Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-graphite-200/5 py-3">
                      <td className="text-white py-2">{u.name}</td>
                      <td className="text-graphite-300 py-2">{u.email}</td>
                      <td className="py-2">
                        <span className={u.role === 'ADMIN' ? 'text-accent' : 'text-graphite-200'}>{u.role}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-xl font-bold text-white mb-4">Заявки ({bookings.length})</h2>
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div key={b.id} className="p-3 rounded-lg bg-graphite-200/10 border border-graphite-200/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white">{b.service?.name || 'Услуга'}</span>
                        <span className="text-caption text-graphite-300 ml-2">{b.studio?.city}</span>
                      </div>
                      <span className="text-caption text-graphite-300">{new Date(b.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="mt-2 text-body-sm text-graphite-200">
                      Клиент: <span className="text-white">{b.user?.name || '—'}</span> · Время: <span className="text-white">{b.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
