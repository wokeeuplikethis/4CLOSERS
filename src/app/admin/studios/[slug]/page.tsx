import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StudioForm } from '@/components/StudioForm'
import { AdminRow, EditCell } from '@/components/admin/AdminRow'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminStudioEditPage({
  params,
}: {
  params: { slug: string }
}) {
  const studio = await prisma.studio.findUnique({
    where: { slug: params.slug },
    include: {
      rooms: { orderBy: { sortOrder: 'asc' } },
    },
  })

  if (!studio) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">{studio.slug}</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {studio.city}
      </h1>

      <StudioForm
        slug={studio.slug}
        initial={{
          name: studio.name,
          city: studio.city,
          address: studio.address,
          phone: studio.phone,
          email: studio.email,
          telegram: studio.telegram,
          vk: studio.vk,
          hours: studio.hours,
          description: studio.description,
        }}
      />

      <div className="mt-16 border-t border-ash pt-8">
        <div className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="font-display font-light text-bone text-xl sm:text-2xl">
              Помещения{' '}
              <span className="font-mono text-sm text-bone/40">
                ({studio.rooms.length})
              </span>
            </h2>

            {studio.rooms.length > 0 && (
              <Link
                href={`/admin/rooms/new?studio=${studio.slug}`}
                className="btn btn-solid h-10"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Добавить помещение
              </Link>
            )}
          </div>

          {studio.rooms.length === 0 ? (
            <div>
              <p className="text-sm text-bone/40">Помещения пока не заведены.</p>
              <Link
                href={`/admin/rooms/new?studio=${studio.slug}`}
                className="btn btn-solid h-10 mt-4"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Добавить помещение
              </Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>фото</th>
                  <th>название</th>
                  <th>slug</th>
                  <th>порядок</th>
                  <th>статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {studio.rooms.map((room) => (
                  <AdminRow key={room.id} href={`/admin/rooms/${room.id}`}>
                    <td>
                      {room.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={room.image}
                          alt=""
                          className="h-7 w-10 rounded object-cover border border-ash"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bone font-display text-sm text-void">
                          {(room.name.trim().charAt(0) || '?').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td>{room.name}</td>
                    <td className="font-mono text-[12px] text-bone/50">
                      {room.slug}
                    </td>
                    <td className="font-mono text-[12px] text-bone/50">
                      {room.sortOrder}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/60">
                        <span className={cn('dot', room.isActive && 'dot-live')} />
                        {room.isActive ? 'активно' : 'скрыто'}
                      </span>
                    </td>
                    <EditCell />
                  </AdminRow>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
