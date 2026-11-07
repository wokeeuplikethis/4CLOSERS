import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { hashPassword } from '@/lib/auth/jwt'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { bookings: true, reviews: true } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ user })
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

  const existing = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 400 })
    data.name = name
  }

  if (typeof body.email === 'string') {
    const email = body.email.trim()
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Укажите корректный email' }, { status: 400 })
    }
    const sameEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (sameEmail && sameEmail.id !== params.id) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }
    data.email = email
  }

  if (typeof body.role === 'string') {
    if (body.role !== 'USER' && body.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Некорректная роль' }, { status: 400 })
    }
    if (existing.role === 'ADMIN' && body.role === 'USER') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
      if (admins <= 1) {
        return NextResponse.json(
          { error: 'Нельзя снять роль с последнего администратора' },
          { status: 400 }
        )
      }
    }
    data.role = body.role
  }

  // Пустой пароль — «не менять», не ошибка.
  if (typeof body.password === 'string' && body.password.length > 0) {
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не короче 6 символов' },
        { status: 400 }
      )
    }
    data.passwordHash = await hashPassword(body.password)
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
  }

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    })
    return NextResponse.json({ user })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 })
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

  if (auth.userId === params.id) {
    return NextResponse.json({ error: 'Нельзя удалить свой аккаунт' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, role: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (user.role === 'ADMIN') {
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (admins <= 1) {
      return NextResponse.json(
        { error: 'Нельзя удалить последнего администратора' },
        { status: 400 }
      )
    }
  }

  try {
    // Заявки пользователя остаются с userId = null (SetNull), отзывы удаляются (Cascade).
    await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
