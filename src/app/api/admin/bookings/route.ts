import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as const

type BookingStatusValue = (typeof STATUSES)[number]

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const { searchParams } = new URL(request.url)
  const studio = searchParams.get('studio')
  const status = searchParams.get('status')
  const q = (searchParams.get('q') ?? '').trim()
  const rawLimit = Number(searchParams.get('limit'))
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 500)
      : 100

  const where: Prisma.BookingWhereInput = {}

  if (studio === 'moscow' || studio === 'spb') {
    where.studio = { slug: studio }
  }

  if (status && STATUSES.includes(status as BookingStatusValue)) {
    where.status = status as BookingStatusValue
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
    ]
  }

  const bookings = await prisma.booking.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      room: { select: { id: true, slug: true, name: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  })

  return NextResponse.json({ bookings })
}
