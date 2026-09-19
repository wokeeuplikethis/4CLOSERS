'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Artist, Track } from '@/types'

export function WorksContent({ artists }: { artists: Artist[] }) {
  const [artistIndex, setArtistIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)

  if (artists.length === 0) {
    return (
      <section className="band">
        <div className="shell">
          <h1 className="font-display font-light text-bone mb-6" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            Работы
          </h1>
          <p className="text-bone/50 text-sm">Пока пусто.</p>
        </div>
      </section>
    )
  }

  const artist = artists[artistIndex]
  const track = artist.tracks[trackIndex]

  const prevArtist = () => {
    setArtistIndex((i) => (i - 1 + artists.length) % artists.length)
    setTrackIndex(0)
  }
  const nextArtist = () => {
    setArtistIndex((i) => (i + 1) % artists.length)
    setTrackIndex(0)
  }
  const prevTrack = () => setTrackIndex((i) => (i - 1 + artist.tracks.length) % artist.tracks.length)
  const nextTrack = () => setTrackIndex((i) => (i + 1) % artist.tracks.length)

  return (
    <section className="band">
      <div className="shell">
        {/* Заголовок */}
        <header className="mb-12">
          <div className="section-mark">
            <span className="num">01</span>
            <span className="rule" />
          </div>
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}
          >
            Работы
          </h1>
          <p className="section-lede">
            Артисты и треки, которые вышли из наших комнат.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-x-6 gap-y-10">
          {/* Слева — карточка артиста */}
          <div className="col-span-12 lg:col-span-6">
            <article className="panel overflow-hidden">
              <div className="aspect-[4/5] bg-void border-b border-ash relative overflow-hidden">
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate">
                    <span className="font-display text-8xl text-bone/15">
                      {artist.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-baseline justify-between gap-4 mb-4">
                  <h2 className="font-display text-2xl lg:text-3xl text-bone tracking-[-0.02em]">
                    {artist.name}
                  </h2>
                  {artist.isFeatured && (
                    <span className="h-1.5 w-1.5 rounded-full bg-signal shrink-0" aria-label="Избранное" />
                  )}
                </div>

                {artist.genre && (
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-4">
                    {artist.genre}
                  </div>
                )}

                {artist.bio && (
                  <p className="text-sm leading-relaxed text-bone/70 mb-6">{artist.bio}</p>
                )}

                {/* Переключатель артистов */}
                {artists.length > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t border-ash">
                    <button
                      type="button"
                      onClick={prevArtist}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                      aria-label="Предыдущий артист"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {artists.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setArtistIndex(i)
                            setTrackIndex(0)
                          }}
                          className={cn(
                            'h-1.5 rounded-full transition-all duration-300',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                            i === artistIndex ? 'w-6 bg-signal' : 'w-1.5 bg-bone/25 hover:bg-bone/50'
                          )}
                          aria-label={`Перейти к артисту ${i + 1}`}
                          aria-current={i === artistIndex}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={nextArtist}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                      aria-label="Следующий артист"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Справа — трек */}
          <div className="col-span-12 lg:col-span-6">
            <article className="panel overflow-hidden">
              <div className="aspect-[4/5] bg-void border-b border-ash relative overflow-hidden">
                {track?.coverImage ? (
                  <img
                    src={track.coverImage}
                    alt={track.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/25">
                      обложка
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8">
                {track ? (
                  <>
                    <h3 className="font-display text-2xl lg:text-3xl text-bone tracking-[-0.02em] mb-3">
                      {track.title}
                    </h3>

                    <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-6">
                      {track.genre && <span>{track.genre}</span>}
                      {track.year && <span>· {track.year}</span>}
                      {track.isFeatured && (
                        <span className="inline-flex items-center gap-1.5 text-signal">
                          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                          избранное
                        </span>
                      )}
                    </div>

                    {/* Переключатель треков */}
                    {artist.tracks.length > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-ash">
                        <button
                          type="button"
                          onClick={prevTrack}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                          aria-label="Предыдущий трек"
                        >
                          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>

                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                          {String(trackIndex + 1).padStart(2, '0')} / {String(artist.tracks.length).padStart(2, '0')}
                        </span>

                        <button
                          type="button"
                          onClick={nextTrack}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                          aria-label="Следующий трек"
                        >
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-bone/50">У артиста пока нет треков.</p>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}