import { ArtistForm } from '@/components/admin/ArtistForm'

export default function AdminArtistNewPage() {
  return (
    <div>
      <div className="section-mark mb-6">
        <span className="num">новый</span>
        <span className="rule" />
      </div>

      <h1
        className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95] mb-10"
        style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
      >
        Новый артист
      </h1>

      <ArtistForm
        mode="create"
        initial={{
          studioSlug: 'moscow',
          name: '',
          slug: '',
          avatar: null,
          genre: '',
          bio: '',
          isFeatured: false,
          sortOrder: 0,
        }}
      />
    </div>
  )
}