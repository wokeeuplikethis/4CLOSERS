import { TeamMemberForm } from '@/components/admin/TeamMemberForm'

export default function AdminTeamNewPage() {
  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новый</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новый участник
      </h1>

      <TeamMemberForm
        mode="create"
        initial={{
          name: '',
          nickname: '',
          position: '',
          timeInTeam: '',
          experience: '',
          bio: '',
          photo: null,
          telegramUrl: '',
          vkUrl: '',
          instagramUrl: '',
          sortOrder: 0,
          isActive: true,
        }}
      />
    </div>
  )
}