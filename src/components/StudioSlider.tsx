'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStudio } from '@/components/StudioProvider'
import { getStudio } from '@/data/studios'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000

export function StudioSlider() {
  const { currentStudio, transitionKey } = useStudio()
  const studio = getStudio(currentStudio)

  // Все картинки студии: сначала studio, потом rooms — единый список.
  const images = [...studio.images.studio, ...studio.images.rooms]

  const [index, setIndex] = useState(0)

  // При смене города — сбрасываем на первый кадр.
  useEffect(() => {
    setIndex(0)
  }, [transitionKey])

  // Автоплей: переход вперёд каждые AUTOPLAY_MS.
  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [images.length, transitionKey])

  if (images.length === 0) return null

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  return (
    <section id="photos" className="band border-t border-ash" aria-label="Фото студии">
      <div className="shell">
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="section-mark">
              <span className="num">02</span>
              <span className="rule" />
            </div>
            <h2
              className="font-display font-light text-bone tracking-[-0.03em] leading-[0.95]"
              style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}
            >
              Фото студии
            </h2>
          </div>

          {/* Счётчик кадров + стрелки */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bone/40">
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={prev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full
                         border border-ash text-bone/60 hover:text-bone hover:border-bone/40
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full
                         border border-ash text-bone/60 hover:text-bone hover:border-bone/40
                         transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Кадр */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-ash bg-slate">
          {images.map((src, i) => (
            <img
              key={`${transitionKey}-${i}`}
              src={src}
              alt={`${studio.city} — кадр ${i + 1}`}
              className={cn(
                'absolute inset-0 h-full w-full object-cover',
                'transition-opacity duration-700 ease-[cubic-bezier(.22,.61,.36,1)]',
                i === index ? 'opacity-100' : 'opacity-0'
              )}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}

          {/* Точки-индикаторы внизу */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                  i === index
                    ? 'w-6 bg-signal'
                    : 'w-1.5 bg-bone/30 hover:bg-bone/60'
                )}
                aria-label={`Перейти к кадру ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}