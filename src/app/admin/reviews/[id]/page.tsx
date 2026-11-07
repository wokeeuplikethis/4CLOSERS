import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReviewForm } from '@/components/admin/ReviewForm'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export default async function AdminReviewEditPage({
  params,
}: {
  params: { id: string }
}) {
  const review = await prisma.review.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
      studio: { select: { id: true, slug: true, city: true, name: true } },
    },
  })

  if (!review) notFound()

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">отзыв</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Отзыв
      </h1>

      <div className="panel p-6 max-w-2xl mb-10">
        <div className="datum">
          <span className="k">автор</span>
          <span className="v">{review.user.name}</span>
        </div>
        <div className="datum">
          <span className="k">email</span>
          <span className="v break-all">{review.user.email}</span>
        </div>
        <div className="datum">
          <span className="k">дата</span>
          <span className="v">{formatDate(review.createdAt)}</span>
        </div>
        <div className="datum">
          <span className="k">студия</span>
          <span className="v">{review.studio.city}</span>
        </div>
        <div className="datum">
          <span className="k">оценка</span>
          <span className="v">{review.rating}/5</span>
        </div>
      </div>

      <ReviewForm
        initial={{
          id: review.id,
          rating: review.rating,
          content: review.content,
          studioSlug: review.studio.slug as 'moscow' | 'spb',
        }}
      />
    </div>
  )
}
