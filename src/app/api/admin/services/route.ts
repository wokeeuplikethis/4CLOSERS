import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

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

  const services = await prisma.service.findMany({
    where: studioSlug
      ? { studio: { slug: studioSlug } }
      : undefined,
    orderBy: [{ studioId: 'asc' }, { sortOrder: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return NextResponse.json({ services })
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

  const studioSlug = typeof body.studioSlug === 'string' ? body.studioSlug : null
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const price = Number(body.price)
  const duration = Number(body.duration)
  const features = Array.isArray(body.features)
    ? body.features.filter((f: unknown): f is string => typeof f === 'string' && f.trim() !== '')
    : []
  const isActive = body.isActive !== false
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

  if (!studioSlug || !name || !slug || !description) {
    return NextResponse.json(
      { error: 'studioSlug, name, slug, description обязательны' },
      { status: 400 }
    )
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: 'price должен быть числом ≥ 0' }, { status: 400 })
  }
  if (!Number.isFinite(duration) || duration < 0) {
    return NextResponse.json({ error: 'duration должен быть числом ≥ 0' }, { status: 400 })
  }

  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } })
  if (!studio) {
    return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
  }

  try {
    const service = await prisma.service.create({
      data: {
        studioId: studio.id,
        name,
        slug,
        description,
        price,
        duration,
        features,
        isActive,
        sortOrder,
      },
    })
    return NextResponse.json({ service })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Ошибка создания'
    // Уникальный индекс [studioId, slug]
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Услуга с таким slug уже есть в этой студии' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}