import Link from 'next/link'
import {
  AudioLines,
  Building2,
  CalendarCheck,
  Guitar,
  ListMusic,
  MicVocal,
  Star,
  Users,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}

export default async function AdminOverviewPage() {
  const [
    usersCount,
    adminsCount,
    bookingsCount,
    pendingCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    reviewsCount,
    roomsCount,
    servicesCount,
    artistsCount,
    equipmentCount,
    teamCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.review.count(),
    prisma.room.count(),
    prisma.service.count(),
    prisma.artist.count(),
    prisma.equipment.count(),
    prisma.teamMember.count(),
  ])

  const closedCount = completedCount + cancelledCount

  const sections = [
    {
      href: '/admin/bookings',
      label: 'Заявки',
      value: bookingsCount,
      note:
        pendingCount > 0
          ? `${pendingCount} ${plural(pendingCount, 'ожидает', 'ожидают', 'ожидают')} подтверждения`
          : `${closedCount} ${plural(closedCount, 'закрыта', 'закрыты', 'закрыто')}`,
      icon: CalendarCheck,
    },
    {
      href: '/admin/users',
      label: 'Пользователи',
      value: usersCount,
      note: `${adminsCount} ${plural(adminsCount, 'админ', 'админа', 'админов')}`,
      icon: Users,
    },
    {
      href: '/admin/reviews',
      label: 'Отзывы',
      value: reviewsCount,
      icon: Star,
    },
    {
      href: '/admin/studios',
      label: 'Студии / Помещения',
      value: roomsCount,
      note: 'помещений',
      icon: Building2,
    },
    {
      href: '/admin/services',
      label: 'Услуги',
      value: servicesCount,
      icon: MicVocal,
    },
    {
      href: '/admin/artists',
      label: 'Артисты',
      value: artistsCount,
      icon: AudioLines,
    },
    {
      href: '/admin/equipment',
      label: 'Оборудование',
      value: equipmentCount,
      icon: Guitar,
    },
    {
      href: '/admin/team',
      label: 'Команда',
      value: teamCount,
      icon: ListMusic,
    },
  ]

  return (
    <div>
      <div className="section-mark mb-8">
        <span className="num">админ</span>
        <span className="rule" />
      </div>

      <div className="flex items-end justify-between gap-6 mb-12">
        <div>
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Обзор
          </h1>
          <p className="text-sm text-bone/40 mt-3">
            Сводка по заявкам, пользователям и контенту сайта.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/50 whitespace-nowrap">
          <span className="dot dot-live" />
          доступ разрешён
        </span>
      </div>

      {/* Главные цифры */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-8 mb-12">
        <BigStat value={bookingsCount} label="заявок всего" />
        <BigStat
          value={pendingCount}
          label="ожидают подтверждения"
          accent={pendingCount > 0}
        />
        <BigStat value={confirmedCount} label="подтверждено" />
        <BigStat
          value={closedCount}
          label="закрыто заявок"
          note={`${completedCount} завершено · ${cancelledCount} отменено`}
        />
        <BigStat value={usersCount} label="пользователей" />
      </div>

      {/* Требуют внимания */}
      <div className="panel p-6 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-3">
              требуют внимания
            </div>
            {pendingCount > 0 ? (
              <p className="flex items-center gap-3 text-bone">
                <span className="dot dot-live" aria-hidden="true" />
                <span className="font-display text-xl tracking-[-0.01em]">
                  {pendingCount === 1
                    ? '1 заявка ожидает подтверждения'
                    : `${pendingCount} заявок ожидают подтверждения`}
                </span>
              </p>
            ) : (
              <p className="text-bone/50">Новых заявок нет.</p>
            )}
            <p className="font-mono text-[11px] text-bone/35 mt-3">
              завершено {completedCount} · отменено {cancelledCount}
            </p>
          </div>

          {pendingCount > 0 && (
            <Link
              href="/admin/bookings?status=PENDING"
              className="btn btn-line h-10"
            >
              Перейти к заявкам
            </Link>
          )}
        </div>
      </div>

      {/* Разделы */}
      <div className="section-mark mb-6">
        <span className="num">разделы</span>
        <span className="rule" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Link
              key={section.href}
              href={section.href}
              className="panel group flex flex-col gap-5 p-5 transition-colors hover:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal/60"
            >
              <Icon
                className="h-5 w-5 text-bone/35 transition-colors group-hover:text-signal"
                aria-hidden="true"
              />
              <div>
                <div className="font-display font-light text-2xl text-bone tracking-[-0.02em]">
                  {section.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mt-1.5">
                  {section.label}
                </div>
                {'note' in section && section.note && (
                  <div className="text-[11px] text-bone/30 mt-1">{section.note}</div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function BigStat({
  value,
  label,
  accent,
  note,
}: {
  value: number
  label: string
  accent?: boolean
  note?: string
}) {
  return (
    <div className="border-t border-ash pt-4">
      <div
        className={cn(
          'font-display font-light text-4xl lg:text-5xl tracking-[-0.03em]',
          accent ? 'text-signal' : 'text-bone'
        )}
      >
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mt-2">
        {label}
      </div>
      {note && (
        <div className="font-mono text-[10px] text-bone/30 mt-1.5">{note}</div>
      )}
    </div>
  )
}
