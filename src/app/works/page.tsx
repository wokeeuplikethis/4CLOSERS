import { prisma } from '@/lib/prisma'
import { WorksContent } from '@/components/WorksContent'
import type { Artist } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Работы' }

async function loadArtists(): Promise<Artist[]> {
  const artists = await prisma.artist.findMany({
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    include: { tracks: { orderBy: { sortOrder: 'asc' } } },
  })

  return artists.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    avatar: a.avatar,
    genre: a.genre,
    bio: a.bio,
    isFeatured: a.isFeatured,
    sortOrder: a.sortOrder,
    tracks: a.tracks.map((t) => ({
      id: t.id,
      title: t.title,
      coverImage: t.coverImage,
      genre: t.genre,
      year: t.year,
      yandexUrl: t.yandexUrl,
      vkUrl: t.vkUrl,
      spotifyUrl: t.spotifyUrl,
      isFeatured: t.isFeatured,
      sortOrder: t.sortOrder,
    })),
  }))
}

export default async function WorksPage() {
  const artists = await loadArtists()
  return <WorksContent artists={artists} />
}