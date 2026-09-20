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
  const studioSlug = searchParams.get('studio')

  const artists = await prisma.artist.findMany({
    where: studioSlug ? { studio: { slug: studioSlug } } : undefined,
    orderBy: [{ studioId: 'asc' }, { sortOrder: 'asc' }],
    include: {
      studio: { select: { slug: true, city: true } },
      _count: { select: { tracks: true } },
    },
  })

  return NextResponse.json({ artists })
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
  const avatar = typeof body.avatar === 'string' && body.avatar ? body.avatar : null
  const genre = typeof body.genre === 'string' ? body.genre.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const isFeatured = body.isFeatured === true
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

  if (!studioSlug || !name || !slug) {
    return NextResponse.json(
      { error: 'studioSlug, name, slug обязательны' },
      { status: 400 }
    )
  }

  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } })
  if (!studio) {
    return NextResponse.json({ error: 'Студия не найдена' }, { status: 404 })
  }

  try {
    const artist = await prisma.artist.create({
      data: {
        studioId: studio.id,
        name,
        slug,
        avatar,
        genre: genre || null,
        bio: bio || null,
        isFeatured,
        sortOrder,
      },
    })
    return NextResponse.json({ artist })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Артист с таким slug уже есть в этой студии' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}