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
    select: { coverImage: true, audioUrl: true },
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

  if ('coverImage' in body) {
    const next = typeof body.coverImage === 'string' && body.coverImage ? body.coverImage : null
    if (prev.coverImage && prev.coverImage !== next) {
      await storage.delete(prev.coverImage).catch(() => {})
    }
    data.coverImage = next
  }
  if ('audioUrl' in body) {
    const next = typeof body.audioUrl === 'string' && body.audioUrl ? body.audioUrl : null
    if (prev.audioUrl && prev.audioUrl !== next) {
      await storage.delete(prev.audioUrl).catch(() => {})
    }
    data.audioUrl = next
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
    select: { coverImage: true, audioUrl: true },
  })
  if (!track) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.track.delete({ where: { id: params.trackId } })

  if (track.coverImage) await storage.delete(track.coverImage).catch(() => {})
  if (track.audioUrl) await storage.delete(track.audioUrl).catch(() => {})

  return NextResponse.json({ success: true })
}