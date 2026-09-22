'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StreamingLinks } from '@/components/StreamingLinks'
import type { Artist } from '@/types'

export function WorksContent({ artists }: { artists: Artist[] }) {
  const [artistIndex, setArtistIndex] = useState(0)
  const [trackIndex, setTrackIndex] = useState(0)

  if (artists.length === 0) {
    return (
      <section className="band pt-6 lg:pt-10">
        <div className="shell">
          <h1
            className="font-display font-light text-bone mb-6"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
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
  const prevTrack = () =>
    setTrackIndex((i) => (i - 1 + artist.tracks.length) % artist.tracks.length)
  const nextTrack = () =>
    setTrackIndex((i) => (i + 1) % artist.tracks.length)

  return (
    <section className="band pt-4 lg:pt-6">
      <div className="shell">
        <header className="mb-6">
          <div className="section-mark">
            <span className="num">01</span>
            <span className="rule" />
          </div>
          <h1
            className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            Работы
          </h1>
          <p className="text-sm text-bone/60 mt-2 max-w-[68ch]">
            Артисты и треки, которые вышли из наших комнат.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-x-6 gap-y-6 items-stretch">
          {/* ─── Карточка артиста ─── */}
          <div className="col-span-12 lg:col-span-6">
            <article className="panel overflow-hidden flex flex-col h-full">
              <CrossfadeImage
                src={artist.avatar}
                alt={artist.name}
                fallbackLetter={artist.name.charAt(0)}
                className="aspect-[16/10]"
              />

              <div className="p-3 lg:p-4 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h2 className="font-display text-base lg:text-lg text-bone tracking-[-0.02em] line-clamp-2">
                    {artist.name}
                  </h2>
                  {artist.isFeatured && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-signal shrink-0"
                      aria-label="Избранное"
                    />
                  )}
                </div>

                {artist.genre && (
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-2 truncate">
                    {artist.genre}
                  </div>
                )}

                {artist.bio && (
                  <p className="text-[13px] leading-snug text-bone/70 mb-2 line-clamp-2">
                    {artist.bio}
                  </p>
                )}

                {artists.length > 1 && (
                  <div className="mt-auto pt-2 border-t border-ash flex items-center justify-between">
                    <button
                      type="button"
                      onClick={prevArtist}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                      aria-label="Предыдущий артист"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
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
                            i === artistIndex
                              ? 'w-5 bg-signal'
                              : 'w-1.5 bg-bone/25 hover:bg-bone/50'
                          )}
                          aria-label={`Перейти к артисту ${i + 1}`}
                          aria-current={i === artistIndex}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={nextArtist}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                      aria-label="Следующий артист"
                    >
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* ─── Карточка трека ─── */}
          <div className="col-span-12 lg:col-span-6">
            <article className="panel overflow-hidden flex flex-col h-full">
              <CrossfadeImage
                src={track?.coverImage ?? null}
                alt={track?.title ?? 'Обложка'}
                fallbackLetter=""
                fallbackText="обложка"
                className="aspect-[16/10]"
              />

              <div className="p-3 lg:p-4 flex-1 flex flex-col">
                {track ? (
                  <>
                    <h3 className="font-display text-base lg:text-lg text-bone tracking-[-0.02em] mb-2 line-clamp-2">
                      {track.title}
                    </h3>

                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/40 mb-2 truncate">
                      {track.genre && <span className="truncate">{track.genre}</span>}
                      {track.year && <span className="shrink-0">· {track.year}</span>}
                      {track.isFeatured && (
                        <span className="inline-flex items-center gap-1.5 text-signal shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
                          избранное
                        </span>
                      )}
                    </div>

                    <StreamingLinks
                      yandex={track.yandexUrl}
                      vk={track.vkUrl}
                      spotify={track.spotifyUrl}
                      className="mb-2"
                    />

                    {artist.tracks.length > 1 && (
                      <div className="mt-auto pt-2 border-t border-ash flex items-center justify-between">
                        <button
                          type="button"
                          onClick={prevTrack}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                          aria-label="Предыдущий трек"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>

                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/50">
                          {String(trackIndex + 1).padStart(2, '0')} /{' '}
                          {String(artist.tracks.length).padStart(2, '0')}
                        </span>

                        <button
                          type="button"
                          onClick={nextTrack}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ash text-bone/60 hover:text-bone hover:border-bone/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                          aria-label="Следующий трек"
                        >
                          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
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

/* ─── Кроссфейд-картинка: единый state, без гонок ─── */

interface CrossfadeImageProps {
  src?: string | null
  alt: string
  fallbackLetter: string
  fallbackText?: string
  className?: string
  duration?: number
}
function CrossfadeImage({
  src,
  alt,
  fallbackLetter,
  fallbackText,
  className,
  duration = 400,
}: CrossfadeImageProps) {
  // Оба слоя в одном state-объекте — гарантированно согласованы
  const [layers, setLayers] = useState<{
    current: string | null
    previous: string | null
    /** 0 — current видно, 1 — previous видно */
    phase: 0 | 1
  }>({
    current: src,
    previous: null,
    phase: 0,
  })

  // Храним актуальный src в ref, чтобы избежать гонок в useEffect
  const srcRef = useRef(src)

  useEffect(() => {
    if (srcRef.current === src) return
    srcRef.current = src

    // Меняем состояние один раз: previous = то, что видно сейчас,
    // current = новое, phase сразу 1 — prev opacity 0, current opacity 1
    setLayers((prev) => {
      const visible = prev.phase === 0 ? prev.current : prev.previous
      return {
        current: src,
        previous: visible,
        phase: 0,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  return (
    <div
      className={cn(
        'bg-void border-b border-ash overflow-hidden shrink-0 relative',
        className
      )}
    >
      {/* Previous layer — уходит в opacity 0 */}
      {layers.previous !== null && layers.previous !== layers.current && (
        <div
          key={`prev-${layers.previous}`}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0,
            transition: `opacity ${duration}ms ease-in-out`,
          }}
        >
          <LayerContent
            src={layers.previous}
            alt=""
            fallbackLetter={fallbackLetter}
            fallbackText={fallbackText}
          />
        </div>
      )}

      {/* Current layer — всегда opacity 1 */}
      <div
        key={`cur-${layers.current ?? 'empty'}`}
        className="absolute inset-0"
        style={{
          opacity: 1,
          transition: `opacity ${duration}ms ease-in-out`,
        }}
      >
        <LayerContent
          src={layers.current}
          alt={alt}
          fallbackLetter={fallbackLetter}
          fallbackText={fallbackText}
        />
      </div>
    </div>
  )
}

/* ─── Внутренний контент слоя ─── */

function LayerContent({
  src,
  alt,
  fallbackLetter,
  fallbackText,
}: {
  src: string | null
  alt: string
  fallbackLetter: string
  fallbackText?: string
}) {
  if (!src) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate">
        {fallbackLetter ? (
          <span className="font-display text-5xl text-bone/15">
            {fallbackLetter}
          </span>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/25">
            {fallbackText ?? ''}
          </span>
        )}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  )
}