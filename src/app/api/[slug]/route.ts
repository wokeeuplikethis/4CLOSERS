import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/jwt'

async function requireAdmin() {
  const token = cookies().get('auth_token')?.value
  if (!token) return { ok: false, status: 401 as const }

  try {
    const payload = await verifyToken(token)
    if (payload.role !== 'ADMIN') return { ok: false, status: 403 as const }
    return { ok: true as const, payload }
  } catch {
    return { ok: false, status: 401 as const }
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.status === 403 ? 'Forbidden' : 'Unauthorized' },
      { status: auth.status }
    )
  }

  const body = await req.json()

  // Только разрешённые поля — не даём менять id, slug, createdAt.
  const allowed = [
    'name',
    'city',
    'address',
    'phone',
    'email',
    'telegram',
    'vk',
    'hours',
    'description',
    'mapUrl',
    'latitude',
    'longitude',
  ] as const

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  try {
    const studio = await prisma.studio.update({
      where: { slug: params.slug },
      data,
    })
    return NextResponse.json({ studio })
  } catch {
    return NextResponse.json({ error: 'Studio not found' }, { status: 404 })
  }
}