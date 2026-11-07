import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ArtistForm } from '@/components/admin/ArtistForm'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminArtistEditPage({
  params,
}: {
  params: { id: string }
}) {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    include: {
      tracks: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!artist) notFound()

  return (
    <div className="space-y-16">
      <div>
        <div className="section-mark mb-6">
          <span className="num">артист</span>
          <span className="rule" />
        </div>

        <h1
          className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
          style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
        >
          {artist.name}
        </h1>

        <ArtistForm
          mode="edit"
          initial={{
            id: artist.id,
            name: artist.name,
            slug: artist.slug,
            avatar: artist.avatar,
            genre: artist.genre ?? '',
            bio: artist.bio ?? '',
            isFeatured: artist.isFeatured,
            sortOrder: artist.sortOrder,
          }}
        />
      </div>

      <div>
        <div className="section-mark mb-6">
          <span className="num">треки</span>
          <span className="rule" />
        </div>

        <div className="flex items-end justify-between gap-6 mb-6">
          <h2 className="font-display font-light text-bone text-2xl">
            Треки ({artist.tracks.length})
          </h2>
          <Link
            href={`/admin/artists/${artist.id}/tracks/new`}
            className="btn btn-solid h-11"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Добавить трек
          </Link>
        </div>

        {artist.tracks.length === 0 ? (
          <p className="text-sm text-bone/40">Пока нет треков.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>обложка</th>
                <th>название</th>
                <th>жанр</th>
                <th>год</th>
                <th>ссылки</th>
                <th>избранное</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {artist.tracks.map((t) => {
                const linkCount = [t.yandexUrl, t.vkUrl, t.spotifyUrl].filter(Boolean).length
                return (
                  <AdminRow
                    key={t.id}
                    href={`/admin/artists/${artist.id}/tracks/${t.id}`}
                  >
                    <td>
                      {t.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.coverImage}
                          alt=""
                          className="h-10 w-10 rounded object-cover border border-ash"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bone font-display text-sm text-void">
                          {(t.title.trim().charAt(0) || '?').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="text-bone">{t.title}</td>
                    <td className="text-bone/60 text-[12px]">{t.genre ?? '—'}</td>
                    <td className="font-mono text-[12px] text-bone/50">{t.year ?? '—'}</td>
                    <td>
                      <span
                        className={cn(
                          'font-mono text-[10px] uppercase tracking-[0.14em]',
                          linkCount > 0 ? 'text-signal' : 'text-bone/30'
                        )}
                      >
                        {linkCount > 0 ? `${linkCount} из 3` : 'нет'}
                      </span>
                    </td>
                    <td>
                      <span className={cn('dot', t.isFeatured && 'dot-live')} />
                    </td>
                    <EditCell />
                  </AdminRow>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
