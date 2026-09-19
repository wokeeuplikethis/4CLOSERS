import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Админ-панель — 4CLOSERS',
  robots: 'noindex, nofollow',
}

export default async function AdminPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value ?? null

  if (!token) redirect('/login?redirect=/admin')

  try {
    const payload = await verifyToken(token)
    if (payload.role !== 'ADMIN') redirect('/')
  } catch {
    redirect('/login?redirect=/admin')
  }

  const prisma = new PrismaClient()

  const [users, bookings, stats] = await Promise.all([
    prisma.user.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.booking.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: true, studio: true, service: true },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    ]),
  ])

  const [userCount, bookingCount, confirmedCount] = stats

  return (
    <main className="min-h-[100svh] pt-24 pb-20">
      <section className="shell">
        <div className="section-mark mb-8">
          <span className="num">админ</span>
          <span className="rule" />
        </div>

        <div className="flex items-end justify-between gap-6 mb-14">
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Панель
          </h1>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/50">
            <span className="dot dot-live" />
            доступ разрешён
          </span>
        </div>

        {/* Счётчики */}
        <div className="grid grid-cols-3 gap-4 mb-16 border-t border-ash pt-6">
          <Stat value={userCount} label="пользователей" />
          <Stat value={bookingCount} label="заявок" />
          <Stat value={confirmedCount} label="подтверждено" />
        </div>

        {/* Пользователи */}
        <div className="mb-16">
          <div className="section-mark mb-6">
            <span className="num">01</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/80">
              пользователи
            </span>
            <span className="rule" />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>имя</th>
                <th>почта</th>
                <th>роль</th>
                <th>создан</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-bone">{u.name || '—'}</td>
                  <td className="font-mono text-[12px]">{u.email}</td>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className={cn('dot', u.role === 'ADMIN' && 'dot-live')} />
                      {u.role === 'ADMIN' ? 'админ' : 'клиент'}
                    </span>
                  </td>
                  <td className="font-mono text-[12px] text-bone/50">
                    {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Заявки */}
        <div>
          <div className="section-mark mb-6">
            <span className="num">02</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/80">
              заявки
            </span>
            <span className="rule" />
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-bone/40">Пока пусто.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>дата</th>
                  <th>время</th>
                  <th>услуга</th>
                  <th>студия</th>
                  <th>клиент</th>
                  <th>статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id}>
                    <td className="font-mono text-[12px]">
                      {new Date(b.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="font-mono text-[12px]">{b.time}</td>
                    <td>{b.service?.name ?? '—'}</td>
                    <td>{b.studio?.city ?? '—'}</td>
                    <td>{b.user?.name ?? '—'}</td>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn('dot', b.status === 'CONFIRMED' && 'dot-live')} />
                        {b.status.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display font-light text-3xl lg:text-4xl text-bone tracking-[-0.02em]">
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mt-2">
        {label}
      </div>
    </div>
  )
}