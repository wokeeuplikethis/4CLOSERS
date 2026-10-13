import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminArtistsPage() {
  const artists = await prisma.artist.findMany({
    orderBy: [{ studioId: 'asc' }, { sortOrder: 'asc' }],
    include: {
      studio: { select: { slug: true, city: true } },
      _count: { select: { tracks: true } },
    },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">артисты</span>
        <span className="rule" />
      </div>

      <div className="flex items-end justify-between gap-6 mb-10">
        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          Артисты
        </h1>
        <Link href="/admin/artists/new" className="btn btn-solid h-11">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Новый артист
        </Link>
      </div>

      {artists.length === 0 ? (
        <p className="text-sm text-bone/40">Пока пусто.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>студия</th>
              <th>имя</th>
              <th>жанр</th>
              <th>треков</th>
              <th>избранное</th>
              <th>порядок</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((a) => (
              <tr key={a.id}>
                <td className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                  {a.studio.slug === 'moscow' ? 'мск' : 'спб'}
                </td>
                <td>
                  <Link
                    href={`/admin/artists/${a.id}`}
                    className="text-bone hover:text-signal transition-colors"
                  >
                    {a.name}
                  </Link>
                </td>
                <td className="text-bone/60 text-[12px]">{a.genre ?? '—'}</td>
                <td className="font-mono text-[12px]">{a._count.tracks}</td>
                <td>
                  <span className={cn('dot', a.isFeatured && 'dot-live')} />
                </td>
                <td className="font-mono text-[12px] text-bone/50">{a.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}