import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { storage } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const track = await prisma.track.findFirst({
    where: { id: params.trackId, artistId: params.id },
    include: { artist: { select: { name: true, slug: true } } },
  })
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ track })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const body = await req.json().catch(() => ({}))
  const prev = await prisma.track.findFirst({
    where: { id: params.trackId, artistId: params.id },
    select: { coverImage: true },
  })
  if (!prev) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: Record<string, unknown> = {}

  if (typeof body.title === 'string') data.title = body.title.trim()
  if (typeof body.genre === 'string') data.genre = body.genre.trim() || null
  if ('year' in body) {
    const n = Number(body.year)
    data.year = Number.isFinite(n) && n > 0 ? n : null
  }
  if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured
  if ('sortOrder' in body) {
    const n = Number(body.sortOrder)
    if (Number.isFinite(n)) data.sortOrder = n
  }

  // Ссылки на стриминги
  if ('yandexUrl' in body) {
    data.yandexUrl = typeof body.yandexUrl === 'string' && body.yandexUrl.trim()
      ? body.yandexUrl.trim()
      : null
  }
  if ('vkUrl' in body) {
    data.vkUrl = typeof body.vkUrl === 'string' && body.vkUrl.trim()
      ? body.vkUrl.trim()
      : null
  }
  if ('spotifyUrl' in body) {
    data.spotifyUrl = typeof body.spotifyUrl === 'string' && body.spotifyUrl.trim()
      ? body.spotifyUrl.trim()
      : null
  }

  if ('coverImage' in body) {
    const next = typeof body.coverImage === 'string' && body.coverImage ? body.coverImage : null
    if (prev.coverImage && prev.coverImage !== next) {
      await storage.delete(prev.coverImage).catch(() => {})
    }
    data.coverImage = next
  }

  try {
    const track = await prisma.track.update({
      where: { id: params.trackId },
      data,
    })
    return NextResponse.json({ track })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; trackId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const track = await prisma.track.findFirst({
    where: { id: params.trackId, artistId: params.id },
    select: { coverImage: true },
  })
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.track.delete({ where: { id: params.trackId } })

  if (track.coverImage) await storage.delete(track.coverImage).catch(() => {})

  return NextResponse.json({ success: true })
}