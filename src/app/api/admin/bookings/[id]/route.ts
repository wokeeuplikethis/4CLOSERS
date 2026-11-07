import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const

type BookingStatusValue = (typeof STATUSES)[number]

const bookingInclude: Prisma.BookingInclude = {
  items: true,
  room: { select: { id: true, slug: true, name: true } },
  studio: { select: { id: true, slug: true, city: true, name: true } },
  user: { select: { id: true, name: true, email: true, role: true } },
}

function normalizeTelegram(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const clean = value
    .replace(/[\s@]/g, '')
    .replace(/[^A-Za-z0-9_]/g, '')
    .slice(0, 32)
  return clean ? `@${clean}` : null
}

function parseDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  if (date.toISOString().slice(0, 10) !== value) return null
  return date
}

function unauthorized(status: 401 | 403) {
  return NextResponse.json(
    { error: status === 403 ? 'Forbidden' : 'Unauthorized' },
    { status }
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return unauthorized(auth.status)

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: bookingInclude,
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ booking })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return unauthorized(auth.status)

  const existing = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { items: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const parsedBody = await req.json().catch(() => null)
  if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
  }
  const body = parsedBody as Record<string, unknown>

  const data: Prisma.BookingUpdateInput = {}
  let touched = false

  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 400 })
    if (name.length > 120) {
      return NextResponse.json(
        { error: 'Имя не должно превышать 120 символов' },
        { status: 400 }
      )
    }
    data.name = name
    touched = true
  }

  if ('phone' in body) {
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ error: 'Укажите телефон' }, { status: 400 })
    }
    data.phone = phone
    touched = true
  }

  if ('telegram' in body) {
    data.telegram = normalizeTelegram(body.telegram)
    touched = true
  }

  if ('comment' in body) {
    const raw = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : ''
    data.comment = raw || null
    touched = true
  }

  if ('status' in body) {
    const status = body.status
    if (typeof status !== 'string' || !STATUSES.includes(status as BookingStatusValue)) {
      return NextResponse.json({ error: 'Некорректный статус' }, { status: 400 })
    }
    data.status = status as BookingStatusValue
    touched = true
  }

  let hours = existing.hours
  if ('hours' in body) {
    const parsedHours = Number(body.hours)
    if (!Number.isInteger(parsedHours) || parsedHours < 1 || parsedHours > 24) {
      return NextResponse.json(
        { error: 'Часы: целое число от 1 до 24' },
        { status: 400 }
      )
    }
    hours = parsedHours
    data.hours = parsedHours
    touched = true
  }

  const hasSchedule = existing.items.some((item) => item.requiresSchedule)

  let date = existing.date
  if ('date' in body) {
    const raw = body.date
    const isEmpty =
      raw === null ||
      raw === undefined ||
      (typeof raw === 'string' && raw.trim() === '')
    if (isEmpty) {
      if (hasSchedule) {
        return NextResponse.json(
          { error: 'Услуга требует записи — укажите дату' },
          { status: 400 }
        )
      }
      date = null
    } else if (typeof raw === 'string' && DATE_RE.test(raw.trim())) {
      const parsedDate = parseDate(raw.trim())
      if (!parsedDate) {
        return NextResponse.json({ error: 'Некорректная дата' }, { status: 400 })
      }
      date = parsedDate
    } else {
      return NextResponse.json({ error: 'Некорректная дата' }, { status: 400 })
    }
    data.date = date
    touched = true
  }

  let time = existing.time
  if ('time' in body) {
    const raw = body.time
    if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) {
      time = null
    } else if (typeof raw === 'string') {
      time = raw.trim().slice(0, 20)
    } else {
      return NextResponse.json({ error: 'Некорректное время' }, { status: 400 })
    }
    data.time = time
    touched = true
  }

  if (hasSchedule && !date) {
    return NextResponse.json(
      { error: 'Услуга требует записи — укажите дату' },
      { status: 400 }
    )
  }
  if (hasSchedule && date && !time) {
    return NextResponse.json({ error: 'Укажите время' }, { status: 400 })
  }

  if ('roomId' in body) {
    const rawRoomId = body.roomId
    if (rawRoomId === null || rawRoomId === undefined) {
      data.room = { disconnect: true }
      touched = true
    } else if (typeof rawRoomId === 'string') {
      const value = rawRoomId.trim()
      if (!value) {
        data.room = { disconnect: true }
      } else {
        const room = await prisma.room.findUnique({
          where: { id: value },
          select: { id: true, studioId: true },
        })
        if (!room || room.studioId !== existing.studioId) {
          return NextResponse.json({ error: 'Помещение не найдено' }, { status: 400 })
        }
        data.room = { connect: { id: room.id } }
      }
      touched = true
    } else {
      return NextResponse.json({ error: 'Некорректное помещение' }, { status: 400 })
    }
  }

  if (!touched) {
    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
  }

  // Сумма пересчитывается по часам: обычные услуги — фиксированно,
  // услуги с расписанием — за каждый час сессии.
  const total = existing.items.reduce(
    (sum, item) => sum + item.price * (item.requiresSchedule ? hours : 1),
    0
  )

  try {
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { ...data, total },
      include: bookingInclude,
    })
    return NextResponse.json({ booking })
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить' }, { status: 400 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return unauthorized(auth.status)

  try {
    await prisma.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
