import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { EQUIPMENT_CATEGORIES } from '@/types'

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

  const item = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: { studio: { select: { slug: true, city: true } } },
  })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ equipment: item })
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

  if (typeof body.category === 'string') {
    if (!EQUIPMENT_CATEGORIES.includes(body.category as (typeof EQUIPMENT_CATEGORIES)[number])) {
      return NextResponse.json({ error: 'Неизвестная категория' }, { status: 400 })
    }
    data.category = body.category
  }
  if (typeof body.name === 'string') data.name = body.name.trim()
  if (typeof body.model === 'string') data.model = body.model.trim()
  if ('description' in body) {
    data.description = typeof body.description === 'string' && body.description.trim()
      ? body.description.trim()
      : null
  }
  if ('image' in body) {
    data.image = typeof body.image === 'string' && body.image ? body.image : null
  }
  if ('sortOrder' in body) {
    const n = Number(body.sortOrder)
    if (Number.isFinite(n)) data.sortOrder = n
  }

  try {
    const item = await prisma.equipment.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json({ equipment: item })
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

  try {
    const item = await prisma.equipment.findUnique({
      where: { id: params.id },
      select: { image: true },
    })
    await prisma.equipment.delete({ where: { id: params.id } })

    // Если картинка была загружена нами — удалим из хранилища
    if (item?.image) {
      const { storage } = await import('@/lib/storage')
      await storage.delete(item.image).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}