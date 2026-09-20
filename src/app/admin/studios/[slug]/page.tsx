import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StudioForm } from '@/components/StudioForm'

export const dynamic = 'force-dynamic'

export default async function AdminStudioEditPage({
  params,
}: {
  params: { slug: string }
}) {
  const studio = await prisma.studio.findUnique({
    where: { slug: params.slug },
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
    </div>
  )
}