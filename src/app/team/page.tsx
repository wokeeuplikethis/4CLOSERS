import { prisma } from '@/lib/prisma'
import { TeamContent } from '@/components/TeamContent'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Команда' }

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return <TeamContent members={members} />
}