import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { StudioFilter } from '@/components/admin/StudioFilter'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: { studio?: string }
}) {
  const studioFilter = searchParams.studio

  const services = await prisma.service.findMany({
    where:
      studioFilter === 'moscow' || studioFilter === 'spb'
        ? { studio: { slug: studioFilter } }
        : undefined,
    orderBy: [{ studioId: 'asc' }, { sortOrder: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">услуги</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Услуги
        </h1>

        <div className="flex items-center gap-4">
          <StudioFilter />
          <Link href="/admin/services/new" className="btn btn-solid h-10">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Новая
          </Link>
        </div>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-bone/40">Пока нет ни одной услуги.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>студия</th>
              <th>название</th>
              <th>цена</th>
              <th>длит.</th>
              <th>порядок</th>
              <th>статус</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                  {s.studio.slug === 'moscow' ? 'мск' : 'спб'}
                </td>
                <td>
                  <Link
                    href={`/admin/services/${s.id}`}
                    className="text-bone hover:text-signal transition-colors"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="font-mono text-[12px]">{s.price.toLocaleString('ru-RU')} ₽</td>
                <td className="font-mono text-[12px]">{s.duration} мин</td>
                <td className="font-mono text-[12px] text-bone/50">{s.sortOrder}</td>
                <td>
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                    <span className={cn('dot', s.isActive && 'dot-live')} />
                    {s.isActive ? 'видна' : 'скрыта'}
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