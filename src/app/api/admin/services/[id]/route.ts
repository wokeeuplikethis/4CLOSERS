import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const service = await prisma.service.findUnique({
    where: { id: params.id },
    include: {
      studio: { select: { slug: true, city: true } },
      room: { select: { id: true, slug: true, name: true } },
    },
  })
  if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ service })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const body = await req.json().catch(() => ({}))
  const allowed = [
    'name',
    'slug',
    'description',
    'price',
    'duration',
    'features',
    'isActive',
    'sortOrder',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      if (key === 'price' || key === 'duration' || key === 'sortOrder') {
        const n = Number(body[key])
        if (Number.isFinite(n)) data[key] = n
      } else if (key === 'features') {
        data[key] = Array.isArray(body[key])
          ? body[key].filter((f: unknown): f is string => typeof f === 'string')
          : []
      } else if (key === 'isActive') {
        data[key] = Boolean(body[key])
      } else {
        data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key]
      }
    }
  }

  const existing = await prisma.service.findUnique({
    where: { id: params.id },
    select: { studioId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if ('roomId' in body) {
    const rawRoomId = body.roomId
    if (rawRoomId === null || rawRoomId === undefined) {
      data.roomId = null
    } else if (typeof rawRoomId === 'string') {
      const value = rawRoomId.trim()
      if (!value) {
        data.roomId = null
      } else {
        const room = await prisma.room.findUnique({ where: { id: value } })
        if (!room || room.studioId !== existing.studioId) {
          return NextResponse.json({ error: 'Помещение не найдено' }, { status: 400 })
        }
        data.roomId = room.id
      }
    } else {
      return NextResponse.json({ error: 'Некорректное помещение' }, { status: 400 })
    }
  }

  if ('requiresSchedule' in body) {
    if (typeof body.requiresSchedule !== 'boolean') {
      return NextResponse.json({ error: 'requiresSchedule должен быть boolean' }, { status: 400 })
    }
    data.requiresSchedule = body.requiresSchedule
  }

  try {
    const service = await prisma.service.update({
      where: { id: params.id },
      data,
      include: { room: { select: { id: true, slug: true, name: true } } },
    })
    return NextResponse.json({ service })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'slug уже занят' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  try {
    await prisma.service.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}