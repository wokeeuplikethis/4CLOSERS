import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">команда</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Команда
        </h1>
        <Link href="/admin/team/new" className="btn btn-solid h-10">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Добавить
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-bone/40">Пока никого нет.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>фото</th>
              <th>имя</th>
              <th>ник</th>
              <th>должность</th>
              <th>город</th>
              <th>в команде</th>
              <th>порядок</th>
              <th>статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <AdminRow key={m.id} href={`/admin/team/${m.id}`}>
                <td>
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt=""
                      className="h-10 w-10 rounded object-cover border border-ash"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bone font-display text-sm text-void">
                      {(m.name.trim().charAt(0) || '?').toUpperCase()}
                    </span>
                  )}
                </td>
                <td className="text-bone">{m.name}</td>
                <td className="font-mono text-[12px] text-bone/60">
                  {m.nickname ?? '—'}
                </td>
                <td className="text-bone/60 text-[12px]">{m.position}</td>
                <td className="font-mono text-[12px] text-bone/50">
                  {m.studio?.city ?? 'все'}
                </td>
                <td className="font-mono text-[12px] text-bone/50">
                  {m.timeInTeam ?? '—'}
                </td>
                <td className="font-mono text-[12px] text-bone/50">{m.sortOrder}</td>
                <td>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                    <span className={cn('dot', m.isActive && 'dot-live')} />
                    {m.isActive ? 'видна' : 'скрыта'}
                  </span>
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
