import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { StudioFilter } from '@/components/admin/StudioFilter'
import { BookingsFilter } from '@/components/admin/BookingsFilter'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'
import { BookingStatusActions } from '@/components/admin/BookingStatusActions'

export const dynamic = 'force-dynamic'

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const

type BookingStatusValue = (typeof STATUSES)[number]

const STATUS_LABELS: Record<BookingStatusValue, string> = {
  PENDING: 'ожидает',
  CONFIRMED: 'подтверждена',
  CANCELLED: 'отменена',
  COMPLETED: 'завершена',
}

const STATUS_HELP: { status: BookingStatusValue; live: boolean; text: string }[] = [
  {
    status: 'PENDING',
    live: false,
    text: 'новая заявка, студия ещё не подтвердила → «Подтвердить» или «Отменить».',
  },
  {
    status: 'CONFIRMED',
    live: true,
    text: 'клиент записан, ждёт сессию → после проведения «Завершить».',
  },
  {
    status: 'CANCELLED',
    live: false,
    text: 'заявка отменена клиентом или студией.',
  },
  {
    status: 'COMPLETED',
    live: true,
    text: 'сессия прошла, заявка закрыта.',
  },
]

/** Дата сессии хранится как UTC-полночь — форматируем без сдвига часового пояса. */
function formatDate(value: Date | null): string {
  if (!value) return 'без даты'
  const iso = value.toISOString().slice(0, 10)
  return iso.split('-').reverse().join('.')
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { studio?: string; status?: string; q?: string }
}) {
  const studioFilter = searchParams.studio
  const statusFilter = STATUSES.find((status) => status === searchParams.status)
  const q = (searchParams.q ?? '').trim()

  const where: Prisma.BookingWhereInput = {}

  if (studioFilter === 'moscow' || studioFilter === 'spb') {
    where.studio = { slug: studioFilter }
  }
  if (statusFilter) {
    where.status = statusFilter
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ]
  }

  const bookings = await prisma.booking.findMany({
    where,
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      room: { select: { id: true, slug: true, name: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
    },
  })

  const hasFilters = Boolean(studioFilter || statusFilter || q)

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">заявки</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <div className="flex items-baseline gap-4">
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Заявки
          </h1>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/40">
            {bookings.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StudioFilter />
          <BookingsFilter />
        </div>
      </div>

      <div className="panel p-5 mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-3">
          статусы заявок — как это работает
        </div>

        <ul className="space-y-2">
          {STATUS_HELP.map((item) => (
            <li
              key={item.status}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
            >
              <span className="inline-flex min-w-[130px] items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70">
                <span className={cn('dot', item.live && 'dot-live')} />
                {STATUS_LABELS[item.status]}
              </span>
              <span className="text-[13px] text-bone/60">{item.text}</span>
            </li>
          ))}
        </ul>

        <p className="field-hint mt-4">
          Статус меняется кнопками в таблице или в карточке заявки. Нажмите на строку
          или карандаш справа, чтобы открыть заявку целиком.
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-bone/40">
          {hasFilters
            ? 'По выбранным фильтрам заявок нет.'
            : 'Пока нет ни одной заявки.'}
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>дата</th>
              <th>время</th>
              <th>услуги</th>
              <th>студия</th>
              <th>клиент</th>
              <th>сумма</th>
              <th>статус</th>
              <th aria-label="редактировать" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <AdminRow key={booking.id} href={`/admin/bookings/${booking.id}`}>
                <td className="font-mono text-[12px] whitespace-nowrap">
                  {formatDate(booking.date)}
                </td>
                <td className="font-mono text-[12px] whitespace-nowrap">
                  {booking.time ?? '—'}
                  {booking.hours > 1 && (
                    <span className="text-bone/40"> · {booking.hours} ч</span>
                  )}
                </td>
                <td>
                  {booking.items.length > 0
                    ? booking.items.map((item) => item.name).join(', ')
                    : '—'}
                </td>
                <td>
                  {booking.studio.city}
                  {booking.room && (
                    <span className="text-bone/50"> · {booking.room.name}</span>
                  )}
                </td>
                <td>
                  <span className="text-bone">{booking.name}</span>
                  <div className="text-[11px] text-bone/40 mt-0.5">{booking.phone}</div>
                  {booking.telegram && (
                    <div className="text-[11px] text-bone/40">{booking.telegram}</div>
                  )}
                </td>
                <td className="font-mono text-[12px] whitespace-nowrap">
                  {booking.total.toLocaleString('ru-RU')} ₽
                </td>
                <td>
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60 whitespace-nowrap">
                      <span
                        className={cn(
                          'dot',
                          booking.status === 'CONFIRMED' && 'dot-live'
                        )}
                      />
                      {STATUS_LABELS[booking.status]}
                    </span>
                    <BookingStatusActions id={booking.id} status={booking.status} />
                  </div>
                </td>
                <EditCell />
              </AdminRow>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
