import { prisma } from '@/lib/prisma'
import { RoomForm } from '@/components/admin/RoomForm'

export const dynamic = 'force-dynamic'

export default async function AdminRoomNewPage({
  searchParams,
}: {
  searchParams: { studio?: string }
}) {
  const studios = await prisma.studio.findMany({
    orderBy: { slug: 'asc' },
    select: { slug: true, city: true, name: true },
  })

  const requested = searchParams.studio
  const studioSlug: 'moscow' | 'spb' = requested === 'spb' ? 'spb' : 'moscow'

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новое</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новое помещение
      </h1>

      <RoomForm
        mode="create"
        studios={studios.map((studio) => ({
          slug: studio.slug,
          city: studio.city,
        }))}
        initial={{
          studioSlug,
          name: '',
          slug: '',
          description: '',
          image: '',
          sortOrder: 0,
          isActive: true,
        }}
      />
    </div>
  )
}
