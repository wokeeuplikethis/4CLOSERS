import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'
import { StudioFilter } from '@/components/admin/StudioFilter'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { studio?: string }
}) {
  const studioFilter = searchParams.studio

  const reviews = await prisma.review.findMany({
    where:
      studioFilter === 'moscow' || studioFilter === 'spb'
        ? { studio: { slug: studioFilter } }
        : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
    },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">отзывы</span>
        <span className="rule" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div className="flex items-baseline gap-4">
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Отзывы
          </h1>
          <span className="font-mono text-[12px] text-bone/40">{reviews.length}</span>
        </div>

        <StudioFilter />
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-bone/40">Пока нет отзывов</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>дата</th>
              <th>клиент</th>
              <th>студия</th>
              <th>оценка</th>
              <th>отзыв</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <AdminRow key={r.id} href={`/admin/reviews/${r.id}`}>
                <td className="font-mono text-[12px] text-bone/50 whitespace-nowrap">
                  {formatDate(r.createdAt)}
                </td>
                <td>
                  <div className="text-[14px]">{r.user.name}</div>
                  <p className="font-mono text-[11px] text-bone/40 mt-0.5">
                    {r.user.email}
                  </p>
                </td>
                <td className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                  {r.studio.city}
                </td>
                <td>
                  <span
                    className={cn(
                      'font-mono text-[12px]',
                      r.rating >= 5 ? 'text-signal' : 'text-bone/70'
                    )}
                  >
                    {r.rating}/5
                  </span>
                </td>
                <td className="max-w-[380px]">
                  <p
                    title={r.content}
                    className="text-[13px] leading-snug text-bone/60 line-clamp-2"
                  >
                    {r.content}
                  </p>
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
