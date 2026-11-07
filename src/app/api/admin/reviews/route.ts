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
  const studio = searchParams.get('studio')

  const reviews = await prisma.review.findMany({
    where:
      studio === 'moscow' || studio === 'spb'
        ? { studio: { slug: studio } }
        : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
    },
  })

  return NextResponse.json({ reviews })
}
