import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'

export const dynamic = 'force-dynamic'

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-10 w-10 rounded-full object-cover border border-ash"
      />
    )
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bone font-display text-sm text-void">
      {(name.trim().charAt(0) || '?').toUpperCase()}
    </span>
  )
}

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">пользователи</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div className="flex items-baseline gap-4">
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Пользователи
          </h1>
          <span className="font-mono text-[12px] text-bone/40">{users.length}</span>
        </div>

        <Link href="/admin/users/new" className="btn btn-solid h-10">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Новый пользователь
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-bone/40">Пока нет ни одного пользователя.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>фото</th>
              <th>имя</th>
              <th>почта</th>
              <th>роль</th>
              <th>заявок</th>
              <th>создан</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <AdminRow key={user.id} href={`/admin/users/${user.id}`}>
                <td>
                  <Avatar name={user.name} avatar={user.avatar} />
                </td>
                <td className="text-bone">{user.name}</td>
                <td className="font-mono text-[12px] text-bone/60">{user.email}</td>
                <td>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                    <span className={cn('dot', user.role === 'ADMIN' && 'dot-live')} />
                    {user.role === 'ADMIN' ? 'админ' : 'пользователь'}
                  </span>
                </td>
                <td className="font-mono text-[12px]">{user._count.bookings}</td>
                <td className="font-mono text-[12px] text-bone/50 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <EditCell />
              </AdminRow>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
