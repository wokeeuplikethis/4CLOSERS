import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EquipmentForm } from '@/components/admin/EquipmentForm'

export const dynamic = 'force-dynamic'

export default async function AdminEquipmentEditPage({
  params,
}: {
  params: { id: string }
}) {
  const item = await prisma.equipment.findUnique({
    where: { id: params.id },
    include: { studio: { select: { slug: true } } },
  })

  if (!item) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">{item.studio.slug}</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {item.name}
      </h1>

      <EquipmentForm
        mode="edit"
        initial={{
          id: item.id,
          studioSlug: item.studio.slug as 'moscow' | 'spb',
          category: item.category,
          name: item.name,
          model: item.model,
          description: item.description ?? '',
          image: item.image,
          sortOrder: item.sortOrder,
        }}
      />
    </div>
  )
}