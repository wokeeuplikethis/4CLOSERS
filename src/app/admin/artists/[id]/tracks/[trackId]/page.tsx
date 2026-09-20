import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TrackForm } from '@/components/admin/TrackForm'

export const dynamic = 'force-dynamic'

export default async function AdminTrackEditPage({
  params,
}: {
  params: { id: string; trackId: string }
}) {
  const artist = await prisma.artist.findUnique({
    where: { id: params.id },
    select: { id: true, name: true },
  })
  if (!artist) notFound()

  const track = await prisma.track.findFirst({
    where: { id: params.trackId, artistId: artist.id },
  })
  if (!track) notFound()

  return (
    <div>
      <Link
        href={`/admin/artists/${artist.id}`}
        className="inline-flex items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 hover:text-signal transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        назад к {artist.name}
      </Link>

      <div className="section-mark mb-6">
        <span className="num">{artist.name}</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        {track.title}
      </h1>

      <TrackForm
        mode="edit"
        initial={{
          id: track.id,
          artistId: artist.id,
          title: track.title,
          coverImage: track.coverImage,
          audioUrl: track.audioUrl,
          genre: track.genre ?? '',
          year: track.year,
          isFeatured: track.isFeatured,
          sortOrder: track.sortOrder,
        }}
      />
    </div>
  )
}