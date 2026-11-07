import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { BookingForm } from '@/components/admin/BookingForm'

export const dynamic = 'force-dynamic'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'ожидает',
  CONFIRMED: 'подтверждена',
  CANCELLED: 'отменена',
  COMPLETED: 'завершена',
}

/** Дата сессии хранится как UTC-полночь — форматируем без сдвига часового пояса. */
function formatDate(value: Date | null): string {
  if (!value) return 'без даты'
  const iso = value.toISOString().slice(0, 10)
  return iso.split('-').reverse().join('.')
}

function formatDateTime(value: Date): string {
  return value.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminBookingEditPage({
  params,
}: {
  params: { id: string }
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      room: { select: { id: true, slug: true, name: true } },
      studio: {
        select: {
          id: true,
          slug: true,
          city: true,
          name: true,
          rooms: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, name: true },
          },
        },
      },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  })

  if (!booking) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">заявка</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          {booking.name}
        </h1>
        <span className={cn('tag', booking.status === 'CONFIRMED' && 'tag-signal')}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      <p className="field-hint mb-10">
        Статус заявки меняется в форме ниже или кнопками быстрого доступа в списке
        заявок.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="panel p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-2">
            контакты
          </div>
          <div className="datum">
            <span className="k">имя</span>
            <span className="v">{booking.name}</span>
          </div>
          <div className="datum">
            <span className="k">телефон</span>
            <span className="v">{booking.phone}</span>
          </div>
          <div className="datum">
            <span className="k">telegram</span>
            <span className="v">{booking.telegram ?? '—'}</span>
          </div>
          <div className="datum">
            <span className="k">клиент</span>
            <span className="v">
              {booking.user
                ? `${booking.user.email} · ${booking.user.role === 'ADMIN' ? 'админ' : 'пользователь'}`
                : 'гость'}
            </span>
          </div>
        </div>

        <div className="panel p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-2">
            сессия
          </div>
          <div className="datum">
            <span className="k">студия</span>
            <span className="v">{booking.studio.city}</span>
          </div>
          <div className="datum">
            <span className="k">помещение</span>
            <span className="v">{booking.room?.name ?? 'без помещения'}</span>
          </div>
          <div className="datum">
            <span className="k">дата</span>
            <span className="v">{formatDate(booking.date)}</span>
          </div>
          <div className="datum">
            <span className="k">время</span>
            <span className="v">{booking.time ?? '—'}</span>
          </div>
          <div className="datum">
            <span className="k">часы</span>
            <span className="v">{booking.hours} ч</span>
          </div>
          <div className="datum">
            <span className="k">создана</span>
            <span className="v">{formatDateTime(booking.createdAt)}</span>
          </div>
          <div className="datum">
            <span className="k">обновлена</span>
            <span className="v">{formatDateTime(booking.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="panel p-5 mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
          услуги
        </div>

        {booking.items.length === 0 ? (
          <p className="text-sm text-bone/40">В заявке нет услуг.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>название</th>
                <th>цена</th>
                <th>длительность</th>
                <th>оплата</th>
              </tr>
            </thead>
            <tbody>
              {booking.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td className="font-mono text-[12px] whitespace-nowrap">
                    {item.price.toLocaleString('ru-RU')} ₽
                    {item.requiresSchedule && (
                      <span className="text-bone/40"> × {booking.hours}</span>
                    )}
                  </td>
                  <td className="font-mono text-[12px] whitespace-nowrap">
                    {item.duration > 0 ? `${item.duration} мин` : '—'}
                  </td>
                  <td>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/50">
                      {item.requiresSchedule ? 'почасово' : 'фиксированно'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex items-baseline justify-between gap-4 mt-4 pt-4 border-t border-ash">
          <span className="field-label mb-0">итого</span>
          <span className="font-mono text-base text-bone">
            {booking.total.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      <div className="panel p-5 mb-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-3">
          комментарий
        </div>
        {booking.comment ? (
          <p className="text-sm text-bone/70 whitespace-pre-line">{booking.comment}</p>
        ) : (
          <p className="text-sm text-bone/40">Без комментария.</p>
        )}
      </div>

      <BookingForm
        id={booking.id}
        studioSlug={booking.studio.slug as 'moscow' | 'spb'}
        rooms={booking.studio.rooms}
        initialBooking={{
          status: booking.status,
          name: booking.name,
          phone: booking.phone,
          telegram: booking.telegram ?? '',
          date: booking.date ? booking.date.toISOString().slice(0, 10) : '',
          time: booking.time ?? '',
          hours: booking.hours,
          comment: booking.comment ?? '',
          roomId: booking.roomId,
          items: booking.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            requiresSchedule: item.requiresSchedule,
          })),
        }}
      />
    </div>
  )
}
