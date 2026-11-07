import { prisma } from '@/lib/prisma'
import { ServiceForm } from '@/components/admin/ServiceForm'

export const dynamic = 'force-dynamic'

export default async function AdminServiceNewPage() {
  const studios = await prisma.studio.findMany({
    include: {
      rooms: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, studioId: true },
      },
    },
    orderBy: { slug: 'asc' },
  })

  const rooms = studios.flatMap((studio) =>
    studio.rooms.map((room) => ({
      id: room.id,
      name: room.name,
      studioSlug: studio.slug as 'moscow' | 'spb',
    }))
  )

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новая</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новая услуга
      </h1>

      <ServiceForm
        mode="create"
        rooms={rooms}
        initial={{
          studioSlug: 'moscow',
          roomId: null,
          name: '',
          slug: '',
          description: '',
          price: 0,
          duration: 60,
          features: [],
          requiresSchedule: true,
          isActive: true,
          sortOrder: 0,
        }}
      />
    </div>
  )
}
