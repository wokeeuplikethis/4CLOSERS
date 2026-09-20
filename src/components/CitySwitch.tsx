'use client'

import { useStudio } from '@/components/StudioProvider'
import { STUDIO_SLUGS, type StudioSlug } from '@/types'
import { cn } from '@/lib/utils'

const LABELS: Record<StudioSlug, string> = {
  moscow: 'МСК',
  spb: 'СПБ',
}

const CRESTS: Record<StudioSlug, string> = {
  moscow: '/images/GERB_MSK.png',
  spb: '/images/GERB_SPB.png',
}

interface CitySwitchProps {
  className?: string
  /** Узкая версия для мобильных / хедера. */
  compact?: boolean
}

export function CitySwitch({ className, compact = false }: CitySwitchProps) {
  const { currentStudio, setCurrentStudio, mounted } = useStudio()

  const activeIndex = mounted ? STUDIO_SLUGS.indexOf(currentStudio) : 0

  return (
    <div
      role="tablist"
      aria-label="Выбор студии"
      className={cn(
        'relative inline-grid grid-cols-2 items-center',
        'bg-bone/[0.04] backdrop-blur-xl',
        'border border-ash',
        'rounded-full',
        'p-1',
        compact ? 'h-10' : 'h-12',
        className
      )}
      style={{ minWidth: compact ? '148px' : '184px' }}
    >
      {/* Подложка активного сегмента */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 bottom-1 left-1 rounded-full',
          'bg-bone',
          'transition-transform duration-300 ease-[cubic-bezier(.22,.61,.36,1)]',
          'will-change-transform'
        )}
        style={{
          width: `calc(50% - 0.25rem)`,
          transform: `translateX(calc(${activeIndex} * 100%))`,
        }}
      />

      {STUDIO_SLUGS.map((slug) => {
        const isActive = mounted && slug === currentStudio
        return (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setCurrentStudio(slug)}
            className={cn(
              'relative z-10 inline-flex items-center justify-center gap-1.5',
              'rounded-full',
              'font-mono uppercase',
              'transition-colors duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-signal',
              compact
                ? 'px-3 text-[10px] tracking-[0.12em] h-full'
                : 'px-4 text-[11px] tracking-[0.16em] h-full',
              isActive ? 'text-void' : 'text-bone/50 hover:text-bone/80'
            )}
          >
            {/* Герб. Активный — чёрный (без invert). Неактивный — белый (invert). */}
            <img
              src={CRESTS[slug]}
              alt=""
              aria-hidden="true"
              className={cn(
                'shrink-0 object-contain transition-[filter] duration-200',
                compact ? 'h-3.5 w-3.5' : 'h-4 w-4',
                isActive ? '' : 'invert brightness-110'
              )}
            />

            <span className="whitespace-nowrap">{LABELS[slug]}</span>
          </button>
        )
      })}
    </div>
  )
}