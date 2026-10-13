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

  const member = await prisma.teamMember.findUnique({ where: { id: params.id } })
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ member })
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
  if ('nickname' in body) {
    data.nickname = typeof body.nickname === 'string' && body.nickname.trim()
      ? body.nickname.trim()
      : null
  }
  if (typeof body.position === 'string') data.position = body.position.trim()
  if ('timeInTeam' in body) {
    data.timeInTeam = typeof body.timeInTeam === 'string' && body.timeInTeam.trim()
      ? body.timeInTeam.trim()
      : null
  }
  if ('experience' in body) {
    data.experience = typeof body.experience === 'string' && body.experience.trim()
      ? body.experience.trim()
      : null
  }
  if ('bio' in body) {
    data.bio = typeof body.bio === 'string' && body.bio.trim() ? body.bio.trim() : null
  }
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive
  if ('sortOrder' in body) {
    const n = Number(body.sortOrder)
    if (Number.isFinite(n)) data.sortOrder = n
  }

  if ('photo' in body) {
    const prev = await prisma.teamMember.findUnique({
      where: { id: params.id },
      select: { photo: true },
    })
    const next = typeof body.photo === 'string' && body.photo ? body.photo : null
    if (prev?.photo && prev.photo !== next) {
      await storage.delete(prev.photo).catch(() => {})
    }
    data.photo = next
  }

  if ('telegramUrl' in body) {
    data.telegramUrl = typeof body.telegramUrl === 'string' && body.telegramUrl.trim()
      ? body.telegramUrl.trim() : null
  }
  if ('vkUrl' in body) {
    data.vkUrl = typeof body.vkUrl === 'string' && body.vkUrl.trim()
      ? body.vkUrl.trim() : null
  }
  if ('instagramUrl' in body) {
    data.instagramUrl = typeof body.instagramUrl === 'string' && body.instagramUrl.trim()
      ? body.instagramUrl.trim() : null
  }

  try {
    const member = await prisma.teamMember.update({
      where: { id: params.id },
      data,
    })
    return NextResponse.json({ member })
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

  const member = await prisma.teamMember.findUnique({
    where: { id: params.id },
    select: { photo: true },
  })
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.teamMember.delete({ where: { id: params.id } })

  if (member.photo) await storage.delete(member.photo).catch(() => {})

  return NextResponse.json({ success: true })
}