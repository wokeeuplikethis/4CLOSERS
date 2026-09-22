import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
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
              <th>в команде</th>
              <th>порядок</th>
              <th>статус</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt=""
                      className="h-10 w-10 rounded object-cover border border-ash"
                    />
                  ) : (
                    <span className="font-mono text-[10px] text-bone/30">—</span>
                  )}
                </td>
                <td>
                  <Link
                    href={`/admin/team/${m.id}`}
                    className="text-bone hover:text-signal transition-colors"
                  >
                    {m.name}
                  </Link>
                </td>
                <td className="font-mono text-[12px] text-bone/60">
                  {m.nickname ?? '—'}
                </td>
                <td className="text-bone/60 text-[12px]">{m.position}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}