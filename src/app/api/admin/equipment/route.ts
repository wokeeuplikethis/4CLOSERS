import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { EQUIPMENT_CATEGORIES } from '@/types'

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
  const studioSlug = searchParams.get('studio')

  const equipment = await prisma.equipment.findMany({
    where: studioSlug ? { studio: { slug: studioSlug } } : undefined,
    orderBy: [{ studioId: 'asc' }, { category: 'asc' }, { sortOrder: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return NextResponse.json({ equipment })
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
  const category = typeof body.category === 'string' ? body.category : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const model = typeof body.model === 'string' ? body.model.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const image = typeof body.image === 'string' && body.image ? body.image : null
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

  if (!studioSlug || !name || !model || !category) {
    return NextResponse.json(
      { error: 'studioSlug, category, name, model обязательны' },
      { status: 400 }
    )
  }

  if (!EQUIPMENT_CATEGORIES.includes(category as (typeof EQUIPMENT_CATEGORIES)[number])) {
    return NextResponse.json({ error: 'Неизвестная категория' }, { status: 400 })
  }

  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } })
  if (!studio) {
    return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
  }

  try {
    const item = await prisma.equipment.create({
      data: {
        studioId: studio.id,
        category,
        name,
        model,
        description: description || null,
        image,
        sortOrder,
      },
    })
    return NextResponse.json({ equipment: item })
  } catch {
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}