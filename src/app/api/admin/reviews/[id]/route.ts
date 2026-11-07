import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

const reviewInclude = {
  user: { select: { id: true, name: true, email: true, avatar: true } },
  studio: { select: { id: true, slug: true, city: true, name: true } },
} as const

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

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: reviewInclude,
  })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ review })
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

  const exists = await prisma.review.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const data: { rating?: number; content?: string; studioId?: string } = {}

  if ('rating' in body) {
    const rating = Number(body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рейтинг должен быть целым числом от 1 до 5' },
        { status: 400 }
      )
    }
    data.rating = rating
  }

  if ('content' in body) {
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!content) {
      return NextResponse.json(
        { error: 'Текст отзыва не может быть пустым' },
        { status: 400 }
      )
    }
    if (content.length > 4000) {
      return NextResponse.json(
        { error: 'Текст отзыва слишком длинный (максимум 4000 символов)' },
        { status: 400 }
      )
    }
    data.content = content
  }

  if ('studioSlug' in body || 'studioId' in body) {
    const slug = typeof body.studioSlug === 'string' ? body.studioSlug.trim() : ''
    const id = typeof body.studioId === 'string' ? body.studioId.trim() : ''

    let studioId: string | null = null
    if (slug) {
      const studio = await prisma.studio.findUnique({
        where: { slug },
        select: { id: true },
      })
      studioId = studio?.id ?? null
    } else if (id) {
      const studio = await prisma.studio.findUnique({
        where: { id },
        select: { id: true },
      })
      studioId = studio?.id ?? null
    }

    if (!studioId) {
      return NextResponse.json({ error: 'Студия не найдена' }, { status: 400 })
    }
    data.studioId = studioId
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: 'Нет данных для обновления' },
      { status: 400 }
    )
  }

  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data,
      include: reviewInclude,
    })
    return NextResponse.json({ review })
  } catch {
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

  const review = await prisma.review.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.review.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
