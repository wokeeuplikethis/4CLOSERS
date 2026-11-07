import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { hashPassword } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
  })

  return NextResponse.json({ users })
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const body = await request.json().catch(() => ({}))

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const rawRole = typeof body.role === 'string' ? body.role : 'USER'

  if (!name) {
    return NextResponse.json({ error: 'Укажите имя' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Пароль должен быть не короче 6 символов' },
      { status: 400 }
    )
  }
  if (rawRole !== 'USER' && rawRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Некорректная роль' }, { status: 400 })
  }
  const role: 'USER' | 'ADMIN' = rawRole

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Пользователь с таким email уже существует' },
      { status: 409 }
    )
  }

  try {
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ user }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
