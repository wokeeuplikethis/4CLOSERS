import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function normalizeTelegram(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const clean = value
    .replace(/[\s@]/g, '')
    .replace(/[^A-Za-z0-9_]/g, '')
    .slice(0, 32)
  return clean ? `@${clean}` : null
}

async function getUserId(cookieHeader: string | null): Promise<string | null> {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/auth_token=([^;]+)/)
  if (!match) return null
  try {
    const payload = await verifyToken(match[1])
    return payload?.userId ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    // Заявку может оставить и гость — отсутствие токена не ошибка.
    const userId = await getUserId(request.headers.get('cookie'))

    const parsedBody = await request.json().catch(() => null)
    const body: Record<string, unknown> =
      parsedBody && typeof parsedBody === 'object' ? (parsedBody as Record<string, unknown>) : {}
    const city = typeof body.city === 'string' ? body.city.trim() : ''

    const studio = await prisma.studio.findUnique({ where: { slug: city } })
    if (!studio) {
      return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
    }

    const rawServiceIds: unknown[] = Array.isArray(body.serviceIds) ? body.serviceIds : []
    const serviceIds = Array.from(
      new Set(
        rawServiceIds
          .filter((id): id is string => typeof id === 'string')
          .map((id) => id.trim())
          .filter((id) => id !== '')
      )
    )
    if (serviceIds.length === 0) {
      return NextResponse.json({ error: 'Выберите услугу' }, { status: 400 })
    }

    const foundServices = await prisma.service.findMany({
      where: { studioId: studio.id, isActive: true, id: { in: serviceIds } },
    })
    if (foundServices.length !== serviceIds.length) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 400 })
    }

    // Сохраняем порядок выбора пользователя.
    const services = serviceIds.map((id) => foundServices.find((s) => s.id === id)!)

    const rooms = await prisma.room.findMany({
      where: { studioId: studio.id, isActive: true },
    })
    const rawRoomId =
      typeof body.roomId === 'string' && body.roomId.trim() !== '' ? body.roomId.trim() : null
    if (rawRoomId && !rooms.some((r) => r.id === rawRoomId)) {
      return NextResponse.json({ error: 'Помещение не найдено' }, { status: 400 })
    }

    // Услуги, привязанные к помещению, задают его жёстко.
    const roomLocked = services.filter((s) => s.roomId !== null)
    if (roomLocked.length > 0) {
      if (!rawRoomId || roomLocked.some((s) => s.roomId !== rawRoomId)) {
        return NextResponse.json({ error: 'Выберите студию' }, { status: 400 })
      }
    }
    const roomId = rawRoomId

    const requiresSchedule = services.some((s) => s.requiresSchedule)
    let date: Date | null = null
    let time: string | null = null
    // Часы имеют смысл только для сессионных услуг; по умолчанию — один час.
    let hours = 1

    if (requiresSchedule) {
      const rawDate = typeof body.date === 'string' ? body.date.trim() : ''
      if (!DATE_RE.test(rawDate)) {
        return NextResponse.json({ error: 'Укажите дату' }, { status: 400 })
      }
      const parsedDate = new Date(`${rawDate}T00:00:00.000Z`)
      if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== rawDate) {
        return NextResponse.json({ error: 'Укажите дату' }, { status: 400 })
      }

      const rawTime = typeof body.time === 'string' ? body.time.trim() : ''
      if (!rawTime) {
        return NextResponse.json({ error: 'Укажите время' }, { status: 400 })
      }

      date = parsedDate
      time = rawTime

      const rawHours =
        typeof body.hours === 'number'
          ? body.hours
          : typeof body.hours === 'string' && body.hours.trim() !== ''
          ? Number(body.hours)
          : Number.NaN
      const parsedHours = Number.isFinite(rawHours) ? Math.trunc(rawHours) : 1
      hours = Math.min(24, Math.max(1, parsedHours))
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Укажите имя' }, { status: 400 })
    }
    if (name.length > 120) {
      return NextResponse.json({ error: 'Имя не должно превышать 120 символов' }, { status: 400 })
    }

    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const phoneDigits = phone.replace(/\D/g, '')
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json({ error: 'Укажите телефон' }, { status: 400 })
    }

    const telegram = normalizeTelegram(body.telegram)

    const rawComment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : ''
    const comment = rawComment || null

    // Удалённые услуги — фиксированная цена, сессионные — цена за час.
    const total = services.reduce(
      (sum, s) => sum + (s.requiresSchedule ? hours * s.price : s.price),
      0
    )

    const booking = await prisma.booking.create({
      data: {
        userId,
        studioId: studio.id,
        roomId,
        name,
        phone,
        telegram,
        date,
        time,
        hours,
        status: 'PENDING',
        comment,
        total,
        items: {
          create: services.map((s) => ({
            serviceId: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
            requiresSchedule: s.requiresSchedule,
          })),
        },
      },
      include: { items: true, room: true, studio: true },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Ошибка создания записи' }, { status: 500 })
  }
}
