import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/auth_token=([^;]+)/)
  return match ? match[1] : null
}

async function getUserId(request: Request): Promise<string | null> {
  const token = getTokenFromCookie(request.headers.get('cookie'))
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return payload?.userId ?? null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { id: true, name: true, slug: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
    },
  })

  return NextResponse.json({ user, bookings })
}

export async function PATCH(request: Request) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const data: { name?: string | null } = {}

  if (typeof body.name === 'string') {
    data.name = body.name.trim() || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
}

export async function DELETE(request: Request) {
  const userId = await getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Чистим файл аватара, если он наш
  const prev = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  })
  if (prev?.avatar?.startsWith('/uploads/avatars/')) {
    const { unlink } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const prevPath = join(process.cwd(), 'public', prev.avatar)
    unlink(prevPath).catch(() => {})
  }

  await prisma.booking.deleteMany({ where: { userId } })
  await prisma.user.delete({ where: { id: userId } })

  const response = NextResponse.json({ success: true })
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}