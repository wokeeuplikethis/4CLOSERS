import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

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

  const tracks = await prisma.track.findMany({
    where: { artistId: params.id },
    orderBy: { sortOrder: 'asc' },
  })

  return NextResponse.json({ tracks })
}

export async function POST(
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

  const artist = await prisma.artist.findUnique({ where: { id: params.id } })
  if (!artist) {
    return NextResponse.json({ error: 'Артист не найден' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const coverImage = typeof body.coverImage === 'string' && body.coverImage ? body.coverImage : null
  const audioUrl = typeof body.audioUrl === 'string' && body.audioUrl ? body.audioUrl : null
  const genre = typeof body.genre === 'string' ? body.genre.trim() : ''
  const year = Number.isFinite(Number(body.year)) && Number(body.year) > 0
    ? Number(body.year)
    : null
  const isFeatured = body.isFeatured === true
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

  if (!title) {
    return NextResponse.json({ error: 'title обязателен' }, { status: 400 })
  }

  try {
    const track = await prisma.track.create({
      data: {
        artistId: params.id,
        title,
        coverImage,
        audioUrl,
        genre: genre || null,
        year,
        isFeatured,
        sortOrder,
      },
    })
    return NextResponse.json({ track })
  } catch {
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}