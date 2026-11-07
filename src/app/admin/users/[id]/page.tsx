import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserForm } from '@/components/admin/UserForm'

export const dynamic = 'force-dynamic'

export default async function AdminUserEditPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      createdAt: true,
      _count: { select: { bookings: true, reviews: true } },
    },
  })

  if (!user) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">{user.role === 'ADMIN' ? 'админ' : 'пользователь'}</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          {user.name}
        </h1>

        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/40">
          {user._count.bookings} заявок · {user._count.reviews} отзывов
        </div>
      </div>

      <UserForm
        mode="edit"
        initial={{
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }}
      />
    </div>
  )
}
