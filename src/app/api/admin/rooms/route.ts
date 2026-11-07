import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

const SLUG_RE = /^[a-z0-9-]+$/

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const { searchParams } = new URL(request.url)
  const studioSlug = searchParams.get('studio') // 'moscow' | 'spb' | null

  const rooms = await prisma.room.findMany({
    where: studioSlug ? { studio: { slug: studioSlug } } : undefined,
    orderBy: [{ studioId: 'asc' }, { sortOrder: 'asc' }],
    include: {
      studio: { select: { slug: true, city: true } },
    },
  })

  return NextResponse.json({ rooms })
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

  const studioSlug = typeof body.studioSlug === 'string' ? body.studioSlug.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const image = typeof body.image === 'string' ? body.image.trim() : ''
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
  const isActive = body.isActive !== false

  if (!studioSlug || !name || !slug) {
    return NextResponse.json(
      { error: 'studioSlug, name и slug обязательны' },
      { status: 400 }
    )
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: 'slug: только латиница, цифры и дефис' },
      { status: 400 }
    )
  }

  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } })
  if (!studio) {
    return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
  }

  const duplicate = await prisma.room.findUnique({
    where: { studioId_slug: { studioId: studio.id, slug } },
  })
  if (duplicate) {
    return NextResponse.json(
      { error: 'Помещение с таким slug уже есть в этой студии' },
      { status: 409 }
    )
  }

  try {
    const room = await prisma.room.create({
      data: {
        studioId: studio.id,
        name,
        slug,
        description,
        image,
        sortOrder,
        isActive,
      },
      include: {
        studio: { select: { slug: true, city: true } },
      },
    })
    return NextResponse.json({ room }, { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    // Уникальный индекс [studioId, slug]
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Помещение с таким slug уже есть в этой студии' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
