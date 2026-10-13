import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceForm } from '@/components/admin/ServiceForm'

export const dynamic = 'force-dynamic'

export default async function AdminServiceEditPage({
  params,
}: {
  params: { id: string }
}) {
  const service = await prisma.service.findUnique({
    where: { id: params.id },
    include: { studio: { select: { slug: true } } },
  })

  if (!service) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">{service.studio.slug}</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {service.name}
      </h1>

      <ServiceForm
        mode="edit"
        initial={{
          id: service.id,
          studioSlug: service.studio.slug as 'moscow' | 'spb',
          name: service.name,
          slug: service.slug,
          description: service.description,
          price: service.price,
          duration: service.duration,
          features: service.features,
          isActive: service.isActive,
          sortOrder: service.sortOrder,
        }}
      />
    </div>
  )
}