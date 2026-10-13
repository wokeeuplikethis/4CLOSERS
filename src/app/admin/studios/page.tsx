import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminStudiosPage() {
  const studios = await prisma.studio.findMany({
    orderBy: { slug: 'asc' },
  })

  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">студии</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Студии
      </h1>

      <div className="space-y-3">
        {studios.map((s) => (
          <Link
            key={s.id}
            href={`/admin/studios/${s.slug}`}
            className="
              group flex items-center justify-between gap-6
              panel px-5 py-4
              hover:border-signal transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-signal
            "
          >
            <div className="min-w-0 flex-1">
              <div className="font-display text-base text-bone group-hover:text-signal transition-colors">
                {s.city}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40 mt-1">
                {s.name} · {s.slug}
              </div>
            </div>

            <div className="hidden sm:block text-right min-w-0">
              <div className="text-sm text-bone/70 truncate max-w-[24rem]">
                {s.address}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-bone/40 mt-1">
                {s.phone}
              </div>
            </div>

            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-bone/30 group-hover:text-signal transition-colors"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}