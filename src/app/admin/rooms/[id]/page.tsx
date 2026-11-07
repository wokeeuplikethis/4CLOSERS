import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { RoomForm } from '@/components/admin/RoomForm'

export const dynamic = 'force-dynamic'

export default async function AdminRoomEditPage({
  params,
}: {
  params: { id: string }
}) {
  const room = await prisma.room.findUnique({
    where: { id: params.id },
    include: {
      studio: { select: { slug: true, city: true } },
    },
  })

  if (!room) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">{room.studio.slug}</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {room.name}
      </h1>

      <RoomForm
        mode="edit"
        studios={[{ slug: room.studio.slug, city: room.studio.city }]}
        initial={{
          id: room.id,
          studioSlug: room.studio.slug as 'moscow' | 'spb',
          name: room.name,
          slug: room.slug,
          description: room.description,
          image: room.image,
          sortOrder: room.sortOrder,
          isActive: room.isActive,
        }}
      />
    </div>
  )
}
