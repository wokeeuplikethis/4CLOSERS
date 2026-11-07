import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9-]+$/

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: {
      studio: { select: { slug: true, city: true } },
    },
  })
  if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ room })
}

export async function PATCH(
  req: Request,
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

  const existing = await prisma.room.findUnique({
    where: { id: params.id },
    select: { id: true, studioId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // studioId намеренно не меняется: помещение остаётся в своей студии.
  const data: Record<string, unknown> = {}

  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'name не может быть пустым' }, { status: 400 })
    }
    data.name = name
  }

  if ('slug' in body) {
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
    if (!SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: 'slug: только латиница, цифры и дефис' },
        { status: 400 }
      )
    }

    const duplicate = await prisma.room.findUnique({
      where: { studioId_slug: { studioId: existing.studioId, slug } },
      select: { id: true },
    })
    if (duplicate && duplicate.id !== existing.id) {
      return NextResponse.json(
        { error: 'Помещение с таким slug уже есть в этой студии' },
        { status: 409 }
      )
    }

    data.slug = slug
  }

  if ('description' in body) {
    data.description = typeof body.description === 'string' ? body.description.trim() : ''
  }

  if ('image' in body) {
    data.image = typeof body.image === 'string' ? body.image.trim() : ''
  }

  if ('sortOrder' in body) {
    const sortOrder = Number(body.sortOrder)
    if (!Number.isFinite(sortOrder)) {
      return NextResponse.json(
        { error: 'sortOrder должен быть числом' },
        { status: 400 }
      )
    }
    data.sortOrder = sortOrder
  }

  if ('isActive' in body) {
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive должен быть boolean' },
        { status: 400 }
      )
    }
    data.isActive = body.isActive
  }

  try {
    const room = await prisma.room.update({
      where: { id: params.id },
      data,
      include: {
        studio: { select: { slug: true, city: true } },
      },
    })
    return NextResponse.json({ room })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Помещение с таким slug уже есть в этой студии' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
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
    await prisma.room.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
