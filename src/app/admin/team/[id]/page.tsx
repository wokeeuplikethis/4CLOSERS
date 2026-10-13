import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TeamMemberForm } from '@/components/admin/TeamMemberForm'

export const dynamic = 'force-dynamic'

export default async function AdminTeamEditPage({
  params,
}: {
  params: { id: string }
}) {
  const member = await prisma.teamMember.findUnique({
    where: { id: params.id },
  })

  if (!member) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">редактирование</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {member.name}
      </h1>

      <TeamMemberForm
        mode="edit"
        initial={{
          id: member.id,
          name: member.name,
          nickname: member.nickname ?? '',
          position: member.position,
          timeInTeam: member.timeInTeam ?? '',
          experience: member.experience ?? '',
          bio: member.bio ?? '',
          photo: member.photo,
          telegramUrl: member.telegramUrl ?? '',
          vkUrl: member.vkUrl ?? '',
          instagramUrl: member.instagramUrl ?? '',
          sortOrder: member.sortOrder,
          isActive: member.isActive,
        }}
      />
    </div>
  )
}