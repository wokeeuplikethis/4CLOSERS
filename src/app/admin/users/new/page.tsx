import { UserForm } from '@/components/admin/UserForm'

export const dynamic = 'force-dynamic'

export default function AdminUserNewPage() {
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
        Новый пользователь
      </h1>

      <UserForm
        mode="create"
        initial={{ name: '', email: '', role: 'USER' }}
      />
    </div>
  )
}
