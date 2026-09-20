'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const AUTOPLAY_MS = 5000

interface PhotoCarouselProps {
  images: string[]
  alt?: string
  aspect?: string
  className?: string
}

export function PhotoCarousel({
  images,
  alt = '',
  aspect = 'aspect-[16/10]',
  className,
}: PhotoCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [images.length])

  useEffect(() => {
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  if (images.length === 0) {
    return (
      <div
        className={cn(
          aspect,
          'rounded-lg border border-ash bg-slate flex items-center justify-center',
          className
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone/25">
          нет фото
        </span>
      </div>
    )
  }

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  return (
    <div className={cn('group relative', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-ash bg-slate',
          aspect
        )}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={alt ? `${alt} — ${i + 1}` : ''}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              'transition-opacity duration-700 ease-[cubic-bezier(.22,.61,.36,1)]',
              i === index ? 'opacity-100' : 'opacity-0'
            )}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                         inline-flex h-10 w-10 items-center justify-center rounded-full
                         bg-void/70 backdrop-blur-sm border border-bone/20
                         text-bone/80 hover:text-bone hover:border-bone/50
                         opacity-0 group-hover:opacity-100
                         transition-opacity duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:opacity-100"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                         inline-flex h-10 w-10 items-center justify-center rounded-full
                         bg-void/70 backdrop-blur-sm border border-bone/20
                         text-bone/80 hover:text-bone hover:border-bone/50
                         opacity-0 group-hover:opacity-100
                         transition-opacity duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:opacity-100"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
                  i === index ? 'w-6 bg-signal' : 'w-1.5 bg-bone/30 hover:bg-bone/60'
                )}
                aria-label={`Перейти к кадру ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}