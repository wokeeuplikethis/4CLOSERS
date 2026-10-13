import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { storage } from '@/lib/storage'

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

  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: {
      studio: { select: { slug: true, city: true } },
      tracks: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!artist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ artist })
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

  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}

  if (typeof body.name === 'string') data.name = body.name.trim()
  if (typeof body.slug === 'string') data.slug = body.slug.trim()
  if (typeof body.genre === 'string') data.genre = body.genre.trim() || null
  if (typeof body.bio === 'string') data.bio = body.bio.trim() || null
  if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured
  if ('sortOrder' in body) {
    const n = Number(body.sortOrder)
    if (Number.isFinite(n)) data.sortOrder = n
  }
  if ('avatar' in body) {
    // Если меняем аватар — удаляем старый файл
    if (typeof body.avatar === 'string' && body.avatar !== null) {
      const prev = await prisma.artist.findUnique({
        where: { id: params.id },
        select: { avatar: true },
      })
      if (prev?.avatar && prev.avatar !== body.avatar) {
        await storage.delete(prev.avatar).catch(() => {})
      }
      data.avatar = body.avatar || null
    } else if (body.avatar === null || body.avatar === '') {
      const prev = await prisma.artist.findUnique({
        where: { id: params.id },
        select: { avatar: true },
      })
      if (prev?.avatar) await storage.delete(prev.avatar).catch(() => {})
      data.avatar = null
    }
  }

  try {
    const artist = await prisma.artist.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json({ artist })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'slug уже занят' }, { status: 409 })
    }
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

  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    select: { avatar: true, tracks: { select: { coverImage: true, audioUrl: true } } },
  })
  if (!artist) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.artist.delete({ where: { id: params.id } }) // треки удалятся каскадом

  // Чистим файлы
  if (artist.avatar) await storage.delete(artist.avatar).catch(() => {})
  for (const t of artist.tracks) {
    if (t.coverImage) await storage.delete(t.coverImage).catch(() => {})
    if (t.audioUrl) await storage.delete(t.audioUrl).catch(() => {})
  }

  return NextResponse.json({ success: true })
}