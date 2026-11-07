import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

function isUniqueError(e: unknown) {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code?: unknown }).code === 'P2002'
  )
}

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const artists = await prisma.artist.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { tracks: true } } },
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

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const avatar = typeof body.avatar === 'string' && body.avatar ? body.avatar : null
  const genre = typeof body.genre === 'string' ? body.genre.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const isFeatured = body.isFeatured === true
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

  if (!name || !slug) {
    return NextResponse.json({ error: 'name и slug обязательны' }, { status: 400 })
  }

  try {
    const artist = await prisma.artist.create({
      data: {
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
    if (isUniqueError(e)) {
      return NextResponse.json(
        { error: 'Артист с таким slug уже существует' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
