import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth/jwt'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const tokenMatch = cookie.match(/auth_token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    const { studioSlug, serviceSlug, date, time, comment } = await request.json()

    const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } })
    if (!studio) {
      return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
    }

    const service = await prisma.service.findFirst({
      where: { studioId: studio.id, slug: serviceSlug, isActive: true },
    })
    if (!service) {
      return NextResponse.json({ error: 'Услуга не найдена' }, { status: 404 })
    }

    const booking = await prisma.booking.create({
      data: {
        userId: payload.userId,
        studioId: studio.id,
        serviceId: service.id,
        date: new Date(date),
        time,
        status: 'PENDING',
        comment: comment || '',
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Ошибка создания записи' }, { status: 500 })
  }
}
