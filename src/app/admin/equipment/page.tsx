import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StudioFilter } from '@/components/admin/StudioFilter'
import { EQUIPMENT_LABELS } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: { studio?: string }
}) {
  const studioFilter = searchParams.studio

  const items = await prisma.equipment.findMany({
    where:
      studioFilter === 'moscow' || studioFilter === 'spb'
        ? { studio: { slug: studioFilter } }
        : undefined,
    orderBy: [{ studioId: 'asc' }, { category: 'asc' }, { sortOrder: 'asc' }],
    include: { studio: { select: { slug: true, city: true } } },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">оборудование</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Оборудование
        </h1>

        <div className="flex items-center gap-4">
          <StudioFilter />
          <Link href="/admin/equipment/new" className="btn btn-solid h-10">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Добавить
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-bone/40">Пока пусто.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>студия</th>
              <th>категория</th>
              <th>название</th>
              <th>модель</th>
              <th>фото</th>
              <th>порядок</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                  {item.studio.slug === 'moscow' ? 'мск' : 'спб'}
                </td>
                <td className="text-bone/60 text-[12px]">
                  {EQUIPMENT_LABELS[item.category] ?? item.category}
                </td>
                <td>
                  <Link
                    href={`/admin/equipment/${item.id}`}
                    className="text-bone hover:text-signal transition-colors"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="font-mono text-[12px] text-bone/60">{item.model}</td>
                <td>
                  {item.image ? (
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                      <span className="dot dot-live" />
                      есть
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/30">
                      нет
                    </span>
                  )}
                </td>
                <td className="font-mono text-[12px] text-bone/50">{item.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}