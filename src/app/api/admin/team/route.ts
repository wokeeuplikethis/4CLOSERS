import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const members = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return NextResponse.json({ members })
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
  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
  const position = typeof body.position === 'string' ? body.position.trim() : ''
  const timeInTeam = typeof body.timeInTeam === 'string' ? body.timeInTeam.trim() : ''
  const experience = typeof body.experience === 'string' ? body.experience.trim() : ''
  const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
  const photo = typeof body.photo === 'string' && body.photo ? body.photo : null
  const telegramUrl = typeof body.telegramUrl === 'string' && body.telegramUrl.trim()
    ? body.telegramUrl.trim() : null
  const vkUrl = typeof body.vkUrl === 'string' && body.vkUrl.trim()
    ? body.vkUrl.trim() : null
  const instagramUrl = typeof body.instagramUrl === 'string' && body.instagramUrl.trim()
    ? body.instagramUrl.trim() : null
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0
  const isActive = body.isActive !== false
  const studioSlug = typeof body.studioSlug === 'string' ? body.studioSlug.trim() : ''

  if (!name || !position) {
    return NextResponse.json(
      { error: 'name и position обязательны' },
      { status: 400 }
    )
  }

  let studioId: string | null = null
  if (studioSlug) {
    const studio = await prisma.studio.findUnique({
      where: { slug: studioSlug },
      select: { id: true },
    })
    if (!studio) {
      return NextResponse.json({ error: 'Студия не найдена' }, { status: 400 })
    }
    studioId = studio.id
  }

  try {
    const member = await prisma.teamMember.create({
      data: {
        name,
        nickname: nickname || null,
        position,
        timeInTeam: timeInTeam || null,
        experience: experience || null,
        bio: bio || null,
        photo,
        telegramUrl,
        vkUrl,
        instagramUrl,
        sortOrder,
        isActive,
        studio: studioId ? { connect: { id: studioId } } : undefined,
      },
      include: { studio: { select: { slug: true, city: true } } },
    })
    return NextResponse.json({ member })
  } catch {
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}